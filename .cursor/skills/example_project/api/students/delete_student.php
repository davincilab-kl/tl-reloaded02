<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $student_id = isset($input['student_id']) ? (int)$input['student_id'] : null;
    $teacher_id = isset($input['teacher_id']) ? (int)$input['teacher_id'] : null;

    if ($student_id === null || $student_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'student_id fehlt oder ungültig']);
        exit;
    }

    if ($teacher_id === null || $teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'teacher_id fehlt oder ungültig']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob der Schüler zu einer Klasse des Lehrers gehört
        $check_sql = "SELECT s.id 
                     FROM students s 
                     INNER JOIN classes c ON s.class_id = c.id 
                     WHERE s.id = ? AND c.teacher_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('ii', $student_id, $teacher_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $result = $check_stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Schüler gehört nicht zu einer Klasse dieses Lehrers oder existiert nicht']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();

        // Lösche zuerst den zugehörigen User (falls vorhanden)
        $delete_user_sql = "DELETE FROM users WHERE role_id = ? AND role = 'student'";
        $delete_user_stmt = $conn->prepare($delete_user_sql);
        if (!$delete_user_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $delete_user_stmt->bind_param('i', $student_id);
        $delete_user_stmt->execute();
        $delete_user_stmt->close();

        // Lösche den Schüler
        $delete_sql = "DELETE FROM students WHERE id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        if (!$delete_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $delete_stmt->bind_param('i', $student_id);
        if (!$delete_stmt->execute()) {
            throw new Exception('Execute failed: ' . $delete_stmt->error);
        }
        
        if ($delete_stmt->affected_rows === 0) {
            throw new Exception('Schüler konnte nicht gelöscht werden');
        }
        
        $delete_stmt->close();

        echo json_encode([
            'success' => true,
            'student_id' => $student_id,
            'message' => 'Schüler erfolgreich gelöscht'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

