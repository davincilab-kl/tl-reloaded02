<?php
    /**
     * Einfache SMTP-Mail-Versendung ohne externe Bibliotheken
     */
    
    function sendSMTPEmail($to, $to_name, $subject, $body, $is_html = false) {
        $config = require __DIR__ . '/../config/mail_config.php';
        
        // Validierung
        if (empty($config['smtp_password'])) {
            return ['success' => false, 'error' => 'SMTP-Passwort nicht konfiguriert'];
        }
        
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Ungültige E-Mail-Adresse'];
        }
        
        $host = $config['smtp_host'];
        $port = $config['smtp_port'];
        $username = $config['smtp_username'];
        $password = $config['smtp_password'];
        $from_email = $config['from_email'];
        $from_name = $config['from_name'];
        $secure = $config['smtp_secure'];
        
        try {
            // SSL-Context für sichere Verbindung
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ]);
            
            // Verbindung zum SMTP-Server
            $socket = @stream_socket_client(
                ($secure === 'ssl' ? 'ssl://' : '') . $host . ':' . $port,
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );
            
            if (!$socket) {
                return ['success' => false, 'error' => "Verbindungsfehler: $errstr ($errno)"];
            }
            
            // Initiale Server-Begrüßung lesen (220)
            $response = fgets($socket, 515);
            if (!$response) {
                fclose($socket);
                return ['success' => false, 'error' => 'Keine Begrüßung vom SMTP-Server'];
            }
            $greeting = trim($response);
            
            // Prüfen ob es eine 220-Begrüßung ist
            if (substr($response, 0, 3) !== '220') {
                fclose($socket);
                return ['success' => false, 'error' => 'Unerwartete Server-Begrüßung: ' . $greeting];
            }
            
            // EHLO senden
            fputs($socket, "EHLO " . $host . "\r\n");
            
            // EHLO-Antworten lesen (mehrzeilig möglich)
            $ehlo_responses = [];
            $first_response = fgets($socket, 515);
            
            if (!$first_response) {
                fclose($socket);
                return ['success' => false, 'error' => 'Keine EHLO-Antwort vom Server erhalten'];
            }
            
            $ehlo_responses[] = trim($first_response);
            
            // Weitere Zeilen lesen, solange die Antwort mehrzeilig ist (250-...)
            while ($first_response && substr($first_response, 0, 3) === '250' && substr($first_response, 3, 1) === '-') {
                $response = fgets($socket, 515);
                if ($response) {
                    $ehlo_responses[] = trim($response);
                    $first_response = $response;
                } else {
                    break;
                }
            }
            
            // Letzte Zeile muss mit 250 (ohne -) beginnen
            $last_response = end($ehlo_responses);
            if (substr($last_response, 0, 3) !== '250') {
                fclose($socket);
                return ['success' => false, 'error' => 'EHLO fehlgeschlagen. Server-Antwort: ' . $last_response . ' | Alle Zeilen: ' . implode(' | ', $ehlo_responses)];
            }
            
            // Prüfen welche AUTH-Methoden unterstützt werden
            $auth_methods = [];
            foreach ($ehlo_responses as $line) {
                if (stripos($line, 'AUTH') !== false) {
                    // AUTH-Methoden extrahieren (z.B. "250-AUTH PLAIN LOGIN CRAM-MD5")
                    if (preg_match('/AUTH\s+(.+)/i', $line, $matches)) {
                        $auth_methods = array_map('trim', explode(' ', strtoupper($matches[1])));
                    }
                    break;
                }
            }
            
            if (!$auth_methods && $secure !== 'ssl') {
                // Versuche STARTTLS wenn nicht bereits SSL
                fputs($socket, "STARTTLS\r\n");
                $response = fgets($socket, 515);
                if ($response && substr($response, 0, 3) === '220') {
                    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                        fclose($socket);
                        return ['success' => false, 'error' => 'STARTTLS-Verbindung fehlgeschlagen'];
                    }
                    // Nach STARTTLS nochmal EHLO
                    fputs($socket, "EHLO " . $host . "\r\n");
                    $ehlo_responses_tls = [];
                    $first_response_tls = fgets($socket, 515);
                    
                    if ($first_response_tls) {
                        $ehlo_responses_tls[] = trim($first_response_tls);
                        // Weitere Zeilen lesen
                        while ($first_response_tls && substr($first_response_tls, 0, 3) === '250' && substr($first_response_tls, 3, 1) === '-') {
                            $response_tls = fgets($socket, 515);
                            if ($response_tls) {
                                $ehlo_responses_tls[] = trim($response_tls);
                                $first_response_tls = $response_tls;
                            } else {
                                break;
                            }
                        }
                        // AUTH-Methoden aus neuer EHLO-Antwort extrahieren
                        foreach ($ehlo_responses_tls as $line) {
                            if (stripos($line, 'AUTH') !== false) {
                                if (preg_match('/AUTH\s+(.+)/i', $line, $matches)) {
                                    $auth_methods = array_map('trim', explode(' ', strtoupper($matches[1])));
                                }
                                break;
                            }
                        }
                    }
                }
            }
            
            // Versuche AUTH PLAIN zuerst, dann AUTH LOGIN
            $auth_success = false;
            $auth_error = '';
            
            if (in_array('PLAIN', $auth_methods)) {
                // AUTH PLAIN - alles in einem Base64-String
                $auth_string = base64_encode("\0" . $username . "\0" . $password);
                fputs($socket, "AUTH PLAIN " . $auth_string . "\r\n");
                $response = fgets($socket, 515);
                if ($response && substr($response, 0, 3) === '235') {
                    $auth_success = true;
                } else {
                    $auth_error = 'AUTH PLAIN: ' . trim($response);
                }
            }
            
            // Falls PLAIN fehlgeschlagen ist, versuche LOGIN
            if (!$auth_success && (in_array('LOGIN', $auth_methods) || empty($auth_methods))) {
                // AUTH LOGIN
                fputs($socket, "AUTH LOGIN\r\n");
                $response = fgets($socket, 515);
                if (!$response) {
                    fclose($socket);
                    return ['success' => false, 'error' => 'AUTH LOGIN: Keine Antwort vom Server'];
                }
                $auth_response = trim($response);
                
                if (substr($response, 0, 3) === '334') {
                    // Benutzername senden
                    fputs($socket, base64_encode($username) . "\r\n");
                    $response = fgets($socket, 515);
                    if ($response && substr($response, 0, 3) === '334') {
                        // Passwort senden
                        fputs($socket, base64_encode($password) . "\r\n");
                        $response = fgets($socket, 515);
                        if ($response && substr($response, 0, 3) === '235') {
                            $auth_success = true;
                        } else {
                            $auth_error = 'AUTH LOGIN Passwort: ' . trim($response);
                        }
                    } else {
                        $auth_error = 'AUTH LOGIN Benutzername: ' . trim($response);
                    }
                } else {
                    $auth_error = 'AUTH LOGIN fehlgeschlagen. Server-Antwort: ' . $auth_response;
                }
            }
            
            if (!$auth_success) {
                fclose($socket);
                $error_msg = 'SMTP-Authentifizierung fehlgeschlagen';
                if ($auth_error) {
                    $error_msg .= '. ' . $auth_error;
                }
                if (!empty($auth_methods)) {
                    $error_msg .= ' Verfügbare Methoden: ' . implode(', ', $auth_methods);
                }
                return ['success' => false, 'error' => $error_msg];
            }
            
            // Authentifizierung wurde bereits in obiger Logik durchgeführt
            
            // MAIL FROM
            fputs($socket, "MAIL FROM: <$from_email>\r\n");
            $response = fgets($socket, 515);
            if (substr($response, 0, 3) !== '250') {
                fclose($socket);
                return ['success' => false, 'error' => 'MAIL FROM fehlgeschlagen'];
            }
            
            // RCPT TO
            fputs($socket, "RCPT TO: <$to>\r\n");
            $response = fgets($socket, 515);
            if (substr($response, 0, 3) !== '250') {
                fclose($socket);
                return ['success' => false, 'error' => 'RCPT TO fehlgeschlagen'];
            }
            
            // DATA
            fputs($socket, "DATA\r\n");
            $response = fgets($socket, 515);
            if (substr($response, 0, 3) !== '354') {
                fclose($socket);
                return ['success' => false, 'error' => 'DATA fehlgeschlagen'];
            }
            
            // E-Mail-Header und Body
            $to_header = !empty($to_name) ? "To: $to_name <$to>\r\n" : "To: <$to>\r\n";
            $from_header = "From: $from_name <$from_email>\r\n";
            $subject_header = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
            $content_type = $is_html ? "Content-Type: text/html; charset=UTF-8\r\n" : "Content-Type: text/plain; charset=UTF-8\r\n";
            $mime_version = "MIME-Version: 1.0\r\n";
            $date_header = "Date: " . date('r') . "\r\n";
            
            $message = $to_header .
                      $from_header .
                      $subject_header .
                      $mime_version .
                      $content_type .
                      $date_header .
                      "\r\n" .
                      $body .
                      "\r\n.\r\n";
            
            fputs($socket, $message);
            $response = fgets($socket, 515);
            if (substr($response, 0, 3) !== '250') {
                fclose($socket);
                return ['success' => false, 'error' => 'E-Mail-Versendung fehlgeschlagen: ' . $response];
            }
            
            // QUIT
            fputs($socket, "QUIT\r\n");
            fclose($socket);
            
            return ['success' => true, 'message' => 'E-Mail erfolgreich gesendet'];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Fehler: ' . $e->getMessage() . ' (' . get_class($e) . ')'];
        }
    }
?>

