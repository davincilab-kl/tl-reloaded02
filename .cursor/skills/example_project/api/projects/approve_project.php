<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
    require_once __DIR__ . '/update_project_counts.php';
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

    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = isset($input['project_id']) ? (int)$input['project_id'] : null;
    $challenge_ids = isset($input['challenge_ids']) && is_array($input['challenge_ids']) ? $input['challenge_ids'] : [];

    if ($project_id === null || $project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    // Prüfe ob User berechtigt ist (Admin oder Teacher)
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    $user_role = get_user_role();
    if ($user_role !== 'admin' && $user_role !== 'teacher') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Projekt existiert und hole student_id
        $check_sql = "SELECT p.id, p.student_id, p.status
                     FROM projects p
                     INNER JOIN students s ON p.student_id = s.id
                     WHERE p.id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('i', $project_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $project_row = $check_result->fetch_assoc();
        $student_id = (int)$project_row['student_id'];
        $current_status = $project_row['status'] ?? 'working';
        $check_stmt->close();

        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;

        if (!$has_status_column) {
            // Falls status Spalte nicht existiert, erstelle sie
            $conn->query("ALTER TABLE projects ADD COLUMN status ENUM('working', 'check', 'published') DEFAULT 'working'");
            $has_status_column = true;
        }

        // Prüfe ob Projekt bereits veröffentlicht war
        $was_published = ($current_status === 'published');
        
        // Update Status auf published
        $new_status = 'published';
        $update_sql = "UPDATE projects SET status = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $update_stmt->bind_param('si', $new_status, $project_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_stmt->error);
        }
        $update_stmt->close();

        // Vergibe 5 T!Coins für Projekt-Veröffentlichung (nur wenn es vorher nicht veröffentlicht war)
        if (!$was_published) {
            try {
                awardTcoins($conn, $student_id, 5, 'project_published', $project_id, 'project');
            } catch (Exception $tcoins_error) {
                // Nicht kritisch - nur loggen
                error_log("[approve_project.php] Fehler bei T!Coin-Vergabe: " . $tcoins_error->getMessage());
            }
        }

        // Aktualisiere Projektanzahl in students Tabelle
        try {
            updateStudentProjectCounts($conn, $student_id);
        } catch (Exception $count_error) {
            error_log("[approve_project.php] Fehler beim Aktualisieren der Projektanzahl: " . $count_error->getMessage());
        }

        // Füge Projekt zu Challenges hinzu (falls Challenge-IDs angegeben wurden)
        if (!empty($challenge_ids)) {
            // Prüfe ob challenge_participations Tabelle existiert
            $check_participations_table = $conn->query("SHOW TABLES LIKE 'challenge_participations'");
            $has_participations_table = $check_participations_table && $check_participations_table->num_rows > 0;
            
            if ($has_participations_table) {
                // Entferne alle bestehenden Challenge-Teilnahmen für dieses Projekt
                $delete_sql = "DELETE FROM challenge_participations WHERE project_id = ?";
                $delete_stmt = $conn->prepare($delete_sql);
                if ($delete_stmt) {
                    $delete_stmt->bind_param('i', $project_id);
                    $delete_stmt->execute();
                    $delete_stmt->close();
                }
                
                // Füge neue Challenge-Teilnahmen hinzu
                $insert_sql = "INSERT INTO challenge_participations (challenge_id, project_id) VALUES (?, ?)";
                $insert_stmt = $conn->prepare($insert_sql);
                if ($insert_stmt) {
                    foreach ($challenge_ids as $challenge_id) {
                        $challenge_id_int = (int)$challenge_id;
                        if ($challenge_id_int > 0) {
                            $insert_stmt->bind_param('ii', $challenge_id_int, $project_id);
                            if (!$insert_stmt->execute()) {
                                // Ignoriere Duplikat-Fehler (UNIQUE KEY)
                                if (strpos($insert_stmt->error, 'Duplicate entry') === false) {
                                    error_log("[approve_project.php] Fehler beim Hinzufügen zu Challenge: " . $insert_stmt->error);
                                }
                            }
                        }
                    }
                    $insert_stmt->close();
                }
            }
        }

        // Prüfe und aktualisiere Lehrer-Status nach Projekt-Veröffentlichung
        $teacher_sql = "SELECT c.teacher_id 
                      FROM students s 
                      INNER JOIN classes c ON s.class_id = c.id 
                      WHERE s.id = ? 
                      AND s.class_id IS NOT NULL
                      LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        
        if ($teacher_stmt) {
            $teacher_stmt->bind_param('i', $student_id);
            if ($teacher_stmt->execute()) {
                $teacher_result = $teacher_stmt->get_result();
                if ($teacher_row = $teacher_result->fetch_assoc()) {
                    $teacher_id = (int)$teacher_row['teacher_id'];
                    // Status-Prüfung auslösen (nicht-blockierend, Fehler werden geloggt)
                    try {
                        checkAndUpdateTeacherStatus($conn, $teacher_id);
                    } catch (Exception $status_error) {
                        error_log("[approve_project.php] Fehler bei Status-Prüfung: " . $status_error->getMessage());
                    }
                }
            }
            $teacher_stmt->close();
        }

        echo json_encode([
            'success' => true,
            'message' => 'Projekt erfolgreich veröffentlicht'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[approve_project.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

