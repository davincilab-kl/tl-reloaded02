<?php
require_once __DIR__ . '/../config/access_db.php';
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('ETag: "' . md5(time()) . '"');

try {
    // Parameter abrufen
    $type = $_GET['type'] ?? 'schools';
    $sort = $_GET['sort'] ?? 'students';
    $limit = min((int)($_GET['limit'] ?? 100), 100); // Maximal 100 Einträge
    
    // Validierung der Parameter
    $validTypes = ['schools', 'teachers', 'classes', 'students'];
    if (!in_array($type, $validTypes)) {
        throw new Exception('Ungültiger Typ');
    }
    
    $conn = db_connect();
    $data = [];
    
    switch ($type) {
        case 'schools':
            $data = getSchoolsLeaderboard($conn, $sort, $limit);
            break;
        case 'teachers':
            $data = getTeachersLeaderboard($conn, $sort, $limit);
            break;
        case 'classes':
            $data = getClassesLeaderboard($conn, $sort, $limit);
            break;
        case 'students':
            $data = getStudentsLeaderboard($conn, $sort, $limit);
            break;
    }
    
    $conn->close();
    
    // Verwende österreichische Zeitzone für Timestamps
    $now = new DateTime('now', new DateTimeZone('Europe/Vienna'));
    
    echo json_encode([
        'success' => true,
        'data' => $data,
        'type' => $type,
        'sort' => $sort,
        'count' => count($data),
        'timestamp' => $now->getTimestamp(), // Aktueller Timestamp für Cache-Busting
        'generated_at' => $now->format('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    $now = new DateTime('now', new DateTimeZone('Europe/Vienna'));
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => $now->getTimestamp()
    ]);
}

function getSchoolsLeaderboard($conn, $sort, $limit) {
    $validSorts = [
        'students' => 'student_count',
        'teachers' => 'teacher_count', 
        'classes' => 'class_count',
        'avg_t_coins' => 'avg_t_coins'
    ];
    
    $sortColumn = $validSorts[$sort] ?? 'student_count';
    
    // Optimierte Query mit separaten JOINs - viel schneller als Subqueries
    $sql = "
        SELECT 
            s.id,
            s.name,
            s.bundesland,
            s.ort,
            s.schulart,
            COALESCE(student_stats.student_count, 0) as student_count,
            COALESCE(teacher_stats.teacher_count, 0) as teacher_count,
            COALESCE(class_stats.class_count, 0) as class_count,
            COALESCE(student_stats.avg_t_coins, 0) as avg_t_coins
        FROM schools s
        LEFT JOIN (
            SELECT 
                school_id,
                COUNT(*) as student_count,
                COALESCE(AVG(t_coins), 0) as avg_t_coins
            FROM students
            GROUP BY school_id
        ) student_stats ON s.id = student_stats.school_id
        LEFT JOIN (
            SELECT 
                school_id,
                COUNT(*) as teacher_count
            FROM teachers
            GROUP BY school_id
        ) teacher_stats ON s.id = teacher_stats.school_id
        LEFT JOIN (
            SELECT 
                t.school_id,
                COUNT(*) as class_count
            FROM classes c
            LEFT JOIN teachers t ON c.teacher_id = t.id
            WHERE t.school_id IS NOT NULL
            GROUP BY t.school_id
        ) class_stats ON s.id = class_stats.school_id
        ORDER BY {$sortColumn} DESC, s.name ASC
        LIMIT {$limit}
    ";
    
    $result = $conn->query($sql);
    $data = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'bundesland' => $row['bundesland'],
                'ort' => $row['ort'],
                'schulart' => $row['schulart'],
                'student_count' => (int)$row['student_count'],
                'teacher_count' => (int)$row['teacher_count'],
                'class_count' => (int)$row['class_count'],
                'avg_t_coins' => round((float)$row['avg_t_coins'], 2)
            ];
        }
    } else {
        // Fehlerbehandlung hinzufügen
        throw new Exception('SQL Fehler: ' . $conn->error);
    }
    
    return $data;
}

function getTeachersLeaderboard($conn, $sort, $limit) {
    $validSorts = [
        'students' => 'student_count',
        'classes' => 'class_count',
        'total_t_coins' => 'total_t_coins',
        'avg_t_coins' => 'avg_t_coins'
    ];
    
    $sortColumn = $validSorts[$sort] ?? 'student_count';
    
    $sql = "
        SELECT 
            t.id,
            u.first_name,
            u.last_name,
            u.email,
            t.school_admin,
            u.last_login,
            s.name as school_name,
            t.school_id,
            COALESCE(stats.student_count, 0) as student_count,
            COALESCE(stats.class_count, 0) as class_count,
            COALESCE(stats.total_t_coins, 0) as total_t_coins,
            COALESCE(stats.avg_t_coins, 0) as avg_t_coins
        FROM teachers t
        LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
        LEFT JOIN schools s ON t.school_id = s.id
        LEFT JOIN (
            SELECT 
                c.teacher_id,
                COUNT(DISTINCT st.id) as student_count,
                COUNT(DISTINCT c.id) as class_count,
                COALESCE(SUM(st.t_coins), 0) as total_t_coins,
                COALESCE(AVG(st.t_coins), 0) as avg_t_coins
            FROM classes c
            LEFT JOIN students st ON c.id = st.class_id
            GROUP BY c.teacher_id
        ) stats ON t.id = stats.teacher_id
        ORDER BY {$sortColumn} DESC, u.first_name, u.last_name ASC
        LIMIT {$limit}
    ";
    
    $result = $conn->query($sql);
    $data = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren (last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $data[] = [
                'id' => (int)$row['id'],
                'name' => $full_name,
                'email' => $row['email'],
                'admin' => (bool)$row['school_admin'],
                'last_login' => $row['last_login'],
                'school_name' => $row['school_name'],
                'school_id' => (int)$row['school_id'],
                'student_count' => (int)$row['student_count'],
                'class_count' => (int)$row['class_count'],
                'total_t_coins' => (int)$row['total_t_coins'],
                'avg_t_coins' => round((float)$row['avg_t_coins'], 2)
            ];
        }
    }
    
    return $data;
}

