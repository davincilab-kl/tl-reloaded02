<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Course ID aus GET-Parameter
    $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

    if ($course_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid course ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Kurs-Details abfragen
        $sql = "SELECT id, title, description, text, cover_path, background_path, prio 
                FROM courses 
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $course_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
            exit;
        }
        
        $row = $result->fetch_assoc();
        $course = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'description' => $row['description'] ?? '',
            'text' => $row['text'] ?? '',
            'cover_path' => $row['cover_path'] ?? '',
            'background_path' => $row['background_path'] ?? '',
            'prio' => (int)($row['prio'] ?? 0)
        ];

        error_log('[get_course.php] Course Data: ' . print_r($course, true));
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'course' => $course
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

