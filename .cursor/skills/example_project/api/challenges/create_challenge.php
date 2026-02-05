<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['title']) || !isset($input['challenge_type']) || !isset($input['state'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
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

        $title = $conn->real_escape_string($input['title']);
        $description = isset($input['description']) ? $conn->real_escape_string($input['description']) : null;
        $challenge_type = $conn->real_escape_string($input['challenge_type']);
        $state = $conn->real_escape_string($input['state']);
        $start_date = !empty($input['start_date']) ? $conn->real_escape_string($input['start_date']) : null;
        $end_date = !empty($input['end_date']) ? $conn->real_escape_string($input['end_date']) : null;
        $state_filter = !empty($input['state_filter']) ? $conn->real_escape_string($input['state_filter']) : null;
        $sponsor_filter = !empty($input['sponsor_filter']) ? $conn->real_escape_string($input['sponsor_filter']) : null;
        $image_path = !empty($input['image_path']) ? $conn->real_escape_string($input['image_path']) : null;

        $sql = "INSERT INTO challenges (title, description, challenge_type, state, start_date, end_date, state_filter, sponsor_filter, image_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param('sssssssss', $title, $description, $challenge_type, $state, $start_date, $end_date, $state_filter, $sponsor_filter, $image_path);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $challenge_id = $conn->insert_id;
        $stmt->close();

        echo json_encode([
            'success' => true,
            'challenge_id' => $challenge_id,
            'message' => 'Challenge erfolgreich erstellt'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[create_challenge.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

