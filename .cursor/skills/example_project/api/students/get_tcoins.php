<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Not logged in']);
        exit;
    }
    
    // Für Students: role_id ist die student_id
    // Für Teachers/Admins: müssen student_id aus teachers Tabelle holen
    $student_id = null;
    if (is_student()) {
        $student_id = get_role_id();
    } else if (is_teacher() || is_admin()) {
        // Hole student_id aus teachers Tabelle
        $conn_temp = db_connect();
        $role_id = get_role_id();
        $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
        $teacher_stmt = $conn_temp->prepare($teacher_sql);
        if ($teacher_stmt) {
            $teacher_stmt->bind_param('i', $role_id);
            $teacher_stmt->execute();
            $teacher_result = $teacher_stmt->get_result();
            if ($teacher_row = $teacher_result->fetch_assoc()) {
                $student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
            }
            $teacher_stmt->close();
        }
        $conn_temp->close();
        
        if ($student_id === null || $student_id <= 0) {
            http_response_code(403);
            echo json_encode(['error' => 'No student_id found for this user']);
            exit;
        }
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied - Invalid role']);
        exit;
    }

    // Optional: student_id aus GET-Parameter (für Admins/Teachers die andere Schüler ansehen)
    if (isset($_GET['student_id']) && (is_admin() || is_teacher())) {
        $requested_student_id = intval($_GET['student_id']);
        if ($requested_student_id > 0) {
            $student_id = $requested_student_id;
        }
    }

    // Optional: Historie anzeigen
    $include_history = isset($_GET['include_history']) && $_GET['include_history'] === 'true';

    $conn = db_connect();

    try {
        // Hole aktuellen T!Coins-Stand
        $student_sql = "SELECT t_coins FROM students WHERE id = ? LIMIT 1";
        $student_stmt = $conn->prepare($student_sql);
        
        if (!$student_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $student_stmt->bind_param('i', $student_id);
        if (!$student_stmt->execute()) {
            throw new Exception('Execute failed: ' . $student_stmt->error);
        }
        
        $student_result = $student_stmt->get_result();
        if ($student_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            $student_stmt->close();
            $conn->close();
            exit;
        }
        
        $student_row = $student_result->fetch_assoc();
        $t_coins = (int)$student_row['t_coins'];
        $student_stmt->close();
        
        $response = [
            'success' => true,
            'student_id' => $student_id,
            't_coins' => $t_coins
        ];
        
        // Optional: Transaktionshistorie
        if ($include_history) {
            $history_sql = "SELECT id, amount, reason, reference_id, reference_type, created_at 
                           FROM tcoins_transactions 
                           WHERE student_id = ? 
                           ORDER BY created_at DESC 
                           LIMIT 100";
            $history_stmt = $conn->prepare($history_sql);
            
            if ($history_stmt) {
                $history_stmt->bind_param('i', $student_id);
                $history_stmt->execute();
                $history_result = $history_stmt->get_result();
                
                $transactions = [];
                while ($row = $history_result->fetch_assoc()) {
                    $transactions[] = [
                        'id' => (int)$row['id'],
                        'amount' => (int)$row['amount'],
                        'reason' => $row['reason'],
                        'reference_id' => $row['reference_id'] !== null ? (int)$row['reference_id'] : null,
                        'reference_type' => $row['reference_type'],
                        'created_at' => $row['created_at']
                    ];
                }
                
                $response['history'] = $transactions;
                $response['history_count'] = count($transactions);
                $history_stmt->close();
            }
        }
        
        $conn->close();
        
        echo json_encode($response);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

