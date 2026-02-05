<?php
    /**
     * Login-API-Endpunkt
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
    
    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }
    
    $login_type = isset($input['login_type']) ? $input['login_type'] : ''; // 'admin_teacher' oder 'student'
    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';
    
    if (empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Passwort ist erforderlich']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        if ($login_type === 'student') {
            // Schüler-Login: Nur Passwort (unique)
            $sql = "SELECT id, role_id, role, first_name, last_name, email, password 
                    FROM users 
                    WHERE role = 'student' AND password = ? 
                    LIMIT 1";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $stmt->bind_param('s', $password);
            
        } else {
            // Admin/Lehrer-Login: Email + Passwort
            if (empty($email)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'E-Mail ist erforderlich']);
                exit;
            }
            
            $sql = "SELECT id, role_id, role, first_name, last_name, email, password 
                    FROM users 
                    WHERE (role = 'admin' OR role = 'teacher') 
                    AND email = ? AND password = ? 
                    LIMIT 1";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $stmt->bind_param('ss', $email, $password);
        }
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Ungültige Anmeldedaten']);
            $stmt->close();
            $conn->close();
            exit;
        }
        
        $user = $result->fetch_assoc();
        $stmt->close();
        
        // Namen kombinieren (last_name kann NULL sein)
        $user_full_name = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
        
        // Prüfe ob Lehrer mit Status 1 (E-Mail noch nicht bestätigt)
        $needs_email_verification = false;
        if ($user['role'] === 'teacher') {
            $check_status_sql = "SELECT t.status_id 
                               FROM teachers t 
                               WHERE t.id = ? LIMIT 1";
            $check_status_stmt = $conn->prepare($check_status_sql);
            if ($check_status_stmt) {
                $check_status_stmt->bind_param('i', $user['role_id']);
                if ($check_status_stmt->execute()) {
                    $status_result = $check_status_stmt->get_result();
                    if ($status_row = $status_result->fetch_assoc()) {
                        $status_id = isset($status_row['status_id']) ? (int)$status_row['status_id'] : null;
                        // Status 1 = E-Mail noch nicht bestätigt
                        if ($status_id === 1) {
                            $needs_email_verification = true;
                        }
                    }
                }
                $check_status_stmt->close();
            }
        }
        
        // Wenn E-Mail-Verifizierung benötigt wird, Session NICHT setzen und zur Verifizierungsseite weiterleiten
        if ($needs_email_verification) {
            $conn->close();
            echo json_encode([
                'success' => false,
                'error' => 'E-Mail-Verifizierung erforderlich',
                'requires_verification' => true,
                'teacher_id' => $user['role_id'],
                'redirect' => '/register/verify_email.php?teacher_id=' . $user['role_id']
            ]);
            exit;
        }
        
        // Session starten
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role_id'] = $user['role_id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user_full_name;
        $_SESSION['user_email'] = $user['email'];
        
        // last_login aktualisieren
        $update_sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if ($update_stmt) {
            $update_stmt->bind_param('i', $user['id']);
            $update_stmt->execute();
            $update_stmt->close();
        }
        
        $conn->close();
        
        // Erfolgreiche Antwort
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'role_id' => $user['role_id'],
                'role' => $user['role'],
                'name' => $user_full_name
            ],
            'redirect' => $user['role'] === 'admin' ? '/admin/dashboard/' : 
                        ($user['role'] === 'teacher' ? '/teachers/dashboard/' : '/students/courses/')
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server-Fehler: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

