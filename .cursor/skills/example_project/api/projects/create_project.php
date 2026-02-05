<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
    require_once __DIR__ . '/update_project_counts.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
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
        // Hole student_id des aktuellen Users
        // Für Students: role_id ist die student_id
        // Für Teachers/Admins: müssen student_id aus teachers/admins Tabelle holen
        $student_id = null;
        $user_role = get_user_role();
        
        if (is_student()) {
            $student_id = get_role_id();
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
                            $student_id = !empty($admin_row['student_id']) ? (int)$admin_row['student_id'] : null;
                        }
                        $admin_stmt->close();
                    }
                }
            }
            
            // Falls noch keine student_id gefunden, hole aus teachers Tabelle
            if ($student_id === null || $student_id <= 0) {
                $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
                $teacher_stmt = $conn->prepare($teacher_sql);
                if ($teacher_stmt) {
                    $teacher_stmt->bind_param('i', $role_id);
                    $teacher_stmt->execute();
                    $teacher_result = $teacher_stmt->get_result();
                    if ($teacher_row = $teacher_result->fetch_assoc()) {
                        $student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
                    }
                    $teacher_stmt->close();
                }
            }
        }
        
        if ($student_id === null || $student_id <= 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Student not found for this user']);
            $conn->close();
            exit;
        }

        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        // Erstelle Projekt
        $title = 'Test-Projekt';
        $description = '';
        $status = 'working';
        
        if ($has_status_column) {
            $project_sql = "INSERT INTO projects (title, description, student_id, status) VALUES (?, ?, ?, ?)";
            $project_stmt = $conn->prepare($project_sql);
            if (!$project_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $project_stmt->bind_param('ssis', $title, $description, $student_id, $status);
        } else {
            // Falls status Spalte nicht existiert, erstelle sie (für Testzwecke)
            $conn->query("ALTER TABLE projects ADD COLUMN status ENUM('working', 'check', 'published') DEFAULT 'working'");
            $project_sql = "INSERT INTO projects (title, description, student_id, status) VALUES (?, ?, ?, ?)";
            $project_stmt = $conn->prepare($project_sql);
            if (!$project_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $project_stmt->bind_param('ssis', $title, $description, $student_id, $status);
        }
        if (!$project_stmt->execute()) {
            throw new Exception('Execute failed: ' . $project_stmt->error);
        }
        
        $project_id = $project_stmt->insert_id;
        $project_stmt->close();

        // Aktualisiere Projektanzahl in students Tabelle
        try {
            updateStudentProjectCounts($conn, $student_id);
        } catch (Exception $count_error) {
            // Nicht kritisch - nur loggen
            error_log("[create_project.php] Fehler beim Aktualisieren der Projektanzahl: " . $count_error->getMessage());
        }

        // Prüfe und aktualisiere Lehrer-Status nach Projekt-Erstellung
        // Hole teacher_id über class_id des Schülers
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
                        // Nicht kritisch - nur loggen
                        error_log("[create_project.php] Fehler bei Status-Prüfung: " . $status_error->getMessage());
                    }
                }
            }
            $teacher_stmt->close();
        }

        echo json_encode([
            'success' => true,
            'project_id' => $project_id,
            'message' => 'Projekt erfolgreich erstellt'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[create_project.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

