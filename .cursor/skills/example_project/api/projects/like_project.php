<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
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

    if ($project_id === null || $project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    // Hole aktuelle User-ID
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Projekt existiert
        $check_project_sql = "SELECT id, student_id FROM projects WHERE id = ? LIMIT 1";
        $check_project_stmt = $conn->prepare($check_project_sql);
        if (!$check_project_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_project_stmt->bind_param('i', $project_id);
        if (!$check_project_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_project_stmt->error);
        }
        
        $project_result = $check_project_stmt->get_result();
        if ($project_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            $check_project_stmt->close();
            $conn->close();
            exit;
        }
        
        $project_row = $project_result->fetch_assoc();
        $project_student_id = (int)$project_row['student_id'];
        $check_project_stmt->close();

        // Hole student_id des aktuell eingeloggten Users
        // Für Students: role_id ist die student_id
        // Für Teachers/Admins: müssen student_id aus teachers/admins Tabelle holen
        $current_student_id = null;
        
        if (is_student()) {
            $current_student_id = get_role_id();
        } else if (is_teacher() || is_admin()) {
            // Hole student_id aus teachers Tabelle
            $role_id = get_role_id();
            
            // Prüfe zuerst ob Admin mit student_id in admins Tabelle
            if (is_admin()) {
                $check_admins_table = $conn->query("SHOW TABLES LIKE 'admins'");
                if ($check_admins_table && $check_admins_table->num_rows > 0) {
                    $admin_sql = "SELECT student_id FROM admins WHERE id = ? LIMIT 1";
                    $admin_stmt = $conn->prepare($admin_sql);
                    if ($admin_stmt) {
                        $admin_stmt->bind_param('i', $role_id);
                        $admin_stmt->execute();
                        $admin_result = $admin_stmt->get_result();
                        if ($admin_row = $admin_result->fetch_assoc()) {
                            $current_student_id = !empty($admin_row['student_id']) ? (int)$admin_row['student_id'] : null;
                        }
                        $admin_stmt->close();
                    }
                }
            }
            
            // Falls noch keine student_id gefunden, hole aus teachers Tabelle
            if ($current_student_id === null || $current_student_id <= 0) {
                $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
                $teacher_stmt = $conn->prepare($teacher_sql);
                if ($teacher_stmt) {
                    $teacher_stmt->bind_param('i', $role_id);
                    $teacher_stmt->execute();
                    $teacher_result = $teacher_stmt->get_result();
                    if ($teacher_row = $teacher_result->fetch_assoc()) {
                        $current_student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
                    }
                    $teacher_stmt->close();
                }
            }
        }
        
        // Prüfe ob User sein eigenes Projekt liken möchte
        if ($current_student_id !== null && $current_student_id > 0 && $current_student_id === $project_student_id) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Du kannst dein eigenes Projekt nicht liken']);
            $conn->close();
            exit;
        }

        // Prüfe ob likes Spalte in projects existiert
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;

        if (!$has_likes_column) {
            // Falls likes Spalte nicht existiert, erstelle sie
            if (!$conn->query("ALTER TABLE projects ADD COLUMN likes INT DEFAULT 0")) {
                throw new Exception('Failed to create likes column: ' . $conn->error);
            }
            $has_likes_column = true;
        }

        // Inkrementiere likes Spalte
        $update_likes_sql = "UPDATE projects SET likes = likes + 1 WHERE id = ?";
        $update_likes_stmt = $conn->prepare($update_likes_sql);
        if (!$update_likes_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $update_likes_stmt->bind_param('i', $project_id);
        if (!$update_likes_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_likes_stmt->error);
        }
        $update_likes_stmt->close();

        // Vergibe 1 T!Coin für Like auf Projekt
        // Jeder Like gibt 1 T!Coin - verwende null als reference_id und reference_type,
        // damit jeder Like einzeln gezählt wird (die Doppelvergabe-Prüfung in awardTcoins()
        // basiert dann nur auf reason, aber da jeder Like eine neue Transaktion ist, wird jeder Like einzeln belohnt)
        try {
            // Verwende null als reference_id und reference_type, damit jeder Like einzeln gezählt wird
            // Die Doppelvergabe-Prüfung in awardTcoins() prüft dann nur auf reason, aber da jeder Like
            // eine neue Transaktion ist, wird jeder Like einzeln belohnt
            awardTcoins($conn, $project_student_id, 1, 'project_liked', null, null);
        } catch (Exception $tcoins_error) {
            // Nicht kritisch - nur loggen
            error_log("[like_project.php] Fehler bei T!Coin-Vergabe: " . $tcoins_error->getMessage());
        }

        // Hole aktuellen Like-Count
        $get_likes_sql = "SELECT likes FROM projects WHERE id = ? LIMIT 1";
        $get_likes_stmt = $conn->prepare($get_likes_sql);
        if (!$get_likes_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $get_likes_stmt->bind_param('i', $project_id);
        if (!$get_likes_stmt->execute()) {
            throw new Exception('Execute failed: ' . $get_likes_stmt->error);
        }
        
        $get_likes_result = $get_likes_stmt->get_result();
        $like_count = 0;
        if ($get_likes_row = $get_likes_result->fetch_assoc()) {
            $like_count = (int)$get_likes_row['likes'];
        }
        $get_likes_stmt->close();

        // Prüfe und aktualisiere Lehrer-Status nach Like
        // Status 16 wird geprüft, wenn ein Projekt 3+ Likes erreicht
        // checkStatus16() prüft, ob mindestens ein Projekt mit >= 3 Likes existiert
        $teacher_sql = "SELECT c.teacher_id 
                      FROM students s 
                      INNER JOIN classes c ON s.class_id = c.id 
                      WHERE s.id = ? 
                      AND s.class_id IS NOT NULL
                      LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        
        if ($teacher_stmt) {
            $teacher_stmt->bind_param('i', $project_student_id);
            if ($teacher_stmt->execute()) {
                $teacher_result = $teacher_stmt->get_result();
                if ($teacher_row = $teacher_result->fetch_assoc()) {
                    $teacher_id = (int)$teacher_row['teacher_id'];
                    // Status-Prüfung auslösen (nicht-blockierend, Fehler werden geloggt)
                    // checkStatus16() prüft, ob mindestens ein Projekt mit >= 3 Likes existiert
                    try {
                        checkAndUpdateTeacherStatus($conn, $teacher_id);
                    } catch (Exception $status_error) {
                        // Nicht kritisch - nur loggen
                        error_log("[like_project.php] Fehler bei Status-Prüfung: " . $status_error->getMessage());
                    }
                }
            }
            $teacher_stmt->close();
        }

        echo json_encode([
            'success' => true,
            'like_count' => $like_count,
            'message' => 'Projekt geliked'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[like_project.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>
