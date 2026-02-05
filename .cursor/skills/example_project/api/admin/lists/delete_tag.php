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
    
    if (!$input || !isset($input['list_id']) || !isset($input['tag'])) {
        http_response_code(400);
        echo json_encode(['error' => 'list_id und tag sind erforderlich']);
        exit;
    }
    
    $list_id = intval($input['list_id']);
    $tag_to_delete = trim($input['tag']);
    
    if ($list_id <= 0 || empty($tag_to_delete)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid list_id or tag']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Hole alle Einträge der Liste
        $get_sql = "SELECT id, teacher_id, tags FROM admin_teacher_list_cache WHERE list_id = ?";
        $get_stmt = $conn->prepare($get_sql);
        $get_stmt->bind_param('i', $list_id);
        $get_stmt->execute();
        $result = $get_stmt->get_result();
        
        $updated_count = 0;
        
        while ($row = $result->fetch_assoc()) {
            $tags = [];
            if (!empty($row['tags'])) {
                $tags = json_decode($row['tags'], true);
                if (!is_array($tags)) {
                    $tags = [];
                }
            }
            
            // Entferne das Tag aus dem Array
            $tags = array_filter($tags, function($tag) use ($tag_to_delete) {
                return trim($tag) !== $tag_to_delete;
            });
            
            // Konvertiere zurück zu indiziertem Array
            $tags = array_values($tags);
            
            // Aktualisiere den Eintrag
            $update_sql = "UPDATE admin_teacher_list_cache SET tags = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $tags_json = json_encode($tags);
            $update_stmt->bind_param('si', $tags_json, $row['id']);
            
            if ($update_stmt->execute()) {
                $updated_count++;
            }
            $update_stmt->close();
        }
        
        $get_stmt->close();
        
        echo json_encode([
            'success' => true,
            'list_id' => $list_id,
            'tag' => $tag_to_delete,
            'updated_count' => $updated_count
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

