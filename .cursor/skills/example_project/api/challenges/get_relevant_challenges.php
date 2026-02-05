<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Project ID aus GET-Parameter
    $project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : 0;

    if ($project_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid project ID']);
        exit;
    }

    // Prüfe ob User berechtigt ist (Admin oder Teacher)
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    $user_role = get_user_role();
    if ($user_role !== 'admin' && $user_role !== 'teacher') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob sponsor Spalte in schools noch existiert
        $check_sponsor_col = $conn->query("SHOW COLUMNS FROM schools LIKE 'sponsor'");
        $has_sponsor_in_schools = $check_sponsor_col && $check_sponsor_col->num_rows > 0;

        // Hole Projekt und Schüler-Informationen inkl. Schule und aktuellem Sponsor
        $project_sql = "SELECT 
                        p.id,
                        p.student_id,
                        s.class_id,
                        c.teacher_id,
                        sch.bundesland,
                        " . ($has_sponsor_in_schools ? "COALESCE(ssy.sponsor, sch.sponsor)" : "ssy.sponsor") . " as sponsor
                    FROM projects p
                    INNER JOIN students s ON p.student_id = s.id
                    LEFT JOIN classes c ON s.class_id = c.id
                    LEFT JOIN teachers t ON c.teacher_id = t.id
                    LEFT JOIN schools sch ON t.school_id = sch.id
                    LEFT JOIN school_school_years ssy ON sch.id = ssy.school_id
                    LEFT JOIN school_years sy ON ssy.school_year_id = sy.id AND sy.is_current = 1
                    WHERE p.id = ?
                    ORDER BY sy.is_current DESC
                    LIMIT 1";
        
        $project_stmt = $conn->prepare($project_sql);
        if (!$project_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $project_stmt->bind_param('i', $project_id);
        if (!$project_stmt->execute()) {
            throw new Exception('Execute failed: ' . $project_stmt->error);
        }
        
        $project_result = $project_stmt->get_result();
        if ($project_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            $project_stmt->close();
            $conn->close();
            exit;
        }
        
        $project_data = $project_result->fetch_assoc();
        $project_stmt->close();
        
        $student_bundesland = $project_data['bundesland'] ?? null;
        $student_sponsor = $project_data['sponsor'] ?? null;
        
        // Prüfe ob challenges Tabelle existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'challenges'");
        $table_exists = $check_table && $check_table->num_rows > 0;
        
        if (!$table_exists) {
            echo json_encode([
                'success' => true,
                'challenges' => []
            ]);
            $conn->close();
            exit;
        }
        
        // Hole relevante Challenges (nur Projekt-Challenges)
        // Eine Challenge ist relevant, wenn:
        // 1. challenge_type = 'projects'
        // 2. state = 'active'
        // 3. Für state_filter:
        //    - Wenn Challenge keinen Filter hat (state_filter IS NULL) → für alle verfügbar
        //    - Wenn Challenge einen Filter hat (state_filter = bundesland) → nur für dieses Bundesland
        //    - Wenn Schüler kein Bundesland hat → nur Challenges ohne Filter (state_filter IS NULL)
        // 4. Gleiche Logik für sponsor_filter
        // 5. (start_date IS NULL OR start_date <= CURDATE())
        // 6. (end_date IS NULL OR end_date >= CURDATE())
        
        // Baue SQL dynamisch auf, abhängig davon, ob Schüler Bundesland/Sponsor hat
        $challenges_sql = "SELECT 
                            id,
                            title,
                            description,
                            challenge_type,
                            state,
                            start_date,
                            end_date,
                            state_filter,
                            sponsor_filter,
                            image_path
                        FROM challenges
                        WHERE challenge_type = 'projects'
                        AND state = 'active'";
        
        // State Filter Logik
        if ($student_bundesland === null || $student_bundesland === '') {
            // Schüler hat kein Bundesland → nur Challenges ohne state_filter
            $challenges_sql .= " AND state_filter IS NULL";
        } else {
            // Schüler hat Bundesland → Challenges ohne Filter ODER mit passendem Filter
            $challenges_sql .= " AND (state_filter IS NULL OR state_filter = ?)";
        }
        
        // Sponsor Filter Logik
        if ($student_sponsor === null || $student_sponsor === '') {
            // Schüler hat keinen Sponsor → nur Challenges ohne sponsor_filter
            $challenges_sql .= " AND sponsor_filter IS NULL";
        } else {
            // Schüler hat Sponsor → Challenges ohne Filter ODER mit passendem Filter
            $challenges_sql .= " AND (sponsor_filter IS NULL OR sponsor_filter = ?)";
        }
        
        // Datum-Filter
        $challenges_sql .= " AND (start_date IS NULL OR start_date <= CURDATE())
                            AND (end_date IS NULL OR end_date >= CURDATE())
                            ORDER BY created_at DESC";
        
        $challenges_stmt = $conn->prepare($challenges_sql);
        if (!$challenges_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        // Binde Parameter nur wenn nötig
        if ($student_bundesland !== null && $student_bundesland !== '' && 
            $student_sponsor !== null && $student_sponsor !== '') {
            // Beide Parameter vorhanden
            $challenges_stmt->bind_param('ss', $student_bundesland, $student_sponsor);
        } else if ($student_bundesland !== null && $student_bundesland !== '') {
            // Nur Bundesland vorhanden
            $challenges_stmt->bind_param('s', $student_bundesland);
        } else if ($student_sponsor !== null && $student_sponsor !== '') {
            // Nur Sponsor vorhanden
            $challenges_stmt->bind_param('s', $student_sponsor);
        }
        // Wenn beide NULL sind, werden keine Parameter gebunden - execute() kann trotzdem aufgerufen werden
        
        if (!$challenges_stmt->execute()) {
            throw new Exception('Execute failed: ' . $challenges_stmt->error);
        }
        
        $challenges_result = $challenges_stmt->get_result();
        $challenges = [];
        
        while ($row = $challenges_result->fetch_assoc()) {
            $challenges[] = [
                'id' => (int)$row['id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'challenge_type' => $row['challenge_type'],
                'state' => $row['state'] ?? 'active',
                'start_date' => $row['start_date'] ?? null,
                'end_date' => $row['end_date'] ?? null,
                'state_filter' => $row['state_filter'] ?? null,
                'sponsor_filter' => $row['sponsor_filter'] ?? null,
                'image_path' => $row['image_path'] ?? null
            ];
        }
        
        $challenges_stmt->close();
        
        echo json_encode([
            'success' => true,
            'challenges' => $challenges
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        error_log("[get_relevant_challenges.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

