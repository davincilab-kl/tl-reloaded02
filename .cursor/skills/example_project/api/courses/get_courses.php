<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

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
        // Alle Kurse abfragen, sortiert nach Priorität (prio > 0 zuerst, dann prio = 0)
        $sql = "SELECT id, title, description, cover_path, prio 
                FROM courses 
                ORDER BY (prio = 0 OR prio IS NULL), prio ASC, title";
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('Query failed: ' . $conn->error);
        }
        
        $courses = [];
        while ($row = $result->fetch_assoc()) {
            $course_id = (int)$row['id'];
            $progress = 0;
            $completed_lections = 0;
            $total_lections = 0;
            
            // Berechne Fortschritt, wenn student_id vorhanden
            if ($student_id && $student_id > 0) {
                // Zähle Gesamtanzahl der Lektionen
                $total_sql = "SELECT COUNT(*) as total FROM lections WHERE course_id = ?";
                $total_stmt = $conn->prepare($total_sql);
                $total_stmt->bind_param('i', $course_id);
                $total_stmt->execute();
                $total_result = $total_stmt->get_result();
                if ($total_row = $total_result->fetch_assoc()) {
                    $total_lections = (int)$total_row['total'];
                }
                $total_stmt->close();
                
                if ($total_lections > 0) {
                    // Zähle abgeschlossene Lektionen
                    // Prüfe für jede Lektion, ob sie abgeschlossen ist
                    $lections_sql = "SELECT id FROM lections WHERE course_id = ?";
                    $lections_stmt = $conn->prepare($lections_sql);
                    $lections_stmt->bind_param('i', $course_id);
                    $lections_stmt->execute();
                    $lections_result = $lections_stmt->get_result();
                    
                    while ($lection_row = $lections_result->fetch_assoc()) {
                        $lection_id = (int)$lection_row['id'];
                        
                        // Prüfe ob Lektion ein Quiz hat
                        $quiz_check_sql = "SELECT id FROM quizzes WHERE lection_id = ? LIMIT 1";
                        $quiz_check_stmt = $conn->prepare($quiz_check_sql);
                        $quiz_check_stmt->bind_param('i', $lection_id);
                        $quiz_check_stmt->execute();
                        $quiz_check_result = $quiz_check_stmt->get_result();
                        $has_quiz = $quiz_check_result->num_rows > 0;
                        $quiz_check_stmt->close();
                        
                        $is_completed = false;
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
                        
                        if ($is_completed) {
                            $completed_lections++;
                        }
                    }
                    $lections_stmt->close();
                    
                    // Berechne Fortschritt in Prozent
                    $progress = $total_lections > 0 ? round(($completed_lections / $total_lections) * 100) : 0;
                }
            }
            
            $courses[] = [
                'id' => $course_id,
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'cover_path' => $row['cover_path'] ?? '',
                'progress' => $progress,
                'completed_lections' => $completed_lections,
                'total_lections' => $total_lections
            ];
        }

        echo json_encode([
            'success' => true,
            'courses' => $courses
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

