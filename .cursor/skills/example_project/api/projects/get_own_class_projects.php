<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Prüfe ob User eingeloggt ist
    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole student_id des aktuellen Users
        $user_role = get_user_role();
        $student_id = null;
        
        if ($user_role === 'student') {
            $student_id = get_role_id();
        } else if ($user_role === 'teacher' || $user_role === 'admin') {
            // Für Lehrer/Admin: Hole student_id aus teachers/admins Tabelle
            $role_id = get_role_id();
            
            // Prüfe zuerst ob Admin mit student_id in admins Tabelle
            if ($user_role === 'admin') {
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
            echo json_encode(['error' => 'No student_id found for this user']);
            $conn->close();
            exit;
        }

        // Hole school_id, Schulname, class_id und Klassenname des Schülers
        $school_sql = "SELECT s.school_id, s.class_id, sch.name as school_name, c.name as class_name
                       FROM students s 
                       LEFT JOIN schools sch ON s.school_id = sch.id 
                       LEFT JOIN classes c ON s.class_id = c.id
                       WHERE s.id = ? LIMIT 1";
        $school_stmt = $conn->prepare($school_sql);
        if (!$school_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $school_stmt->bind_param('i', $student_id);
        if (!$school_stmt->execute()) {
            throw new Exception('Execute failed: ' . $school_stmt->error);
        }
        
        $school_result = $school_stmt->get_result();
        if ($school_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            $school_stmt->close();
            $conn->close();
            exit;
        }
        
        $school_row = $school_result->fetch_assoc();
        $school_id = $school_row['school_id'];
        $school_name = $school_row['school_name'] ?? 'Schule';
        $own_class_id = isset($school_row['class_id']) ? (int)$school_row['class_id'] : null;
        $own_class_name = $school_row['class_name'] ?? null;
        $school_stmt->close();
        
        if ($school_id === null) {
            http_response_code(404);
            echo json_encode(['error' => 'Student has no school assigned']);
            $conn->close();
            exit;
        }

        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        // Prüfe ob likes Spalte existiert
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;

        // Projekte der gesamten Schule abfragen (nur veröffentlichte)
        $sql = "SELECT 
                    p.id,
                    p.title,
                    p.description,
                    p.student_id,
                    CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS student_name,
                    s.class_id,
                    COALESCE(c.name, 'Keine Klasse') AS class_name,
                    " . ($has_status_column ? "p.status" : "'working' AS status") . ",
                    " . ($has_likes_column ? "COALESCE(p.likes, 0)" : "0") . " AS like_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN users u ON u.role_id = s.id AND u.role = 'student'
                LEFT JOIN classes c ON s.class_id = c.id
                WHERE s.school_id = ?";
        
        // Filter: Nur veröffentlichte Projekte
        if ($has_status_column) {
            $sql .= " AND p.status = 'published'";
        } else {
            // Wenn status Spalte nicht existiert, keine Projekte zurückgeben
            $sql .= " AND 1 = 0";
        }
        
        $sql .= " ORDER BY c.name ASC, p.id DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $school_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $projects = [];
        
        while ($row = $result->fetch_assoc()) {
            $projects[] = [
                'id' => (int)$row['id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'link' => null,
                'student_id' => (int)$row['student_id'],
                'student_name' => $row['student_name'],
                'class_id' => isset($row['class_id']) ? (int)$row['class_id'] : null,
                'class_name' => $row['class_name'] ?? 'Keine Klasse',
                'status' => $row['status'] ?? 'working',
                'like_count' => isset($row['like_count']) ? (int)$row['like_count'] : 0
            ];
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'school_name' => $school_name,
            'own_class_id' => $own_class_id,
            'own_class_name' => $own_class_name,
            'projects' => $projects
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[get_own_class_projects.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>
