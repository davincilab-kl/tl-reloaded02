<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // Nur Admin-Zugriff erlauben
    require_admin();

    $conn = db_connect();

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        $conn->close();
        exit;
    }

    $teacher_id = isset($input['teacher_id']) ? intval($input['teacher_id']) : 0;
    $note_text = isset($input['note_text']) ? trim($input['note_text']) : '';

    // Validierung
    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid teacher ID']);
        $conn->close();
        exit;
    }

    if (empty($note_text)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Note text cannot be empty']);
        $conn->close();
        exit;
    }

    try {
        // Prüfe ob Lehrer existiert
        $check_teacher_sql = "SELECT id FROM teachers WHERE id = ?";
        $check_stmt = $conn->prepare($check_teacher_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $check_stmt->bind_param('i', $teacher_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            $check_stmt->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Teacher not found']);
            $conn->close();
            exit;
        }
        $check_stmt->close();

        // Hole User-ID aus Session
        $created_by_user_id = get_user_id();
        if (!$created_by_user_id) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'User not authenticated']);
            $conn->close();
            exit;
        }

        // Notiz erstellen
        $sql = "INSERT INTO teacher_notes (teacher_id, created_by_user_id, note_text) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('iis', $teacher_id, $created_by_user_id, $note_text);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $note_id = $conn->insert_id;
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'note_id' => $note_id,
            'message' => 'Notiz erfolgreich erstellt'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }

    $conn->close();
?>
