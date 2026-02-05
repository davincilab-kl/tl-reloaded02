<?php
    /**
     * Hilfsfunktion zur Generierung des Caches für eine Liste
     * Wird von create_list.php und update_list_cache.php verwendet
     */
    
    require_once __DIR__ . '/../../config/access_db.php';
    
    function generate_list_cache($conn, $list_id, $filter_config, $columns_config) {
        try {
            // Beginne Transaktion
            $conn->begin_transaction();
            
            // Lösche alte Cache-Einträge für diese Liste
            $delete_sql = "DELETE FROM admin_teacher_list_cache WHERE list_id = ?";
            $delete_stmt = $conn->prepare($delete_sql);
            if (!$delete_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $delete_stmt->bind_param('i', $list_id);
            if (!$delete_stmt->execute()) {
                throw new Exception('Delete failed: ' . $delete_stmt->error);
            }
            $delete_stmt->close();
            
            // Baue SQL-Query basierend auf Filter-Konfiguration
            $where_conditions = [];
            $params = [];
            $param_types = '';
            
            // Filter: Schule
            if (!empty($filter_config['schools']) && is_array($filter_config['schools']) && count($filter_config['schools']) > 0) {
                $placeholders = implode(',', array_fill(0, count($filter_config['schools']), '?'));
                $where_conditions[] = "s.name IN ($placeholders)";
                foreach ($filter_config['schools'] as $school) {
                    $params[] = $school;
                    $param_types .= 's';
                }
            }
            
            // Filter: Info-Webinar
            if (isset($filter_config['infowebinar']) && $filter_config['infowebinar'] !== '') {
                if ($filter_config['infowebinar'] === 'ja') {
                    $where_conditions[] = "t.infowebinar IS NOT NULL AND t.infowebinar != '0000-00-00 00:00:00' AND t.infowebinar != '0000-00-00'";
                } elseif ($filter_config['infowebinar'] === 'nein') {
                    $where_conditions[] = "(t.infowebinar IS NULL OR t.infowebinar = '0000-00-00 00:00:00' OR t.infowebinar = '0000-00-00')";
                }
            }
            
            // Filter: Admin-Rolle
            if (isset($filter_config['admin_role']) && $filter_config['admin_role'] !== '') {
                if ($filter_config['admin_role'] === 'admin') {
                    $where_conditions[] = "t.school_admin = '1'";
                } elseif ($filter_config['admin_role'] === 'teacher') {
                    $where_conditions[] = "(t.school_admin = '0' OR t.school_admin IS NULL)";
                }
            }
            
            // Filter: Status
            if (!empty($filter_config['status_id'])) {
                $where_conditions[] = "t.status_id = ?";
                $params[] = (int)$filter_config['status_id'];
                $param_types .= 'i';
            }
            
            // Filter: Bundesland
            if (!empty($filter_config['bundesland'])) {
                $where_conditions[] = "s.bundesland = ?";
                $params[] = $filter_config['bundesland'];
                $param_types .= 's';
            }
            
            // Filter: Förderung (basierend auf school_school_years)
            if (isset($filter_config['foerderung']) && $filter_config['foerderung'] !== '') {
                $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
                $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
                $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
                $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
                
                if ($has_school_years && $has_school_school_years) {
                    if ($filter_config['foerderung'] === 'ja') {
                        $where_conditions[] = "EXISTS (SELECT 1 FROM school_school_years ssy
                                                 INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                                 WHERE ssy.school_id = s.id 
                                                 AND sy.is_current = 1)";
                    } elseif ($filter_config['foerderung'] === 'nein') {
                        $where_conditions[] = "NOT EXISTS (SELECT 1 FROM school_school_years ssy
                                                      INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                                      WHERE ssy.school_id = s.id 
                                                      AND sy.is_current = 1)";
                    }
                }
            }
            
            // Filter: Suche (Name/Email)
            if (!empty($filter_config['search'])) {
                $where_conditions[] = "(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) LIKE ? OR u.email LIKE ?)";
                $search_term = "%" . $filter_config['search'] . "%";
                $params[] = $search_term;
                $params[] = $search_term;
                $param_types .= 'ss';
            }
            
            $where_sql = '';
            if (!empty($where_conditions)) {
                $where_sql = 'WHERE ' . implode(' AND ', $where_conditions);
            }
            
            // Prüfe ob school_years Tabellen existieren
            $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
            $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
            $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
            $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
            
            $school_columns = 's.name as school_name, s.bundesland as school_bundesland';
            $group_by_columns = 's.name, s.bundesland';
            $foerderung_join = '';
            $foerderung_select = '0 as school_foerderung';
            
            if ($has_school_years && $has_school_school_years) {
                $foerderung_join = "LEFT JOIN school_school_years ssy_foerderung ON ssy_foerderung.school_id = s.id
                                    LEFT JOIN school_years sy_foerderung ON sy_foerderung.id = ssy_foerderung.school_year_id AND sy_foerderung.is_current = 1";
                $foerderung_select = "CASE WHEN sy_foerderung.is_current = 1 THEN 1 ELSE 0 END as school_foerderung";
                $group_by_columns .= ', school_foerderung';
            }
            
            // Optimierte Query: Hole alle Daten in einer Query mit Subqueries
            $sql = "SELECT 
                        t.id, 
                        t.school_id, 
                        u.first_name, 
                        u.last_name, 
                        u.email, 
                        u.phone, 
                        t.infowebinar, 
                        t.school_admin, 
                        u.last_login, 
                        u.created_at as registered_at,
                        $school_columns,
                        $foerderung_select,
                        t.status_id,
                        ts.display_name as status_name,
                        -- Klassen- und Schüler-Anzahl
                        COALESCE((
                            SELECT COUNT(DISTINCT c.id)
                            FROM classes c
                            WHERE c.teacher_id = t.id
                        ), 0) as class_count,
                        COALESCE((
                            SELECT COUNT(DISTINCT st.id)
                            FROM classes c
                            LEFT JOIN students st ON c.id = st.class_id
                            WHERE c.teacher_id = t.id
                        ), 0) as student_count,
                        -- T!Score (total_t_coins)
                        COALESCE((
                            SELECT SUM(st.t_coins)
                            FROM students st
                            INNER JOIN classes c ON st.class_id = c.id
                            WHERE c.teacher_id = t.id
                            AND st.class_id IS NOT NULL
                            AND (st.is_teacher_placeholder = 0 OR st.is_teacher_placeholder IS NULL)
                        ), 0) as total_t_coins,
                        -- T!Score (avg_t_coins)
                        COALESCE((
                            SELECT AVG(st.t_coins)
                            FROM students st
                            INNER JOIN classes c ON st.class_id = c.id
                            WHERE c.teacher_id = t.id
                            AND st.class_id IS NOT NULL
                            AND (st.is_teacher_placeholder = 0 OR st.is_teacher_placeholder IS NULL)
                        ), 0) as avg_t_coins,
                        -- Projekt-Anzahl
                        COALESCE((
                            SELECT COUNT(DISTINCT p.id)
                            FROM projects p
                            INNER JOIN students st ON p.student_id = st.id
                            INNER JOIN classes c ON st.class_id = c.id
                            WHERE c.teacher_id = t.id
                        ), 0) as project_count
                    FROM teachers t
                    LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                    LEFT JOIN schools s ON t.school_id = s.id
                    " . $foerderung_join . "
                    LEFT JOIN teacher_stati ts ON t.status_id = ts.id
                    $where_sql
                    GROUP BY t.id, t.school_id, u.first_name, u.last_name, u.email, u.phone, 
                             t.infowebinar, t.school_admin, u.last_login, u.created_at, 
                             $group_by_columns, t.status_id, ts.display_name
                    ORDER BY t.school_admin DESC, u.first_name, u.last_name";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            // Parameter binden
            if ($param_types !== '' && count($params) > 0) {
                $refs = [];
                foreach ($params as $key => $value) {
                    $refs[$key] = &$params[$key];
                }
                array_unshift($refs, $param_types);
                call_user_func_array([$stmt, 'bind_param'], $refs);
            }
            
            if (!$stmt->execute()) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }
            
            $result = $stmt->get_result();
            $teachers = [];
            
            while ($row = $result->fetch_assoc()) {
                $teacher_id = (int)$row['id'];
                
                // Erstelle teacher_data mit allen verfügbaren Daten
                $teacher_data = [
                    'id' => $teacher_id,
                    'school_id' => (int)$row['school_id'],
                    'name' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
                    'first_name' => $row['first_name'] ?? '',
                    'last_name' => $row['last_name'] ?? '',
                    'email' => $row['email'] ?? '',
                    'phone' => $row['phone'] ?? '',
                    'infowebinar' => $row['infowebinar'],
                    'admin' => (bool)$row['school_admin'],
                    'last_login' => $row['last_login'],
                    'registered_at' => $row['registered_at'],
                    'school_name' => $row['school_name'] ?? null,
                    'school_bundesland' => $row['school_bundesland'] ?? null,
                    'status_id' => $row['status_id'] ? (int)$row['status_id'] : null,
                    'status_name' => $row['status_name'] ?? null,
                    'class_count' => (int)$row['class_count'],
                    'student_count' => (int)$row['student_count'],
                    'total_t_coins' => (int)$row['total_t_coins'],
                    'avg_t_coins' => round((float)$row['avg_t_coins'], 1),
                    'project_count' => (int)$row['project_count'],
                ];
                
                $teacher_data['school_foerderung'] = isset($row['school_foerderung']) ? (bool)$row['school_foerderung'] : false;
                
                $teachers[] = $teacher_data;
            }
            
            $stmt->close();
            
            // Speichere Lehrer in Cache-Tabelle
            $insert_sql = "INSERT INTO admin_teacher_list_cache 
                          (list_id, teacher_id, cached_data, cached_at) 
                          VALUES (?, ?, ?, NOW())";
            $insert_stmt = $conn->prepare($insert_sql);
            if (!$insert_stmt) {
                throw new Exception('Prepare insert failed: ' . $conn->error);
            }
            
            foreach ($teachers as $teacher) {
                $cached_data_json = json_encode($teacher);
                $insert_stmt->bind_param('iis', $list_id, $teacher['id'], $cached_data_json);
                if (!$insert_stmt->execute()) {
                    throw new Exception('Insert failed: ' . $insert_stmt->error);
                }
            }
            
            $insert_stmt->close();
            
            // Aktualisiere last_updated und setze is_generating auf 0 in admin_teacher_lists
            $update_sql = "UPDATE admin_teacher_lists SET last_updated = NOW(), is_generating = 0 WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if ($update_stmt) {
                $update_stmt->bind_param('i', $list_id);
                $update_stmt->execute();
                $update_stmt->close();
            }
            
            // Commit Transaktion
            $conn->commit();
            
            return [
                'success' => true,
                'count' => count($teachers)
            ];
            
        } catch (Exception $e) {
            // Rollback bei Fehler
            $conn->rollback();
            throw $e;
        }
    }
?>

