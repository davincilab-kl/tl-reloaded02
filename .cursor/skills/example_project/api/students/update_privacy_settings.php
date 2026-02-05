<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // JSON-Daten aus Request Body lesen
    $input = json_decode(file_get_contents('php://input'), true);

    // Student ID aus POST-Daten
    $student_id = isset($input['student_id']) ? intval($input['student_id']) : 0;

    if ($student_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid student ID']);
        exit;
    }

    // Privatsphäre-Einstellungen aus POST-Daten
    $profile_picture = isset($input['profile_picture_visible']) ? (intval($input['profile_picture_visible']) ? 1 : 0) : 1;
    $name = isset($input['name_visible']) ? (intval($input['name_visible']) ? 1 : 0) : 1;
    $stats = isset($input['stats_visible']) ? (intval($input['stats_visible']) ? 1 : 0) : 1;
    $projects = isset($input['scratch_projects_visible']) ? (intval($input['scratch_projects_visible']) ? 1 : 0) : 1;

    $conn = db_connect();

    try {

        // Prüfe ob Eintrag bereits existiert
        $check_sql = "SELECT id FROM student_privacy_settings WHERE student_id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('i', $student_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $check_stmt->close();
        
        if ($check_result->num_rows > 0) {
            // Update bestehender Eintrag
            $update_sql = "UPDATE student_privacy_settings 
                          SET profile_picture = ?, 
                              name = ?, 
                              stats = ?, 
                              projects = ?
                          WHERE student_id = ?";
            $stmt = $conn->prepare($update_sql);
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $stmt->bind_param('iiiii', $profile_picture, $name, $stats, $projects, $student_id);
        } else {
            // Neuen Eintrag erstellen
            $insert_sql = "INSERT INTO student_privacy_settings 
                          (student_id, profile_picture, name, stats, projects) 
                          VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($insert_sql);
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $stmt->bind_param('iiiii', $student_id, $profile_picture, $name, $stats, $projects);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Privacy settings updated successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
