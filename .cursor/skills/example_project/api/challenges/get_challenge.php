<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $challenge_id = isset($_GET['challenge_id']) ? intval($_GET['challenge_id']) : 0;

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

        // Hole Challenge-Details
        $challenge_sql = "SELECT id, title, description, challenge_type, state, start_date, end_date, state_filter, sponsor_filter, image_path
                         FROM challenges
                         WHERE id = ? LIMIT 1";
        $challenge_stmt = $conn->prepare($challenge_sql);
        if (!$challenge_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $challenge_stmt->bind_param('i', $challenge_id);
        if (!$challenge_stmt->execute()) {
            throw new Exception('Execute failed: ' . $challenge_stmt->error);
        }
        
        $challenge_result = $challenge_stmt->get_result();
        if ($challenge_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Challenge not found']);
            $challenge_stmt->close();
            $conn->close();
            exit;
        }
        
        $challenge_row = $challenge_result->fetch_assoc();
        $challenge = [
            'id' => (int)$challenge_row['id'],
            'title' => $challenge_row['title'],
            'description' => $challenge_row['description'] ?? '',
            'challenge_type' => $challenge_row['challenge_type'],
            'state' => $challenge_row['state'] ?? 'active',
            'start_date' => $challenge_row['start_date'] ?? null,
            'end_date' => $challenge_row['end_date'] ?? null,
            'state_filter' => $challenge_row['state_filter'] ?? null,
            'sponsor_filter' => $challenge_row['sponsor_filter'] ?? null,
            'image_path' => $challenge_row['image_path'] ?? null
        ];
        
        $challenge_stmt->close();

        echo json_encode([
            'success' => true,
            'challenge' => $challenge
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[get_challenge.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

