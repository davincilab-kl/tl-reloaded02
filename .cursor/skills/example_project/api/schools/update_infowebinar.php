<?php
    require_once __DIR__ . '/../config/access_db.php';
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

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['teacher_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }

    $teacher_id = (int)$input['teacher_id'];
    $infowebinar = isset($input['infowebinar']) ? $input['infowebinar'] : null; // Kann jetzt ein Datum oder null sein

    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid teacher ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Info-Webinar-Teilnahme für den Lehrer aktualisieren
        if ($infowebinar === null) {
            $sql = "UPDATE teachers SET infowebinar = NULL WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $teacher_id);
        } else {
            $sql = "UPDATE teachers SET infowebinar = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('si', $infowebinar, $teacher_id);
        }
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        if ($stmt->affected_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Teacher not found']);
        } else {
            echo json_encode([
                'success' => true,
                'teacher_id' => $teacher_id,
                'infowebinar' => $infowebinar
            ]);
        }

        $stmt->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
