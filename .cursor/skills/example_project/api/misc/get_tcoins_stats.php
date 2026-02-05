<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // T-Coins-Transaktionen der letzten 14 Tage, gruppiert nach Datum
        // Ausschluss von Transaktionen mit reason = 'class_creation'
        $sql = "SELECT 
                    DATE(created_at) as date,
                    SUM(amount) as total_tcoins
                FROM tcoins_transactions
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                AND reason != 'class_creation'
                GROUP BY DATE(created_at)
                ORDER BY date ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $data = [];
        $dates = [];
        $tcoins = [];
        
        // Alle letzten 14 Tage generieren (auch wenn keine Transaktionen)
        for ($i = 13; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $dates[] = date('d.m', strtotime($date));
            $tcoins[] = 0; // Standardwert
        }
        
        // Echte Daten einfügen
        while ($row = $result->fetch_assoc()) {
            $date = $row['date'];
            $total = (int)$row['total_tcoins'];
            
            $index = array_search(date('d.m', strtotime($date)), $dates);
            if ($index !== false) {
                $tcoins[$index] = $total;
            }
        }
        
        $data = [
            'dates' => $dates,
            'tcoins' => $tcoins
        ];
        
        echo json_encode($data);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

