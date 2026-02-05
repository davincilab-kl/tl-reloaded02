<?php
    // Error-Logging aktivieren
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../../php_error.log');
    
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Parameter aus GET-Request
    $status_id = isset($_GET['status_id']) ? intval($_GET['status_id']) : 0;
    $target_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

    if ($status_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid status ID'
        ]);
        $conn->close();
        exit;
    }

    try {
        // Validiere Datum
        $target_datetime = $target_date . ' 23:59:59';
        $date_obj = DateTime::createFromFormat('Y-m-d', $target_date);
        if (!$date_obj || $date_obj->format('Y-m-d') !== $target_date) {
            throw new Exception('Invalid date format');
        }

        // Finde alle Lehrer, die zu diesem Datum in diesem Status waren
        // Optimiert: Eine einzige Abfrage für alle Lehrer statt N+1 Abfragen
        $matching_teacher_ids = [];
        
        // Hole alle Status-Änderungen bis zum gewählten Datum, gruppiert nach teacher_id
        // Verwende eine Subquery, um den letzten Status pro Lehrer zu finden
        $status_sql = "SELECT tsh1.teacher_id, tsh1.status_id, tsh1.changed_at
                       FROM teacher_status_history tsh1
                       INNER JOIN (
                           SELECT teacher_id, MAX(changed_at) as max_changed_at
                           FROM teacher_status_history
                           WHERE changed_at <= ?
                           GROUP BY teacher_id
                       ) tsh2 ON tsh1.teacher_id = tsh2.teacher_id 
                              AND tsh1.changed_at = tsh2.max_changed_at
                       WHERE tsh1.changed_at <= ? AND tsh1.status_id = ?";
        $status_stmt = $conn->prepare($status_sql);
        $status_stmt->bind_param('ssi', $target_datetime, $target_datetime, $status_id);
        $status_stmt->execute();
        $status_result = $status_stmt->get_result();
        
        while ($status_row = $status_result->fetch_assoc()) {
            $matching_teacher_ids[] = [
                'id' => (int)$status_row['teacher_id'],
                'status_reached_at' => $status_row['changed_at']
            ];
        }
        $status_stmt->close();

        // Wenn keine Lehrer gefunden wurden, gib leeres Array zurück
        if (empty($matching_teacher_ids)) {
            echo json_encode([
                'success' => true,
                'teachers' => []
            ]);
            $conn->close();
            exit;
        }

        // Extrahiere nur die IDs für die SQL-Abfrage
        $teacher_ids = array_column($matching_teacher_ids, 'id');
        $teacher_ids_placeholders = implode(',', array_fill(0, count($teacher_ids), '?'));
        
        // Hole detaillierte Informationen über die gefundenen Lehrer
        $sql = "SELECT 
                    t.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    t.school_id,
                    s.name as school_name,
                    u.last_login
                FROM teachers t
                LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                LEFT JOIN schools s ON t.school_id = s.id
                WHERE t.id IN ($teacher_ids_placeholders)
                ORDER BY u.first_name, u.last_name";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        // Bind Parameter
        $types = str_repeat('i', count($teacher_ids));
        $stmt->bind_param($types, ...$teacher_ids);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $teachers = [];
        
        // Erstelle Map für status_reached_at
        $status_reached_map = [];
        foreach ($matching_teacher_ids as $item) {
            $status_reached_map[$item['id']] = $item['status_reached_at'];
        }
        
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            
            $teachers[] = [
                'id' => (int)$row['id'],
                'name' => $full_name,
                'email' => $row['email'],
                'school_name' => $row['school_name'],
                'status_reached_at' => $status_reached_map[$row['id']] ?? null,
                'last_login' => $row['last_login']
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'teachers' => $teachers
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

