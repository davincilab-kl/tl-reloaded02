<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Hole aktuelle User-ID
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        $conn->close();
        exit;
    }

    try {
        // Hole school_id und teacher_id des aktuellen Lehrers (unterstützt sowohl 'teacher' als auch 'admin' Rollen)
        $teacher_sql = "SELECT t.id as teacher_id, t.school_id, t.waitlist 
                       FROM teachers t 
                       INNER JOIN users u ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin') 
                       WHERE u.id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $teacher_stmt->bind_param('i', $user_id);
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_result = $teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Teacher not found']);
            $teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_data = $teacher_result->fetch_assoc();
        $school_id = $teacher_data['school_id'];
        $teacher_id = $teacher_data['teacher_id'];
        $waitlist_flag = isset($teacher_data['waitlist']) ? (int)$teacher_data['waitlist'] : 0;
        $teacher_stmt->close();
        
        // Prüfe ob auf Warteliste
        $waitlist_entry = null;
        $check_waitlist = $conn->query("SHOW TABLES LIKE 'teacher_waitlist'");
        if ($check_waitlist && $check_waitlist->num_rows > 0 && $teacher_id) {
            $waitlist_sql = "SELECT w.id, w.school_id, w.created_at, w.status, s.name as school_name, s.bundesland, s.ort
                           FROM teacher_waitlist w
                           INNER JOIN schools s ON s.id = w.school_id
                           WHERE w.teacher_id = ? AND w.status = 'pending'
                           ORDER BY w.created_at DESC
                           LIMIT 1";
            $waitlist_stmt = $conn->prepare($waitlist_sql);
            if ($waitlist_stmt) {
                $waitlist_stmt->bind_param('i', $teacher_id);
                if ($waitlist_stmt->execute()) {
                    $waitlist_result = $waitlist_stmt->get_result();
                    if ($waitlist_row = $waitlist_result->fetch_assoc()) {
                        $waitlist_entry = [
                            'id' => (int)$waitlist_row['id'],
                            'school_id' => (int)$waitlist_row['school_id'],
                            'created_at' => $waitlist_row['created_at'],
                            'status' => $waitlist_row['status'],
                            'school_name' => $waitlist_row['school_name'],
                            'school_bundesland' => $waitlist_row['bundesland'],
                            'school_ort' => $waitlist_row['ort']
                        ];
                    }
                }
                $waitlist_stmt->close();
            }
        }
        
        if (!$school_id) {
            // Keine Schule zugewiesen
            if ($waitlist_entry) {
                // Auf Warteliste
                echo json_encode([
                    'success' => true,
                    'status' => 'waitlist',
                    'waitlist' => $waitlist_entry
                ]);
            } else {
                // Keine Schule, nicht auf Warteliste
                echo json_encode([
                    'success' => true,
                    'status' => 'no_school'
                ]);
            }
            $conn->close();
            exit;
        }
        
        // Hole Schulinformationen (inkl. Förderung)
        $school_columns = ['s.id', 's.name', 's.bundesland', 's.ort', 's.strasse', 's.plz', 's.schulart', 's.schultyp', 's.erstelldatum'];
        $group_by_columns = ['s.id', 's.name', 's.bundesland', 's.ort', 's.strasse', 's.plz', 's.schulart', 's.schultyp', 's.erstelldatum'];
        
        // Prüfe ob strasse und plz Spalten existieren
        $check_strasse = $conn->query("SHOW COLUMNS FROM schools LIKE 'strasse'");
        $has_strasse = $check_strasse && $check_strasse->num_rows > 0;
        $check_plz = $conn->query("SHOW COLUMNS FROM schools LIKE 'plz'");
        $has_plz = $check_plz && $check_plz->num_rows > 0;
        
        if (!$has_strasse) {
            $school_columns = array_filter($school_columns, function($col) { return $col !== 's.strasse'; });
            $group_by_columns = array_filter($group_by_columns, function($col) { return $col !== 's.strasse'; });
        }
        if (!$has_plz) {
            $school_columns = array_filter($school_columns, function($col) { return $col !== 's.plz'; });
            $group_by_columns = array_filter($group_by_columns, function($col) { return $col !== 's.plz'; });
        }
        
        // Prüfe ob is_teacher_placeholder Spalte existiert
        $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
        $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
        
        $student_join = "LEFT JOIN students st ON st.class_id = c.id";
        if ($has_is_teacher_placeholder) {
            $student_join .= " AND (st.is_teacher_placeholder = 0 OR st.is_teacher_placeholder IS NULL)";
        }
        
        // JOIN für Förderung im aktuellen Schuljahr
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
        $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
        
        $foerderung_join = '';
        $foerderung_select = '0 as foerderung';
        if ($has_school_years && $has_school_school_years) {
            $foerderung_join = "LEFT JOIN school_school_years ssy_foerderung ON ssy_foerderung.school_id = s.id
                                LEFT JOIN school_years sy_foerderung ON sy_foerderung.id = ssy_foerderung.school_year_id AND sy_foerderung.is_current = 1";
            $foerderung_select = "CASE WHEN ssy_foerderung.id IS NOT NULL THEN 1 ELSE 0 END as foerderung";
        }
        
        $school_sql = "SELECT " . implode(', ', $school_columns) . ",
                      COUNT(DISTINCT t.id) as teacher_count,
                      COUNT(DISTINCT c.id) as class_count,
                      COUNT(DISTINCT st.id) as student_count,
                      COALESCE(AVG(st.t_coins), 0) as avg_t_coins,
                      " . $foerderung_select . "
                      FROM schools s
                      LEFT JOIN teachers t ON t.school_id = s.id
                      LEFT JOIN classes c ON c.teacher_id = t.id
                      " . $student_join . "
                      " . $foerderung_join . "
                      WHERE s.id = ?
                      GROUP BY " . implode(', ', $group_by_columns) . ($foerderung_join ? ", foerderung" : "");
        
        $school_stmt = $conn->prepare($school_sql);
        if (!$school_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $school_stmt->bind_param('i', $school_id);
        if (!$school_stmt->execute()) {
            throw new Exception('Execute failed: ' . $school_stmt->error);
        }
        
        $school_result = $school_stmt->get_result();
        if ($school_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'School not found']);
            $school_stmt->close();
            $conn->close();
            exit;
        }
        
        $school_data = $school_result->fetch_assoc();
        $school_stmt->close();
        
        echo json_encode([
            'success' => true,
            'status' => 'assigned',
            'school' => [
                'id' => (int)$school_data['id'],
                'name' => $school_data['name'],
                'bundesland' => $school_data['bundesland'],
                'ort' => $school_data['ort'],
                'strasse' => isset($school_data['strasse']) ? $school_data['strasse'] : null,
                'plz' => isset($school_data['plz']) ? $school_data['plz'] : null,
                'schulart' => $school_data['schulart'],
                'schultyp' => $school_data['schultyp'],
                'erstelldatum' => $school_data['erstelldatum'],
                'foerderung' => isset($school_data['foerderung']) ? (bool)$school_data['foerderung'] : false,
                'teacher_count' => (int)$school_data['teacher_count'],
                'class_count' => (int)$school_data['class_count'],
                'student_count' => (int)$school_data['student_count'],
                'avg_t_coins' => round((float)$school_data['avg_t_coins'], 1)
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

