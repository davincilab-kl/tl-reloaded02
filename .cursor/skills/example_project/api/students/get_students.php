<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Parameter aus GET-Request
    $school_id = isset($_GET['school_id']) ? intval($_GET['school_id']) : 0;
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

    if ($school_id <= 0 && $teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid school ID or teacher ID']);
        $conn->close();
        exit;
    }

    try {
        // Schüler abfragen mit Klassen-Information und neuen Spalten (ohne Lehrer-Placeholder)
        $sql = "SELECT s.id, s.school_id, u.first_name, u.last_name, s.class_id, c.name as class_name,
                       s.courses_done, s.projects_wip, s.projects_pending, s.projects_public, s.t_coins, u.last_login
                FROM students s 
                LEFT JOIN classes c ON s.class_id = c.id 
                LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                WHERE s.class_id IS NOT NULL 
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND ";
        
        $params = [];
        $param_types = '';
        
        if ($school_id > 0) {
            $sql .= "s.school_id = ?";
            $params[] = $school_id;
            $param_types .= 'i';
        }
        
        if ($teacher_id > 0) {
            if ($school_id > 0) {
                $sql .= " AND ";
            }
            $sql .= "c.teacher_id = ?";
            $params[] = $teacher_id;
            $param_types .= 'i';
        }
        
        $sql .= " ORDER BY c.name, u.first_name, u.last_name";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        if (count($params) > 0) {
            $stmt->bind_param($param_types, ...$params);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $students = [];
        
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren (bei Students: gesamter Name in first_name, last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $students[] = [
                'id' => (int)$row['id'],
                'school_id' => (int)$row['school_id'],
                'name' => $full_name,
                'class_id' => (int)$row['class_id'],
                'class_name' => $row['class_name'],
                'courses_done' => (int)$row['courses_done'],
                'projects_wip' => (int)$row['projects_wip'],
                'projects_pending' => (int)$row['projects_pending'],
                'projects_public' => (int)$row['projects_public'],
                't_coins' => (int)$row['t_coins'],
                'last_login' => $row['last_login']
            ];
        }

        $stmt->close();
        
        echo json_encode([
            'students' => $students,
            'total' => count($students)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
