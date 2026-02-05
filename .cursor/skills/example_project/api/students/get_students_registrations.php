<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // Schüler-Logins der letzten 14 Tage basierend auf last_login aus users
        $sql = "SELECT 
                    DATE(u.last_login) as date,
                    COUNT(*) as login_count
                FROM users u
                WHERE u.role = 'student' 
                AND u.last_login >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                GROUP BY DATE(u.last_login)
                ORDER BY date ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $data = [];
        $dates = [];
        $logins = [];
        
        // Alle letzten 14 Tage generieren
        for ($i = 13; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $dates[] = date('d.m', strtotime($date));
            $logins[] = 0; // Standardwert
        }
        
        // Echte Daten einfügen
        while ($row = $result->fetch_assoc()) {
            $date = $row['date'];
            $loginCount = (int)$row['login_count'];
            
            $index = array_search(date('d.m', strtotime($date)), $dates);
            if ($index !== false) {
                $logins[$index] = $loginCount;
            }
        }
        
        $data = [
            'dates' => $dates,
            'logins' => $logins
        ];
        
        echo json_encode($data);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
