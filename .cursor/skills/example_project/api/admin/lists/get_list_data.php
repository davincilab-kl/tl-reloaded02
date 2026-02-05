<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    
    header('Content-Type: application/json');
    
    $list_id = isset($_GET['list_id']) ? intval($_GET['list_id']) : 0;
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit_input = isset($_GET['limit']) ? $_GET['limit'] : 50;
    
    // Behandle "alle" als sehr große Zahl
    if ($limit_input === 'all' || $limit_input === '999999') {
        $limit = 999999; // Praktisch unbegrenzt
        $offset = 0;
        $page = 1; // Bei "alle" immer Seite 1
    } else {
        $limit = max(1, min(999999, intval($limit_input)));
        $offset = ($page - 1) * $limit;
    }
    
    // Filter
    $color_filter = isset($_GET['color']) ? trim($_GET['color']) : '';
    $tag_filter = isset($_GET['tag']) ? trim($_GET['tag']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Sortierung
    $sort_column = isset($_GET['sort_column']) ? trim($_GET['sort_column']) : '';
    $sort_direction = isset($_GET['sort_direction']) ? strtoupper(trim($_GET['sort_direction'])) : 'ASC';
    if ($sort_direction !== 'ASC' && $sort_direction !== 'DESC') {
        $sort_direction = 'ASC';
    }
    
    if ($list_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid list_id']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Prüfe ob Liste existiert
        $check_sql = "SELECT id, name, columns_config FROM admin_teacher_lists WHERE id = ?";
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
        
        $list_info = $check_result->fetch_assoc();
        $columns_config = json_decode($list_info['columns_config'], true);
        $check_stmt->close();
        
        // Baue WHERE-Bedingungen für Filter
        $where_conditions = ['c.list_id = ?'];
        $params = [$list_id];
        $param_types = 'i';
        
        if (!empty($color_filter)) {
            $where_conditions[] = "c.color_marker = ?";
            $params[] = $color_filter;
            $param_types .= 's';
        }
        
        if (!empty($tag_filter)) {
            $where_conditions[] = "JSON_CONTAINS(c.tags, ?)";
            $params[] = json_encode($tag_filter);
            $param_types .= 's';
        }
        
        if (!empty($search)) {
            $where_conditions[] = "(JSON_EXTRACT(c.cached_data, '$.name') LIKE ? OR JSON_EXTRACT(c.cached_data, '$.email') LIKE ?)";
            $search_term = "%$search%";
            $params[] = $search_term;
            $params[] = $search_term;
            $param_types .= 'ss';
        }
        
        $where_sql = 'WHERE ' . implode(' AND ', $where_conditions);
        
        // Hole Gesamtanzahl
        $count_sql = "SELECT COUNT(*) as total FROM admin_teacher_list_cache c $where_sql";
        $count_stmt = $conn->prepare($count_sql);
        if ($param_types !== '' && count($params) > 0) {
            $refs = [];
            foreach ($params as $key => $value) {
                $refs[$key] = &$params[$key];
            }
            array_unshift($refs, $param_types);
            call_user_func_array([$count_stmt, 'bind_param'], $refs);
        }
        $count_stmt->execute();
        $count_result = $count_stmt->get_result();
        $total_row = $count_result->fetch_assoc();
        $total = (int)$total_row['total'];
        $count_stmt->close();
        
        // Baue ORDER BY-Klausel
        $order_by = "c.cached_at DESC"; // Standard-Sortierung
        
        if (!empty($sort_column)) {
            // Erlaubte Spalten für Sortierung
            $allowed_sort_columns = [
                'name', 'email', 'phone', 'school_name', 'school_bundesland', 
                'infowebinar', 'class_count', 'student_count', 'total_t_coins', 
                'avg_t_coins', 'project_count', 'last_login', 'registered_at', 
                'status_name', 'admin', 'school_foerderung'
            ];
            
            if (in_array($sort_column, $allowed_sort_columns)) {
                // Spezielle Behandlung für verschiedene Datentypen
                if (in_array($sort_column, ['class_count', 'student_count', 'total_t_coins', 'avg_t_coins', 'project_count'])) {
                    // Numerische Felder
                    $order_by = "CAST(JSON_EXTRACT(c.cached_data, '$.{$sort_column}') AS DECIMAL(10,2)) {$sort_direction}";
                } elseif (in_array($sort_column, ['last_login', 'registered_at', 'infowebinar'])) {
                    // Datumsfelder
                    $order_by = "CAST(JSON_EXTRACT(c.cached_data, '$.{$sort_column}') AS DATETIME) {$sort_direction}";
                } elseif ($sort_column === 'admin') {
                    // Boolean-Feld
                    $order_by = "CAST(JSON_EXTRACT(c.cached_data, '$.{$sort_column}') AS UNSIGNED) {$sort_direction}";
                } else {
                    // Textfelder
                    $order_by = "JSON_EXTRACT(c.cached_data, '$.{$sort_column}') {$sort_direction}";
                }
            }
        }
        
        // Hole Daten mit Pagination
        $sql = "SELECT c.id, c.teacher_id, c.cached_data, c.cached_at, 
                       c.color_marker, c.notes, c.tags, c.updated_at,
                       c.updated_by_user_id
                FROM admin_teacher_list_cache c
                $where_sql
                ORDER BY {$order_by}
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        $param_types .= 'ii';
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        if ($param_types !== '' && count($params) > 0) {
            $refs = [];
            foreach ($params as $key => $value) {
                $refs[$key] = &$params[$key];
            }
            array_unshift($refs, $param_types);
            call_user_func_array([$stmt, 'bind_param'], $refs);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $entries = [];
        
        while ($row = $result->fetch_assoc()) {
            $cached_data = json_decode($row['cached_data'], true);
            
            // Filtere Spalten basierend auf columns_config
            $filtered_data = [];
            foreach ($columns_config as $column => $enabled) {
                if ($enabled && array_key_exists($column, $cached_data)) {
                    $filtered_data[$column] = $cached_data[$column];
                }
            }
            
            // Füge immer ID hinzu
            $filtered_data['id'] = $cached_data['id'];
            $filtered_data['teacher_id'] = (int)$row['teacher_id'];
            
            $entries[] = [
                'cache_id' => (int)$row['id'],
                'teacher_id' => (int)$row['teacher_id'],
                'data' => $filtered_data,
                'cached_at' => $row['cached_at'],
                'color_marker' => $row['color_marker'],
                'notes' => $row['notes'],
                'tags' => $row['tags'] ? json_decode($row['tags'], true) : [],
                'updated_at' => $row['updated_at'],
                'updated_by_user_id' => $row['updated_by_user_id'] ? (int)$row['updated_by_user_id'] : null
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'list_id' => $list_id,
            'list_name' => $list_info['name'],
            'entries' => $entries,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

