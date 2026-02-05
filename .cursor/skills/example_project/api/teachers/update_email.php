<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['user_id']) || !isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $user_id = (int)$input['user_id'];
    $email = trim($input['email']);

    // Validierung
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
        exit;
    }

    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'E-Mail-Adresse ist erforderlich']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige E-Mail-Adresse']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfen ob Benutzer existiert und ein Lehrer ist
        $check_sql = "SELECT role_id FROM users WHERE role_id = ? AND role = 'teacher' LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $check_stmt->bind_param('i', $user_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $check_stmt->close();

        // Prüfen ob E-Mail bereits verwendet wird
        $email_check_sql = "SELECT id FROM users WHERE email = ? AND role_id != ? LIMIT 1";
        $email_check_stmt = $conn->prepare($email_check_sql);
        
        if (!$email_check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $email_check_stmt->bind_param('si', $email, $user_id);
        $email_check_stmt->execute();
        $email_check_result = $email_check_stmt->get_result();
        
        if ($email_check_result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Diese E-Mail-Adresse wird bereits verwendet']);
            $email_check_stmt->close();
            $conn->close();
            exit;
        }
        
        $email_check_stmt->close();

        // E-Mail in users Tabelle aktualisieren
        $update_users_sql = "UPDATE users SET email = ? WHERE role_id = ? AND role = 'teacher'";
        $update_users_stmt = $conn->prepare($update_users_sql);
        
        if (!$update_users_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $update_users_stmt->bind_param('si', $email, $user_id);
        
        if (!$update_users_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_users_stmt->error);
        }

        $update_users_stmt->close();

        // E-Mail in teachers Tabelle aktualisieren (falls vorhanden)
        $update_teachers_sql = "UPDATE teachers SET email = ? WHERE id = ?";
        $update_teachers_stmt = $conn->prepare($update_teachers_sql);
        
        if ($update_teachers_stmt) {
            $update_teachers_stmt->bind_param('si', $email, $user_id);
            $update_teachers_stmt->execute();
            $update_teachers_stmt->close();
        }

        echo json_encode([
            'success' => true,
            'message' => 'E-Mail-Adresse erfolgreich aktualisiert',
            'email' => $email
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

