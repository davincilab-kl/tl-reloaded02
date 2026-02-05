<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
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
    $project_id = isset($input['project_id']) ? (int)$input['project_id'] : null;
    $challenge_ids = isset($input['challenge_ids']) && is_array($input['challenge_ids']) ? $input['challenge_ids'] : [];

    if ($project_id === null || $project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    // Prüfe ob User berechtigt ist (Admin oder Teacher)
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    $user_role = get_user_role();
    if ($user_role !== 'admin' && $user_role !== 'teacher') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Projekt existiert
        $check_sql = "SELECT id FROM projects WHERE id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('i', $project_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();
        
        // Prüfe ob challenge_participations Tabelle existiert
        $check_participations_table = $conn->query("SHOW TABLES LIKE 'challenge_participations'");
        $has_participations_table = $check_participations_table && $check_participations_table->num_rows > 0;
        
        if (!$has_participations_table) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Challenge participations table not found']);
            $conn->close();
            exit;
        }
        
        // Entferne alle bestehenden Challenge-Teilnahmen für dieses Projekt
        $delete_sql = "DELETE FROM challenge_participations WHERE project_id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        if (!$delete_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $delete_stmt->bind_param('i', $project_id);
        if (!$delete_stmt->execute()) {
            throw new Exception('Execute failed: ' . $delete_stmt->error);
        }
        $delete_stmt->close();
        
        // Füge neue Challenge-Teilnahmen hinzu
        if (!empty($challenge_ids)) {
            $insert_sql = "INSERT INTO challenge_participations (challenge_id, project_id) VALUES (?, ?)";
            $insert_stmt = $conn->prepare($insert_sql);
            if (!$insert_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            foreach ($challenge_ids as $challenge_id) {
                $challenge_id_int = (int)$challenge_id;
                if ($challenge_id_int > 0) {
                    $insert_stmt->bind_param('ii', $challenge_id_int, $project_id);
                    if (!$insert_stmt->execute()) {
                        // Ignoriere Duplikat-Fehler (UNIQUE KEY)
                        if (strpos($insert_stmt->error, 'Duplicate entry') === false) {
                            throw new Exception('Execute failed: ' . $insert_stmt->error);
                        }
                    }
                }
            }
            $insert_stmt->close();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Project added to challenges successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[add_project_to_challenges.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

