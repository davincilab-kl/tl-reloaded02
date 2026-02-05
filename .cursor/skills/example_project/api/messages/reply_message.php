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
    $message = isset($input['message']) ? trim($input['message']) : '';
    $thread_id = isset($input['thread_id']) ? (int)$input['thread_id'] : null;
    $receiver = isset($input['receiver']) ? (int)$input['receiver'] : null;
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : null;
    $sender = isset($input['sender']) ? intval($input['sender']) : null;

    if (mb_strlen($message) < 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nachricht ist zu kurz']);
        exit;
    }

    if ($thread_id === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'thread_id fehlt']);
        exit;
    }

    if ($receiver === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'receiver fehlt']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Thread archiviert ist
        $check_archived = $conn->prepare("SELECT COUNT(*) as count FROM messages WHERE (thread_id = ? OR id = ?) AND archived = 1");
        if ($check_archived) {
            $check_archived->bind_param('ii', $thread_id, $thread_id);
            $check_archived->execute();
            $archived_result = $check_archived->get_result();
            $archived_row = $archived_result->fetch_assoc();
            $check_archived->close();
            
            if ($archived_row && $archived_row['count'] > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Auf archivierte Threads kann nicht geantwortet werden']);
                exit;
            }
        }
        
        // Bestimme sender: user_id hat Priorität, dann sender, sonst NULL (Admin)
        $final_sender = null;
        if ($user_id !== null && $user_id > 0) {
            $final_sender = $user_id;
        } elseif ($sender !== null && $sender > 0) {
            $final_sender = $sender;
        }
        
        // Hole den title vom ursprünglichen Thread (erste Nachricht)
        $title_sql = "SELECT title FROM messages WHERE id = ? OR thread_id = ? ORDER BY id ASC LIMIT 1";
        $title_stmt = $conn->prepare($title_sql);
        $thread_title = null;
        if ($title_stmt) {
            $title_stmt->bind_param('ii', $thread_id, $thread_id);
            $title_stmt->execute();
            $title_result = $title_stmt->get_result();
            if ($title_row = $title_result->fetch_assoc()) {
                $thread_title = $title_row['title'];
            }
            $title_stmt->close();
        }
        
        // Antwort senden (mit dem title vom ursprünglichen Thread)
        // Verwende aktuelle Zeit in österreichischer Zeitzone
        $now = new DateTime('now', new DateTimeZone('Europe/Vienna'));
        $timestamp_str = $now->format('Y-m-d H:i:s');
        
        $sql = "INSERT INTO messages (message, title, sender, receiver, m_read, thread_id, timestamp) VALUES (?, ?, ?, ?, 0, ?, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('ssiiis', $message, $thread_title, $final_sender, $receiver, $thread_id, $timestamp_str);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        echo json_encode(['success' => true, 'id' => $stmt->insert_id, 'thread_id' => $thread_id]);
        $stmt->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

