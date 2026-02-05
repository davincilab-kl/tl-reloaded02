<?php
    /**
     * Impersonation-API-Endpunkt: Admin kann sich als Lehrer einloggen
     */
    
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    
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
    
    // Prüfe ob Admin eingeloggt ist
    if (!is_logged_in() || !has_role('admin')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Nur Admins können sich als Lehrer einloggen']);
        exit;
    }
    
    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }
    
    $teacher_id = isset($input['teacher_id']) ? intval($input['teacher_id']) : 0;
    
    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige Lehrer-ID']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Hole Lehrer-Daten
        $sql = "SELECT u.id, u.role_id, u.role, u.first_name, u.last_name, u.email
                FROM users u
                WHERE u.role = 'teacher' AND u.role_id = ?
                LIMIT 1";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $teacher_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Lehrer nicht gefunden']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher = $result->fetch_assoc();
        $stmt->close();
        
        // Namen kombinieren
        $teacher_full_name = trim(($teacher['first_name'] ?? '') . ' ' . ($teacher['last_name'] ?? ''));
        
        // Speichere Original-Admin-Session
        $_SESSION['original_user_id'] = $_SESSION['user_id'];
        $_SESSION['original_role_id'] = $_SESSION['role_id'];
        $_SESSION['original_user_role'] = $_SESSION['user_role'];
        $_SESSION['original_user_name'] = $_SESSION['user_name'];
        $_SESSION['original_user_email'] = $_SESSION['user_email'];
        $_SESSION['is_impersonating'] = true;
        
        // Setze Lehrer-Session
        $_SESSION['user_id'] = $teacher['id'];
        $_SESSION['role_id'] = $teacher['role_id'];
        $_SESSION['user_role'] = $teacher['role'];
        $_SESSION['user_name'] = $teacher_full_name;
        $_SESSION['user_email'] = $teacher['email'];
        
        $conn->close();
        
        // Erfolgreiche Antwort
        echo json_encode([
            'success' => true,
            'teacher' => [
                'id' => $teacher['id'],
                'role_id' => $teacher['role_id'],
                'role' => $teacher['role'],
                'name' => $teacher_full_name
            ],
            'redirect' => '/teachers/dashboard/'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server-Fehler: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

