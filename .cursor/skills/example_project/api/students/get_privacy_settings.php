<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
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
        // Hole Privatsphäre-Einstellungen
        $sql = "SELECT profile_picture, name, stats, projects
                FROM student_privacy_settings
                WHERE student_id = ?
                LIMIT 1";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $student_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // Keine Einstellungen vorhanden - Standardwerte zurückgeben
            $settings = [
                'profile_picture_visible' => true,
                'name_visible' => true,
                'stats_visible' => true,
                'scratch_projects_visible' => true
            ];
        } else {
            $row = $result->fetch_assoc();
            $settings = [
                'profile_picture_visible' => (bool)$row['profile_picture'],
                'name_visible' => (bool)$row['name'],
                'stats_visible' => (bool)$row['stats'],
                'scratch_projects_visible' => (bool)$row['projects']
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
