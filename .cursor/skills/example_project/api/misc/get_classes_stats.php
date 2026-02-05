<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    try {
        // Klassen-Statistiken: Gesamtanzahl und durchschnittliche Schüler pro Klasse
        $sql = "SELECT 
                    COUNT(DISTINCT c.id) as total_classes,
                    COUNT(DISTINCT s.id) as total_students,
                    CASE 
                        WHEN COUNT(DISTINCT c.id) > 0 
                        THEN ROUND(COUNT(DISTINCT s.id) / COUNT(DISTINCT c.id), 1)
                        ELSE 0 
                    END as avg_students_per_class
                FROM classes c
                LEFT JOIN students s ON c.id = s.class_id";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $row = $result->fetch_assoc();
        
        $data = [
            'total_classes' => (int)$row['total_classes'],
            'total_students' => (int)$row['total_students'],
            'avg_students_per_class' => (float)$row['avg_students_per_class']
        ];
        
        echo json_encode($data);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
