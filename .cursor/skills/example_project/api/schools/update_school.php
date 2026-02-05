<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }

    $school_id = (int)$input['id'];
    $name = isset($input['name']) ? trim($input['name']) : '';
    $bundesland = isset($input['bundesland']) ? trim($input['bundesland']) : '';
    $ort = isset($input['ort']) ? trim($input['ort']) : '';
    $strasse = isset($input['strasse']) ? trim($input['strasse']) : '';
    $plz = isset($input['plz']) ? trim($input['plz']) : '';
    $schulart = isset($input['schulart']) ? trim($input['schulart']) : '';
    $sponsor = isset($input['sponsor']) ? trim($input['sponsor']) : '';
    $erstelldatum = isset($input['erstelldatum']) && !empty($input['erstelldatum']) ? trim($input['erstelldatum']) : null;

    // Validierung
    if ($school_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid school ID']);
        exit;
    }

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'School name is required']);
        exit;
    }

    if (empty($bundesland)) {
        http_response_code(400);
        echo json_encode(['error' => 'Bundesland is required']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Spalten existieren
        $check_erstelldatum = $conn->query("SHOW COLUMNS FROM schools LIKE 'erstelldatum'");
        $has_erstelldatum = $check_erstelldatum && $check_erstelldatum->num_rows > 0;
        $check_strasse = $conn->query("SHOW COLUMNS FROM schools LIKE 'strasse'");
        $has_strasse = $check_strasse && $check_strasse->num_rows > 0;
        $check_plz = $conn->query("SHOW COLUMNS FROM schools LIKE 'plz'");
        $has_plz = $check_plz && $check_plz->num_rows > 0;
        
        // Schule aktualisieren (ohne Sponsor - der kommt in school_school_years)
        $update_fields = ['name = ?', 'bundesland = ?', 'ort = ?', 'schulart = ?'];
        $params = [$name, $bundesland, $ort, $schulart];
        $types = 'ssss';
        
        if ($has_strasse) {
            $update_fields[] = 'strasse = ?';
            $params[] = $strasse;
            $types .= 's';
        }
        
        if ($has_plz) {
            $update_fields[] = 'plz = ?';
            $params[] = $plz;
            $types .= 's';
        }
        
        if ($has_erstelldatum && $erstelldatum !== null) {
            $update_fields[] = 'erstelldatum = ?';
            $params[] = $erstelldatum;
            $types .= 's';
        }
        
        $params[] = $school_id;
        $types .= 'i';
        
        $sql = "UPDATE schools SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $stmt->bind_param($types, ...$params);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        if ($stmt->affected_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'School not found']);
            $stmt->close();
            $conn->close();
            exit;
        }

        $stmt->close();
        
        // Sponsor in school_school_years für aktuelles Schuljahr speichern
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        
        if ($check_school_years && $check_school_years->num_rows > 0 && 
            $check_school_school_years && $check_school_school_years->num_rows > 0) {
            
            // Hole aktuelles Schuljahr
            $current_year_sql = "SELECT id FROM school_years WHERE is_current = 1 LIMIT 1";
            $current_year_result = $conn->query($current_year_sql);
            
            if ($current_year_result && $current_year_result->num_rows > 0) {
                $current_year_row = $current_year_result->fetch_assoc();
                $current_year_id = (int)$current_year_row['id'];
                
                // Prüfe ob Verknüpfung existiert
                $check_link = $conn->prepare("SELECT id FROM school_school_years WHERE school_id = ? AND school_year_id = ?");
                $check_link->bind_param('ii', $school_id, $current_year_id);
                $check_link->execute();
                $link_result = $check_link->get_result();
                
                $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
                $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
                
                if ($link_result->num_rows > 0 && $has_sponsor_column) {
                    // Verknüpfung existiert - aktualisiere Sponsor
                    $link_row = $link_result->fetch_assoc();
                    $link_id = (int)$link_row['id'];
                    
                    $update_sponsor_sql = "UPDATE school_school_years SET sponsor = ? WHERE id = ?";
                    $update_sponsor_stmt = $conn->prepare($update_sponsor_sql);
                    $sponsor_value = !empty($sponsor) ? $sponsor : null;
                    $update_sponsor_stmt->bind_param('si', $sponsor_value, $link_id);
                    $update_sponsor_stmt->execute();
                    $update_sponsor_stmt->close();
                } elseif ($link_result->num_rows === 0 && $has_sponsor_column) {
                    // Verknüpfung existiert nicht - erstelle neue mit Sponsor
                    $insert_link_sql = "INSERT INTO school_school_years (school_id, school_year_id, sponsor) VALUES (?, ?, ?)";
                    $insert_link_stmt = $conn->prepare($insert_link_sql);
                    $sponsor_value = !empty($sponsor) ? $sponsor : null;
                    $insert_link_stmt->bind_param('iis', $school_id, $current_year_id, $sponsor_value);
                    $insert_link_stmt->execute();
                    $insert_link_stmt->close();
                }
                
                $check_link->close();
            }
        }
        
        echo json_encode([
            'success' => true,
            'school_id' => $school_id,
            'message' => 'Schule erfolgreich aktualisiert'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
