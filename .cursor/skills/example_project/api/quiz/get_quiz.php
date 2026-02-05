<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Not logged in']);
        exit;
    }
    
    // Für Students: role_id ist die student_id
    // Für Teachers/Admins: müssen student_id aus teachers Tabelle holen
    $student_id = null;
    if (is_student()) {
        $student_id = get_role_id();
    } else if (is_teacher() || is_admin()) {
        // Hole student_id aus teachers Tabelle
        $conn_temp = db_connect();
        $role_id = get_role_id();
        $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
        $teacher_stmt = $conn_temp->prepare($teacher_sql);
        if ($teacher_stmt) {
            $teacher_stmt->bind_param('i', $role_id);
            $teacher_stmt->execute();
            $teacher_result = $teacher_stmt->get_result();
            if ($teacher_row = $teacher_result->fetch_assoc()) {
                $student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
            }
            $teacher_stmt->close();
        }
        $conn_temp->close();
        
        if ($student_id === null || $student_id <= 0) {
            http_response_code(403);
            echo json_encode(['error' => 'No student_id found for this user']);
            exit;
        }
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied - Invalid role']);
        exit;
    }

    $lection_id = isset($_GET['lection_id']) ? intval($_GET['lection_id']) : 0;

    if ($lection_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid lection ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Quiz für diese Lektion existiert
        $sql = "SELECT q.id, q.title, q.description, 
                       (SELECT SUM(points) FROM quiz_questions WHERE quiz_id = q.id) as points_total
                FROM quizzes q
                WHERE q.lection_id = ?
                LIMIT 1";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $lection_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // Kein Quiz vorhanden - prüfe ob Lektion bereits abgeschlossen wurde
            $stmt->close();
            
            $is_completed = false;
            if ($student_id && $student_id > 0) {
                $completion_sql = "SELECT id FROM lection_completions 
                                  WHERE student_id = ? AND lection_id = ? LIMIT 1";
                $completion_stmt = $conn->prepare($completion_sql);
                $completion_stmt->bind_param('ii', $student_id, $lection_id);
                $completion_stmt->execute();
                $completion_result = $completion_stmt->get_result();
                $is_completed = $completion_result->num_rows > 0;
                $completion_stmt->close();
            }
            
            $conn->close();
            echo json_encode([
                'success' => true,
                'has_quiz' => false,
                'is_completed' => $is_completed
            ]);
            exit;
        }
        
        $quiz = $result->fetch_assoc();
        $quiz_id = (int)$quiz['id'];
        $stmt->close();
        
        // Prüfe ob Student das Quiz bereits abgeschlossen hat (hole neuestes Ergebnis)
        $check_sql = "SELECT passed, points_earned, points_total 
                      FROM quiz_results 
                      WHERE student_id = ? AND quiz_id = ? 
                      ORDER BY completed_at DESC
                      LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('ii', $student_id, $quiz_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $already_completed = $check_result->num_rows > 0;
        $previous_result = $already_completed ? $check_result->fetch_assoc() : null;
        $check_stmt->close();
        
        // Lade Fragen
        $questions_sql = "SELECT id, type, title, text, order_index, points, required, question_data
                         FROM quiz_questions
                         WHERE quiz_id = ?
                         ORDER BY order_index ASC";
        $questions_stmt = $conn->prepare($questions_sql);
        $questions_stmt->bind_param('i', $quiz_id);
        $questions_stmt->execute();
        $questions_result = $questions_stmt->get_result();
        
        $questions = [];
        while ($row = $questions_result->fetch_assoc()) {
            $questions[] = [
                'id' => (int)$row['id'],
                'type' => $row['type'],
                'title' => $row['title'],
                'text' => $row['text'],
                'order_index' => (int)$row['order_index'],
                'points' => (int)$row['points'],
                'required' => (bool)$row['required'],
                'question_data' => json_decode($row['question_data'], true)
            ];
        }
        $questions_stmt->close();
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'has_quiz' => true,
            'quiz' => [
                'id' => $quiz_id,
                'title' => $quiz['title'],
                'description' => $quiz['description'],
                'points_total' => (int)$quiz['points_total'],
                'questions' => $questions
            ],
            'already_completed' => $already_completed,
            'previous_result' => $previous_result ? [
                'passed' => (bool)$previous_result['passed'],
                'points_earned' => (int)$previous_result['points_earned'],
                'points_total' => (int)$previous_result['points_total']
            ] : null
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
?>

