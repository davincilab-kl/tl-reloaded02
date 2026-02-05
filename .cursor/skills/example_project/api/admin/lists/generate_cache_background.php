<?php
    /**
     * Wird im Hintergrund aufgerufen um Cache zu generieren
     * Verwendung: php generate_cache_background.php <list_id>
     */
    
    require_once __DIR__ . '/../../config/access_db.php';
    require_once __DIR__ . '/generate_cache.php';
    
    if ($argc < 2) {
        exit(1);
    }
    
    $list_id = intval($argv[1]);
    
    if ($list_id <= 0) {
        exit(1);
    }
    
    $conn = db_connect();
    
    try {
        // Hole Liste
        $get_sql = "SELECT filter_config, columns_config FROM admin_teacher_lists WHERE id = ?";
        $get_stmt = $conn->prepare($get_sql);
        $get_stmt->bind_param('i', $list_id);
        $get_stmt->execute();
        $result = $get_stmt->get_result();
        
        if ($result->num_rows === 0) {
            exit(1);
        }
        
        $list = $result->fetch_assoc();
        $get_stmt->close();
        
        $filter_config = json_decode($list['filter_config'], true);
        $columns_config = json_decode($list['columns_config'], true);
        
        // Generiere Cache
        generate_list_cache($conn, $list_id, $filter_config, $columns_config);
        
        // Setze is_generating auf 0
        $update_sql = "UPDATE admin_teacher_lists SET is_generating = 0 WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param('i', $list_id);
        $update_stmt->execute();
        $update_stmt->close();
        
    } catch (Exception $e) {
        // Bei Fehler: Setze is_generating auf 0 und logge Fehler
        $update_sql = "UPDATE admin_teacher_lists SET is_generating = 0 WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param('i', $list_id);
        $update_stmt->execute();
        $update_stmt->close();
        
        error_log("Cache-Generierung fehlgeschlagen für Liste $list_id: " . $e->getMessage());
        exit(1);
    }
    
    $conn->close();
?>

