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

    // Unterstütze sowohl JSON als auch FormData
    $project_id = null;
    $title = null;
    $description = null;
    $cover_file = null;

    if (isset($_POST['project_id'])) {
        // FormData (für File-Upload)
        $project_id = isset($_POST['project_id']) ? (int)$_POST['project_id'] : null;
        $title = isset($_POST['title']) ? trim($_POST['title']) : null;
        $description = isset($_POST['description']) ? trim($_POST['description']) : null;
        $cover_file = isset($_FILES['cover']) ? $_FILES['cover'] : null;
    } else {
        // JSON (alte API)
        $input = json_decode(file_get_contents('php://input'), true);
        $project_id = isset($input['project_id']) ? (int)$input['project_id'] : null;
        $title = isset($input['title']) ? trim($input['title']) : null;
        $description = isset($input['description']) ? trim($input['description']) : null;
    }

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
        // Hole student_id des aktuellen Users
        // Für Students: role_id ist die student_id
        // Für Teachers/Admins: müssen student_id aus teachers/admins Tabelle holen
        $student_id = null;
        
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
        
        // Prüfe ob Projekt existiert und dem User gehört
        $check_sql = "SELECT p.id, p.student_id, p.status
                     FROM projects p 
                     WHERE p.id = ? AND p.student_id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('ii', $project_id, $student_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found or access denied']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $project_row = $check_result->fetch_assoc();
        $current_status = $project_row['status'] ?? 'working';
        $check_stmt->close();

        // Prüfe ob Projekt bereits veröffentlicht war
        $was_published = ($current_status === 'published');
        
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;

        // Verarbeite Cover-Bild Upload (falls vorhanden)
        $cover_path = null;
        if ($cover_file && $cover_file['error'] === UPLOAD_ERR_OK) {
            // Validiere Dateityp
            $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $file_type = mime_content_type($cover_file['tmp_name']);
            
            if (!in_array($file_type, $allowed_types)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ungültiger Dateityp für Cover-Bild']);
                $conn->close();
                exit;
            }
            
            // Validiere Dateigröße (max 5MB)
            if ($cover_file['size'] > 5 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Cover-Bild ist zu groß (max 5MB)']);
                $conn->close();
                exit;
            }
            
            // Erstelle Upload-Verzeichnis falls nicht vorhanden
            $upload_dir = __DIR__ . '/../../uploads/project_covers/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            // Generiere eindeutigen Dateinamen
            $file_extension = pathinfo($cover_file['name'], PATHINFO_EXTENSION);
            $cover_filename = 'project_' . $project_id . '_' . time() . '.' . $file_extension;
            $cover_path = $upload_dir . $cover_filename;
            
            // Verschiebe Datei
            if (!move_uploaded_file($cover_file['tmp_name'], $cover_path)) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Fehler beim Hochladen des Cover-Bilds']);
                $conn->close();
                exit;
            }
            
            // Speichere relativen Pfad
            $cover_path = '/uploads/project_covers/' . $cover_filename;
        }

        if ($has_status_column) {
            // Update Status, Titel, Beschreibung und Cover
            // Setze Status auf 'check' statt 'published', damit die Lehrkraft es prüfen kann
            $new_status = 'check';
            $update_fields = ['status = ?'];
            $update_params = [$new_status];
            $update_types = 's';
            
            if ($title !== null && $title !== '') {
                $update_fields[] = 'title = ?';
                $update_params[] = $title;
                $update_types .= 's';
            }
            
            if ($description !== null) {
                $update_fields[] = 'description = ?';
                $update_params[] = $description;
                $update_types .= 's';
            }
            
            if ($cover_path !== null) {
                // Prüfe ob cover_path Spalte existiert
                $check_cover_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'cover_path'");
                if ($check_cover_column && $check_cover_column->num_rows > 0) {
                    $update_fields[] = 'cover_path = ?';
                    $update_params[] = $cover_path;
                    $update_types .= 's';
                }
            }
            
            $update_params[] = $project_id;
            $update_types .= 'i';
            
            $update_sql = "UPDATE projects SET " . implode(', ', $update_fields) . " WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if (!$update_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $update_stmt->bind_param($update_types, ...$update_params);
            if (!$update_stmt->execute()) {
                throw new Exception('Execute failed: ' . $update_stmt->error);
            }
            $update_stmt->close();
        } else {
            // Falls status Spalte nicht existiert, erstelle sie (für Testzwecke)
            $conn->query("ALTER TABLE projects ADD COLUMN status ENUM('working', 'check', 'published') DEFAULT 'working'");
            // Setze Status auf 'check' statt 'published', damit die Lehrkraft es prüfen kann
            $new_status = 'check';
            $update_sql = "UPDATE projects SET status = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if ($update_stmt) {
                $update_stmt->bind_param('si', $new_status, $project_id);
                $update_stmt->execute();
                $update_stmt->close();
            }
            
            // Update Titel und Beschreibung separat
            if ($title !== null && $title !== '') {
                $title_sql = "UPDATE projects SET title = ? WHERE id = ?";
                $title_stmt = $conn->prepare($title_sql);
                if ($title_stmt) {
                    $title_stmt->bind_param('si', $title, $project_id);
                    $title_stmt->execute();
                    $title_stmt->close();
                }
            }
            
            if ($description !== null) {
                $desc_sql = "UPDATE projects SET description = ? WHERE id = ?";
                $desc_stmt = $conn->prepare($desc_sql);
                if ($desc_stmt) {
                    $desc_stmt->bind_param('si', $description, $project_id);
                    $desc_stmt->execute();
                    $desc_stmt->close();
                }
            }
        }

        // Vergibe 5 T!Coins für Projekt-Veröffentlichung (nur wenn es vorher nicht veröffentlicht war)
        if (!$was_published) {
            try {
                awardTcoins($conn, $student_id, 5, 'project_published', $project_id, 'project');
            } catch (Exception $tcoins_error) {
                // Nicht kritisch - nur loggen
                error_log("[publish_project.php] Fehler bei T!Coin-Vergabe: " . $tcoins_error->getMessage());
            }
        }

        // Aktualisiere Projektanzahl in students Tabelle
        try {
            updateStudentProjectCounts($conn, $student_id);
        } catch (Exception $count_error) {
            // Nicht kritisch - nur loggen
            error_log("[publish_project.php] Fehler beim Aktualisieren der Projektanzahl: " . $count_error->getMessage());
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
                        // Nicht kritisch - nur loggen
                        error_log("[publish_project.php] Fehler bei Status-Prüfung: " . $status_error->getMessage());
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
        error_log("[publish_project.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

