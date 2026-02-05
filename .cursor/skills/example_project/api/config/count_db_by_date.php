<?php
    require_once __DIR__ . '/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // Datum aus GET-Parameter holen (Format: Y-m-d)
        $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
        
        // Validiere Datum
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid date format']);
            $conn->close();
            exit;
        }

        // Schulen: Anzahl bis zum angegebenen Datum (erstelldatum statt created_at)
        $schools_sql = "SELECT COUNT(*) AS cnt FROM schools WHERE (erstelldatum IS NULL OR DATE(erstelldatum) <= ?)";
        $schools_stmt = $conn->prepare($schools_sql);
        $schools_count = 0;
        if ($schools_stmt) {
            $schools_stmt->bind_param('s', $date);
            if ($schools_stmt->execute()) {
                $schools_result = $schools_stmt->get_result();
                if ($schools_row = $schools_result->fetch_assoc()) {
                    $schools_count = (int)$schools_row['cnt'];
                }
            } else {
                error_log("SQL Execute Error (schools): " . $schools_stmt->error);
            }
            $schools_stmt->close();
        } else {
            error_log("SQL Prepare Error (schools): " . $conn->error);
        }

        // Lehrkräfte: Anzahl bis zum angegebenen Datum (basierend auf users.created_at)
        $teachers_sql = "SELECT COUNT(DISTINCT t.id) AS cnt 
                         FROM teachers t 
                         LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                         WHERE (u.created_at IS NULL OR DATE(u.created_at) <= ?)";
        $teachers_stmt = $conn->prepare($teachers_sql);
        $teachers_count = 0;
        if ($teachers_stmt) {
            $teachers_stmt->bind_param('s', $date);
            if ($teachers_stmt->execute()) {
                $teachers_result = $teachers_stmt->get_result();
                if ($teachers_row = $teachers_result->fetch_assoc()) {
                    $teachers_count = (int)$teachers_row['cnt'];
                }
            } else {
                error_log("SQL Execute Error (teachers): " . $teachers_stmt->error);
            }
            $teachers_stmt->close();
        } else {
            error_log("SQL Prepare Error (teachers): " . $conn->error);
        }

        // Klassen: Anzahl bis zum angegebenen Datum
        $classes_sql = "SELECT COUNT(*) AS cnt FROM classes WHERE (created_at IS NULL OR DATE(created_at) <= ?)";
        $classes_stmt = $conn->prepare($classes_sql);
        $classes_count = 0;
        if ($classes_stmt) {
            $classes_stmt->bind_param('s', $date);
            if ($classes_stmt->execute()) {
                $classes_result = $classes_stmt->get_result();
                if ($classes_row = $classes_result->fetch_assoc()) {
                    $classes_count = (int)$classes_row['cnt'];
                }
            } else {
                error_log("SQL Execute Error (classes): " . $classes_stmt->error);
            }
            $classes_stmt->close();
        } else {
            error_log("SQL Prepare Error (classes): " . $conn->error);
        }

        // Schüler: Anzahl bis zum angegebenen Datum (ohne Lehrer-Placeholder, basierend auf users.created_at)
        $students_sql = "SELECT COUNT(DISTINCT s.id) AS cnt 
                         FROM students s
                         LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                         WHERE s.class_id IS NOT NULL 
                         AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                         AND (u.created_at IS NULL OR DATE(u.created_at) <= ?)";
        $students_stmt = $conn->prepare($students_sql);
        $students_count = 0;
        if ($students_stmt) {
            $students_stmt->bind_param('s', $date);
            if ($students_stmt->execute()) {
                $students_result = $students_stmt->get_result();
                if ($students_row = $students_result->fetch_assoc()) {
                    $students_count = (int)$students_row['cnt'];
                }
            } else {
                error_log("SQL Execute Error (students): " . $students_stmt->error);
            }
            $students_stmt->close();
        } else {
            error_log("SQL Prepare Error (students): " . $conn->error);
        }

    $data = [
        'date' => $date,
        'schools' => $schools_count,
        'teachers' => $teachers_count,
        'classes' => $classes_count,
        'students' => $students_count
    ];

        echo json_encode($data);

    } catch (Exception $e) {
        http_response_code(500);
        error_log("Error in count_db_by_date.php: " . $e->getMessage());
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

