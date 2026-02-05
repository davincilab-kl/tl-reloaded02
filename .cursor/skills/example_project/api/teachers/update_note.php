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

    $note_id = isset($input['note_id']) ? intval($input['note_id']) : 0;
    $note_text = isset($input['note_text']) ? trim($input['note_text']) : '';

    // Validierung
    if ($note_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid note ID']);
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
        // Prüfe ob Notiz existiert
        $check_sql = "SELECT id FROM teacher_notes WHERE id = ?";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $check_stmt->bind_param('i', $note_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            $check_stmt->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Note not found']);
            $conn->close();
            exit;
        }
        $check_stmt->close();

        // Notiz aktualisieren
        $sql = "UPDATE teacher_notes SET note_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('si', $note_text, $note_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Notiz erfolgreich aktualisiert'
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
