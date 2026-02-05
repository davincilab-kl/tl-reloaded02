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

        // Hole school_id des Schülers
        $school_sql = "SELECT school_id FROM students WHERE id = ? LIMIT 1";
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
        $school_stmt->close();
        
        if ($school_id === null) {
            http_response_code(404);
            echo json_encode(['error' => 'Student has no school assigned']);
            $conn->close();
            exit;
        }

        // Prüfe ob is_teacher_placeholder Spalte existiert
        $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
        $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
        
        // Top 3 Klassen nach T!Score (avg_t_coins) abfragen
        $sql = "SELECT 
                    c.id,
                    c.name,
                    COUNT(st.id) as student_count,
                    COALESCE(AVG(st.t_coins), 0) as avg_t_coins,
                    COALESCE(SUM(st.t_coins), 0) as total_t_coins
                FROM classes c
                LEFT JOIN students st ON c.id = st.class_id";
        
        if ($has_is_teacher_placeholder) {
            $sql .= " AND (st.is_teacher_placeholder = 0 OR st.is_teacher_placeholder IS NULL)";
        }
        
        $sql .= " WHERE c.school_id = ?
                GROUP BY c.id, c.name
                HAVING student_count > 0
                ORDER BY avg_t_coins DESC, c.name ASC
                LIMIT 3";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $school_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $classes = [];
        $rank = 1;
        
        while ($row = $result->fetch_assoc()) {
            $classes[] = [
                'rank' => $rank++,
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'student_count' => (int)$row['student_count'],
                'avg_t_coins' => round((float)$row['avg_t_coins'], 1),
                'total_t_coins' => (int)$row['total_t_coins']
            ];
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'classes' => $classes
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[get_school_top_classes.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>
