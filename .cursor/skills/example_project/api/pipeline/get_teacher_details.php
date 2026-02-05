<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Parameter aus GET-Request
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid teacher ID']);
        $conn->close();
        exit;
    }

    try {
        // Hole alle Informationen über die Lehrkraft
        $sql = "SELECT 
                    t.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    t.school_id,
                    t.status_id,
                    t.infowebinar,
                    t.school_admin,
                    s.name as school_name,
                    s.ort as school_ort,
                    s.bundesland as school_bundesland,
                    ts.display_name as status_name,
                    ts.description as status_description,
                    u.last_login,
                    u.created_at as registered_at,
                    COUNT(DISTINCT c.id) as class_count,
                    COUNT(DISTINCT st.id) as student_count,
                    COALESCE(SUM(st.t_coins), 0) as total_t_coins,
                    COALESCE(AVG(st.t_coins), 0) as avg_t_coins,
                    (SELECT changed_at 
                     FROM teacher_status_history h 
                     WHERE h.teacher_id = t.id 
                     ORDER BY h.changed_at DESC 
                     LIMIT 1) as last_status_change
                FROM teachers t
                LEFT JOIN schools s ON t.school_id = s.id
                LEFT JOIN teacher_stati ts ON t.status_id = ts.id
                LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                LEFT JOIN classes c ON t.id = c.teacher_id
                LEFT JOIN students st ON c.id = st.class_id
                WHERE t.id = ?
                GROUP BY t.id, u.first_name, u.last_name, u.email, t.school_id, t.status_id, t.infowebinar, t.school_admin,
                         s.name, s.ort, s.bundesland, ts.display_name, ts.description, u.last_login, u.created_at";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $teacher_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Teacher not found']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $row = $result->fetch_assoc();
        
        // Namen kombinieren (last_name kann NULL sein)
        $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
        
        // Hole Klassen-Informationen
        $classes_sql = "SELECT id, name, 
                       (SELECT COUNT(*) FROM students WHERE class_id = classes.id) as student_count
                       FROM classes WHERE teacher_id = ? ORDER BY name";
        $classes_stmt = $conn->prepare($classes_sql);
        $classes_stmt->bind_param('i', $teacher_id);
        $classes_stmt->execute();
        $classes_result = $classes_stmt->get_result();
        $classes = [];
        while ($class_row = $classes_result->fetch_assoc()) {
            $classes[] = [
                'id' => (int)$class_row['id'],
                'name' => $class_row['name'],
                'student_count' => (int)$class_row['student_count']
            ];
        }
        $classes_stmt->close();
        
        $teacher = [
            'id' => (int)$row['id'],
            'name' => $full_name,
            'email' => $row['email'],
            'school_id' => $row['school_id'] ? (int)$row['school_id'] : null,
            'school_name' => $row['school_name'],
            'school_ort' => $row['school_ort'],
            'school_bundesland' => $row['school_bundesland'],
            'status_id' => $row['status_id'] ? (int)$row['status_id'] : null,
            'status_name' => $row['status_name'],
            'status_description' => $row['status_description'],
            'infowebinar' => (bool)$row['infowebinar'],
            'admin' => (bool)$row['school_admin'],
            'last_login' => $row['last_login'],
            'registered_at' => $row['registered_at'],
            'last_status_change' => $row['last_status_change'],
            'class_count' => (int)$row['class_count'],
            'student_count' => (int)$row['student_count'],
            'total_t_coins' => (int)$row['total_t_coins'],
            'avg_t_coins' => round((float)$row['avg_t_coins'], 2),
            'classes' => $classes
        ];
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'teacher' => $teacher
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }

    $conn->close();
?>

