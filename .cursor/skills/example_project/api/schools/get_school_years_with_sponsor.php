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
        $school_id = isset($_GET['school_id']) ? intval($_GET['school_id']) : 0;
        
        if ($school_id <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Ungültige school_id',
                'school_years' => []
            ]);
            $conn->close();
            exit;
        }

        // Prüfe ob Tabellen existieren
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        
        if (!$check_school_years || $check_school_years->num_rows === 0 || 
            !$check_school_school_years || $check_school_school_years->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Tabellen existieren noch nicht',
                'school_years' => []
            ]);
            $conn->close();
            exit;
        }
        
        // Prüfe ob sponsor Spalte existiert
        $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
        $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
        
        // SQL-Query: Alle Schuljahre mit Sponsor für diese Schule
        if ($has_sponsor_column) {
            $sql = "SELECT sy.id, sy.name as school_year_name, sy.start_date, sy.end_date, sy.is_current, 
                           ssy.sponsor
                    FROM school_school_years ssy
                    INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                    WHERE ssy.school_id = ? 
                    AND (ssy.sponsor IS NOT NULL AND ssy.sponsor != '')
                    ORDER BY sy.end_date DESC, sy.start_date DESC";
        } else {
            // Fallback wenn sponsor Spalte noch nicht existiert
            $sql = "SELECT sy.id, sy.name as school_year_name, sy.start_date, sy.end_date, sy.is_current, 
                           NULL as sponsor
                    FROM school_school_years ssy
                    INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                    WHERE ssy.school_id = ? 
                    ORDER BY sy.end_date DESC, sy.start_date DESC";
        }
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            $error_msg = 'Prepare failed: ' . $conn->error;
            error_log('[get_school_years_with_sponsor.php] ' . $error_msg);
            echo json_encode([
                'success' => false,
                'error' => 'Query preparation failed',
                'details' => $conn->error,
                'school_years' => []
            ]);
            $conn->close();
            exit;
        }
        
        $stmt->bind_param('i', $school_id);
        
        if (!$stmt->execute()) {
            http_response_code(500);
            $error_msg = 'Query execution failed: ' . $stmt->error;
            error_log('[get_school_years_with_sponsor.php] ' . $error_msg);
            echo json_encode([
                'success' => false,
                'error' => 'Query failed',
                'details' => $stmt->error,
                'school_years' => []
            ]);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $result = $stmt->get_result();
        $school_years = [];
        
        while ($row = $result->fetch_assoc()) {
            $school_years[] = [
                'id' => (int)$row['id'],
                'name' => $row['school_year_name'],
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'is_current' => (bool)$row['is_current'],
                'sponsor' => $row['sponsor']
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'school_id' => $school_id,
            'school_years' => $school_years
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Exception: ' . $e->getMessage() . ' | File: ' . __FILE__ . ' | Line: ' . $e->getLine();
        error_log('[get_school_years_with_sponsor.php] ' . $error_msg);
        echo json_encode([
            'success' => false,
            'error' => 'Server error',
            'details' => $e->getMessage(),
            'school_years' => []
        ]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>
