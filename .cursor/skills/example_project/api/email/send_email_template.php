<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/send_smtp_mail.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $conn = db_connect();

    try {
        // Template abrufen
        $template_id = isset($input['template_id']) ? intval($input['template_id']) : null;
        if (!$template_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Template-ID fehlt']);
            exit;
        }

        $template_sql = "SELECT name, subject, body, is_html FROM email_templates WHERE id = ?";
        $template_stmt = $conn->prepare($template_sql);
        
        if (!$template_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $template_stmt->bind_param('i', $template_id);
        
        if (!$template_stmt->execute()) {
            throw new Exception('Execute failed: ' . $template_stmt->error);
        }

        $template_result = $template_stmt->get_result();
        if ($template_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Vorlage nicht gefunden']);
            exit;
        }

        $template = $template_result->fetch_assoc();
        $template_stmt->close();

        // Empfänger bestimmen
        $recipient_type = isset($input['recipient_type']) ? $input['recipient_type'] : '';
        $custom_email = isset($input['custom_email']) ? trim($input['custom_email']) : '';
        $user_ids = isset($input['user_ids']) ? $input['user_ids'] : null;
        $recipients = [];

        if ($recipient_type === 'custom') {
            if (empty($custom_email) || !filter_var($custom_email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ungültige E-Mail-Adresse']);
                exit;
            }
            $recipients[] = ['email' => $custom_email, 'name' => '', 'school' => ''];
        } elseif ($recipient_type === 'user_ids') {
            if (empty($user_ids) || !is_array($user_ids)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Keine gültigen User-IDs angegeben']);
                exit;
            }
            
            // User-IDs zu Integer konvertieren und filtern
            $user_ids_clean = array_map('intval', $user_ids);
            $user_ids_clean = array_filter($user_ids_clean, function($id) { return $id > 0; });
            
            if (empty($user_ids_clean)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Keine gültigen User-IDs gefunden']);
                exit;
            }
            
            // Platzhalter für Prepared Statement erstellen
            $placeholders = implode(',', array_fill(0, count($user_ids_clean), '?'));
            $user_ids_sql = "SELECT email, first_name, last_name 
                            FROM users 
                            WHERE id IN ($placeholders) AND email IS NOT NULL AND email != ''";
            
            $user_ids_stmt = $conn->prepare($user_ids_sql);
            if (!$user_ids_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            // Bind parameters - User-IDs aus users Tabelle
            $types = str_repeat('i', count($user_ids_clean));
            $user_ids_stmt->bind_param($types, ...$user_ids_clean);
            
            if (!$user_ids_stmt->execute()) {
                throw new Exception('Execute failed: ' . $user_ids_stmt->error);
            }
            
            $user_ids_result = $user_ids_stmt->get_result();
            while ($row = $user_ids_result->fetch_assoc()) {
                // Namen kombinieren (last_name kann NULL sein)
                $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                $recipients[] = [
                    'email' => $row['email'],
                    'name' => $full_name,
                    'school' => '' // Keine Schule mehr, da nur users Tabelle verwendet wird
                ];
            }
            
            $user_ids_stmt->close();
            
            if (empty($recipients)) {
                http_response_code(400);
                $found_ids = implode(', ', $user_ids_clean);
                echo json_encode([
                    'success' => false, 
                    'error' => 'Keine E-Mail-Adressen für die angegebenen User-IDs gefunden. ' .
                               'Die User-IDs (' . $found_ids . ') existieren möglicherweise nicht ' .
                               'oder haben keine E-Mail-Adresse in der users-Tabelle.'
                ]);
                exit;
            }
        } elseif ($recipient_type === 'all_teachers') {
            $teachers_sql = "SELECT u.email, u.first_name, u.last_name, s.name as school_name 
                            FROM teachers t 
                            LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                            LEFT JOIN schools s ON t.school_id = s.id 
                            WHERE u.email IS NOT NULL AND u.email != ''";
            $teachers_result = $conn->query($teachers_sql);
            while ($row = $teachers_result->fetch_assoc()) {
                // Namen kombinieren (last_name kann NULL sein)
                $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                $recipients[] = [
                    'email' => $row['email'],
                    'name' => $full_name,
                    'school' => $row['school_name'] ?? ''
                ];
            }
        } elseif ($recipient_type === 'all_schools') {
            // Hier könnten Schulen E-Mail-Adressen haben, für jetzt nehmen wir die erste Lehrkraft jeder Schule
            $schools_sql = "SELECT DISTINCT s.id, s.name as school_name,
                           (SELECT u.email FROM teachers t2 LEFT JOIN users u ON u.role_id = t2.id AND u.role = 'teacher' WHERE t2.school_id = s.id AND u.email IS NOT NULL AND u.email != '' LIMIT 1) as email,
                           (SELECT CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) FROM teachers t2 LEFT JOIN users u ON u.role_id = t2.id AND u.role = 'teacher' WHERE t2.school_id = s.id AND u.email IS NOT NULL AND u.email != '' LIMIT 1) as teacher_name
                           FROM schools s
                           WHERE EXISTS (SELECT 1 FROM teachers t3 LEFT JOIN users u ON u.role_id = t3.id AND u.role = 'teacher' WHERE t3.school_id = s.id AND u.email IS NOT NULL AND u.email != '')";
            $schools_result = $conn->query($schools_sql);
            while ($row = $schools_result->fetch_assoc()) {
                if (!empty($row['email'])) {
                    $recipients[] = [
                        'email' => $row['email'],
                        'name' => $row['teacher_name'] ?? '',
                        'school' => $row['school_name'] ?? ''
                    ];
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Ungültiger Empfängertyp']);
            exit;
        }

        if (empty($recipients)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Keine Empfänger gefunden']);
            exit;
        }

        // E-Mail-Versendung
        $sent_count = 0;
        $failed_count = 0;
        $errors = [];

        foreach ($recipients as $recipient) {
            // Platzhalter ersetzen
            $subject = str_replace(
                ['{{name}}', '{{email}}', '{{school}}', '{{date}}'], 
                [
                    $recipient['name'] ?? '', 
                    $recipient['email'], 
                    $recipient['school'] ?? '', 
                    date('d.m.Y')
                ], 
                $template['subject']
            );
            
            $body = str_replace(
                ['{{name}}', '{{email}}', '{{school}}', '{{date}}'], 
                [
                    $recipient['name'] ?? '', 
                    $recipient['email'], 
                    $recipient['school'] ?? '', 
                    date('d.m.Y')
                ], 
                $template['body']
            );

            // E-Mail senden
            $result = sendSMTPEmail(
                $recipient['email'], 
                $recipient['name'] ?? '', 
                $subject, 
                $body, 
                $template['is_html'] == 1
            );
            
            if ($result['success']) {
                $sent_count++;
            } else {
                $failed_count++;
                $error_detail = $result['error'] ?? 'Unbekannter Fehler';
                $errors[] = $recipient['email'] . ': ' . $error_detail;
                
                // Detaillierte Fehlerinformationen für Debugging
                error_log("E-Mail-Versendung fehlgeschlagen für {$recipient['email']}: {$error_detail}");
            }
            
            // Kleine Pause zwischen E-Mails, um Server nicht zu überlasten
            if (count($recipients) > 1) {
                usleep(500000); // 0.5 Sekunden
            }
        }

        $success = $failed_count === 0;
        
        echo json_encode([
            'success' => $success,
            'message' => "E-Mails versendet: {$sent_count} erfolgreich, {$failed_count} fehlgeschlagen",
            'sent_count' => $sent_count,
            'failed_count' => $failed_count,
            'total_recipients' => count($recipients),
            'errors' => $errors
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

