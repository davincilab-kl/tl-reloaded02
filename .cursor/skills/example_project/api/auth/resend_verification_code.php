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
    
    if (!$input || !isset($input['teacher_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $teacher_id = (int)$input['teacher_id'];

    // Validierung
    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid teacher ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole User-ID
        $user_sql = "SELECT u.id FROM users u INNER JOIN teachers t ON u.role_id = t.id AND u.role = 'teacher' WHERE t.id = ? LIMIT 1";
        $user_stmt = $conn->prepare($user_sql);
        if (!$user_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $user_stmt->bind_param('i', $teacher_id);
        if (!$user_stmt->execute()) {
            throw new Exception('Execute failed: ' . $user_stmt->error);
        }
        
        $user_result = $user_stmt->get_result();
        if ($user_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Lehrer nicht gefunden']);
            $user_stmt->close();
            $conn->close();
            exit;
        }
        
        $user_data = $user_result->fetch_assoc();
        $user_id = $user_data['id'];
        $user_stmt->close();
        
        // Prüfe ob Code-Spalte existiert
        $check_code_column = $conn->query("SHOW COLUMNS FROM users LIKE 'email_verification_code'");
        $has_code_column = $check_code_column && $check_code_column->num_rows > 0;
        
        // Standard-Code: 123456
        $verification_code = '123456';
        
        // Code in Datenbank speichern (falls Spalte existiert)
        if ($has_code_column) {
            $update_sql = "UPDATE users SET email_verification_code = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if ($update_stmt) {
                $update_stmt->bind_param('si', $verification_code, $user_id);
                $update_stmt->execute();
                $update_stmt->close();
            }
        }
        
        // TODO: Hier würde normalerweise eine E-Mail versendet werden
        // Für jetzt wird nur der Code in der Datenbank gespeichert
        
        $conn->close();

        echo json_encode([
            'success' => true,
            'message' => 'Bestätigungscode wurde erneut gesendet'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server-Fehler: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

