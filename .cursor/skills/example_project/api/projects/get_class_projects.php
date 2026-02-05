<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Class ID aus GET-Parameter
    $class_id = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;

    if ($class_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid class ID']);
        exit;
    }

    // Prüfe ob User berechtigt ist (Admin oder Teacher der Klasse)
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob User berechtigt ist, diese Klasse zu sehen
        $user_role = get_user_role();
        $role_id = get_role_id();

        if ($user_role === 'admin') {
            // Admin kann alle Klassen sehen
        } else if ($user_role === 'teacher') {
            // Teacher kann nur eigene Klassen sehen
            $check_sql = "SELECT id FROM classes WHERE id = ? AND teacher_id = ? LIMIT 1";
            $check_stmt = $conn->prepare($check_sql);
            if (!$check_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $check_stmt->bind_param('ii', $class_id, $role_id);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            if ($check_result->num_rows === 0) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied: Teacher does not own this class']);
                $check_stmt->close();
                $conn->close();
                exit;
            }
            $check_stmt->close();
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied: Invalid role']);
            $conn->close();
            exit;
        }

        // Prüfe welche Spalten in der projects Tabelle existieren
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;

        // Projekte der Klasse abfragen
        $sql = "SELECT 
                    p.id,
                    p.title,
                    p.description,
                    p.student_id,
                    CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS student_name,
                    " . ($has_status_column ? "p.status" : "'working' AS status") . ",
                    " . ($has_likes_column ? "COALESCE(p.likes, 0)" : "0") . " AS like_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                WHERE s.class_id = ?
                ORDER BY p.id DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $class_id);
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
                'student_id' => (int)$row['student_id'],
                'student_name' => $row['student_name'],
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
        error_log("[get_class_projects.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

