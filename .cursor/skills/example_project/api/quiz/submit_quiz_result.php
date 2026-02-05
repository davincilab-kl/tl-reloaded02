<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../students/tcoins_manager.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Not logged in']);
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
            echo json_encode(['success' => false, 'error' => 'No student_id found for this user']);
            exit;
        }
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied - Invalid role']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $quiz_id = isset($input['quiz_id']) ? intval($input['quiz_id']) : 0;
    $answers = isset($input['answers']) ? $input['answers'] : [];
    $threshold_percentage = 70; // Schwellenwert: 70% müssen erreicht werden

    if ($quiz_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid quiz ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Quiz existiert und hole Fragen
        $quiz_sql = "SELECT q.id, q.lection_id,
                            (SELECT SUM(points) FROM quiz_questions WHERE quiz_id = q.id) as points_total
                     FROM quizzes q
                     WHERE q.id = ?
                     LIMIT 1";
        $quiz_stmt = $conn->prepare($quiz_sql);
        $quiz_stmt->bind_param('i', $quiz_id);
        $quiz_stmt->execute();
        $quiz_result = $quiz_stmt->get_result();
        
        if ($quiz_result->num_rows === 0) {
            throw new Exception('Quiz not found');
        }
        
        $quiz = $quiz_result->fetch_assoc();
        $points_total = (int)$quiz['points_total'];
        $lection_id = (int)$quiz['lection_id'];
        $quiz_stmt->close();
        
        // Lade alle Fragen mit korrekten Antworten
        $questions_sql = "SELECT id, type, points, question_data
                         FROM quiz_questions
                         WHERE quiz_id = ?";
        $questions_stmt = $conn->prepare($questions_sql);
        $questions_stmt->bind_param('i', $quiz_id);
        $questions_stmt->execute();
        $questions_result = $questions_stmt->get_result();
        
        $points_earned = 0;
        
        while ($question = $questions_result->fetch_assoc()) {
            $question_id = (int)$question['id'];
            $question_type = $question['type'];
            $question_points = (int)$question['points'];
            $question_data = json_decode($question['question_data'], true);
            $answer = isset($answers[$question_id]) ? $answers[$question_id] : null;
            
            $is_correct = false;
            
            // Bewerte Antwort je nach Fragetyp
            switch ($question_type) {
                case 'multiple_choice':
                    if (isset($answer['selected_option_indices']) && is_array($answer['selected_option_indices'])) {
                        $selected = $answer['selected_option_indices'];
                        $options = $question_data['options'] ?? [];
                        $correct_count = 0;
                        $total_correct = 0;
                        
                        foreach ($options as $idx => $option) {
                            if ($option['is_correct']) {
                                $total_correct++;
                                if (in_array($idx, $selected)) {
                                    $correct_count++;
                                }
                            }
                        }
                        
                        // Teilpunkte: Anteil der richtigen Antworten
                        if ($total_correct > 0) {
                            $is_correct = ($correct_count === $total_correct && count($selected) === $total_correct);
                            if ($is_correct) {
                                $points_earned += $question_points;
                            }
                        }
                    }
                    break;
                    
                case 'single_choice':
                    if (isset($answer['selected_option_index'])) {
                        $selected_idx = (int)$answer['selected_option_index'];
                        $options = $question_data['options'] ?? [];
                        if (isset($options[$selected_idx]) && $options[$selected_idx]['is_correct']) {
                            $is_correct = true;
                            $points_earned += $question_points;
                        }
                    }
                    break;
                    
                case 'true_false':
                    if (isset($answer['answer'])) {
                        $correct_answer = $question_data['correct_answer'] ?? false;
                        if ($answer['answer'] === $correct_answer) {
                            $is_correct = true;
                            $points_earned += $question_points;
                        }
                    }
                    break;
                    
                case 'text':
                    // Text-Antworten werden als richtig gewertet (könnte später mit KI/Mustererkennung verbessert werden)
                    if (isset($answer['text']) && trim($answer['text']) !== '') {
                        $is_correct = true;
                        $points_earned += $question_points;
                    }
                    break;
                    
                case 'drag_drop':
                    if (isset($answer['order']) && is_array($answer['order'])) {
                        $correct_order = $question_data['correct_order'] ?? [];
                        $is_correct = ($answer['order'] === $correct_order);
                        if ($is_correct) {
                            $points_earned += $question_points;
                        }
                    }
                    break;
                    
                case 'code':
                    // Code-Aufgaben: Prüfe ob alle Tests bestanden wurden
                    if (isset($answer['test_results']) && is_array($answer['test_results'])) {
                        $all_passed = true;
                        foreach ($answer['test_results'] as $test) {
                            if (!isset($test['passed']) || !$test['passed']) {
                                $all_passed = false;
                                break;
                            }
                        }
                        if ($all_passed) {
                            $is_correct = true;
                            $points_earned += $question_points;
                        }
                    }
                    break;
            }
        }
        
        $questions_stmt->close();
        
        // Berechne ob bestanden (Schwellenwert)
        $percentage = $points_total > 0 ? ($points_earned / $points_total) * 100 : 0;
        $passed = $percentage >= $threshold_percentage;
        
        // Speichere Ergebnis (neue Zeile für jeden Versuch)
        $insert_sql = "INSERT INTO quiz_results (student_id, quiz_id, points_earned, points_total, passed)
                      VALUES (?, ?, ?, ?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param('iiiii', $student_id, $quiz_id, $points_earned, $points_total, $passed);
        $insert_stmt->execute();
        $insert_stmt->close();
        
        // Vergibe T!Coins wenn Quiz bestanden wurde (+1 T!Coin)
        // Doppelvergabe wird durch tcoins_manager verhindert (prüft auf bereits existierende Transaktion für diese Lektion)
        if ($passed) {
            awardTcoins($conn, $student_id, 1, 'lection_completed', $lection_id, 'lection');
        }
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'points_earned' => $points_earned,
            'points_total' => $points_total,
            'percentage' => round($percentage, 2),
            'passed' => $passed,
            'threshold_percentage' => $threshold_percentage
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
?>

