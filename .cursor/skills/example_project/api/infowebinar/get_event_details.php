<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if (!is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    if (!isset($_GET['event_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameter: event_id']);
        exit;
    }

    $eventId = (int)$_GET['event_id'];

    /**
     * Findet passenden User für Attendee basierend auf E-Mail oder vollständigem Namen
     */
    function findMatchingUser($conn, $attendeeEmail, $attendeeName) {
        // 1. E-Mail-Matching (exakt)
        $stmt = $conn->prepare("
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email
            FROM users u
            WHERE u.role = 'teacher'
            AND LOWER(u.email) = LOWER(?)
            LIMIT 1
        ");
        $stmt->bind_param("s", $attendeeEmail);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $stmt->close();
            return [
                'id' => (int)$user['id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'email' => $user['email']
            ];
        }
        $stmt->close();
        
        // 2. Name-Matching (vollständiger Vor- + Nachname)
        $attendeeNameNormalized = trim($attendeeName);
        $stmt = $conn->prepare("
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email
            FROM users u
            WHERE u.role = 'teacher'
            AND LOWER(TRIM(CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, '')))) = LOWER(?)
            LIMIT 1
        ");
        $stmt->bind_param("s", $attendeeNameNormalized);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $stmt->close();
            return [
                'id' => (int)$user['id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'email' => $user['email']
            ];
        }
        $stmt->close();
        
        return null;
    }

    try {
        $conn = db_connect();
        
        // Event-Details abrufen
        $stmt = $conn->prepare("
            SELECT 
                ce.id,
                ce.calendly_id,
                ce.event_name,
                ce.start_time,
                ce.status,
                ce.location
            FROM calendly_events ce
            WHERE ce.id = ?
        ");
        $stmt->bind_param("i", $eventId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            $conn->close();
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
            exit;
        }
        
        $event = $result->fetch_assoc();
        $stmt->close();
        
        // Attendees mit User-Informationen abrufen
        $stmt = $conn->prepare("
            SELECT 
                cea.id,
                cea.name,
                cea.email,
                cea.attended,
                cea.user_id,
                cea.prognosis_class_count,
                cea.prognosis_start,
                cea.notes,
                u.first_name,
                u.last_name,
                u.email as user_email
            FROM calendly_event_attendees cea
            LEFT JOIN users u ON cea.user_id = u.id
            WHERE cea.event_id = ?
            ORDER BY cea.id ASC
        ");
        $stmt->bind_param("i", $eventId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $attendees = [];
        while ($row = $result->fetch_assoc()) {
            $attendeeData = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'attended' => $row['attended'] === null ? null : (bool)$row['attended'],
                'user_id' => $row['user_id'] ? (int)$row['user_id'] : null,
                'prognosis_class_count' => $row['prognosis_class_count'],
                'prognosis_start' => $row['prognosis_start'],
                'notes' => $row['notes'],
                'user' => $row['user_id'] ? [
                    'id' => (int)$row['user_id'],
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'email' => $row['user_email']
                ] : null
            ];
            
            // Auto-Matching: Wenn noch kein User zugeordnet, suche nach passendem User
            if (!$attendeeData['user_id']) {
                $matchedUser = findMatchingUser($conn, $row['email'], $row['name']);
                if ($matchedUser) {
                    $attendeeData['user_id'] = $matchedUser['id'];
                    $attendeeData['user'] = $matchedUser;
                }
            }
            
            $attendees[] = $attendeeData;
        }
        $stmt->close();
        
        $startDateTime = new DateTime($event['start_time']);
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'event' => [
                'id' => (int)$event['id'],
                'calendly_id' => $event['calendly_id'],
                'name' => $event['event_name'],
                'start_time' => $event['start_time'],
                'start_time_formatted' => $startDateTime->format('d.m.Y H:i'),
                'status' => $event['status'],
                'location' => $event['location'],
                'attendees' => $attendees
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Abrufen der Event-Details: ' . $e->getMessage()
        ]);
    }
?>
