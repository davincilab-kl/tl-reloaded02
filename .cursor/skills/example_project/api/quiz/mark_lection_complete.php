<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../students/tcoins_manager.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Not logged in']);
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
            echo json_encode(['success' => false, 'error' => 'No student_id found for this user']);
            exit;
        }
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied - Invalid role']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $lection_id = isset($input['lection_id']) ? intval($input['lection_id']) : 0;

    if ($lection_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid lection ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Lektion existiert
        $check_sql = "SELECT id FROM lections WHERE id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('i', $lection_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            throw new Exception('Lection not found');
        }
        $check_stmt->close();
        
        // Prüfe ob Quiz für diese Lektion existiert
        $quiz_sql = "SELECT id FROM quizzes WHERE lection_id = ? LIMIT 1";
        $quiz_stmt = $conn->prepare($quiz_sql);
        $quiz_stmt->bind_param('i', $lection_id);
        $quiz_stmt->execute();
        $quiz_result = $quiz_stmt->get_result();
        
        if ($quiz_result->num_rows > 0) {
            // Es gibt ein Quiz - Lektion kann nicht manuell als erledigt markiert werden
            $quiz_stmt->close();
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Lection has a quiz. Please complete the quiz instead.']);
            exit;
        }
        $quiz_stmt->close();
        
        // Markiere Lektion als erledigt
        $insert_sql = "INSERT INTO lection_completions (student_id, lection_id)
                      VALUES (?, ?)
                      ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP";
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param('ii', $student_id, $lection_id);
        $insert_stmt->execute();
        $insert_stmt->close();
        
        // Vergibe T!Coins für Lektionsabschluss (+1 T!Coin)
        // Doppelvergabe wird durch tcoins_manager verhindert
        awardTcoins($conn, $student_id, 1, 'lection_completed', $lection_id, 'lection');
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Lection marked as completed'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
?>

