<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur Admins dürfen alle Anmeldungen sehen
    if (!is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole alle Anmeldungen mit Lehrer- und User-Informationen
        $sql = "SELECT 
                    ip.id, 
                    ip.teacher_id, 
                    ip.webinar_date, 
                    ip.participated, 
                    ip.updated_by_user_id, 
                    ip.created_at, 
                    ip.updated_at,
                    u.first_name,
                    u.last_name,
                    u.email,
                    s.name as school_name
                FROM infowebinar_participation ip
                INNER JOIN teachers t ON t.id = ip.teacher_id
                INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                LEFT JOIN schools s ON s.id = t.school_id
                ORDER BY ip.webinar_date ASC, ip.created_at ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('Query failed: ' . $conn->error);
        }
        
        $participations = [];
        
        while ($row = $result->fetch_assoc()) {
            $participations[] = [
                'id' => (int)$row['id'],
                'teacher_id' => (int)$row['teacher_id'],
                'webinar_date' => $row['webinar_date'],
                'participated' => $row['participated'] === null ? null : (bool)$row['participated'],
                'updated_by_user_id' => $row['updated_by_user_id'] ? (int)$row['updated_by_user_id'] : null,
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'teacher_name' => trim($row['first_name'] . ' ' . $row['last_name']),
                'teacher_email' => $row['email'],
                'school_name' => $row['school_name']
            ];
        }

        echo json_encode([
            'success' => true,
            'participations' => $participations
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

