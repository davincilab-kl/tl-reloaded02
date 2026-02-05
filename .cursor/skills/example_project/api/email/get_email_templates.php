<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

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

        // Alle Vorlagen abrufen
        $sql = "SELECT id, name, subject, body, is_html, created_at, updated_at 
                FROM email_templates 
                ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $templates = [];
        
        while ($row = $result->fetch_assoc()) {
            $templates[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'subject' => $row['subject'],
                'body' => $row['body'],
                'is_html' => (int)$row['is_html'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }

        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'templates' => $templates,
            'total' => count($templates)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