function getClassesLeaderboard($conn, $sort, $limit) {
    $validSorts = [
        'students' => 'student_count',
        'total_t_coins' => 'total_t_coins',
        'avg_t_coins' => 'avg_t_coins'
    ];
    
    $sortColumn = $validSorts[$sort] ?? 'student_count';
    
    // Optimierte Query mit JOINs statt Subqueries - viel schneller
    $sql = "
        SELECT 
            c.id,
            c.name,
            c.teacher_id,
            u.first_name as teacher_first_name,
            u.last_name as teacher_last_name,
            s.name as school_name,
            COALESCE(stats.student_count, 0) as student_count,
            COALESCE(stats.total_t_coins, 0) as total_t_coins,
            COALESCE(stats.avg_t_coins, 0) as avg_t_coins
        FROM classes c
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
        LEFT JOIN schools s ON t.school_id = s.id
        LEFT JOIN (
            SELECT 
                st.class_id,
                COUNT(*) as student_count,
                COALESCE(SUM(st.t_coins), 0) as total_t_coins,
                COALESCE(AVG(st.t_coins), 0) as avg_t_coins
            FROM students st
            GROUP BY st.class_id
        ) stats ON c.id = stats.class_id
        ORDER BY {$sortColumn} DESC, c.name ASC
        LIMIT {$limit}
    ";
    
    $result = $conn->query($sql);
    $data = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren (last_name kann NULL sein)
            $teacher_full_name = trim(($row['teacher_first_name'] ?? '') . ' ' . ($row['teacher_last_name'] ?? ''));
            $data[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'teacher_id' => (int)$row['teacher_id'],
                'teacher_name' => $teacher_full_name,
                'school_name' => $row['school_name'],
                'student_count' => (int)$row['student_count'],
                'total_t_coins' => (int)$row['total_t_coins'],
                'avg_t_coins' => round((float)$row['avg_t_coins'], 2)
            ];
        }
    } else {
        // Fehlerbehandlung hinzufügen
        throw new Exception('SQL Fehler: ' . $conn->error);
    }
    
    return $data;
}

function getStudentsLeaderboard($conn, $sort, $limit) {
    $validSorts = [
        't_coins' => 't_coins',
        'courses_done' => 'courses_done',
        'projects_public' => 'projects_public',
        'projects_wip' => 'projects_wip'
    ];
    
    $sortColumn = $validSorts[$sort] ?? 't_coins';
    
    $sql = "
        SELECT 
            s.id,
            u.first_name,
            u.last_name,
            c.name as class_name,
            ut.first_name as teacher_first_name,
            ut.last_name as teacher_last_name,
            sch.name as school_name,
            COALESCE(s.t_coins, 0) as t_coins,
            COALESCE(s.courses_done, 0) as courses_done,
            COALESCE(s.projects_wip, 0) as projects_wip,
            COALESCE(s.projects_pending, 0) as projects_pending,
            COALESCE(s.projects_public, 0) as projects_public
        FROM students s
        LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN users ut ON ut.role_id = t.id AND ut.role = 'teacher'
        LEFT JOIN schools sch ON t.school_id = sch.id
        ORDER BY {$sortColumn} DESC, u.first_name, u.last_name ASC
        LIMIT {$limit}
    ";
    
    $result = $conn->query($sql);
    $data = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren (bei Students: gesamter Name in first_name, last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $teacher_full_name = trim(($row['teacher_first_name'] ?? '') . ' ' . ($row['teacher_last_name'] ?? ''));
            $data[] = [
                'id' => (int)$row['id'],
                'name' => $full_name,
                'class_name' => $row['class_name'],
                'teacher_name' => $teacher_full_name,
                'school_name' => $row['school_name'],
                't_coins' => (int)$row['t_coins'],
                'courses_done' => (int)$row['courses_done'],
                'projects_wip' => (int)$row['projects_wip'],
                'projects_pending' => (int)$row['projects_pending'],
                'projects_public' => (int)$row['projects_public']
            ];
        }
    }
    
    return $data;
}
?>
