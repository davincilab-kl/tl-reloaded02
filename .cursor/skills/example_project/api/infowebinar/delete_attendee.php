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

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['attendee_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameter: attendee_id']);
        exit;
    }

    $attendeeId = (int)$input['attendee_id'];

    try {
        $conn = db_connect();
        
        // Prüfe ob Attendee existiert
        $stmt = $conn->prepare("SELECT id, event_id FROM calendly_event_attendees WHERE id = ?");
        $stmt->bind_param("i", $attendeeId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            $conn->close();
            http_response_code(404);
            echo json_encode(['error' => 'Attendee not found']);
            exit;
        }
        
        $attendee = $result->fetch_assoc();
        $eventId = $attendee['event_id'];
        $stmt->close();
        
        // Lösche Attendee
        $stmt = $conn->prepare("DELETE FROM calendly_event_attendees WHERE id = ?");
        $stmt->bind_param("i", $attendeeId);
        $stmt->execute();
        $stmt->close();
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Attendee gelöscht',
            'event_id' => $eventId
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Löschen des Attendees: ' . $e->getMessage()
        ]);
    }
?>
