<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }
    
    // Für Students: role_id ist die student_id
    // Für Teachers/Admins: müssen student_id aus teachers/admins Tabelle holen
    $student_id = null;
    
    if (is_student()) {
        $student_id = get_role_id();
    } else if (is_teacher() || is_admin()) {
        // Hole student_id aus teachers Tabelle
        $conn = db_connect();
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
        
        $conn->close();
    }
    
    if ($student_id === null || $student_id <= 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'No student_id found for this user']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'student_id' => $student_id
    ]);
?>
