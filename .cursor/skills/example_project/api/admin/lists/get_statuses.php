<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    
    header('Content-Type: application/json');
    
    $conn = db_connect();
    
    try {
        $sql = "SELECT id, display_name, label FROM teacher_stati ORDER BY `order` ASC";
        $result = $conn->query($sql);
        
        $statuses = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $statuses[] = [
                    'id' => (int)$row['id'],
                    'display_name' => $row['display_name'],
                    'label' => $row['label']
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'statuses' => $statuses
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

