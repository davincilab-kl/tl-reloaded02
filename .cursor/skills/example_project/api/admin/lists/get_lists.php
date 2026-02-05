<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    
    header('Content-Type: application/json');
    
    $conn = db_connect();
    $user_id = get_user_id();
    
    try {
        // Hole alle Listen (optional: nur eigene Listen)
        $only_own = isset($_GET['only_own']) && $_GET['only_own'] === 'true';
        
        if ($only_own) {
            $sql = "SELECT id, name, created_by_user_id, filter_config, columns_config, 
                           last_updated, is_generating, created_at, updated_at
                    FROM admin_teacher_lists 
                    WHERE created_by_user_id = ?
                    ORDER BY updated_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $user_id);
        } else {
            $sql = "SELECT id, name, created_by_user_id, filter_config, columns_config, 
                           last_updated, is_generating, created_at, updated_at
                    FROM admin_teacher_lists 
                    ORDER BY updated_at DESC";
            $stmt = $conn->prepare($sql);
        }
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $lists = [];
        
        while ($row = $result->fetch_assoc()) {
            // Hole Anzahl der gecachten Einträge
            $count_sql = "SELECT COUNT(*) as count FROM admin_teacher_list_cache WHERE list_id = ?";
            $count_stmt = $conn->prepare($count_sql);
            $count_stmt->bind_param('i', $row['id']);
            $count_stmt->execute();
            $count_result = $count_stmt->get_result();
            $count_row = $count_result->fetch_assoc();
            $count_stmt->close();
            
            // Hole Creator-Name
            $creator_sql = "SELECT CONCAT(first_name, ' ', last_name) as name 
                          FROM users WHERE id = ?";
            $creator_stmt = $conn->prepare($creator_sql);
            $creator_name = 'Unbekannt';
            if ($creator_stmt) {
                $creator_stmt->bind_param('i', $row['created_by_user_id']);
                $creator_stmt->execute();
                $creator_result = $creator_stmt->get_result();
                if ($creator_row = $creator_result->fetch_assoc()) {
                    $creator_name = $creator_row['name'];
                }
                $creator_stmt->close();
            }
            
            $lists[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'created_by_user_id' => (int)$row['created_by_user_id'],
                'created_by_name' => $creator_name,
                'filter_config' => json_decode($row['filter_config'], true),
                'columns_config' => json_decode($row['columns_config'], true),
                'last_updated' => $row['last_updated'],
                'is_generating' => (bool)$row['is_generating'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'teacher_count' => (int)$count_row['count']
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'lists' => $lists
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

