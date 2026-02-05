<?php
    /**
     * Gibt eine einzelne Schule anhand der ID zurück
     * Für Admin-Bereich
     */
    
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur GET-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // Auth-Prüfung
    if (!is_logged_in() || !is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    // Hole school_id aus Query-Parameter
    $school_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($school_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid school ID']);
        exit;
    }

    $conn = db_connect();

    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    try {
        $school_columns = ['s.id', 's.name', 's.bundesland', 's.ort', 's.schulart', 's.erstelldatum'];
        
        $sql = "SELECT " . implode(', ', $school_columns) . "
                FROM schools s
                WHERE s.id = ?
                LIMIT 1";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $school_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'School not found']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $school_data = $result->fetch_assoc();
        $stmt->close();
        
        $school = [
            'id' => (int)$school_data['id'],
            'name' => $school_data['name'],
            'bundesland' => $school_data['bundesland'],
            'ort' => $school_data['ort'],
            'schulart' => $school_data['schulart'],
            'erstelldatum' => $school_data['erstelldatum']
        ];
        
        // Prüfe Förderung und Sponsor aus school_school_years für aktuelles Schuljahr
        $school['foerderung'] = false;
        $school['sponsor'] = null;
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        
        if ($check_school_years && $check_school_years->num_rows > 0 && 
            $check_school_school_years && $check_school_school_years->num_rows > 0) {
            
            $check_sponsor_column = $conn->query("SHOW COLUMNS FROM school_school_years LIKE 'sponsor'");
            $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
            
            $foerderung_sql = "SELECT ssy.sponsor 
                               FROM school_school_years ssy
                               INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                               WHERE ssy.school_id = ? 
                               AND sy.is_current = 1
                               LIMIT 1";
            $foerderung_stmt = $conn->prepare($foerderung_sql);
            if ($foerderung_stmt) {
                $foerderung_stmt->bind_param('i', $school_id);
                if ($foerderung_stmt->execute()) {
                    $foerderung_result = $foerderung_stmt->get_result();
                    if ($foerderung_row = $foerderung_result->fetch_assoc()) {
                        $school['foerderung'] = true;
                        if ($has_sponsor_column && isset($foerderung_row['sponsor']) && $foerderung_row['sponsor'] !== null && $foerderung_row['sponsor'] !== '') {
                            $school['sponsor'] = $foerderung_row['sponsor'];
                        }
                    }
                }
                $foerderung_stmt->close();
            }
        }
        
        echo json_encode([
            'success' => true,
            'school' => $school
        ]);

    } catch (Exception $e) {
        error_log("[get_school_by_id.php] Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Laden der Schule: ' . $e->getMessage()
        ]);
    }

    $conn->close();
?>

