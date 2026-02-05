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
        $is_current = isset($_GET['is_current']) ? trim($_GET['is_current']) : '';
        
        // SQL-Query aufbauen
        $where_conditions = [];
        $params = [];
        $param_types = '';

        if ($is_current === '1' || $is_current === 'true') {
            $where_conditions[] = "is_current = ?";
            $params[] = 1;
            $param_types .= 'i';
        } elseif ($is_current === '0' || $is_current === 'false') {
            $where_conditions[] = "is_current = ?";
            $params[] = 0;
            $param_types .= 'i';
        }

        $where_sql = '';
        if (!empty($where_conditions)) {
            $where_sql = 'WHERE ' . implode(' AND ', $where_conditions);
        }

        // Prüfe ob Tabelle existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'school_years'");
        if (!$check_table || $check_table->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Tabelle school_years existiert noch nicht',
                'school_years' => []
            ]);
            $conn->close();
            exit;
        }

        $sql = "SELECT id, name, start_date, end_date, is_current, created_at
                FROM school_years 
                $where_sql
                ORDER BY start_date DESC, name DESC";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            $error_msg = 'Prepare failed: ' . $conn->error;
            error_log('[get_school_years.php] ' . $error_msg);
            echo json_encode(['success' => false, 'error' => 'Query preparation failed', 'details' => $conn->error, 'school_years' => []]);
            $conn->close();
            exit;
        }
        
        // Nur binden, wenn WHERE-Parameter existieren
        if ($param_types !== '' && count($params) > 0) {
            $bindParams = [];
            $bindParams[] = &$param_types;
            foreach ($params as $key => $value) {
                $bindParams[] = &$params[$key];
            }
            call_user_func_array([$stmt, 'bind_param'], $bindParams);
        }
        
        if (!$stmt->execute()) {
            http_response_code(500);
            $error_msg = 'Query execution failed: ' . $stmt->error;
            error_log('[get_school_years.php] ' . $error_msg);
            echo json_encode(['success' => false, 'error' => 'Query failed', 'details' => $stmt->error]);
            $stmt->close();
            $conn->close();
            exit;
        }

        $result = $stmt->get_result();
        $school_years = [];
        
        while ($row = $result->fetch_assoc()) {
            $school_years[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'is_current' => (bool)$row['is_current'],
                'created_at' => $row['created_at']
            ];
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'school_years' => $school_years,
            'total' => count($school_years)
        ]);

        $conn->close();
        
    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Exception: ' . $e->getMessage() . ' | File: ' . __FILE__ . ' | Line: ' . $e->getLine();
        error_log('[get_school_years.php] ' . $error_msg);
        echo json_encode(['success' => false, 'error' => 'Server error', 'details' => $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>
