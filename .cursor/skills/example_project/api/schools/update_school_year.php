<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['school_id']) || !isset($input['school_year_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters: school_id and school_year_id']);
        exit;
    }

    $school_id = (int)$input['school_id'];
    $school_year_id = (int)$input['school_year_id'];
    $sponsor = isset($input['sponsor']) ? trim($input['sponsor']) : null;

    if ($school_id <= 0 || $school_year_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid school_id or school_year_id']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Tabellen existieren
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        
        if (!$check_school_years || $check_school_years->num_rows === 0) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Tabelle school_years existiert noch nicht']);
            $conn->close();
            exit;
        }
        
        if (!$check_school_school_years || $check_school_school_years->num_rows === 0) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Tabelle school_school_years existiert noch nicht']);
            $conn->close();
            exit;
        }

        // Prüfe ob Schule existiert
        $check_school = $conn->prepare("SELECT id FROM schools WHERE id = ?");
        $check_school->bind_param('i', $school_id);
        $check_school->execute();
        $school_result = $check_school->get_result();
        if ($school_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'School not found']);
            $check_school->close();
            $conn->close();
            exit;
        }
        $check_school->close();

        // Prüfe ob Schuljahr existiert
        $check_year = $conn->prepare("SELECT id FROM school_years WHERE id = ?");
        $check_year->bind_param('i', $school_year_id);
        $check_year->execute();
        $year_result = $check_year->get_result();
        if ($year_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'School year not found']);
            $check_year->close();
            $conn->close();
            exit;
        }
        $check_year->close();

        // Prüfe ob Verknüpfung bereits existiert
        $check_link = $conn->prepare("SELECT id, sponsor FROM school_school_years WHERE school_id = ? AND school_year_id = ?");
        $check_link->bind_param('ii', $school_id, $school_year_id);
        $check_link->execute();
        $link_result = $check_link->get_result();
        
        if ($link_result->num_rows > 0) {
            // Verknüpfung existiert bereits - aktualisiere sponsor
            $link_row = $link_result->fetch_assoc();
            $link_id = (int)$link_row['id'];
            
            // Prüfe ob sponsor Spalte existiert
            $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
            $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
            
            if ($has_sponsor_column) {
                $update_sql = "UPDATE school_school_years SET sponsor = ? WHERE id = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param('si', $sponsor, $link_id);
            } else {
                // No sponsor column, so no update needed for school_school_years
                echo json_encode([
                    'success' => true,
                    'school_id' => $school_id,
                    'school_year_id' => $school_year_id,
                    'sponsor' => $sponsor,
                    'action' => 'no_change_needed' // Indicate that no DB update was performed here
                ]);
                $check_link->close();
                $conn->close();
                exit;
            }
            
            if (!$update_stmt->execute()) {
                throw new Exception('Update failed: ' . $update_stmt->error);
            }
            
            $update_stmt->close();
            $check_link->close();
            
            echo json_encode([
                'success' => true,
                'school_id' => $school_id,
                'school_year_id' => $school_year_id,
                'sponsor' => $sponsor,
                'action' => 'updated'
            ]);
        } else {
            // Verknüpfung existiert nicht - erstelle neue
            // Prüfe ob sponsor Spalte existiert
            $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
            $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
            
            if ($has_sponsor_column) {
                $insert_sql = "INSERT INTO school_school_years (school_id, school_year_id, sponsor) VALUES (?, ?, ?)";
                $insert_stmt = $conn->prepare($insert_sql);
                $insert_stmt->bind_param('iis', $school_id, $school_year_id, $sponsor);
            } else {
                $insert_sql = "INSERT INTO school_school_years (school_id, school_year_id) VALUES (?, ?)";
                $insert_stmt = $conn->prepare($insert_sql);
                $insert_stmt->bind_param('ii', $school_id, $school_year_id);
            }
            
            if (!$insert_stmt->execute()) {
                throw new Exception('Insert failed: ' . $insert_stmt->error);
            }
            
            $insert_stmt->close();
            $check_link->close();
            
            echo json_encode([
                'success' => true,
                'school_id' => $school_id,
                'school_year_id' => $school_year_id,
                'sponsor' => $sponsor,
                'action' => 'created'
            ]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Exception: ' . $e->getMessage() . ' | File: ' . __FILE__ . ' | Line: ' . $e->getLine();
        error_log('[update_school_year.php] ' . $error_msg);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
