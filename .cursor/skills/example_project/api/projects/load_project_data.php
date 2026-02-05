<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Projekt-ID aus GET-Parameter
    $project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : 0;

    if ($project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    // Authentifizierung prüfen
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole student_id des aktuellen Users
        $student_id = null;
        $user_role = get_user_role();
        
        if (is_student()) {
            $student_id = get_role_id();
        } else if (is_teacher() || is_admin()) {
            $role_id = get_role_id();
            
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

        // Prüfe ob project_data Spalte existiert
        $check_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'project_data'");
        $has_project_data_column = $check_column && $check_column->num_rows > 0;

        if (!$has_project_data_column) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Project data column does not exist']);
            $conn->close();
            exit;
        }

        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        // Lade Projekt-Daten
        $sql = "SELECT project_data, student_id, title";
        if ($has_status_column) {
            $sql .= ", status";
        }
        $sql .= " FROM projects WHERE id = ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $project_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $row = $result->fetch_assoc();
        $project_student_id = (int)$row['student_id'];
        
        // Prüfe ob Benutzer berechtigt ist (Projekt-Besitzer oder Admin)
        if ($project_student_id !== $student_id && !is_admin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Not authorized to access this project']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $project_data = $row['project_data'];
        $project_title = $row['title'];
        $project_status = $has_status_column ? ($row['status'] ?? 'working') : 'working';
        
        $stmt->close();

        // Parse JSON falls vorhanden
        $parsed_data = null;
        if (!empty($project_data)) {
            $parsed_data = json_decode($project_data, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                // Falls kein gültiges JSON, als String zurückgeben
                $parsed_data = $project_data;
            }
        }

        echo json_encode([
            'success' => true,
            'project_id' => $project_id,
            'title' => $project_title,
            'status' => $project_status,
            'project_data' => $parsed_data
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[load_project_data.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

