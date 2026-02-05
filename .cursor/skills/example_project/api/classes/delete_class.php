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
    $class_id = isset($input['class_id']) ? (int)$input['class_id'] : null;
    $teacher_id = isset($input['teacher_id']) ? (int)$input['teacher_id'] : null;

    if ($class_id === null || $class_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'class_id fehlt oder ungültig']);
        exit;
    }

    if ($teacher_id === null || $teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'teacher_id fehlt oder ungültig']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob die Klasse dem Lehrer gehört
        $check_sql = "SELECT id FROM classes WHERE id = ? AND teacher_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('ii', $class_id, $teacher_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $result = $check_stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Klasse gehört nicht zu diesem Lehrer oder existiert nicht']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();

        // Zähle zuerst die Schüler, die gelöscht werden
        $count_students_sql = "SELECT COUNT(*) as count FROM students WHERE class_id = ?";
        $count_stmt = $conn->prepare($count_students_sql);
        if (!$count_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $count_stmt->bind_param('i', $class_id);
        $count_stmt->execute();
        $count_result = $count_stmt->get_result();
        $student_count = 0;
        if ($count_row = $count_result->fetch_assoc()) {
            $student_count = (int)$count_row['count'];
        }
        $count_stmt->close();

        // Hole zuerst alle Schüler-IDs der Klasse
        $get_students_sql = "SELECT id FROM students WHERE class_id = ?";
        $get_students_stmt = $conn->prepare($get_students_sql);
        if (!$get_students_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $get_students_stmt->bind_param('i', $class_id);
        if (!$get_students_stmt->execute()) {
            throw new Exception('Execute failed: ' . $get_students_stmt->error);
        }
        
        $students_result = $get_students_stmt->get_result();
        $student_ids = [];
        while ($row = $students_result->fetch_assoc()) {
            $student_ids[] = (int)$row['id'];
        }
        $get_students_stmt->close();

        // Lösche zuerst alle zugehörigen User
        if (count($student_ids) > 0) {
            $placeholders = implode(',', array_fill(0, count($student_ids), '?'));
            $delete_users_sql = "DELETE FROM users WHERE role_id IN ($placeholders) AND role = 'student'";
            $delete_users_stmt = $conn->prepare($delete_users_sql);
            if (!$delete_users_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $types = str_repeat('i', count($student_ids));
            $delete_users_stmt->bind_param($types, ...$student_ids);
            $delete_users_stmt->execute();
            $delete_users_stmt->close();
        }

        // Lösche zuerst alle Schüler der Klasse
        $delete_students_sql = "DELETE FROM students WHERE class_id = ?";
        $delete_students_stmt = $conn->prepare($delete_students_sql);
        if (!$delete_students_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $delete_students_stmt->bind_param('i', $class_id);
        if (!$delete_students_stmt->execute()) {
            throw new Exception('Execute failed: ' . $delete_students_stmt->error);
        }
        $deleted_students = $delete_students_stmt->affected_rows;
        $delete_students_stmt->close();

        // Lösche die Klasse
        $delete_class_sql = "DELETE FROM classes WHERE id = ? AND teacher_id = ?";
        $delete_class_stmt = $conn->prepare($delete_class_sql);
        if (!$delete_class_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $delete_class_stmt->bind_param('ii', $class_id, $teacher_id);
        if (!$delete_class_stmt->execute()) {
            throw new Exception('Execute failed: ' . $delete_class_stmt->error);
        }
        
        if ($delete_class_stmt->affected_rows === 0) {
            throw new Exception('Klasse konnte nicht gelöscht werden');
        }
        
        $delete_class_stmt->close();

        echo json_encode([
            'success' => true,
            'class_id' => $class_id,
            'deleted_students' => $deleted_students,
            'message' => "Klasse und {$deleted_students} Schüler erfolgreich gelöscht"
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

