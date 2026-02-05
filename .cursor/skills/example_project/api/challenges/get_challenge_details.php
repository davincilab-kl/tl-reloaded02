<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $challenge_id = isset($_GET['challenge_id']) ? intval($_GET['challenge_id']) : 0;

    if ($challenge_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid challenge ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob challenges Tabelle existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'challenges'");
        $table_exists = $check_table && $check_table->num_rows > 0;

        if (!$table_exists) {
            http_response_code(404);
            echo json_encode(['error' => 'Challenges table not found']);
            $conn->close();
            exit;
        }

        // Hole Challenge-Details
        $challenge_sql = "SELECT id, title, description, challenge_type, state, start_date, end_date, state_filter, sponsor_filter, image_path
                         FROM challenges
                         WHERE id = ? LIMIT 1";
        $challenge_stmt = $conn->prepare($challenge_sql);
        if (!$challenge_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $challenge_stmt->bind_param('i', $challenge_id);
        if (!$challenge_stmt->execute()) {
            throw new Exception('Execute failed: ' . $challenge_stmt->error);
        }
        
        $challenge_result = $challenge_stmt->get_result();
        if ($challenge_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Challenge not found']);
            $challenge_stmt->close();
            $conn->close();
            exit;
        }
        
        $challenge_row = $challenge_result->fetch_assoc();
        $challenge = [
            'id' => (int)$challenge_row['id'],
            'title' => $challenge_row['title'],
            'description' => $challenge_row['description'] ?? '',
            'challenge_type' => $challenge_row['challenge_type'],
            'state' => $challenge_row['state'] ?? 'active',
            'start_date' => $challenge_row['start_date'] ?? null,
            'end_date' => $challenge_row['end_date'] ?? null,
            'state_filter' => $challenge_row['state_filter'] ?? null,
            'sponsor_filter' => $challenge_row['sponsor_filter'] ?? null,
            'image_path' => $challenge_row['image_path'] ?? null
        ];
        
        $challenge_stmt->close();

        // Hole Einträge basierend auf challenge_type
        $entries = [];
        
        if ($challenge['challenge_type'] === 'tscore') {
            // Top Klassen nach T!Score
            $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
            $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
            
            $entries_sql = "SELECT 
                            c.id,
                            c.name as class_name,
                            COUNT(st.id) as student_count,
                            COALESCE(AVG(st.t_coins), 0) as avg_t_coins,
                            COALESCE(SUM(st.t_coins), 0) as total_t_coins
                        FROM classes c
                        LEFT JOIN students st ON c.id = st.class_id";
            
            if ($has_is_teacher_placeholder) {
                $entries_sql .= " AND (st.is_teacher_placeholder = 0 OR st.is_teacher_placeholder IS NULL)";
            }
            
            $entries_sql .= " WHERE 1=1";
            
            // Filter nach Bundesland (state_filter)
            if (!empty($challenge['state_filter'])) {
                $entries_sql .= " AND EXISTS (
                    SELECT 1 FROM schools s 
                    WHERE s.id = c.school_id 
                    AND s.bundesland = ?
                )";
            }
            
            // Filter nach Sponsor (sponsor_filter) - aus school_school_years für aktuelles Schuljahr
            if (!empty($challenge['sponsor_filter'])) {
                $entries_sql .= " AND EXISTS (
                    SELECT 1 FROM school_school_years ssy
                    INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                    WHERE ssy.school_id = c.school_id 
                    AND sy.is_current = 1
                    AND ssy.sponsor = ?
                )";
            }
            
            $entries_sql .= " GROUP BY c.id, c.name
                        HAVING student_count > 0
                        ORDER BY avg_t_coins DESC, c.name ASC
                        LIMIT 10";
            
            $entries_stmt = $conn->prepare($entries_sql);
            if ($entries_stmt) {
                $param_types = '';
                $params = [];
                
                if (!empty($challenge['state_filter'])) {
                    $param_types .= 's';
                    $params[] = &$challenge['state_filter'];
                }
                if (!empty($challenge['sponsor_filter'])) {
                    $param_types .= 's';
                    $params[] = &$challenge['sponsor_filter'];
                }
                
                if (!empty($param_types)) {
                    $entries_stmt->bind_param($param_types, ...$params);
                }
                
                if ($entries_stmt->execute()) {
                    $entries_result = $entries_stmt->get_result();
                    while ($row = $entries_result->fetch_assoc()) {
                        $entries[] = [
                            'id' => (int)$row['id'],
                            'class_name' => $row['class_name'],
                            'student_count' => (int)$row['student_count'],
                            'avg_t_coins' => round((float)$row['avg_t_coins'], 1),
                            'total_t_coins' => (int)$row['total_t_coins']
                        ];
                    }
                }
                $entries_stmt->close();
            }
            
        } else if ($challenge['challenge_type'] === 'projects') {
            // Alle teilnehmenden Projekte (aus challenge_participations)
            // Prüfe ob challenge_participations Tabelle existiert
            $check_participations_table = $conn->query("SHOW TABLES LIKE 'challenge_participations'");
            $has_participations_table = $check_participations_table && $check_participations_table->num_rows > 0;
            
            if ($has_participations_table) {
                // Lade Projekte aus challenge_participations
                $entries_sql = "SELECT 
                                p.id,
                                p.title as project_title,
                                p.description,
                                u.first_name,
                                u.last_name,
                                CONCAT(u.first_name, ' ', u.last_name) as student_name,
                                cp.created_at as participation_date
                            FROM challenge_participations cp
                            INNER JOIN projects p ON cp.project_id = p.id
                            INNER JOIN students s ON p.student_id = s.id
                            LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                            WHERE cp.challenge_id = ? AND p.status = 'published'";
                
                // Filter nach Bundesland (state_filter)
                if (!empty($challenge['state_filter'])) {
                    $entries_sql .= " AND EXISTS (
                        SELECT 1 FROM classes c
                        INNER JOIN schools sch ON c.school_id = sch.id
                        WHERE c.id = s.class_id
                        AND sch.bundesland = ?
                    )";
                }
                
                // Filter nach Sponsor (sponsor_filter) - aus school_school_years für aktuelles Schuljahr
                if (!empty($challenge['sponsor_filter'])) {
                    $entries_sql .= " AND EXISTS (
                        SELECT 1 FROM classes c
                        INNER JOIN school_school_years ssy ON ssy.school_id = c.school_id
                        INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                        WHERE c.id = s.class_id
                        AND sy.is_current = 1
                        AND ssy.sponsor = ?
                    )";
                }
                
                $entries_sql .= " ORDER BY cp.created_at DESC, p.title ASC";
                
                $entries_stmt = $conn->prepare($entries_sql);
                if ($entries_stmt) {
                    $param_types = 'i';
                    $params = [&$challenge_id];
                    
                    if (!empty($challenge['state_filter'])) {
                        $param_types .= 's';
                        $params[] = &$challenge['state_filter'];
                    }
                    if (!empty($challenge['sponsor_filter'])) {
                        $param_types .= 's';
                        $params[] = &$challenge['sponsor_filter'];
                    }
                    
                    $entries_stmt->bind_param($param_types, ...$params);
                    
                    if ($entries_stmt->execute()) {
                        $entries_result = $entries_stmt->get_result();
                        while ($row = $entries_result->fetch_assoc()) {
                            $entries[] = [
                                'id' => (int)$row['id'],
                                'project_title' => $row['project_title'],
                                'description' => $row['description'] ?? '',
                                'student_name' => $row['student_name'] ?? '',
                                'participation_date' => $row['participation_date'] ?? null
                            ];
                        }
                    }
                    $entries_stmt->close();
                }
            } else {
                // Fallback: Wenn Tabelle noch nicht existiert, leere Liste zurückgeben
                $entries = [];
            }
        }

        echo json_encode([
            'success' => true,
            'challenge' => $challenge,
            'entries' => $entries
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[get_challenge_details.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

