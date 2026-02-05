<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $class_id = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

    if ($class_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid class ID']);
        exit;
    }

    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid teacher ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob die Klasse dem Lehrer gehört
        $check_sql = "SELECT c.id, c.name FROM classes c WHERE c.id = ? AND c.teacher_id = ?";
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
            echo json_encode(['error' => 'Klasse gehört nicht zu diesem Lehrer oder existiert nicht']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $class_row = $result->fetch_assoc();
        $class_name = $class_row['name'];
        $check_stmt->close();

        // Lade Schüler mit Login-Daten
        $students_sql = "SELECT s.id, u.first_name, u.last_name, u.password
                        FROM students s
                        LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                        WHERE s.class_id = ?
                        ORDER BY u.first_name, u.last_name";
        $students_stmt = $conn->prepare($students_sql);
        if (!$students_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $students_stmt->bind_param('i', $class_id);
        if (!$students_stmt->execute()) {
            throw new Exception('Execute failed: ' . $students_stmt->error);
        }
        
        $students_result = $students_stmt->get_result();
        $students = [];
        
        while ($row = $students_result->fetch_assoc()) {
            // Namen kombinieren (bei Students: gesamter Name in first_name, last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $students[] = [
                'id' => (int)$row['id'],
                'name' => $full_name,
                'password' => $row['password'] ?? ''
            ];
        }
        
        $students_stmt->close();

        echo json_encode([
            'success' => true,
            'class_id' => $class_id,
            'class_name' => $class_name,
            'students' => $students
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

