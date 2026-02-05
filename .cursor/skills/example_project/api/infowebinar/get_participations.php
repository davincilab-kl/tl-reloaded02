<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $user_id = get_user_id();
    
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole teacher_id des aktuellen Users
        $teacher_sql = "SELECT t.id as teacher_id 
                       FROM teachers t 
                       INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher' 
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
        $teacher_id = $teacher_data['teacher_id'];
        $teacher_stmt->close();

        // Hole alle Anmeldungen für diesen Lehrer
        $sql = "SELECT id, teacher_id, webinar_date, registered_at, participated, 
                       registered_by_user_id, created_at, updated_at
                FROM infowebinar_participation 
                WHERE teacher_id = ?
                ORDER BY webinar_date DESC";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $participations = [];
        
        while ($row = $result->fetch_assoc()) {
            $participations[] = [
                'id' => (int)$row['id'],
                'teacher_id' => (int)$row['teacher_id'],
                'webinar_date' => $row['webinar_date'],
                'registered_at' => $row['registered_at'],
                'participated' => (bool)$row['participated'],
                'registered_by_user_id' => $row['registered_by_user_id'] ? (int)$row['registered_by_user_id'] : null,
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'participations' => $participations
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

