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
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    
    // Validierung
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name ist erforderlich']);
        exit;
    }
    
    if (empty($input['filter_config']) || !is_array($input['filter_config'])) {
        http_response_code(400);
        echo json_encode(['error' => 'filter_config ist erforderlich']);
        exit;
    }
    
    if (empty($input['columns_config']) || !is_array($input['columns_config'])) {
        http_response_code(400);
        echo json_encode(['error' => 'columns_config ist erforderlich']);
        exit;
    }
    
    $conn = db_connect();
    $user_id = get_user_id();
    
    try {
        // Erstelle Liste
        $name = $conn->real_escape_string($input['name']);
        $filter_config_json = json_encode($input['filter_config']);
        $columns_config_json = json_encode($input['columns_config']);
        
        $sql = "INSERT INTO admin_teacher_lists 
                (name, created_by_user_id, filter_config, columns_config, is_generating, last_updated) 
                VALUES (?, ?, ?, ?, 1, NOW())";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('siss', $name, $user_id, $filter_config_json, $columns_config_json);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $list_id = $conn->insert_id;
        $stmt->close();
        
        // Starte Cache-Generierung im Hintergrund (asynchron)
        // Verwende exec() um PHP-Script im Hintergrund zu starten
        $script_path = __DIR__ . '/generate_cache_background.php';
        $command = "php " . escapeshellarg($script_path) . " " . escapeshellarg($list_id) . " > /dev/null 2>&1 &";
        exec($command);
        
        // Hole erstellte Liste zurück
        $get_sql = "SELECT id, name, created_by_user_id, filter_config, columns_config, 
                           last_updated, is_generating, created_at, updated_at
                    FROM admin_teacher_lists 
                    WHERE id = ?";
        $get_stmt = $conn->prepare($get_sql);
        $get_stmt->bind_param('i', $list_id);
        $get_stmt->execute();
        $result = $get_stmt->get_result();
        $list = $result->fetch_assoc();
        $get_stmt->close();
        
        // Hole Anzahl der gecachten Einträge (kann noch 0 sein wenn gerade generiert wird)
        $count_sql = "SELECT COUNT(*) as count FROM admin_teacher_list_cache WHERE list_id = ?";
        $count_stmt = $conn->prepare($count_sql);
        $count_stmt->bind_param('i', $list_id);
        $count_stmt->execute();
        $count_result = $count_stmt->get_result();
        $count_row = $count_result->fetch_assoc();
        $count_stmt->close();
        
        $list['filter_config'] = json_decode($list['filter_config'], true);
        $list['columns_config'] = json_decode($list['columns_config'], true);
        $list['teacher_count'] = (int)$count_row['count'];
        $list['is_generating'] = (bool)$list['is_generating'];
        
        echo json_encode([
            'success' => true,
            'list' => $list
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

