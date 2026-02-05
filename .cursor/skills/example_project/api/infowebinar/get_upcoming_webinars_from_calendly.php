<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../config/calendly_config.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur Admins dürfen anstehende Termine sehen
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
            'error' => 'Calendly API Token nicht konfiguriert'
        ]);
        exit;
    }

    try {
        $userUri = $config['user_uri'] ?? null;
        
        if (!$userUri) {
            throw new Exception('User URI nicht in der Konfiguration gefunden');
        }

        // Berechne Datum für die nächsten 14 Tage
        $now = new DateTime();
        $futureDate = clone $now;
        $futureDate->modify('+14 days');
        
        // Hole Scheduled Events von Calendly API für die nächsten 14 Tage
        $scheduledEventsParams = [
            'user' => $userUri,
            'status' => 'active',
            'sort' => 'start_time:asc',
            'min_start_time' => $now->format('c'), // ISO 8601 Format
            'max_start_time' => $futureDate->format('c')
        ];
        
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
            $errorMessage = 'Calendly API Fehler (HTTP ' . $scheduledHttpCode . ')';
            if (isset($errorData['message'])) {
                $errorMessage .= ': ' . $errorData['message'];
            }
            throw new Exception($errorMessage);
        }
        
        $scheduledData = json_decode($scheduledResponse, true);
        
        if (!isset($scheduledData['collection'])) {
            throw new Exception('Unerwartete Antwort von Calendly API');
        }
        
        $webinars = [];
        
        // Verarbeite jedes Event
        foreach ($scheduledData['collection'] as $event) {
            $eventUri = $event['uri'] ?? null;
            $startTime = $event['start_time'] ?? null;
            $name = $event['name'] ?? 'Unbekannt';
            
            if (!$eventUri || !$startTime) {
                continue;
            }
            
            // Location parsen
            $location = null;
            if (isset($event['location'])) {
                if (is_array($event['location'])) {
                    if (isset($event['location']['type']) && $event['location']['type'] === 'google_conference') {
                        if (isset($event['location']['status']) && $event['location']['status'] === 'pushed') {
                            $location = $event['location']['join_url'] ?? null;
                        }
                    } else {
                        $location = $event['location']['join_url'] ?? $event['location']['location'] ?? null;
                    }
                } else {
                    $location = $event['location'];
                }
            }
            
            // Extrahiere Event-UUID aus der URI
            $eventUuid = null;
            if (preg_match('/\/([a-f0-9\-]{36})$/i', $eventUri, $matches)) {
                $eventUuid = $matches[1];
            }
            
            // Hole Invitees für dieses Event
            $participationCount = 0;
            if ($eventUuid) {
                $inviteesUrl = $apiBaseUrl . '/scheduled_events/' . $eventUuid . '/invitees';
            
                $chInvitees = curl_init();
                curl_setopt($chInvitees, CURLOPT_URL, $inviteesUrl);
                curl_setopt($chInvitees, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($chInvitees, CURLOPT_HTTPHEADER, [
                    'Authorization: Bearer ' . $apiToken,
                    'Content-Type: application/json'
                ]);
                
                $inviteesResponse = curl_exec($chInvitees);
                $inviteesHttpCode = curl_getinfo($chInvitees, CURLINFO_HTTP_CODE);
                curl_close($chInvitees);
                
                if ($inviteesHttpCode === 200) {
                    $inviteesData = json_decode($inviteesResponse, true);
                    if (isset($inviteesData['collection'])) {
                        $participationCount = count($inviteesData['collection']);
                    }
                }
            }
            
            $eventDate = new DateTime($startTime);
            
            $webinars[] = [
                'webinar_date' => $startTime,
                'webinar_date_formatted' => $eventDate->format('d.m.Y H:i') . ' Uhr',
                'event_name' => $name,
                'location' => $location,
                'participation_count' => $participationCount,
                'pending_count' => 0, // Calendly API gibt keine attended-Information
                'participated_count' => 0,
                'not_participated_count' => 0
            ];
        }

        echo json_encode([
            'success' => true,
            'webinars' => $webinars
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Abrufen der Termine: ' . $e->getMessage()
        ]);
    }
?>
