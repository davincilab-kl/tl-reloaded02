<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // Klassen-Erstellungen der letzten 14 Tage basierend auf created_at
        $sql = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count
                FROM classes
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $data = [];
        $dates = [];
        $counts = [];
        
        // Alle letzten 14 Tage generieren (auch wenn keine Klassen erstellt wurden)
        for ($i = 13; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $dates[] = date('d.m', strtotime($date));
            $counts[] = 0; // Standardwert
        }
        
        // Echte Daten einfügen
        while ($row = $result->fetch_assoc()) {
            $date = $row['date'];
            $count = (int)$row['count'];
            
            $index = array_search(date('d.m', strtotime($date)), $dates);
            if ($index !== false) {
                $counts[$index] = $count;
            }
        }
        
        $data = [
            'dates' => $dates,
            'counts' => $counts
        ];
        
        echo json_encode($data);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

