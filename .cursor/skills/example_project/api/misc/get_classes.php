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
        // Klassen abfragen mit Schüler-Anzahl und T-Coins-Statistiken
        $sql = "SELECT c.id, c.school_id, c.name, c.teacher_id, 
                       COUNT(st.id) as student_count,
                       COALESCE(SUM(st.t_coins), 0) as total_t_coins,
                       COALESCE(AVG(st.t_coins), 0) as avg_t_coins
                FROM classes c 
                LEFT JOIN students st ON c.id = st.class_id 
                WHERE ";
        
        $params = [];
        $param_types = '';
        
        if ($school_id > 0) {
            $sql .= "c.school_id = ?";
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
        
        $sql .= " GROUP BY c.id, c.school_id, c.name, c.teacher_id
                  ORDER BY c.name";
        
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
        $classes = [];
        
        while ($row = $result->fetch_assoc()) {
            $classes[] = [
                'id' => (int)$row['id'],
                'school_id' => (int)$row['school_id'],
                'name' => $row['name'],
                'teacher_id' => (int)$row['teacher_id'],
                'student_count' => (int)$row['student_count'],
                'total_t_coins' => (int)$row['total_t_coins'],
                'avg_t_coins' => round((float)$row['avg_t_coins'], 2)
            ];
        }

        $stmt->close();
        
        echo json_encode([
            'classes' => $classes,
            'total' => count($classes)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
