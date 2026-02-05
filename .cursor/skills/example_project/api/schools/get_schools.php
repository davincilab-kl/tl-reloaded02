<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Error logging
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../../php_error.log');
    
    try {
        $conn = db_connect();

        // Parameter aus GET-Request
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $bundesland = isset($_GET['bundesland']) ? trim($_GET['bundesland']) : '';
        $infowebinar = isset($_GET['infowebinar']) ? trim($_GET['infowebinar']) : '';
        $sponsor = isset($_GET['sponsor']) ? trim($_GET['sponsor']) : '';
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;

        // Prüfe ob Spalten existieren
        $check_plz = $conn->query("SHOW COLUMNS FROM schools LIKE 'plz'");
        $has_plz = $check_plz && $check_plz->num_rows > 0;
        
        $check_strasse = $conn->query("SHOW COLUMNS FROM schools LIKE 'strasse'");
        $has_strasse = $check_strasse && $check_strasse->num_rows > 0;
        
        $check_created_by_user_id = $conn->query("SHOW COLUMNS FROM schools LIKE 'created_by_user_id'");
        $has_created_by_user_id = $check_created_by_user_id && $check_created_by_user_id->num_rows > 0;
        
        $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
        $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
        
        // SQL-Query aufbauen
        $where_conditions = [];
        $params = [];
        $param_types = '';
        $joins = [];

        // Suchbegriff-Filter
        if (!empty($search)) {
            $where_conditions[] = "s.name LIKE ?";
            $params[] = "%$search%";
            $param_types .= 's';
        }

        // Bundesland-Filter
        if (!empty($bundesland)) {
            $where_conditions[] = "s.bundesland = ?";
            $params[] = $bundesland;
            $param_types .= 's';
        }

        // Info-Webinar-Filter
        if (!empty($infowebinar)) {
            if ($infowebinar === 'ja') {
                // Verwende EXISTS statt JOIN, um Duplikate zu vermeiden
                // Prüfe auf gültige DATETIME-Werte (nicht NULL und > '1970-01-01')
                $where_conditions[] = "EXISTS (SELECT 1 FROM teachers t_info WHERE t_info.school_id = s.id 
                                           AND t_info.infowebinar IS NOT NULL 
                                           AND t_info.infowebinar > '1970-01-01 00:00:00')";
            } elseif ($infowebinar === 'nein') {
                // Schulen ohne Info-Webinar-Teilnahme
                $where_conditions[] = "NOT EXISTS (SELECT 1 FROM teachers t2 WHERE t2.school_id = s.id 
                                                      AND t2.infowebinar IS NOT NULL 
                                                      AND t2.infowebinar > '1970-01-01 00:00:00')";
            }
        }

        // Sponsor-Filter
        if (!empty($sponsor)) {
            $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
            $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
            $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
            $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
            
            if ($has_school_years && $has_school_school_years) {
                $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
                $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
                
                // JOIN nur für das aktuelle Schuljahr
                $joins[] = "LEFT JOIN school_school_years ssy_sponsor ON ssy_sponsor.school_id = s.id";
                $joins[] = "LEFT JOIN school_years sy_sponsor ON sy_sponsor.id = ssy_sponsor.school_year_id AND sy_sponsor.is_current = 1";
                
                if ($sponsor === 'keine') {
                    // Schulen ohne Förderung = KEIN Eintrag in school_school_years für aktuelles Schuljahr
                    $where_conditions[] = "NOT EXISTS (SELECT 1 FROM school_school_years ssy_sub 
                                                      INNER JOIN school_years sy_sub ON ssy_sub.school_year_id = sy_sub.id 
                                                      WHERE ssy_sub.school_id = s.id AND sy_sub.is_current = 1)";
                } elseif ($sponsor === 'mit') {
                    // Schulen mit Förderung = Eintrag in school_school_years für aktuelles Schuljahr
                    $where_conditions[] = "sy_sponsor.is_current = 1";
                }
            }
        }

        $where_sql = '';
        if (!empty($where_conditions)) {
            $where_sql = 'WHERE ' . implode(' AND ', $where_conditions);
        }

        $joins_sql = '';
        if (!empty($joins)) {
            $joins_sql = implode(' ', array_unique($joins));
        }

        // Basis-Spalten
        $school_columns = ['s.id', 's.name', 's.bundesland', 's.ort', 's.schulart', 's.erstelldatum'];
        $group_by_columns = ['s.id', 's.name', 's.bundesland', 's.ort', 's.schulart', 's.erstelldatum'];
        
        if ($has_plz) {
            $school_columns[] = 's.plz';
            $group_by_columns[] = 's.plz';
        }
        
        if ($has_strasse) {
            $school_columns[] = 's.strasse';
            $group_by_columns[] = 's.strasse';
        }
        
        if ($has_created_by_user_id) {
            $school_columns[] = 's.created_by_user_id';
            $group_by_columns[] = 's.created_by_user_id';
        }

        // Student-Join mit optionaler is_teacher_placeholder-Prüfung
        $student_join = "LEFT JOIN students st ON st.class_id = c.id";
        if ($has_is_teacher_placeholder) {
            $student_join .= " AND (st.is_teacher_placeholder = 0 OR st.is_teacher_placeholder IS NULL)";
        }

        // Haupt-Query mit Aggregationen
        $sql = "SELECT " . implode(', ', $school_columns) . ",
                       COUNT(DISTINCT t.id) as teacher_count,
                       COUNT(DISTINCT c.id) as class_count,
                       COUNT(DISTINCT st.id) as student_count
                FROM schools s
                LEFT JOIN teachers t ON t.school_id = s.id
                LEFT JOIN classes c ON c.teacher_id = t.id
                " . $student_join . "
                " . $joins_sql . "
                $where_sql
                GROUP BY " . implode(', ', $group_by_columns) . "
                ORDER BY s.name ASC
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        $param_types .= 'ii';

        // Hilfsfunktion für bind_param
        function make_params_by_ref(&$params) {
            $refs = [];
            foreach ($params as $key => $value) {
                $refs[$key] = &$params[$key];
            }
            return $refs;
        }

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            $error_msg = 'Prepare failed: ' . $conn->error;
            echo json_encode(['error' => 'Query preparation failed', 'details' => $conn->error]);
            $conn->close();
            exit;
        }
        
        // Parameter binden
        if ($param_types !== '' && count($params) > 0) {
            $bindParams = make_params_by_ref($params);
            array_unshift($bindParams, $param_types);
            call_user_func_array([$stmt, 'bind_param'], $bindParams);
        }
        
        if (!$stmt->execute()) {
            http_response_code(500);
            $error_msg = 'Query execution failed: ' . $stmt->error;
            echo json_encode(['error' => 'Query failed', 'details' => $stmt->error]);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $result = $stmt->get_result();
        $schools = [];
        $school_ids = [];
        
        while ($row = $result->fetch_assoc()) {
            $school_id = (int)$row['id'];
            $school_ids[] = $school_id;
            
            $school = [
                'id' => $school_id,
                'name' => $row['name'],
                'bundesland' => $row['bundesland'],
                'ort' => $row['ort'] ?? null,
                'strasse' => ($has_strasse && isset($row['strasse'])) ? $row['strasse'] : null,
                'plz' => ($has_plz && isset($row['plz'])) ? $row['plz'] : null,
                'schulart' => $row['schulart'] ?? null,
                'erstelldatum' => $row['erstelldatum'],
                'foerderung' => false, // Wird später basierend auf school_school_years gesetzt
                'teacher_count' => (int)$row['teacher_count'],
                'class_count' => (int)$row['class_count'],
                'student_count' => (int)$row['student_count'],
                'info_webinar_teilnahme' => false,
                'sponsor' => null,
                'last_current_school_year' => null,
                'created_by_name' => null,
                'letzter_login' => null,
                'letzter_login_teacher' => null
            ];
            
            if ($has_created_by_user_id && isset($row['created_by_user_id'])) {
                $school['created_by_user_id'] = (int)$row['created_by_user_id'];
            }
            
            $schools[$school_id] = $school;
        }
        
        $stmt->close();

        // Gesamtanzahl für Paginierung
        $count_sql = "SELECT COUNT(DISTINCT s.id) as total
                      FROM schools s
                      LEFT JOIN teachers t ON t.school_id = s.id
                      LEFT JOIN classes c ON c.teacher_id = t.id
                      " . $student_join . "
                      " . $joins_sql . "
                      $where_sql";
        
        $count_params = array_slice($params, 0, -2); // Entferne limit und offset
        $count_param_types = str_replace('ii', '', $param_types);
        
        $count_stmt = $conn->prepare($count_sql);
        if ($count_stmt) {
            if ($count_param_types !== '' && count($count_params) > 0) {
                $count_bindParams = make_params_by_ref($count_params);
                array_unshift($count_bindParams, $count_param_types);
                call_user_func_array([$count_stmt, 'bind_param'], $count_bindParams);
            }
            
            if ($count_stmt->execute()) {
                $count_result = $count_stmt->get_result();
                if ($count_row = $count_result->fetch_assoc()) {
                    $total = (int)$count_row['total'];
                } else {
                    $total = count($schools);
                }
            } else {
                $total = count($schools);
            }
            $count_stmt->close();
        } else {
            $total = count($schools);
        }

        // Zusätzliche Informationen für jede Schule laden
        if (!empty($school_ids)) {
            $ids_placeholder = str_repeat('?,', count($school_ids) - 1) . '?';
            
            // Info-Webinar-Teilnahme und letzter Login von Lehrern
            $teacher_details_sql = "SELECT t.school_id, t.infowebinar, u.last_login, u.first_name, u.last_name
                                    FROM teachers t
                                    LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                                    WHERE t.school_id IN ($ids_placeholder)";
            
            $teacher_details_stmt = $conn->prepare($teacher_details_sql);
            if ($teacher_details_stmt) {
                $teacher_details_stmt->bind_param(str_repeat('i', count($school_ids)), ...$school_ids);
                if ($teacher_details_stmt->execute()) {
                    $teacher_details_result = $teacher_details_stmt->get_result();
                    while ($row = $teacher_details_result->fetch_assoc()) {
                        $school_id = (int)$row['school_id'];
                        if (isset($schools[$school_id])) {
                            // Info-Webinar-Teilnahme
                            if ($row['infowebinar'] && $row['infowebinar'] !== null && $row['infowebinar'] > '1970-01-01 00:00:00') {
                                $schools[$school_id]['info_webinar_teilnahme'] = true;
                            }
                            
                            // Letzter Login
                            if ($row['last_login'] && $row['last_login'] > '1970-01-01 00:00:00') {
                                if (!$schools[$school_id]['letzter_login'] || $row['last_login'] > $schools[$school_id]['letzter_login']) {
                                    $schools[$school_id]['letzter_login'] = $row['last_login'];
                                    $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                                    $schools[$school_id]['letzter_login_teacher'] = $full_name;
                                }
                            }
                        }
                    }
                }
                $teacher_details_stmt->close();
            }
            
            // Ersteller-Namen
            if ($has_created_by_user_id) {
                $creator_user_ids = [];
                foreach ($schools as $school) {
                    if (isset($school['created_by_user_id']) && $school['created_by_user_id']) {
                        $creator_user_ids[] = $school['created_by_user_id'];
                    }
                }
                
                if (!empty($creator_user_ids)) {
                    $unique_creator_ids = array_unique($creator_user_ids);
                    $creator_ids_placeholder = str_repeat('?,', count($unique_creator_ids) - 1) . '?';
                    
                    $creator_sql = "SELECT u.id, u.first_name, u.last_name
                                    FROM users u
                                    WHERE u.id IN ($creator_ids_placeholder)";
                    $creator_stmt = $conn->prepare($creator_sql);
                    if ($creator_stmt) {
                        $creator_stmt->bind_param(str_repeat('i', count($unique_creator_ids)), ...$unique_creator_ids);
                        if ($creator_stmt->execute()) {
                            $creator_result = $creator_stmt->get_result();
                            $creators = [];
                            while ($row = $creator_result->fetch_assoc()) {
                                $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                                $creators[(int)$row['id']] = $full_name;
                            }
                            
                            foreach ($schools as &$school) {
                                if (isset($school['created_by_user_id']) && isset($creators[$school['created_by_user_id']])) {
                                    $school['created_by_name'] = $creators[$school['created_by_user_id']];
                                }
                            }
                        }
                        $creator_stmt->close();
                    }
                }
            }
            
            // Förderung, Schuljahr und Sponsor - aktuelles Schuljahr oder letztes aktives Schuljahr
            $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
            $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
            $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
            $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
            
            if ($has_school_years && $has_school_school_years) {
                $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
                $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
                
                $school_year_ids_placeholder = str_repeat('?,', count($school_ids) - 1) . '?';
                
                if ($has_sponsor_column) {
                    // Hole aktuelles Schuljahr ODER letztes aktives Schuljahr (nach end_date sortiert)
                    $school_year_sql = "SELECT ssy.school_id, sy.name as school_year_name, ssy.sponsor, sy.is_current, sy.end_date
                                        FROM school_school_years ssy
                                        INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                        WHERE ssy.school_id IN ($school_year_ids_placeholder)
                                        ORDER BY sy.is_current DESC, sy.end_date DESC, sy.start_date DESC";
                } else {
                    // Hole aktuelles Schuljahr ODER letztes aktives Schuljahr
                    $school_year_sql = "SELECT ssy.school_id, sy.name as school_year_name, sy.is_current, sy.end_date
                                        FROM school_school_years ssy
                                        INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                        WHERE ssy.school_id IN ($school_year_ids_placeholder)
                                        ORDER BY sy.is_current DESC, sy.end_date DESC, sy.start_date DESC";
                }
                
                $school_year_stmt = $conn->prepare($school_year_sql);
                if ($school_year_stmt) {
                    $school_year_stmt->bind_param(str_repeat('i', count($school_ids)), ...$school_ids);
                    if ($school_year_stmt->execute()) {
                        $school_year_result = $school_year_stmt->get_result();
                        
                        $school_years = [];
                        $school_sponsors = [];
                        $school_foerderung = [];
                        while ($row = $school_year_result->fetch_assoc()) {
                            $school_id = (int)$row['school_id'];
                            // Nur den ersten Eintrag pro Schule nehmen (aktuelles oder letztes aktives)
                            if (!isset($school_years[$school_id])) {
                                $school_years[$school_id] = $row['school_year_name'];
                                // Förderung = true, wenn es ein aktuelles Schuljahr ist
                                if (isset($row['is_current']) && $row['is_current'] == 1) {
                                    $school_foerderung[$school_id] = true;
                                }
                                if ($has_sponsor_column && isset($row['sponsor']) && $row['sponsor'] !== null && $row['sponsor'] !== '') {
                                    $school_sponsors[$school_id] = $row['sponsor'];
                                }
                            }
                        }
                        
                        foreach ($schools as &$school) {
                            if (isset($school_years[$school['id']])) {
                                $school['last_current_school_year'] = $school_years[$school['id']];
                            }
                            if (isset($school_sponsors[$school['id']])) {
                                $school['sponsor'] = $school_sponsors[$school['id']];
                            }
                            // Förderung setzen: true wenn Eintrag für aktuelles Schuljahr existiert
                            if (isset($school_foerderung[$school['id']])) {
                                $school['foerderung'] = true;
                            }
                        }
                    }
                    $school_year_stmt->close();
                }
            }
        }

        // Schulen als Array zurückgeben (nicht als assoziatives Array)
        $schools_array = array_values($schools);

        echo json_encode([
            'success' => true,
            'schools' => $schools_array,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);

    } catch (Exception $e) {
        error_log("[get_schools.php] Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Laden der Schulen: ' . $e->getMessage()
        ]);
    }

    if (isset($conn)) {
        $conn->close();
    }
?>

