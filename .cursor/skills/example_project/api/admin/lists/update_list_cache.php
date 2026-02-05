<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    require_once __DIR__ . '/generate_cache.php';
    
    header('Content-Type: application/json');
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['list_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'list_id ist erforderlich']);
        exit;
    }
    
    $list_id = intval($input['list_id']);
    
    if ($list_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid list_id']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Hole Liste
        $get_sql = "SELECT id, filter_config, columns_config FROM admin_teacher_lists WHERE id = ?";
        $get_stmt = $conn->prepare($get_sql);
        $get_stmt->bind_param('i', $list_id);
        $get_stmt->execute();
        $result = $get_stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Liste nicht gefunden']);
            $get_stmt->close();
            $conn->close();
            exit;
        }
        
        $list = $result->fetch_assoc();
        $get_stmt->close();
        
        // Setze is_generating auf 1
        $update_generating_sql = "UPDATE admin_teacher_lists SET is_generating = 1 WHERE id = ?";
        $update_generating_stmt = $conn->prepare($update_generating_sql);
        $update_generating_stmt->bind_param('i', $list_id);
        $update_generating_stmt->execute();
        $update_generating_stmt->close();
        
        $filter_config = json_decode($list['filter_config'], true);
        $columns_config = json_decode($list['columns_config'], true);
        
        // Generiere neuen Cache im Hintergrund
        $script_path = __DIR__ . '/generate_cache_background.php';
        $command = "php " . escapeshellarg($script_path) . " " . escapeshellarg($list_id) . " > /dev/null 2>&1 &";
        exec($command);
        
        echo json_encode([
            'success' => true,
            'list_id' => $list_id,
            'message' => 'Aktualisierung wurde gestartet'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

