<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    
    header('Content-Type: application/json');
    
    $list_id = isset($_GET['list_id']) ? intval($_GET['list_id']) : 0;
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;
    
    if ($list_id <= 0 || $teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid IDs']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        $sql = "SELECT c.id, c.teacher_id, c.cached_data, c.cached_at,
                       c.color_marker, c.notes, c.tags, c.updated_at,
                       c.updated_by_user_id,
                       u.first_name, u.last_name as updater_last_name
                FROM admin_teacher_list_cache c
                LEFT JOIN users u ON c.updated_by_user_id = u.id
                WHERE c.list_id = ? AND c.teacher_id = ?";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('ii', $list_id, $teacher_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Eintrag nicht gefunden']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $row = $result->fetch_assoc();
        $stmt->close();
        
        $updater_name = null;
        if ($row['updated_by_user_id'] && $row['first_name']) {
            $updater_name = trim(($row['first_name'] ?? '') . ' ' . ($row['updater_last_name'] ?? ''));
        }
        
        echo json_encode([
            'success' => true,
            'entry' => [
                'cache_id' => (int)$row['id'],
                'teacher_id' => (int)$row['teacher_id'],
                'cached_data' => json_decode($row['cached_data'], true),
                'cached_at' => $row['cached_at'],
                'color_marker' => $row['color_marker'],
                'notes' => $row['notes'],
                'tags' => $row['tags'] ? json_decode($row['tags'], true) : [],
                'updated_at' => $row['updated_at'],
                'updated_by_user_id' => $row['updated_by_user_id'] ? (int)$row['updated_by_user_id'] : null,
                'updated_by_name' => $updater_name
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

