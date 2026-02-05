<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
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

    // Für Students: role_id ist die student_id
    // Für Teachers/Admins: müssen student_id aus teachers Tabelle holen
    $student_id = null;
    if (is_logged_in()) {
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
        }
    }

    $conn = db_connect();

    try {
        // Lektionen des Kurses abfragen, sortiert nach order
        $sql = "SELECT id, title, text, course_id, `order` 
                FROM lections 
                WHERE course_id = ? 
                ORDER BY `order` ASC";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $course_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $lections = [];
        
        while ($row = $result->fetch_assoc()) {
            $lection_id = (int)$row['id'];
            $is_completed = false;
            
            // Prüfe Completion-Status, wenn student_id vorhanden
            if ($student_id && $student_id > 0) {
                // Prüfe ob Lektion ein Quiz hat
                $quiz_check_sql = "SELECT id FROM quizzes WHERE lection_id = ? LIMIT 1";
                $quiz_check_stmt = $conn->prepare($quiz_check_sql);
                $quiz_check_stmt->bind_param('i', $lection_id);
                $quiz_check_stmt->execute();
                $quiz_check_result = $quiz_check_stmt->get_result();
                $has_quiz = $quiz_check_result->num_rows > 0;
                $quiz_check_stmt->close();
                
                if ($has_quiz) {
                    // Prüfe ob Quiz bestanden wurde
                    $quiz_id_sql = "SELECT id FROM quizzes WHERE lection_id = ? LIMIT 1";
                    $quiz_id_stmt = $conn->prepare($quiz_id_sql);
                    $quiz_id_stmt->bind_param('i', $lection_id);
                    $quiz_id_stmt->execute();
                    $quiz_id_result = $quiz_id_stmt->get_result();
                    if ($quiz_id_row = $quiz_id_result->fetch_assoc()) {
                        $quiz_id = (int)$quiz_id_row['id'];
                        $quiz_id_stmt->close();
                        
                        // Prüfe ob Quiz bestanden wurde
                        $quiz_completion_sql = "SELECT passed FROM quiz_results 
                                               WHERE student_id = ? AND quiz_id = ? AND passed = 1 
                                               ORDER BY completed_at DESC LIMIT 1";
                        $quiz_completion_stmt = $conn->prepare($quiz_completion_sql);
                        $quiz_completion_stmt->bind_param('ii', $student_id, $quiz_id);
                        $quiz_completion_stmt->execute();
                        $quiz_completion_result = $quiz_completion_stmt->get_result();
                        $is_completed = $quiz_completion_result->num_rows > 0;
                        $quiz_completion_stmt->close();
                    } else {
                        $quiz_id_stmt->close();
                    }
                } else {
                    // Prüfe ob Lektion ohne Quiz als erledigt markiert wurde
                    $completion_sql = "SELECT id FROM lection_completions 
                                      WHERE student_id = ? AND lection_id = ? LIMIT 1";
                    $completion_stmt = $conn->prepare($completion_sql);
                    $completion_stmt->bind_param('ii', $student_id, $lection_id);
                    $completion_stmt->execute();
                    $completion_result = $completion_stmt->get_result();
                    $is_completed = $completion_result->num_rows > 0;
                    $completion_stmt->close();
                }
            }
            
            $lections[] = [
                'id' => $lection_id,
                'title' => $row['title'],
                'text' => $row['text'] ?? '',
                'course_id' => (int)$row['course_id'],
                'order' => (int)$row['order'],
                'is_completed' => $is_completed
            ];
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'lections' => $lections
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

