<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Hole aktuelle User-ID
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        $conn->close();
        exit;
    }

    try {
        // Hole school_id des aktuellen Lehrers (unterstützt sowohl 'teacher' als auch 'admin' Rollen)
        $teacher_sql = "SELECT t.school_id 
                       FROM teachers t 
                       INNER JOIN users u ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin') 
                       WHERE u.id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $teacher_stmt->bind_param('i', $user_id);
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_result = $teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Teacher not found']);
            $teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_data = $teacher_result->fetch_assoc();
        $school_id = $teacher_data['school_id'];
        $teacher_stmt->close();
        
        if (!$school_id) {
            http_response_code(404);
            echo json_encode(['error' => 'No school assigned']);
            $conn->close();
            exit;
        }
        
        // Lehrer für die Schule abfragen mit Klassen- und Schüler-Anzahl (unterstützt sowohl 'teacher' als auch 'admin' Rollen)
        $sql = "SELECT t.id, t.school_id, u.first_name, u.last_name, u.email, t.infowebinar, t.school_admin, u.last_login,
                       COUNT(DISTINCT c.id) as class_count,
                       COUNT(DISTINCT s.id) as student_count
                FROM teachers t 
                LEFT JOIN users u ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin')
                LEFT JOIN classes c ON t.id = c.teacher_id 
                LEFT JOIN students s ON c.id = s.class_id 
                WHERE t.school_id = ? 
                GROUP BY t.id, t.school_id, u.first_name, u.last_name, u.email, t.infowebinar, t.school_admin, u.last_login
                ORDER BY t.school_admin DESC, u.first_name, u.last_name";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('i', $school_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $teachers = [];
        
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren (last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $teachers[] = [
                'id' => (int)$row['id'],
                'school_id' => (int)$row['school_id'],
                'name' => $full_name,
                'email' => $row['email'],
                'infowebinar' => $row['infowebinar'],
                'admin' => (bool)$row['school_admin'],
                'last_login' => $row['last_login'],
                'class_count' => (int)$row['class_count'],
                'student_count' => (int)$row['student_count']
            ];
        }

        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'teachers' => $teachers,
            'total' => count($teachers)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

