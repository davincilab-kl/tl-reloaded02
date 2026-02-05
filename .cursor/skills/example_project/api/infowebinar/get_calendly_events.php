<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur Admins dürfen Termine sehen
    if (!is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    try {
        $conn = db_connect();
        $now = new DateTime();
        $nowStr = $now->format('Y-m-d H:i:s');
        
        // Anstehende Events (start_time >= NOW())
        $stmt = $conn->prepare("
            SELECT 
                ce.id,
                ce.event_name,
                ce.start_time,
                ce.status,
                ce.location,
                GROUP_CONCAT(
                    CONCAT(cea.id, ':', cea.name, ':', cea.email, ':', IFNULL(cea.attended, 'NULL'))
                    ORDER BY cea.id
                    SEPARATOR '||'
                ) as attendees_data
            FROM calendly_events ce
            LEFT JOIN calendly_event_attendees cea ON cea.event_id = ce.id
            WHERE ce.start_time >= ?
            GROUP BY ce.id
            ORDER BY ce.start_time ASC
        ");
        $stmt->bind_param("s", $nowStr);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $upcomingEvents = [];
        while ($row = $result->fetch_assoc()) {
            $startDateTime = new DateTime($row['start_time']);
            
            $attendees = [];
            if ($row['attendees_data']) {
                $attendeesArray = explode('||', $row['attendees_data']);
                foreach ($attendeesArray as $attendeeStr) {
                    $parts = explode(':', $attendeeStr, 4);
                    if (count($parts) >= 3) {
                        $attended = null;
                        if (isset($parts[3]) && $parts[3] !== 'NULL') {
                            $attended = (bool)$parts[3];
                        }
                        $attendees[] = [
                            'id' => (int)$parts[0],
                            'name' => $parts[1],
                            'email' => $parts[2],
                            'attended' => $attended
                        ];
                    }
                }
            }
            
            $upcomingEvents[] = [
                'id' => (int)$row['id'],
                'name' => $row['event_name'],
                'start_time' => $row['start_time'],
                'start_time_formatted' => $startDateTime->format('d.m.Y H:i'),
                'status' => $row['status'],
                'location' => $row['location'],
                'invitees' => $attendees,
                'invitee_count' => count($attendees)
            ];
        }
        $stmt->close();
        
        // Vergangene Events (start_time < NOW())
        $stmt = $conn->prepare("
            SELECT 
                ce.id,
                ce.event_name,
                ce.start_time,
                ce.status,
                ce.location,
                GROUP_CONCAT(
                    CONCAT(cea.id, ':', cea.name, ':', cea.email, ':', IFNULL(cea.attended, 'NULL'))
                    ORDER BY cea.id
                    SEPARATOR '||'
                ) as attendees_data
            FROM calendly_events ce
            LEFT JOIN calendly_event_attendees cea ON cea.event_id = ce.id
            WHERE ce.start_time < ?
            GROUP BY ce.id
            ORDER BY ce.start_time DESC
        ");
        $stmt->bind_param("s", $nowStr);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $pastEvents = [];
        while ($row = $result->fetch_assoc()) {
            $startDateTime = new DateTime($row['start_time']);
            
            $attendees = [];
            if ($row['attendees_data']) {
                $attendeesArray = explode('||', $row['attendees_data']);
                foreach ($attendeesArray as $attendeeStr) {
                    $parts = explode(':', $attendeeStr, 4);
                    if (count($parts) >= 3) {
                        $attended = null;
                        if (isset($parts[3]) && $parts[3] !== 'NULL') {
                            $attended = (bool)$parts[3];
                        }
                        $attendees[] = [
                            'id' => (int)$parts[0],
                            'name' => $parts[1],
                            'email' => $parts[2],
                            'attended' => $attended
                        ];
                    }
                }
            }
            
            $pastEvents[] = [
                'id' => (int)$row['id'],
                'name' => $row['event_name'],
                'start_time' => $row['start_time'],
                'start_time_formatted' => $startDateTime->format('d.m.Y H:i'),
                'status' => $row['status'],
                'location' => $row['location'],
                'invitees' => $attendees,
                'invitee_count' => count($attendees)
            ];
        }
        $stmt->close();
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'upcoming_events' => $upcomingEvents,
            'past_events' => $pastEvents,
            'upcoming_count' => count($upcomingEvents),
            'past_count' => count($pastEvents)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Abrufen der Calendly-Termine: ' . $e->getMessage()
        ]);
    }
?>
