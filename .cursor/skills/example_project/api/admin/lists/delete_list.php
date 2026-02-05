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
        // Prüfe ob Liste existiert
        $check_sql = "SELECT id FROM admin_teacher_lists WHERE id = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('i', $list_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Liste nicht gefunden']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $check_stmt->close();
        
        // Lösche Liste (CASCADE löscht automatisch Cache-Einträge)
        $delete_sql = "DELETE FROM admin_teacher_lists WHERE id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param('i', $list_id);
        
        if (!$delete_stmt->execute()) {
            throw new Exception('Delete failed: ' . $delete_stmt->error);
        }
        
        $delete_stmt->close();
        
        echo json_encode([
            'success' => true,
            'list_id' => $list_id
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

