<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Tabelle course_packages existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'course_packages'");
        if (!$check_table || $check_table->num_rows === 0) {
            echo json_encode([
                'success' => true,
                'packages' => [],
                'message' => 'Kurspakete-System noch nicht initialisiert'
            ]);
            $conn->close();
            exit;
        }

        // Lade alle Kurspakete mit ihren Kurs-IDs aus JSON
        $sql = "SELECT 
                    id,
                    name,
                    description,
                    course_ids
                FROM course_packages
                ORDER BY name ASC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception('Query failed: ' . $conn->error);
        }
        
        $packages = [];
        while ($row = $result->fetch_assoc()) {
            // Parse JSON course_ids
            $course_ids = [];
            $course_count = 0;
            
            if (!empty($row['course_ids'])) {
                $course_ids_json = json_decode($row['course_ids'], true);
                if (is_array($course_ids_json)) {
                    $course_ids = array_map('intval', $course_ids_json);
                    $course_count = count($course_ids);
                }
            }
            
            $packages[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'description' => $row['description'] ?? '',
                'course_ids' => $course_ids,
                'course_count' => $course_count
            ];
        }

        echo json_encode([
            'success' => true,
            'packages' => $packages
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

