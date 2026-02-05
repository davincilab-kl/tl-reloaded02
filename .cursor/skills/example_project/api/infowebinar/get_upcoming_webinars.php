<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
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

    try {
        $conn = db_connect();
        $now = new DateTime();
        $nowStr = $now->format('Y-m-d H:i:s');
        
        // Berechne Datum in 14 Tagen
        $futureDate = clone $now;
        $futureDate->modify('+14 days');
        $futureDateStr = $futureDate->format('Y-m-d H:i:s');
        
        // Hole alle anstehenden Calendly-Events für die nächsten 14 Tage
        // Gruppiert nach Event mit Anzahl der Teilnehmer
        $stmt = $conn->prepare("
            SELECT 
                ce.id,
                ce.event_name,
                ce.start_time,
                ce.location,
                COUNT(DISTINCT cea.id) as participation_count,
                COUNT(DISTINCT CASE WHEN cea.attended IS NULL THEN cea.id END) as pending_count,
                COUNT(DISTINCT CASE WHEN cea.attended = 1 THEN cea.id END) as participated_count,
                COUNT(DISTINCT CASE WHEN cea.attended = 0 THEN cea.id END) as not_participated_count
            FROM calendly_events ce
            LEFT JOIN calendly_event_attendees cea ON cea.event_id = ce.id
            WHERE ce.start_time >= ? AND ce.start_time <= ?
            GROUP BY ce.id, ce.event_name, ce.start_time, ce.location
            ORDER BY ce.start_time ASC
            LIMIT 20
        ");
        $stmt->bind_param("ss", $nowStr, $futureDateStr);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $webinars = [];
        
        while ($row = $result->fetch_assoc()) {
            $eventDate = new DateTime($row['start_time']);
            
            $webinars[] = [
                'webinar_date' => $row['start_time'],
                'webinar_date_formatted' => $eventDate->format('d.m.Y H:i') . ' Uhr',
                'event_name' => $row['event_name'],
                'location' => $row['location'],
                'participation_count' => (int)$row['participation_count'],
                'pending_count' => (int)$row['pending_count'],
                'participated_count' => (int)$row['participated_count'],
                'not_participated_count' => (int)$row['not_participated_count']
            ];
        }
        
        $stmt->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'webinars' => $webinars
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }
?>

