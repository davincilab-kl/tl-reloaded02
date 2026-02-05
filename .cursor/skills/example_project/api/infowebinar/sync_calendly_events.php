<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../config/calendly_config.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur Admins dürfen synchronisieren
    if (!is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $config = calendly_config();
    $apiToken = $config['api_token'];
    $apiBaseUrl = $config['api_base_url'];

    if (empty($apiToken)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Calendly API Token nicht konfiguriert. Bitte in api/config/calendly_config.php eintragen.'
        ]);
        exit;
    }

    try {
        $conn = db_connect();
        $userUri = $config['user_uri'] ?? null;
        
        if (!$userUri) {
            throw new Exception('User URI nicht in der Konfiguration gefunden');
        }
        
        // Hole Scheduled Events von Calendly API
        $scheduledEventsParams = [
            'user' => $userUri,
            'status' => 'active',
            'sort' => 'start_time:asc'
        ];
        
        // min_start_time Parameter hinzufügen falls vorhanden
        if (isset($_GET['min_start_time']) && !empty($_GET['min_start_time'])) {
            $scheduledEventsParams['min_start_time'] = $_GET['min_start_time'];
        }
        
        $scheduledEventsUrl = $apiBaseUrl . '/scheduled_events?' . http_build_query($scheduledEventsParams);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $scheduledEventsUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiToken,
            'Content-Type: application/json'
        ]);
        
        $scheduledResponse = curl_exec($ch);
        $scheduledHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $scheduledCurlError = curl_error($ch);
        curl_close($ch);
        
        if ($scheduledCurlError) {
            throw new Exception('cURL Fehler: ' . $scheduledCurlError);
        }
        
        if ($scheduledHttpCode !== 200) {
            $errorData = json_decode($scheduledResponse, true);
            $errorMessage = 'Calendly API Fehler beim Abrufen der Scheduled Events (HTTP ' . $scheduledHttpCode . ')';
            if (isset($errorData['message'])) {
                $errorMessage .= ': ' . $errorData['message'];
            } else {
                $errorMessage .= ': ' . substr($scheduledResponse, 0, 500);
            }
            throw new Exception($errorMessage);
        }
        
        $scheduledData = json_decode($scheduledResponse, true);
        
        if (!isset($scheduledData['collection'])) {
            throw new Exception('Unerwartete Antwort von Calendly API (Scheduled Events)');
        }
        
        $syncedCount = 0;
        $updatedCount = 0;
        $newCount = 0;
        
        // Synchronisiere Events mit DB
        foreach ($scheduledData['collection'] as $event) {
            $eventUri = $event['uri'] ?? null;
            $startTime = $event['start_time'] ?? null;
            $status = $event['status'] ?? null;
            $name = $event['name'] ?? 'Unbekannt';
            
            // Location parsen: Kann ein Objekt (z.B. Google Conference) oder ein String sein
            $location = null;
            if (isset($event['location'])) {
                if (is_array($event['location'])) {
                    // Für Google Conference: join_url extrahieren (nur wenn status = "pushed")
                    if (isset($event['location']['type']) && $event['location']['type'] === 'google_conference') {
                        // Nur join_url verwenden wenn status "pushed" ist (laut Calendly-Doku)
                        if (isset($event['location']['status']) && $event['location']['status'] === 'pushed') {
                            $location = $event['location']['join_url'] ?? null;
                        }
                    } else {
                        // Für andere Location-Typen: Versuche join_url oder location-String
                        $location = $event['location']['join_url'] ?? $event['location']['location'] ?? null;
                    }
                } else {
                    // Location ist bereits ein String
                    $location = $event['location'];
                }
            }
            
            if (!$eventUri || !$startTime || !$name) {
                continue;
            }
            
            // Konvertiere start_time zu DateTime für DB
            $startDateTime = new DateTime($startTime);
            
            // Extrahiere calendly_id aus der URI (UUID am Ende)
            $calendlyId = null;
            if (preg_match('/\/([a-f0-9\-]{36})$/i', $eventUri, $matches)) {
                $calendlyId = $matches[1];
            }
            
            // Prüfe ob calendly_id vorhanden ist (erforderlich für Identifikation)
            if (!$calendlyId) {
                // Überspringe Events ohne calendly_id (sollte nicht vorkommen)
                continue;
            }
            
            // Prüfe ob Event bereits existiert (nach calendly_id)
            $stmt = $conn->prepare("SELECT id FROM calendly_events WHERE calendly_id = ?");
            $stmt->bind_param("s", $calendlyId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existingEvent = $result->fetch_assoc();
            $stmt->close();
            
            $eventId = null;
            $isNew = false;
            
            if ($existingEvent) {
                // Update bestehendes Event
                $eventId = $existingEvent['id'];
                $stmt = $conn->prepare("UPDATE calendly_events SET event_name = ?, start_time = ?, status = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE calendly_id = ?");
                $stmt->bind_param("sssss", $name, $startDateTime->format('Y-m-d H:i:s'), $status, $location, $calendlyId);
                $stmt->execute();
                $stmt->close();
                $updatedCount++;
            } else {
                // Neues Event einfügen
                $stmt = $conn->prepare("INSERT INTO calendly_events (calendly_id, event_name, start_time, status, location) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssss", $calendlyId, $name, $startDateTime->format('Y-m-d H:i:s'), $status, $location);
                $stmt->execute();
                $eventId = $conn->insert_id;
                $stmt->close();
                $newCount++;
                $isNew = true;
            }
            
            // Hole Invitees von Calendly API
            $inviteesUrl = $eventUri . '/invitees';
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $inviteesUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $apiToken,
                'Content-Type: application/json'
            ]);
            
            $inviteesResponse = curl_exec($ch);
            $inviteesHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($inviteesHttpCode === 200) {
                $inviteesData = json_decode($inviteesResponse, true);
                if (isset($inviteesData['collection'])) {
                    foreach ($inviteesData['collection'] as $invitee) {
                        $inviteeName = $invitee['name'] ?? '-';
                        $inviteeEmail = $invitee['email'] ?? '-';
                        
                        if (empty($inviteeEmail)) {
                            continue;
                        }
                        
                        // Prüfe ob Invitee bereits existiert
                        $stmt = $conn->prepare("SELECT id FROM calendly_event_attendees WHERE event_id = ? AND email = ?");
                        $stmt->bind_param("is", $eventId, $inviteeEmail);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        $existingAttendee = $result->fetch_assoc();
                        $stmt->close();
                        
                        if (!$existingAttendee) {
                            // Neuen Invitee einfügen
                            $stmt = $conn->prepare("INSERT INTO calendly_event_attendees (event_id, name, email) VALUES (?, ?, ?)");
                            $stmt->bind_param("iss", $eventId, $inviteeName, $inviteeEmail);
                            $stmt->execute();
                            $stmt->close();
                        } else {
                            // Update Name falls geändert
                            $stmt = $conn->prepare("UPDATE calendly_event_attendees SET name = ? WHERE id = ?");
                            $stmt->bind_param("si", $inviteeName, $existingAttendee['id']);
                            $stmt->execute();
                            $stmt->close();
                        }
                    }
                }
            }
            
            $syncedCount++;
        }
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Synchronisation abgeschlossen',
            'synced' => $syncedCount,
            'new' => $newCount,
            'updated' => $updatedCount
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Synchronisieren der Calendly-Termine: ' . $e->getMessage()
        ]);
    }
?>

