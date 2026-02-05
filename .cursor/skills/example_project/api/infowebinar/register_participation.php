<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
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
    
    if (!$input || !isset($input['webinar_date'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }

    $webinar_date = $input['webinar_date'];
    $user_id = get_user_id();
    
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole teacher_id des aktuellen Users
        $teacher_sql = "SELECT t.id as teacher_id 
                       FROM teachers t 
                       INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher' 
                       WHERE u.id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $teacher_stmt->bind_param('i', $user_id);
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_result = $teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Teacher not found']);
            $teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_data = $teacher_result->fetch_assoc();
        $teacher_id = $teacher_data['teacher_id'];
        $teacher_stmt->close();

        // Prüfe ob bereits eine Anmeldung für dieses Datum existiert
        $check_sql = "SELECT id FROM infowebinar_participation 
                     WHERE teacher_id = ? AND webinar_date = ?";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('is', $teacher_id, $webinar_date);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Already registered for this webinar']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();

        // Füge Anmeldung ein (updated_by_user_id wird erst bei Bewertung durch Admin gesetzt)
        $insert_sql = "INSERT INTO infowebinar_participation 
                      (teacher_id, webinar_date) 
                      VALUES (?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        if (!$insert_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $insert_stmt->bind_param('is', $teacher_id, $webinar_date);
        
        if (!$insert_stmt->execute()) {
            throw new Exception('Execute failed: ' . $insert_stmt->error);
        }

        $participation_id = $conn->insert_id;
        $insert_stmt->close();

        // Status auf "infowebinar_gebucht" (6) aktualisieren, wenn Lehrer sich anmeldet
        $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
        
        if ($has_status_id_column) {
            $target_status_label = 'infowebinar_gebucht';
            $target_status_sql = "SELECT id FROM teacher_stati WHERE label = ? LIMIT 1";
            $target_status_stmt = $conn->prepare($target_status_sql);
            
            if ($target_status_stmt) {
                $target_status_stmt->bind_param('s', $target_status_label);
                $target_status_stmt->execute();
                $target_status_result = $target_status_stmt->get_result();
                
                if ($target_status_row = $target_status_result->fetch_assoc()) {
                    $target_status_id = (int)$target_status_row['id'];
                    
                    // Verwende Hilfsfunktion, die verhindert, dass Status zurückgesetzt wird
                    if (!updateTeacherStatusIfHigher($conn, $teacher_id, $target_status_id)) {
                        error_log("[register_participation.php] Status konnte nicht aktualisiert werden (möglicherweise bereits höherer Status)");
                    }
                }
                $target_status_stmt->close();
            }
        }

        echo json_encode([
            'success' => true,
            'participation_id' => $participation_id,
            'teacher_id' => $teacher_id,
            'webinar_date' => $webinar_date
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

