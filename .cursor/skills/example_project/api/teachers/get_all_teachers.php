<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Parameter aus GET-Request
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $school = isset($_GET['school']) ? trim($_GET['school']) : '';
    $infowebinar = isset($_GET['infowebinar']) ? trim($_GET['infowebinar']) : '';
    $admin = isset($_GET['admin']) ? trim($_GET['admin']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
    $offset = ($page - 1) * $limit;

    // SQL-Query aufbauen
    $where_conditions = [];
    $params = [];
    $param_types = '';

    if (!empty($search)) {
        $where_conditions[] = "(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) LIKE ?)";
        $params[] = "%$search%";
        $param_types .= 's';
    }

    if (!empty($school)) {
        $where_conditions[] = "s.name LIKE ?";
        $params[] = "%$school%";
        $param_types .= 's';
    }

    // Admin-Filter wird nachgelagert angewendet
    // Info-Webinar-Filter wird nachgelagert angewendet

    $where_sql = '';
    if (!empty($where_conditions)) {
        $where_sql = 'WHERE ' . implode(' AND ', $where_conditions);
    }

    // Hilfsfunktion: Referenzen für bind_param erzeugen
    function make_params_by_ref(&$params) {
        $refs = [];
        foreach ($params as $key => $value) {
            $refs[$key] = &$params[$key];
        }
        return $refs;
    }

    // Hilfsfunktion: Erweiterte Filter anwenden
    function applyAdvancedFilters($teachers, $infowebinar, $admin) {
        $filtered_teachers = [];
        
        foreach ($teachers as $teacher) {
            $include_teacher = true;
            
            // Info-Webinar Filter
            if (!empty($infowebinar)) {
                $hasInfowebinar = $teacher['infowebinar'] && 
                    $teacher['infowebinar'] !== '0000-00-00 00:00:00' && 
                    $teacher['infowebinar'] !== '0000-00-00' && 
                    $teacher['infowebinar'] !== null;
                
                if ($infowebinar === 'ja' && !$hasInfowebinar) {
                    $include_teacher = false;
                } elseif ($infowebinar === 'nein' && $hasInfowebinar) {
                    $include_teacher = false;
                }
            }
            
            // Admin Filter
            if (!empty($admin)) {
                if ($admin === 'admin' && !$teacher['admin']) {
                    $include_teacher = false;
                } elseif ($admin === 'teacher' && $teacher['admin']) {
                    $include_teacher = false;
                }
            }
            
            if ($include_teacher) {
                $filtered_teachers[] = $teacher;
            }
        }
        
        return $filtered_teachers;
    }

    // Prüfe ob school_years Tabellen existieren
    $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
    $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
    $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
    $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
    
    // Lehrer abfragen - ALLE Lehrer laden (ohne LIMIT/OFFSET), da Filter nachgelagert angewendet werden
    $school_columns = 's.name as school_name';
    $group_by_columns = 's.name';
    $foerderung_select = "(
        SELECT CASE WHEN EXISTS (
            SELECT 1 FROM school_school_years ssy_sub
            INNER JOIN school_years sy_sub ON ssy_sub.school_year_id = sy_sub.id
            WHERE ssy_sub.school_id = s.id AND sy_sub.is_current = 1
        ) THEN 1 ELSE 0 END
    ) AS school_foerderung";

    $sql = "SELECT t.id, t.school_id, u.first_name, u.last_name, u.email, t.infowebinar, t.school_admin, u.last_login,
                   $school_columns,
                   $foerderung_select,
                   t.status_id,
                   ts.display_name as status_name,
                   COUNT(DISTINCT c.id) as class_count,
                   COUNT(DISTINCT st.id) as student_count,
                   COUNT(DISTINCT p.id) as project_count
            FROM teachers t
            LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
            LEFT JOIN schools s ON t.school_id = s.id
            LEFT JOIN teacher_stati ts ON t.status_id = ts.id
            LEFT JOIN classes c ON t.id = c.teacher_id
            LEFT JOIN students st ON c.id = st.class_id
            LEFT JOIN projects p ON st.id = p.student_id
            $where_sql
            GROUP BY t.id, t.school_id, u.first_name, u.last_name, u.email, t.infowebinar, t.school_admin, u.last_login, $group_by_columns, t.status_id, ts.display_name, school_foerderung
            ORDER BY t.school_admin DESC, u.first_name, u.last_name";

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        // Nur binden, wenn WHERE-Parameter existieren
        if ($param_types !== '' && count($params) > 0) {
            $bindParams = make_params_by_ref($params);
            array_unshift($bindParams, $param_types);
            call_user_func_array([$stmt, 'bind_param'], $bindParams);
        }
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['error' => 'Query failed', 'details' => $stmt->error]);
            $stmt->close();
            $conn->close();
            exit;
        }
        $result = $stmt->get_result();
        
        $teachers = [];
        
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren (last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            
            // Förderstatus bestimmen
            $school_foerderung = isset($row['school_foerderung']) ? (bool)$row['school_foerderung'] : false;
            
            $teachers[] = [
                'id' => (int)$row['id'],
                'school_id' => (int)$row['school_id'],
                'name' => $full_name,
                'email' => $row['email'],
                'infowebinar' => $row['infowebinar'],
                'admin' => (bool)$row['school_admin'],
                'last_login' => $row['last_login'],
                'school_name' => $row['school_name'],
                'school_foerderung' => $school_foerderung,
                'status_id' => $row['status_id'] ? (int)$row['status_id'] : null,
                'status_name' => $row['status_name'] ?? null,
                'class_count' => (int)$row['class_count'],
                'student_count' => (int)$row['student_count'],
                'project_count' => (int)$row['project_count']
            ];
        }
        
        $stmt->close();
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Prepare failed', 'details' => $conn->error]);
        $conn->close();
        exit;
    }

    // Filter nach Info-Webinar und Admin anwenden (nach dem Laden aller Daten)
    $teachers = applyAdvancedFilters($teachers, $infowebinar, $admin);
    
    // Gesamtanzahl für Pagination - nach dem Anwenden aller Filter
    $total = count($teachers);
    
    // Pagination nach dem Filtern anwenden
    $teachers = array_slice($teachers, $offset, $limit);

    // Schulen für Filter
    $schools_result = $conn->query("SELECT DISTINCT name FROM schools ORDER BY name");
    $schools = [];
    if ($schools_result) {
        while ($row = $schools_result->fetch_assoc()) {
            $schools[] = $row['name'];
        }
    }

    echo json_encode([
        'teachers' => $teachers,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'schools' => $schools
    ]);

    $conn->close();
?>
