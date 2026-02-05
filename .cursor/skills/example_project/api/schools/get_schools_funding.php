<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // Schulen mit und ohne Förderung zählen (basierend auf school_school_years)
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
        $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
        
        if ($has_school_years && $has_school_school_years) {
            $sql = "SELECT 
                        COUNT(DISTINCT s.id) as total,
                        COUNT(DISTINCT CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM school_school_years ssy
                                INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                WHERE ssy.school_id = s.id 
                                  AND sy.is_current = 1
                            ) THEN s.id 
                        END) as with_funding,
                        COUNT(DISTINCT CASE 
                            WHEN NOT EXISTS (
                                SELECT 1 FROM school_school_years ssy
                                INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                WHERE ssy.school_id = s.id 
                                  AND sy.is_current = 1
                            ) THEN s.id 
                        END) as without_funding
                    FROM schools s";
        } else {
            // Fallback wenn Tabellen nicht existieren
            $sql = "SELECT 
                        COUNT(*) as total,
                        0 as with_funding,
                        COUNT(*) as without_funding
                    FROM schools";
        }
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $row = $result->fetch_assoc();
        
        $data = [
            'total' => (int)$row['total'],
            'with_funding' => (int)$row['with_funding'],
            'without_funding' => (int)$row['without_funding']
        ];
        
        echo json_encode($data);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
