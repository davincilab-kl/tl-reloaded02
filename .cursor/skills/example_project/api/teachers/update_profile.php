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
    
    if (!$input || !isset($input['user_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $user_id = (int)$input['user_id'];

    // Validierung
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfen ob Benutzer existiert und ein Lehrer ist
        $check_sql = "SELECT id FROM users WHERE id = ? AND role = 'teacher' LIMIT 1";
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

        // SQL-Query dynamisch aufbauen basierend auf übergebenen Feldern
        $update_fields = [];
        $update_params = [];
        $update_types = '';
        
        // Prüfe welche Felder aktualisiert werden sollen
        if (isset($input['first_name'])) {
            $first_name = trim($input['first_name']);
            if (empty($first_name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Vorname ist erforderlich']);
                $conn->close();
                exit;
            }
            $update_fields[] = "first_name = ?";
            $update_params[] = $first_name;
            $update_types .= 's';
        }
        
        if (isset($input['last_name'])) {
            $last_name = trim($input['last_name']);
            if (empty($last_name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Nachname ist erforderlich']);
                $conn->close();
                exit;
            }
            $update_fields[] = "last_name = ?";
            $update_params[] = $last_name;
            $update_types .= 's';
        }
        
        if (isset($input['salutation'])) {
            $update_fields[] = "salutation = ?";
            $update_params[] = trim($input['salutation']);
            $update_types .= 's';
        }
        
        if (isset($input['phone'])) {
            $phone = trim($input['phone']);
            // Telefon-Validierung
            if (!empty($phone) && (!preg_match('/^[\d\s\-\+\(\)]+$/', $phone) || strlen($phone) < 6)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ungültige Telefonnummer']);
                $conn->close();
                exit;
            }
            $update_fields[] = "phone = ?";
            $update_params[] = $phone;
            $update_types .= 's';
        }
        
        if (isset($input['email'])) {
            $email = trim($input['email']);
            if (empty($email)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'E-Mail-Adresse ist erforderlich']);
                $conn->close();
                exit;
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ungültige E-Mail-Adresse']);
                $conn->close();
                exit;
            }
            
            // Prüfen ob E-Mail bereits verwendet wird
            $email_check_sql = "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1";
            $email_check_stmt = $conn->prepare($email_check_sql);
            if ($email_check_stmt) {
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
            }
            
            $update_fields[] = "email = ?";
            $update_params[] = $email;
            $update_types .= 's';
        }
        
        if (isset($input['newsletter'])) {
            $update_fields[] = "newsletter = ?";
            $update_params[] = $input['newsletter'] ? 1 : 0;
            $update_types .= 'i';
        }
        
        if (empty($update_fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Keine Felder zum Aktualisieren angegeben']);
            $conn->close();
            exit;
        }
        
        // Prüfe ob die Spalten existieren (first_name und last_name existieren immer)
        $columns_to_check = [];
        if (isset($input['salutation'])) $columns_to_check[] = 'salutation';
        if (isset($input['phone'])) $columns_to_check[] = 'phone';
        if (isset($input['newsletter'])) $columns_to_check[] = 'newsletter';
        
        $existing_columns = [];
        foreach ($columns_to_check as $column) {
            $check_column = $conn->query("SHOW COLUMNS FROM users LIKE '$column'");
            if ($check_column && $check_column->num_rows > 0) {
                $existing_columns[] = $column;
            }
        }
        
        // Entferne Felder, die nicht existieren (first_name, last_name und email existieren immer)
        $final_update_fields = [];
        $final_update_params = [];
        $final_update_types = '';
        
        // Erstelle Mapping von Feldnamen zu Typen
        $field_type_map = [];
        foreach ($update_fields as $index => $field) {
            $field_name = explode(' = ', $field)[0];
            if ($field_name === 'first_name' || $field_name === 'last_name' || $field_name === 'email') {
                $field_type_map[$field_name] = 's';
            } elseif (isset($input['salutation']) && $field_name === 'salutation') {
                $field_type_map[$field_name] = 's';
            } elseif (isset($input['phone']) && $field_name === 'phone') {
                $field_type_map[$field_name] = 's';
            } elseif (isset($input['newsletter']) && $field_name === 'newsletter') {
                $field_type_map[$field_name] = 'i';
            }
        }
        
        foreach ($update_fields as $index => $field) {
            $field_name = explode(' = ', $field)[0];
            // first_name, last_name und email existieren immer, andere müssen geprüft werden
            if ($field_name === 'first_name' || $field_name === 'last_name' || $field_name === 'email' || in_array($field_name, $existing_columns)) {
                $final_update_fields[] = $field;
                $final_update_params[] = $update_params[$index];
                $final_update_types .= $field_type_map[$field_name];
            }
        }
        
        if (empty($final_update_fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Keine gültigen Felder zum Aktualisieren']);
            $conn->close();
            exit;
        }
        
        // Update-Query ausführen
        $update_sql = "UPDATE users SET " . implode(', ', $final_update_fields) . " WHERE id = ?";
        $final_update_types .= 'i';
        $final_update_params[] = $user_id;
        
        $update_stmt = $conn->prepare($update_sql);
        
        if (!$update_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }

        $bind_params = array_merge([$final_update_types], $final_update_params);
        $refs = [];
        foreach ($bind_params as $key => $value) {
            $refs[$key] = &$bind_params[$key];
        }
        call_user_func_array([$update_stmt, 'bind_param'], $refs);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_stmt->error);
        }

        $update_stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Profil erfolgreich aktualisiert'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

