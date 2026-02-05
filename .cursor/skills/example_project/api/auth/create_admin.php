<?php
    /**
     * API-Endpunkt zum Anlegen eines neuen Admins
     * Erstellt User, Teacher, Student und verknüpft sie in der admins Tabelle
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
    
    // Prüfe ob User Admin ist
    require_admin();
    
    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }
    
    $first_name = isset($input['first_name']) ? trim($input['first_name']) : '';
    $last_name = isset($input['last_name']) ? trim($input['last_name']) : '';
    $salutation = isset($input['salutation']) ? trim($input['salutation']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';
    
    // Validierung
    if (empty($first_name) || empty($last_name) || empty($salutation) || empty($email) || empty($phone) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Alle Pflichtfelder sind erforderlich']);
        exit;
    }
    
    // E-Mail-Validierung
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige E-Mail-Adresse']);
        exit;
    }
    
    // Telefon-Validierung
    if (!preg_match('/^[\d\s\-\+\(\)]+$/', $phone) || strlen($phone) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige Telefonnummer']);
        exit;
    }
    
    // Passwort-Validierung
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Das Passwort muss mindestens 6 Zeichen lang sein']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Prüfen, ob E-Mail bereits existiert
        $check_sql = "SELECT id FROM users WHERE email = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('s', $email);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Diese E-Mail-Adresse ist bereits registriert']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();
        
        // Transaction starten
        $conn->begin_transaction();
        
        // Aktuelles Datum für created_at
        $created_at = date('Y-m-d H:i:s');
        
        // 1. Teacher in teachers Tabelle einfügen
        // Admin-Lehrkräfte haben immer school_id = 1 (Admin-Schule)
        $admin_school_id = 1;
        
        // Prüfe welche Spalten existieren
        $check_register_date = $conn->query("SHOW COLUMNS FROM teachers LIKE 'register_date'");
        $has_register_date = $check_register_date && $check_register_date->num_rows > 0;
        
        $teacher_sql = "INSERT INTO teachers (school_id";
        $teacher_values = "VALUES (?)";
        $teacher_params = [$admin_school_id];
        $teacher_types = "i";
        
        if ($has_register_date) {
            $teacher_sql .= ", register_date";
            $teacher_values .= ", ?";
            $teacher_params[] = $created_at;
            $teacher_types .= "s";
        }
        
        $teacher_sql .= ") " . $teacher_values;
        
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $bind_params = array_merge([$teacher_types], $teacher_params);
        $refs = [];
        foreach ($bind_params as $key => $value) {
            $refs[$key] = &$bind_params[$key];
        }
        call_user_func_array([$teacher_stmt, 'bind_param'], $refs);
        
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_id = $teacher_stmt->insert_id;
        $teacher_stmt->close();
        
        // 2. Admin-User in users Tabelle einfügen
        $user_sql = "INSERT INTO users (role_id, role, first_name, last_name, email, password, created_at";
        $user_values = "?, 'admin', ?, ?, ?, ?, ?";
        $user_params = [$teacher_id, $first_name, $last_name, $email, $password, $created_at];
        $user_types = "isssss";
        
        // Prüfe ob salutation Spalte existiert
        $check_salutation = $conn->query("SHOW COLUMNS FROM users LIKE 'salutation'");
        if ($check_salutation && $check_salutation->num_rows > 0) {
            $user_sql .= ", salutation";
            $user_values .= ", ?";
            $user_params[] = $salutation;
            $user_types .= "s";
        }
        
        // Prüfe ob phone Spalte existiert
        $check_phone = $conn->query("SHOW COLUMNS FROM users LIKE 'phone'");
        if ($check_phone && $check_phone->num_rows > 0) {
            $user_sql .= ", phone";
            $user_values .= ", ?";
            $user_params[] = $phone;
            $user_types .= "s";
        }
        
        // Prüfe ob email_verified Spalte existiert
        $check_email_verified = $conn->query("SHOW COLUMNS FROM users LIKE 'email_verified'");
        if ($check_email_verified && $check_email_verified->num_rows > 0) {
            $user_sql .= ", email_verified";
            $user_values .= ", 1"; // Admin-E-Mail als verifiziert markieren
        }
        
        $user_sql .= ") VALUES ($user_values)";
        
        $user_stmt = $conn->prepare($user_sql);
        if (!$user_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $bind_params = array_merge([$user_types], $user_params);
        $refs = [];
        foreach ($bind_params as $key => $value) {
            $refs[$key] = &$bind_params[$key];
        }
        call_user_func_array([$user_stmt, 'bind_param'], $refs);
        
        if (!$user_stmt->execute()) {
            throw new Exception('Execute failed: ' . $user_stmt->error);
        }
        
        $user_id = $user_stmt->insert_id;
        $user_stmt->close();
        
        // 3. Student-Eintrag für Admin erstellen
        // Admin-Students haben immer school_id = 1 (Admin-Schule)
        $student_school_id = 1;
        
        $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
        $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
        
        $student_id = null;
        
        if ($has_is_teacher_placeholder) {
            $student_sql = "INSERT INTO students (class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins, is_teacher_placeholder) VALUES (NULL, ?, 0, 0, 0, 0, 0, 1)";
            $student_stmt = $conn->prepare($student_sql);
            if ($student_stmt) {
                $student_stmt->bind_param('i', $student_school_id);
                if ($student_stmt->execute()) {
                    $student_id = $student_stmt->insert_id;
                } else {
                    throw new Exception('Fehler beim Erstellen des Student-Eintrags: ' . $student_stmt->error);
                }
                $student_stmt->close();
            }
        } else {
            $student_sql = "INSERT INTO students (class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins) VALUES (NULL, ?, 0, 0, 0, 0, 0)";
            $student_stmt = $conn->prepare($student_sql);
            if ($student_stmt) {
                $student_stmt->bind_param('i', $student_school_id);
                if ($student_stmt->execute()) {
                    $student_id = $student_stmt->insert_id;
                } else {
                    throw new Exception('Fehler beim Erstellen des Student-Eintrags: ' . $student_stmt->error);
                }
                $student_stmt->close();
            }
        }
        
        if (!$student_id || $student_id <= 0) {
            throw new Exception('Student-Eintrag konnte nicht erstellt werden');
        }
        
        // 4. student_id in teachers Tabelle aktualisieren
        $check_student_id = $conn->query("SHOW COLUMNS FROM teachers LIKE 'student_id'");
        $has_student_id = $check_student_id && $check_student_id->num_rows > 0;
        
        if ($has_student_id) {
            $update_teacher_sql = "UPDATE teachers SET student_id = ? WHERE id = ?";
            $update_teacher_stmt = $conn->prepare($update_teacher_sql);
            if ($update_teacher_stmt) {
                $update_teacher_stmt->bind_param('ii', $student_id, $teacher_id);
                if (!$update_teacher_stmt->execute()) {
                    throw new Exception('Fehler beim Aktualisieren der student_id: ' . $update_teacher_stmt->error);
                }
                $update_teacher_stmt->close();
            }
        }
        
        // 5. Eintrag in admins Tabelle erstellen
        $check_admins_table = $conn->query("SHOW TABLES LIKE 'admins'");
        if (!$check_admins_table || $check_admins_table->num_rows === 0) {
            throw new Exception('admins Tabelle existiert nicht. Bitte SQL-Script ausführen.');
        }
        
        $admin_sql = "INSERT INTO admins (teacher_id, student_id, created_at) VALUES (?, ?, ?)";
        $admin_stmt = $conn->prepare($admin_sql);
        if (!$admin_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $admin_stmt->bind_param('iis', $teacher_id, $student_id, $created_at);
        if (!$admin_stmt->execute()) {
            throw new Exception('Execute failed: ' . $admin_stmt->error);
        }
        
        $admin_id = $admin_stmt->insert_id;
        $admin_stmt->close();
        
        // Transaction committen
        $conn->commit();
        
        $conn->close();
        
        // Erfolgreiche Antwort
        echo json_encode([
            'success' => true,
            'message' => 'Admin erfolgreich angelegt',
            'admin' => [
                'id' => $admin_id,
                'teacher_id' => $teacher_id,
                'student_id' => $student_id,
                'email' => $email
            ]
        ]);
    }
    catch (Exception $e) {
        // Transaction rollback bei Fehler
        if (isset($conn)) {
            try {
                $conn->rollback();
            } catch (Exception $rollback_error) {
                // Ignoriere Rollback-Fehler
            }
        }
        
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server-Fehler: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>
