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
    $title = isset($input['title']) ? trim($input['title']) : null;
    $sender = isset($input['sender']) ? intval($input['sender']) : null;
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : null;
    $receiver = 0; // 0/NULL steht für Admin-Empfänger

    if (mb_strlen($message) < 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nachricht ist zu kurz']);
        exit;
    }
    
    $conn = db_connect();

    try {
        // Verwende user_id, wenn gesetzt, sonst sender, sonst 1 als Fallback
        if ($user_id !== null && $user_id > 0) {
            $sender = $user_id;
        } elseif ($sender === null) {
            $sender = 1; // Fallback für Lehrerdashboard ohne User-ID
        }
        
        // Beim Einfügen wird thread_id zunächst NULL gesetzt, dann wird sie auf die eigene ID aktualisiert
        // title wird nur bei der ersten Nachricht gesetzt
        // Verwende aktuelle Zeit in österreichischer Zeitzone
        $now = new DateTime('now', new DateTimeZone('Europe/Vienna'));
        $timestamp_str = $now->format('Y-m-d H:i:s');
        
        $sql = "INSERT INTO messages (message, title, sender, receiver, m_read, thread_id, timestamp) VALUES (?, ?, ?, ?, 0, NULL, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('ssiis', $message, $title, $sender, $receiver, $timestamp_str);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $insert_id = $stmt->insert_id;
        $stmt->close();
        
        // thread_id auf die eigene ID setzen (für die erste Nachricht im Thread)
        $update_sql = "UPDATE messages SET thread_id = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if ($update_stmt) {
            $update_stmt->bind_param('ii', $insert_id, $insert_id);
            $update_stmt->execute();
            $update_stmt->close();
        }

        echo json_encode(['success' => true, 'id' => $insert_id, 'thread_id' => $insert_id]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>


