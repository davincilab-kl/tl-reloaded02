<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['challenge_id']) || !isset($input['title']) || !isset($input['challenge_type']) || !isset($input['state'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    $challenge_id = intval($input['challenge_id']);
    if ($challenge_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid challenge ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob challenges Tabelle existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'challenges'");
        $table_exists = $check_table && $check_table->num_rows > 0;

        if (!$table_exists) {
            http_response_code(404);
            echo json_encode(['error' => 'Challenges table not found']);
            $conn->close();
            exit;
        }

        // Prüfe ob Challenge existiert
        $check_sql = "SELECT id FROM challenges WHERE id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('i', $challenge_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Challenge not found']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();

        $title = $conn->real_escape_string($input['title']);
        $description = isset($input['description']) ? $conn->real_escape_string($input['description']) : null;
        $challenge_type = $conn->real_escape_string($input['challenge_type']);
        $state = $conn->real_escape_string($input['state']);
        $start_date = !empty($input['start_date']) ? $conn->real_escape_string($input['start_date']) : null;
        $end_date = !empty($input['end_date']) ? $conn->real_escape_string($input['end_date']) : null;
        $state_filter = !empty($input['state_filter']) ? $conn->real_escape_string($input['state_filter']) : null;
        $sponsor_filter = !empty($input['sponsor_filter']) ? $conn->real_escape_string($input['sponsor_filter']) : null;
        $image_path = !empty($input['image_path']) ? $conn->real_escape_string($input['image_path']) : null;

        $sql = "UPDATE challenges 
                SET title = ?, description = ?, challenge_type = ?, state = ?, 
                    start_date = ?, end_date = ?, state_filter = ?, sponsor_filter = ?, image_path = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param('sssssssssi', $title, $description, $challenge_type, $state, $start_date, $end_date, $state_filter, $sponsor_filter, $image_path, $challenge_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Challenge erfolgreich aktualisiert'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[update_challenge.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

