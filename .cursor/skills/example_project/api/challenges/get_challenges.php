<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // Prüfe ob challenges Tabelle existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'challenges'");
        $table_exists = $check_table && $check_table->num_rows > 0;

        if (!$table_exists) {
            // Erstelle challenges Tabelle falls sie nicht existiert
            // type-Spalte wird nicht mehr benötigt, da alle Challenges gleich behandelt werden
            $create_table_sql = "CREATE TABLE IF NOT EXISTS challenges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                challenge_type ENUM('tscore', 'projects') NOT NULL,
                state VARCHAR(50) DEFAULT 'active',
                start_date DATE,
                end_date DATE,
                state_filter VARCHAR(100) DEFAULT NULL,
                sponsor_filter VARCHAR(100) DEFAULT NULL,
                image_path VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";
            
            if (!$conn->query($create_table_sql)) {
                throw new Exception('Failed to create challenges table: ' . $conn->error);
            }
        }

        // Prüfe ob alle Challenges geladen werden sollen (für Admin)
        $all = isset($_GET['all']) && $_GET['all'] === 'true';
        
        // Challenges abfragen
        $sql = "SELECT id, title, description, challenge_type, state, start_date, end_date, state_filter, sponsor_filter, image_path
                FROM challenges";
        
        if (!$all) {
            $sql .= " WHERE state = 'active'";
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('Query failed: ' . $conn->error);
        }
        
        $challenges = [];
        while ($row = $result->fetch_assoc()) {
            $challenges[] = [
                'id' => (int)$row['id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'challenge_type' => $row['challenge_type'],
                'state' => $row['state'] ?? 'active',
                'start_date' => $row['start_date'] ?? null,
                'end_date' => $row['end_date'] ?? null,
                'state_filter' => $row['state_filter'] ?? null,
                'sponsor_filter' => $row['sponsor_filter'] ?? null,
                'image_path' => $row['image_path'] ?? null
            ];
        }

        echo json_encode([
            'success' => true,
            'challenges' => $challenges
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[get_challenges.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

