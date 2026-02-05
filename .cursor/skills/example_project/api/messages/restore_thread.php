<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $thread_id = isset($input['thread_id']) ? (int)$input['thread_id'] : null;

    if ($thread_id === null || $thread_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'thread_id fehlt oder ungültig']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob archived Spalte existiert
        $check_column = $conn->query("SHOW COLUMNS FROM messages LIKE 'archived'");
        if ($check_column->num_rows == 0) {
            $conn->query("ALTER TABLE messages ADD COLUMN archived BOOLEAN DEFAULT 0");
        }
        
        // Alle Nachrichten des Threads wiederherstellen (archived = 0)
        $sql = "UPDATE messages SET archived = 0 WHERE thread_id = ? OR id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('ii', $thread_id, $thread_id);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $restored_rows = $stmt->affected_rows;
        $stmt->close();

        echo json_encode([
            'success' => true,
            'thread_id' => $thread_id,
            'restored_messages' => $restored_rows,
            'message' => 'Thread erfolgreich wiederhergestellt'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

