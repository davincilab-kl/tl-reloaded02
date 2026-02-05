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
    
    if (!isset($input['event_id']) || !isset($input['name']) || !isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters: event_id, name, email']);
        exit;
    }

    $eventId = (int)$input['event_id'];
    $name = trim($input['name']);
    $email = trim($input['email']);
    $attended = isset($input['attended']) ? ($input['attended'] === true || $input['attended'] === 'true' || $input['attended'] === 1 ? 1 : ($input['attended'] === false || $input['attended'] === 'false' || $input['attended'] === 0 ? 0 : null)) : null;
    $userId = isset($input['user_id']) && $input['user_id'] !== '' ? (int)$input['user_id'] : null;
    $prognosisClassCount = isset($input['prognosis_class_count']) && $input['prognosis_class_count'] !== '' ? (int)$input['prognosis_class_count'] : null;
    $prognosisStart = isset($input['prognosis_start']) && $input['prognosis_start'] !== '' ? trim($input['prognosis_start']) : null;
    $notes = isset($input['notes']) && $input['notes'] !== '' ? trim($input['notes']) : null;
    $updatedByUserId = get_user_id();

    if (empty($name) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Name und E-Mail dürfen nicht leer sein']);
        exit;
    }

    // Validiere E-Mail-Format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Ungültige E-Mail-Adresse']);
        exit;
    }

    try {
        $conn = db_connect();
        
        // Prüfe ob Event existiert
        $stmt = $conn->prepare("SELECT id FROM calendly_events WHERE id = ?");
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
        $stmt->close();
        
        // Prüfe ob Attendee mit dieser E-Mail bereits für dieses Event existiert
        $stmt = $conn->prepare("SELECT id FROM calendly_event_attendees WHERE event_id = ? AND email = ?");
        $stmt->bind_param("is", $eventId, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $stmt->close();
            $conn->close();
            http_response_code(400);
            echo json_encode(['error' => 'Ein Teilnehmer mit dieser E-Mail existiert bereits für dieses Event']);
            exit;
        }
        $stmt->close();
        
        // Validiere user_id falls gesetzt (muss Teacher sein)
        if ($userId !== null) {
            $stmt = $conn->prepare("
                SELECT u.id 
                FROM users u 
                WHERE u.id = ? AND u.role = 'teacher'
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                $stmt->close();
                $conn->close();
                http_response_code(400);
                echo json_encode(['error' => 'Invalid user_id: User must be a teacher']);
                exit;
            }
            $stmt->close();
        }
        
        // Neuen Attendee einfügen
        $stmt = $conn->prepare("
            INSERT INTO calendly_event_attendees 
            (event_id, name, email, attended, user_id, prognosis_class_count, prognosis_start, notes, updated_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("issiiissi", $eventId, $name, $email, $attended, $userId, $prognosisClassCount, $prognosisStart, $notes, $updatedByUserId);
        $stmt->execute();
        $newAttendeeId = $conn->insert_id;
        $stmt->close();
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Teilnehmer erfolgreich hinzugefügt',
            'attendee_id' => $newAttendeeId
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Hinzufügen des Teilnehmers: ' . $e->getMessage()
        ]);
    }
?>
