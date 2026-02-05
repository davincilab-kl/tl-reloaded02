<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
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
    
    if (!$input || !isset($input['school_id']) || !isset($input['foerderung'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }

    $school_id = (int)$input['school_id'];
    $foerderung = (bool)$input['foerderung'];
    $sponsor = isset($input['sponsor']) ? trim($input['sponsor']) : null;

    if ($school_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid school ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Tabellen existieren
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
        $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
        
        if (!$has_school_years || !$has_school_school_years) {
            http_response_code(500);
            echo json_encode(['error' => 'School years tables not found']);
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
            echo json_encode(['error' => 'School not found']);
            $check_school->close();
            $conn->close();
            exit;
        }
        $check_school->close();
        
        // Hole aktuelles Schuljahr
        $current_year_sql = "SELECT id FROM school_years WHERE is_current = 1 LIMIT 1";
        $current_year_result = $conn->query($current_year_sql);
        
        if (!$current_year_result || $current_year_result->num_rows === 0) {
            http_response_code(500);
            echo json_encode(['error' => 'Current school year not found']);
            $conn->close();
            exit;
        }
        
        $current_year_row = $current_year_result->fetch_assoc();
        $current_year_id = (int)$current_year_row['id'];
        
        // Prüfe ob Verknüpfung existiert
        $check_link = $conn->prepare("SELECT id FROM school_school_years WHERE school_id = ? AND school_year_id = ?");
        $check_link->bind_param('ii', $school_id, $current_year_id);
        $check_link->execute();
        $link_result = $check_link->get_result();
        
        $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
        $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
        
        if ($foerderung) {
            // Förderung aktivieren: Erstelle oder aktualisiere Eintrag
            if ($link_result->num_rows > 0) {
                // Verknüpfung existiert - aktualisiere
                $link_row = $link_result->fetch_assoc();
                $link_id = (int)$link_row['id'];
                
                if ($has_sponsor_column) {
                    $update_sql = "UPDATE school_school_years SET sponsor = ? WHERE id = ?";
                    $update_stmt = $conn->prepare($update_sql);
                    $update_stmt->bind_param('si', $sponsor, $link_id);
                }
                $update_stmt->execute();
                $update_stmt->close();
            } else {
                // Verknüpfung existiert nicht - erstelle neue
                if ($has_sponsor_column) {
                    $insert_sql = "INSERT INTO school_school_years (school_id, school_year_id, sponsor) VALUES (?, ?, ?)";
                    $insert_stmt = $conn->prepare($insert_sql);
                    $insert_stmt->bind_param('iis', $school_id, $current_year_id, $sponsor);
                } else {
                    $insert_sql = "INSERT INTO school_school_years (school_id, school_year_id) VALUES (?, ?)";
                    $insert_stmt = $conn->prepare($insert_sql);
                    $insert_stmt->bind_param('ii', $school_id, $current_year_id);
                }
                $insert_stmt->execute();
                $insert_stmt->close();
            }
        } else {
            // Förderung deaktivieren: Lösche Eintrag
            if ($link_result->num_rows > 0) {
                $link_row = $link_result->fetch_assoc();
                $link_id = (int)$link_row['id'];
                
            }
        }
        
        $check_link->close();
        
        // Wenn Förderung aktiviert wird, setze alle Lehrer der Schule auf Status schule_aktiv
        if ($foerderung) {
            $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
            $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
            
            if ($has_status_id_column) {
                $target_status_label = 'schule_aktiv';
                $target_status_sql = "SELECT id FROM teacher_stati WHERE label = ? LIMIT 1";
                $target_status_stmt = $conn->prepare($target_status_sql);
                
                if ($target_status_stmt) {
                    $target_status_stmt->bind_param('s', $target_status_label);
                    $target_status_stmt->execute();
                    $target_status_result = $target_status_stmt->get_result();
                    
                    if ($target_status_row = $target_status_result->fetch_assoc()) {
                        $target_status_id = (int)$target_status_row['id'];
                        
                        // Hole alle Lehrer der Schule
                        $get_teachers_sql = "SELECT id FROM teachers WHERE school_id = ?";
                        $get_teachers_stmt = $conn->prepare($get_teachers_sql);
                        
                        if ($get_teachers_stmt) {
                            $get_teachers_stmt->bind_param('i', $school_id);
                            if ($get_teachers_stmt->execute()) {
                                $teachers_result = $get_teachers_stmt->get_result();
                                
                                // Aktualisiere jeden Lehrer einzeln mit der Hilfsfunktion
                                while ($teacher_row = $teachers_result->fetch_assoc()) {
                                    $teacher_id = (int)$teacher_row['id'];
                                    if (!updateTeacherStatusIfHigher($conn, $teacher_id, $target_status_id)) {
                                        error_log("[update_foerderung.php] Status konnte nicht aktualisiert werden für teacher_id={$teacher_id} (möglicherweise bereits höherer Status)");
                                    }
                                }
                            }
                            $get_teachers_stmt->close();
                        }
                    }
                    $target_status_stmt->close();
                }
            }
        }
        
        // Erfolgreiche Antwort immer ausgeben
        echo json_encode([
            'success' => true,
            'school_id' => $school_id,
            'foerderung' => $foerderung
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
