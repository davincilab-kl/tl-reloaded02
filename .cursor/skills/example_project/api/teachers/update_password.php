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
    
    if (!$input || !isset($input['user_id']) || !isset($input['current_password']) || !isset($input['new_password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $user_id = (int)$input['user_id'];
    $current_password = trim($input['current_password']);
    $new_password = trim($input['new_password']);

    // Validierung
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
        exit;
    }

    if (empty($current_password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Aktuelles Passwort ist erforderlich']);
        exit;
    }

    if (empty($new_password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Neues Passwort ist erforderlich']);
        exit;
    }

    if (strlen($new_password) < 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Das neue Passwort muss mindestens 5 Zeichen lang sein']);
        exit;
    }

    if (strlen($new_password) > 50) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Das neue Passwort darf maximal 50 Zeichen lang sein']);
        exit;
    }

    $conn = db_connect();

    try {
        // Aktuelles Passwort prüfen
        $check_sql = "SELECT password FROM users WHERE id = ? AND role = 'teacher' LIMIT 1";
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
        
        $row = $check_result->fetch_assoc();
        $check_stmt->close();

        // Aktuelles Passwort verifizieren
        if ($row['password'] !== $current_password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Das aktuelle Passwort ist falsch']);
            $conn->close();
            exit;
        }

        // Neues Passwort darf nicht gleich dem alten sein
        if ($row['password'] === $new_password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Das neue Passwort muss sich vom alten unterscheiden']);
            $conn->close();
            exit;
        }

        // Passwort in users Tabelle aktualisieren
        $update_sql = "UPDATE users SET password = ? WHERE id = ? AND role = 'teacher'";
        $update_stmt = $conn->prepare($update_sql);
        
        if (!$update_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $update_stmt->bind_param('si', $new_password, $user_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_stmt->error);
        }

        $update_stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Passwort erfolgreich geändert'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

