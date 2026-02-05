<?php
    require_once __DIR__ . '/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // User-ID aus GET-Parameter holen (für Teacher-Bereich)
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

    $conn = db_connect();

    function count_table($conn, $table) {
        $sql = "SELECT COUNT(*) AS cnt FROM `" . $conn->real_escape_string($table) . "`";
        $res = $conn->query($sql);
        if ($res && $row = $res->fetch_assoc()) {
            return (int)$row['cnt'];
        }
        return 0;
    }

    if ($user_id !== null && $user_id > 0) {
        // Für Teacher: nur Daten, die dem User zugeordnet sind
        // Hole erst die Schule des Lehrers
        $school_sql = "SELECT school_id FROM teachers WHERE id = ? LIMIT 1";
        $school_stmt = $conn->prepare($school_sql);
        $school_id = null;
        if ($school_stmt) {
            $school_stmt->bind_param('i', $user_id);
            $school_stmt->execute();
            $school_result = $school_stmt->get_result();
            if ($school_row = $school_result->fetch_assoc()) {
                $school_id = (int)$school_row['school_id'];
            }
            $school_stmt->close();
        }
        
        // Schulen: nur die Schule des Lehrers (0 wenn keine gefunden)
        $schools_count = $school_id > 0 ? 1 : 0;
        
        // Lehrer: nur dieser Lehrer
        $teachers_count = 1;
        
        // Klassen: nur Klassen dieses Lehrers
        $classes_sql = "SELECT COUNT(*) AS cnt FROM classes WHERE teacher_id = ?";
        $classes_stmt = $conn->prepare($classes_sql);
        $classes_count = 0;
        if ($classes_stmt) {
            $classes_stmt->bind_param('i', $user_id);
            $classes_stmt->execute();
            $classes_result = $classes_stmt->get_result();
            if ($classes_row = $classes_result->fetch_assoc()) {
                $classes_count = (int)$classes_row['cnt'];
            }
            $classes_stmt->close();
        }
        
        // Schüler: nur Schüler der Klassen dieses Lehrers (ohne Lehrer-Placeholder)
        $students_sql = "SELECT COUNT(DISTINCT s.id) AS cnt 
                        FROM students s 
                        INNER JOIN classes c ON s.class_id = c.id 
                        WHERE c.teacher_id = ? 
                        AND s.class_id IS NOT NULL
                        AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        $students_stmt = $conn->prepare($students_sql);
        $students_count = 0;
        if ($students_stmt) {
            $students_stmt->bind_param('i', $user_id);
            $students_stmt->execute();
            $students_result = $students_stmt->get_result();
            if ($students_row = $students_result->fetch_assoc()) {
                $students_count = (int)$students_row['cnt'];
            }
            $students_stmt->close();
        }
        
        $data = [
            'schools' => $schools_count,
            'teachers' => $teachers_count,
            'classes' => $classes_count,
            'students' => $students_count
        ];
    } else {
        // Für Admins: alle Daten (Schüler ohne Lehrer-Placeholder)
        $students_count_sql = "SELECT COUNT(*) AS cnt FROM students WHERE class_id IS NOT NULL AND (is_teacher_placeholder = 0 OR is_teacher_placeholder IS NULL)";
        $students_count_result = $conn->query($students_count_sql);
        $students_count = 0;
        if ($students_count_result && $row = $students_count_result->fetch_assoc()) {
            $students_count = (int)$row['cnt'];
        }
        
        $data = [
            'schools' => count_table($conn, 'schools'),
            'teachers' => count_table($conn, 'teachers'),
            'classes' => count_table($conn, 'classes'),
            'students' => $students_count
        ];
    }

    echo json_encode($data);

    $conn->close();
?>
