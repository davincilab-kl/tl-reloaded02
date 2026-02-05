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

    // Nur Admins dürfen Teilnahme aktualisieren
    if (!is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['participation_id']) || !isset($input['participated'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }

        $participation_id = (int)$input['participation_id'];
    $participated = (bool)$input['participated'];
    $infowebinar_datetime = isset($input['infowebinar_datetime']) ? $input['infowebinar_datetime'] : null;
    $user_id = get_user_id();

    if ($participation_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid participation ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole teacher_id aus der Anmeldung
        $get_sql = "SELECT teacher_id, webinar_date FROM infowebinar_participation WHERE id = ? LIMIT 1";
        $get_stmt = $conn->prepare($get_sql);
        if (!$get_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $get_stmt->bind_param('i', $participation_id);
        if (!$get_stmt->execute()) {
            throw new Exception('Execute failed: ' . $get_stmt->error);
        }
        
        $result = $get_stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Participation not found']);
            $get_stmt->close();
            $conn->close();
            exit;
        }
        
        $participation_data = $result->fetch_assoc();
        $teacher_id = (int)$participation_data['teacher_id'];
        $get_stmt->close();

        // Update Teilnahme-Status und setze updated_by_user_id (Admin, der die Bewertung eingetragen hat)
        $update_sql = "UPDATE infowebinar_participation SET participated = ?, updated_by_user_id = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $update_stmt->bind_param('iii', $participated, $user_id, $participation_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_stmt->error);
        }

        $update_stmt->close();

        // Wenn teilgenommen wurde, aktualisiere auch das infowebinar-Feld in der teachers-Tabelle
        // KEIN Status-Update auf "schule_aktiv", da dieser nur bei Förderung gesetzt wird
        if ($participated && $infowebinar_datetime) {
            $update_teacher_sql = "UPDATE teachers SET infowebinar = ? WHERE id = ?";
            $update_teacher_stmt = $conn->prepare($update_teacher_sql);
            if ($update_teacher_stmt) {
                $update_teacher_stmt->bind_param('si', $infowebinar_datetime, $teacher_id);
                $update_teacher_stmt->execute();
                $update_teacher_stmt->close();
            }
        }

        // Wenn NICHT teilgenommen wurde, setze Status auf "nicht_teilgenommen" (7)
        if (!$participated) {
            $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
            $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
            
            if ($has_status_id_column) {
                $target_status_label = 'nicht_teilgenommen';
                $target_status_sql = "SELECT id FROM teacher_stati WHERE label = ? LIMIT 1";
                $target_status_stmt = $conn->prepare($target_status_sql);
                
                if ($target_status_stmt) {
                    $target_status_stmt->bind_param('s', $target_status_label);
                    $target_status_stmt->execute();
                    $target_status_result = $target_status_stmt->get_result();
                    
                    if ($target_status_row = $target_status_result->fetch_assoc()) {
                        $target_status_id = (int)$target_status_row['id'];
                        
                        // Setze Status direkt (auch wenn order niedriger ist)
                        $update_status_sql = "UPDATE teachers SET status_id = ? WHERE id = ?";
                        $update_status_stmt = $conn->prepare($update_status_sql);
                        if ($update_status_stmt) {
                            $update_status_stmt->bind_param('ii', $target_status_id, $teacher_id);
                            $update_status_stmt->execute();
                            $update_status_stmt->close();
                        }
                    }
                    $target_status_stmt->close();
                }
            }
        }

        echo json_encode([
            'success' => true,
            'participation_id' => $participation_id,
            'participated' => $participated
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

