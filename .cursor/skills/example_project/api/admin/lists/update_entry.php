<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    
    header('Content-Type: application/json');
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['list_id']) || !isset($input['teacher_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'list_id und teacher_id sind erforderlich']);
        exit;
    }
    
    $list_id = intval($input['list_id']);
    $teacher_id = intval($input['teacher_id']);
    $user_id = get_user_id();
    
    if ($list_id <= 0 || $teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid IDs']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Prüfe ob Eintrag existiert
        $check_sql = "SELECT id FROM admin_teacher_list_cache 
                     WHERE list_id = ? AND teacher_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('ii', $list_id, $teacher_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Eintrag nicht gefunden']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $check_stmt->close();
        
        // Baue UPDATE-Query
        $update_fields = [];
        $params = [];
        $param_types = '';
        
        if (array_key_exists('color_marker', $input)) {
            $update_fields[] = "color_marker = ?";
            $color_value = ($input['color_marker'] === null || $input['color_marker'] === '' || $input['color_marker'] === 'none') ? null : $input['color_marker'];
            $params[] = $color_value;
            $param_types .= 's'; // VARCHAR-Spalte, auch NULL wird als 's' gebunden
        }
        
        if (isset($input['notes'])) {
            $update_fields[] = "notes = ?";
            $params[] = $input['notes'];
            $param_types .= 's';
        }
        
        if (isset($input['tags'])) {
            $update_fields[] = "tags = ?";
            $tags_json = is_array($input['tags']) ? json_encode($input['tags']) : $input['tags'];
            $params[] = $tags_json;
            $param_types .= 's';
        }
        
        if (empty($update_fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'Keine Felder zum Aktualisieren']);
            $conn->close();
            exit;
        }
        
        $update_fields[] = "updated_by_user_id = ?";
        $update_fields[] = "updated_at = NOW()";
        $params[] = $user_id;
        $param_types .= 'i';
        
        $params[] = $list_id;
        $params[] = $teacher_id;
        $param_types .= 'ii';
        
        $sql = "UPDATE admin_teacher_list_cache 
                SET " . implode(', ', $update_fields) . "
                WHERE list_id = ? AND teacher_id = ?";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $refs = [];
        foreach ($params as $key => $value) {
            $refs[$key] = &$params[$key];
        }
        array_unshift($refs, $param_types);
        call_user_func_array([$stmt, 'bind_param'], $refs);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'list_id' => $list_id,
            'teacher_id' => $teacher_id
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

