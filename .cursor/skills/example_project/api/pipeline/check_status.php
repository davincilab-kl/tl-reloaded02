<?php
    /**
     * API-Endpunkt zum Auslösen der Status-Prüfung für einen oder alle Lehrer
     */
    
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/check_teacher_status.php';
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $teacher_id = isset($input['teacher_id']) ? (int)$input['teacher_id'] : null;
    
    $conn = db_connect();
    
    try {
        $updated_statuses = [];
        
        if ($teacher_id !== null && $teacher_id > 0) {
            // Prüfe nur einen spezifischen Lehrer
            $new_status_id = checkAndUpdateTeacherStatus($conn, $teacher_id);
            
            if ($new_status_id !== null) {
                $updated_statuses[] = [
                    'teacher_id' => $teacher_id,
                    'new_status_id' => $new_status_id
                ];
            }
        } else {
            // Prüfe alle Lehrer
            $teachers_sql = "SELECT id FROM teachers";
            $teachers_result = $conn->query($teachers_sql);
            
            if ($teachers_result) {
                while ($row = $teachers_result->fetch_assoc()) {
                    $t_id = (int)$row['id'];
                    $new_status_id = checkAndUpdateTeacherStatus($conn, $t_id);
                    
                    if ($new_status_id !== null) {
                        $updated_statuses[] = [
                            'teacher_id' => $t_id,
                            'new_status_id' => $new_status_id
                        ];
                    }
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'updated_count' => count($updated_statuses),
            'updated_statuses' => $updated_statuses
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
        error_log("[check_status.php] Fehler: " . $e->getMessage());
    }
    
    $conn->close();
?>

