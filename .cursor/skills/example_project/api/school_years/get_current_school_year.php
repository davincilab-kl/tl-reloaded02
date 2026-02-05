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

        // Prüfe ob Tabelle existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'school_years'");
        if (!$check_table || $check_table->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Tabelle school_years existiert noch nicht',
                'school_year' => null
            ]);
            $conn->close();
            exit;
        }

        $sql = "SELECT id, name, start_date, end_date, is_current, created_at
                FROM school_years 
                WHERE is_current = 1
                LIMIT 1";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            $error_msg = 'Prepare failed: ' . $conn->error;
            error_log('[get_current_school_year.php] ' . $error_msg);
            echo json_encode(['success' => false, 'error' => 'Query preparation failed', 'details' => $conn->error, 'school_year' => null]);
            $conn->close();
            exit;
        }
        
        if (!$stmt->execute()) {
            http_response_code(500);
            $error_msg = 'Query execution failed: ' . $stmt->error;
            error_log('[get_current_school_year.php] ' . $error_msg);
            echo json_encode(['success' => false, 'error' => 'Query failed', 'details' => $stmt->error]);
            $stmt->close();
            $conn->close();
            exit;
        }

        $result = $stmt->get_result();
        $school_year = null;
        
        if ($row = $result->fetch_assoc()) {
            $school_year = [
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
            'school_year' => $school_year
        ]);

        $conn->close();
        
    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Exception: ' . $e->getMessage() . ' | File: ' . __FILE__ . ' | Line: ' . $e->getLine();
        error_log('[get_current_school_year.php] ' . $error_msg);
        echo json_encode(['success' => false, 'error' => 'Server error', 'details' => $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>
