<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Teacher ID aus GET-Parameter
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid teacher ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        // Prüfe ob likes Spalte in projects existiert
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;
        
        // Projekte des Lehrers abfragen (über Klassen und Schüler)
        $sql = "SELECT 
                    p.id,
                    p.title,
                    p.description,
                    p.student_id,
                    CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS student_name,
                    c.name AS class_name,
                    " . ($has_status_column ? "p.status" : "'working' AS status") . ",
                    " . ($has_likes_column ? "COALESCE(p.likes, 0)" : "0") . " AS like_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                WHERE c.teacher_id = ?
                ORDER BY p.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $teacher_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $projects = [];
        
        while ($row = $result->fetch_assoc()) {
            $projects[] = [
                'id' => (int)$row['id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'link' => null,
                'student_id' => (int)$row['student_id'],
                'student_name' => trim($row['student_name']),
                'class_name' => $row['class_name'] ?? '',
                'status' => $row['status'] ?? 'working',
                'like_count' => isset($row['like_count']) ? (int)$row['like_count'] : 0
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'projects' => $projects
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
