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
    
    if (!isset($input['attendee_id']) || !isset($input['attended'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters: attendee_id, attended']);
        exit;
    }

    $attendeeId = (int)$input['attendee_id'];
    $attended = $input['attended'] === true || $input['attended'] === 'true' || $input['attended'] === 1;
    $userId = get_user_id();

    try {
        $conn = db_connect();
        
        // Prüfe ob Attendee existiert
        $stmt = $conn->prepare("SELECT id FROM calendly_event_attendees WHERE id = ?");
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
        
        $stmt->close();
        
        // Update Anwesenheit
        $stmt = $conn->prepare("UPDATE calendly_event_attendees SET attended = ?, updated_by_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->bind_param("iii", $attended, $userId, $attendeeId);
        $stmt->execute();
        $stmt->close();
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Anwesenheit aktualisiert'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Aktualisieren der Anwesenheit: ' . $e->getMessage()
        ]);
    }
?>

