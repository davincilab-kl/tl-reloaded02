<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // Authentifizierung prüfen
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    // Lade JSON-Body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
        exit;
    }

    $project_id = isset($data['project_id']) ? intval($data['project_id']) : 0;
    $project_data = isset($data['project_data']) ? $data['project_data'] : null;
    $title = isset($data['title']) ? trim($data['title']) : null;
    $cover = isset($data['cover']) ? $data['cover'] : null;

    if ($project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    // Maximale Projektgröße: 10MB
    $max_size = 10 * 1024 * 1024; // 10MB in Bytes
    $project_data_json = json_encode($project_data);
    if (strlen($project_data_json) > $max_size) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'Project data too large (max 10MB)']);
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

        // Prüfe ob Projekt existiert und Benutzer berechtigt ist
        $check_sql = "SELECT student_id FROM projects WHERE id = ? LIMIT 1";
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
        
        $check_row = $check_result->fetch_assoc();
        $project_student_id = (int)$check_row['student_id'];
        
        // Prüfe ob Benutzer berechtigt ist (Projekt-Besitzer oder Admin)
        if ($project_student_id !== $student_id && !is_admin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Not authorized to edit this project']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $check_stmt->close();

        // Validiere JSON-Daten
        if ($project_data !== null) {
            $validation_result = json_encode($project_data);
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid project data format']);
                $conn->close();
                exit;
            }
        }

        // Update Projekt-Daten
        $update_fields = [];
        $update_types = '';
        $update_params = [];

        if ($project_data !== null) {
            $update_fields[] = "project_data = ?";
            $update_types .= 's';
            $update_params[] = json_encode($project_data);
        }

        if ($title !== null && $title !== '') {
            $update_fields[] = "title = ?";
            $update_types .= 's';
            $update_params[] = $title;
        }

        // Prüfe ob cover Spalte existiert
        $check_cover_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'cover'");
        $has_cover_column = $check_cover_column && $check_cover_column->num_rows > 0;
        
        if ($cover !== null && $has_cover_column) {
            // Validiere Base64 Data URI
            if (preg_match('/^data:image\/(png|jpeg|jpg|gif|webp);base64,/', $cover)) {
                $update_fields[] = "cover = ?";
                $update_types .= 's';
                $update_params[] = $cover;
            }
        }

        if (empty($update_fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No data to update']);
            $conn->close();
            exit;
        }

        $update_types .= 'i'; // für project_id
        $update_params[] = $project_id;

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

        echo json_encode([
            'success' => true,
            'project_id' => $project_id,
            'message' => 'Project data saved successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[save_project_data.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

