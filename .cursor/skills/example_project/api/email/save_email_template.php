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
    $conn = db_connect();

    try {
        // Prüfe ob Tabelle existiert, falls nicht erstellen
        $check_table = $conn->query("SHOW TABLES LIKE 'email_templates'");
        if ($check_table->num_rows == 0) {
            $create_table = "CREATE TABLE IF NOT EXISTS email_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                body TEXT NOT NULL,
                is_html TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            $conn->query($create_table);
        }

        // Löschen wenn delete flag gesetzt
        if (isset($input['delete']) && $input['delete'] === true && isset($input['id'])) {
            $id = intval($input['id']);
            $delete_sql = "DELETE FROM email_templates WHERE id = ?";
            $delete_stmt = $conn->prepare($delete_sql);
            
            if (!$delete_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }

            $delete_stmt->bind_param('i', $id);
            
            if (!$delete_stmt->execute()) {
                throw new Exception('Execute failed: ' . $delete_stmt->error);
            }

            $delete_stmt->close();
            echo json_encode(['success' => true, 'message' => 'Vorlage gelöscht']);
            $conn->close();
            exit;
        }

        // Validierung
        $id = isset($input['id']) && $input['id'] ? intval($input['id']) : null;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $subject = isset($input['subject']) ? trim($input['subject']) : '';
        $body = isset($input['body']) ? trim($input['body']) : '';
        $is_html = isset($input['is_html']) ? intval($input['is_html']) : 0;

        if (empty($name) || empty($subject) || empty($body)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name, Betreff und Nachricht sind erforderlich']);
            exit;
        }

        if ($id) {
            // Update
            $update_sql = "UPDATE email_templates SET name = ?, subject = ?, body = ?, is_html = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            
            if (!$update_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }

            $update_stmt->bind_param('sssii', $name, $subject, $body, $is_html, $id);
            
            if (!$update_stmt->execute()) {
                throw new Exception('Execute failed: ' . $update_stmt->error);
            }

            $update_stmt->close();
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Vorlage aktualisiert']);
        } else {
            // Insert
            $insert_sql = "INSERT INTO email_templates (name, subject, body, is_html) VALUES (?, ?, ?, ?)";
            $insert_stmt = $conn->prepare($insert_sql);
            
            if (!$insert_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }

            $insert_stmt->bind_param('sssi', $name, $subject, $body, $is_html);
            
            if (!$insert_stmt->execute()) {
                throw new Exception('Execute failed: ' . $insert_stmt->error);
            }

            $insert_id = $insert_stmt->insert_id;
            $insert_stmt->close();
            echo json_encode(['success' => true, 'id' => $insert_id, 'message' => 'Vorlage erstellt']);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

