<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Student ID aus GET-Parameter
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

    if ($student_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid student ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe, ob die Tabellen existieren
        $check_tables = "SHOW TABLES LIKE 'certificates'";
        $tables_result = $conn->query($check_tables);
        if (!$tables_result || $tables_result->num_rows === 0) {
            // Tabellen existieren noch nicht, gib leeres Array zurück
            echo json_encode([
                'success' => true,
                'certificates' => []
            ]);
            $conn->close();
            exit;
        }
        
        $check_types = "SHOW TABLES LIKE 'certificate_types'";
        $types_result = $conn->query($check_types);
        if (!$types_result || $types_result->num_rows === 0) {
            // Tabellen existieren noch nicht, gib leeres Array zurück
            echo json_encode([
                'success' => true,
                'certificates' => []
            ]);
            $conn->close();
            exit;
        }
        
        // Hole Urkunden des Schülers mit Typ-Informationen
        // Verwende LEFT JOIN, falls ein certificate_type ohne passenden Typ existiert
        // COLLATE utf8mb4_0900_ai_ci um Collation-Konflikte zu vermeiden
        $sql = "SELECT c.id, c.certificate_type, c.earned_date, 
                       ct.title, ct.description, ct.template_file_path
                FROM certificates c
                LEFT JOIN certificate_types ct ON c.certificate_type COLLATE utf8mb4_0900_ai_ci = ct.type COLLATE utf8mb4_0900_ai_ci
                WHERE c.student_id = ? 
                ORDER BY c.earned_date DESC";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $student_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $certificates = [];
        
        while ($row = $result->fetch_assoc()) {
            // Konstruiere den Bildpfad: students/courses/imgs/certificates/<zertifikatname>.jpg
            // template_file_path enthält <zertifikatname>.jpg
            $image_path = null;
            if (!empty($row['template_file_path'])) {
                $image_path = '/students/courses/imgs/certificates/' . $row['template_file_path'];
            }
            
            // Falls kein Titel vorhanden (LEFT JOIN), verwende certificate_type als Fallback
            $title = !empty($row['title']) ? $row['title'] : $row['certificate_type'];
            
            $certificates[] = [
                'id' => (int)$row['id'],
                'certificate_type' => $row['certificate_type'],
                'title' => $title,
                'description' => $row['description'] ?? '',
                'image_path' => $image_path,
                'earned_date' => $row['earned_date']
            ];
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'certificates' => $certificates
        ]);

    } catch (Exception $e) {
        // Wenn die Tabelle noch nicht existiert, gib leeres Array zurück
        $error_msg = $e->getMessage();
        if (strpos($error_msg, "doesn't exist") !== false || 
            strpos($error_msg, "Unknown table") !== false ||
            strpos($error_msg, "Table") !== false) {
            echo json_encode([
                'success' => true,
                'certificates' => []
            ]);
        } else {
            http_response_code(500);
            // In Produktion sollte die Fehlermeldung nicht so detailliert sein
            error_log("Certificate API Error: " . $error_msg);
            echo json_encode([
                'error' => 'Database error',
                'message' => $error_msg
            ]);
        }
    }

    $conn->close();
?>

