<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Error logging
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../../php_error.log');
    
    try {
        $conn = db_connect();

        // Parameter aus GET-Request
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $bundesland = isset($_GET['bundesland']) ? trim($_GET['bundesland']) : '';
        $schulart = isset($_GET['schulart']) ? trim($_GET['schulart']) : '';
        $limit = isset($_GET['limit']) ? max(1, min(1000, intval($_GET['limit']))) : 20;

        // SQL-Query aufbauen
        $where_conditions = [];
        $params = [];
        $param_types = '';

        if (!empty($search)) {
            $where_conditions[] = "s.name LIKE ?";
            $params[] = "%$search%";
            $param_types .= 's';
        }

        if (!empty($bundesland)) {
            $where_conditions[] = "s.bundesland = ?";
            $params[] = $bundesland;
            $param_types .= 's';
        }
        
        if (!empty($schulart)) {
            $where_conditions[] = "s.schulart = ?";
            $params[] = $schulart;
            $param_types .= 's';
        }

        $where_sql = '';
        if (!empty($where_conditions)) {
            $where_sql = 'WHERE ' . implode(' AND ', $where_conditions);
        }

        // Prüfe welche Spalten existieren
        $columns_to_select = ['s.id', 's.name', 's.bundesland'];
        $optional_columns = [
            'schulart' => 's.schulart',
            'ort' => 's.ort'
        ];
        
        foreach ($optional_columns as $column_name => $column_select) {
            $check_column = $conn->query("SHOW COLUMNS FROM schools LIKE '$column_name'");
            if ($check_column && $check_column->num_rows > 0) {
                $columns_to_select[] = $column_select;
            }
        }
        
        $sql = "SELECT " . implode(', ', $columns_to_select) . "
                FROM schools s 
                $where_sql
                ORDER BY s.name
                LIMIT ?";
        
        $params[] = $limit;
        $param_types .= 'i';

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            $error_msg = 'Prepare failed: ' . $conn->error;
            error_log('[get_schools_register.php] ' . $error_msg);
            echo json_encode(['error' => 'Query preparation failed', 'details' => $conn->error]);
            $conn->close();
            exit;
        }
        
        // Parameter binden
        if ($param_types !== '' && count($params) > 0) {
            // Hilfsfunktion: Referenzen für bind_param erzeugen
            function make_params_by_ref(&$params) {
                $refs = [];
                foreach ($params as $key => $value) {
                    $refs[$key] = &$params[$key];
                }
                return $refs;
            }
            
            $bindParams = make_params_by_ref($params);
            array_unshift($bindParams, $param_types);
            call_user_func_array([$stmt, 'bind_param'], $bindParams);
        }
        
        if (!$stmt->execute()) {
            http_response_code(500);
            $error_msg = 'Query execution failed: ' . $stmt->error;
            error_log('[get_schools_register.php] ' . $error_msg);
            echo json_encode(['error' => 'Query failed', 'details' => $stmt->error]);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $result = $stmt->get_result();
        $schools = [];
        
        while ($row = $result->fetch_assoc()) {
            $schools[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'bundesland' => $row['bundesland'],
                'schulart' => isset($row['schulart']) ? $row['schulart'] : null,
                'ort' => isset($row['ort']) ? $row['ort'] : null
            ];
        }
        
        $stmt->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'schools' => $schools
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Exception: ' . $e->getMessage() . ' | File: ' . __FILE__ . ' | Line: ' . $e->getLine();
        error_log('[get_schools_register.php] ' . $error_msg);
        echo json_encode(['success' => false, 'error' => 'Server error', 'details' => $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

