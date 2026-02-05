<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['challenge_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing challenge_id']);
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

        // Lösche Challenge
        $delete_sql = "DELETE FROM challenges WHERE id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        if (!$delete_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $delete_stmt->bind_param('i', $challenge_id);
        
        if (!$delete_stmt->execute()) {
            throw new Exception('Execute failed: ' . $delete_stmt->error);
        }
        
        $delete_stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Challenge erfolgreich gelöscht'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[delete_challenge.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

