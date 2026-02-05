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
        $teacher_sql = "SELECT t.id as teacher_id, t.school_id 
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
        $current_teacher_id = $teacher_data['teacher_id'];
        $teacher_stmt->close();
        
        if (!$school_id) {
            http_response_code(404);
            echo json_encode(['error' => 'No school assigned']);
            $conn->close();
            exit;
        }
        
        // Prüfe ob waitlist Tabelle existiert
        $check_waitlist = $conn->query("SHOW TABLES LIKE 'teacher_waitlist'");
        if (!$check_waitlist || $check_waitlist->num_rows === 0) {
            echo json_encode([
                'success' => true,
                'waitlist' => []
            ]);
            $conn->close();
            exit;
        }
        
        // Hole Waitlist-Einträge für diese Schule (unterstützt sowohl 'teacher' als auch 'admin' Rollen)
        $waitlist_sql = "SELECT w.id, w.teacher_id, w.school_id, w.created_at, w.status,
                        u.first_name, u.last_name, u.email
                        FROM teacher_waitlist w
                        INNER JOIN teachers t ON t.id = w.teacher_id
                        INNER JOIN users u ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin')
                        WHERE w.school_id = ? AND w.status = 'pending'
                        ORDER BY w.created_at ASC";
        
        $waitlist_stmt = $conn->prepare($waitlist_sql);
        if (!$waitlist_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $waitlist_stmt->bind_param('i', $school_id);
        if (!$waitlist_stmt->execute()) {
            throw new Exception('Execute failed: ' . $waitlist_stmt->error);
        }
        
        $waitlist_result = $waitlist_stmt->get_result();
        $waitlist = [];
        while ($row = $waitlist_result->fetch_assoc()) {
            $waitlist[] = [
                'id' => (int)$row['id'],
                'teacher_id' => (int)$row['teacher_id'],
                'school_id' => (int)$row['school_id'],
                'created_at' => $row['created_at'],
                'status' => $row['status'],
                'teacher_name' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
                'teacher_email' => $row['email']
            ];
        }
        $waitlist_stmt->close();
        
        echo json_encode([
            'success' => true,
            'waitlist' => $waitlist
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

