<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        $sponsors = [];
        
        // 1. Sponsoren aus der sponsors-Tabelle holen
        $check_sponsors_table = $conn->query("SHOW TABLES LIKE 'sponsors'");
        $has_sponsors_table = $check_sponsors_table && $check_sponsors_table->num_rows > 0;
        
        if ($has_sponsors_table) {
            $sql = "SELECT name FROM sponsors ORDER BY name";
            $result = $conn->query($sql);
            
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $sponsor_name = trim($row['name']);
                    if (!empty($sponsor_name) && !in_array($sponsor_name, $sponsors)) {
                        $sponsors[] = $sponsor_name;
                    }
                }
            }
        }
        
        // 2. Sponsoren aus der school_school_years-Tabelle holen (neue Struktur)
        $check_ssy_table = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        if ($check_ssy_table && $check_ssy_table->num_rows > 0) {
            $sql = "SELECT DISTINCT sponsor 
                    FROM school_school_years 
                    WHERE sponsor IS NOT NULL 
                    AND sponsor != '' 
                    ORDER BY sponsor";
            
            $result = $conn->query($sql);
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $sponsor_name = trim($row['sponsor']);
                    if (!empty($sponsor_name) && !in_array($sponsor_name, $sponsors)) {
                        $sponsors[] = $sponsor_name;
                    }
                }
            }
        }
        
        // 3. Sponsoren aus der schools.sponsor-Spalte holen (Fallback)
        $check_sponsor_column = $conn->query("SHOW COLUMNS FROM schools LIKE 'sponsor'");
        $has_sponsor_column = $check_sponsor_column && $check_sponsor_column->num_rows > 0;
        
        if ($has_sponsor_column) {
            $sql = "SELECT DISTINCT sponsor 
                    FROM schools 
                    WHERE sponsor IS NOT NULL 
                    AND sponsor != '' 
                    ORDER BY sponsor";
            
            $result = $conn->query($sql);
            
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $sponsor_name = trim($row['sponsor']);
                    if (!empty($sponsor_name) && !in_array($sponsor_name, $sponsors)) {
                        $sponsors[] = $sponsor_name;
                    }
                }
            }
        }
        
        // Sortiere alphabetisch (mit korrekter Behandlung von Umlauten)
        usort($sponsors, function($a, $b) {
            return strcasecmp($a, $b);
        });
        
        echo json_encode([
            'sponsors' => $sponsors,
            'total' => count($sponsors)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
