<?php
    /**
     * Prüft Schulen, bei denen mindestens eine Lehrkraft das Infowebinar besucht hat,
     * aber die Förderung noch nicht eingestellt wurde
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
    
    $conn = db_connect();
    
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    
    try {
        // Prüfe ob benötigte Tabellen existieren
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        $check_infowebinar_participation = $conn->query("SHOW TABLES LIKE 'infowebinar_participation'");
        $check_infowebinar = $conn->query("SHOW COLUMNS FROM teachers LIKE 'infowebinar'");
        
        $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
        $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
        $has_infowebinar_participation = $check_infowebinar_participation && $check_infowebinar_participation->num_rows > 0;
        $has_infowebinar_column = $check_infowebinar && $check_infowebinar->num_rows > 0;
        
        // Finde Schulen, bei denen:
        // 1. Mindestens eine Lehrkraft das Infowebinar besucht hat
        //    (entweder über infowebinar_participation mit participated = 1 oder über teachers.infowebinar IS NOT NULL)
        // 2. Die Förderung noch nicht eingestellt wurde
        //    (kein Eintrag in school_school_years für aktuelles Schuljahr)
        
        // Baue Bedingung für Infowebinar-Teilnahme
        $infowebinar_condition = '';
        if ($has_infowebinar_participation && $has_infowebinar_column) {
            // Prüfe sowohl infowebinar_participation als auch teachers.infowebinar
            $infowebinar_condition = "AND (
                EXISTS (
                    SELECT 1 FROM infowebinar_participation ip
                    WHERE ip.teacher_id = t.id AND ip.participated = 1
                )
                OR t.infowebinar IS NOT NULL
            )";
        } elseif ($has_infowebinar_participation) {
            // Nur infowebinar_participation
            $infowebinar_condition = "AND EXISTS (
                SELECT 1 FROM infowebinar_participation ip
                WHERE ip.teacher_id = t.id AND ip.participated = 1
            )";
        } elseif ($has_infowebinar_column) {
            // Nur teachers.infowebinar
            $infowebinar_condition = "AND t.infowebinar IS NOT NULL";
        } else {
            // Keine Möglichkeit, Infowebinar-Teilnahme zu prüfen
            echo json_encode([
                'success' => true,
                'schools' => [],
                'message' => 'Keine Möglichkeit, Infowebinar-Teilnahme zu prüfen'
            ]);
            $conn->close();
            exit;
        }
        
        // Baue Bedingung für Förderung
        $foerderung_condition = '';
        if ($has_school_years && $has_school_school_years) {
            // Prüfe ob es einen Eintrag in school_school_years für aktuelles Schuljahr gibt
            $foerderung_condition = "AND NOT EXISTS (
                SELECT 1 FROM school_school_years ssy
                INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                WHERE ssy.school_id = s.id 
                  AND sy.is_current = 1
            )";
        } else {
            // Kann Förderung nicht prüfen
            echo json_encode([
                'success' => true,
                'schools' => [],
                'message' => 'Kann Förderung nicht prüfen - benötigte Tabellen fehlen'
            ]);
            $conn->close();
            exit;
        }
        
        $sql = "SELECT 
                    s.id,
                    s.name,
                    s.ort,
                    s.bundesland,
                    COUNT(DISTINCT t.id) as teacher_count
                FROM schools s
                INNER JOIN teachers t ON t.school_id = s.id
                WHERE 1=1
                  $infowebinar_condition
                  $foerderung_condition
                GROUP BY s.id, s.name, s.ort, s.bundesland
                ORDER BY teacher_count DESC, s.name ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('Fehler bei Abfrage: ' . $conn->error);
        }
        
        $schools = [];
        while ($row = $result->fetch_assoc()) {
            $schools[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'ort' => $row['ort'],
                'bundesland' => $row['bundesland'],
                'teacher_count' => (int)$row['teacher_count']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'schools' => $schools,
            'count' => count($schools)
        ]);
        
    } catch (Exception $e) {
        error_log("[check_schools_funding.php] Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Prüfen der Förderung: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
?>

