<?php
    /**
     * Registrierungs-API-Endpunkt für Lehrkräfte
     */
    
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
    $newsletter = isset($input['newsletter']) ? (bool)$input['newsletter'] : false;
    $school_code = isset($input['school_code']) ? trim($input['school_code']) : null;
    
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
        
        // Aktuelles Datum für created_at und register_date
        $created_at = date('Y-m-d H:i:s');
        
        // Hole den ersten Status als Standard-Status für neue Registrierungen
        // Falls ein Status mit Label "registration" oder "pending" existiert, verwende diesen
        $default_status_id = null;
        $status_sql = "SELECT id FROM teacher_stati WHERE label IN ('registration', 'pending', 'neu', 'new') ORDER BY id ASC LIMIT 1";
        $status_result = $conn->query($status_sql);
        if ($status_result && $status_result->num_rows > 0) {
            $status_row = $status_result->fetch_assoc();
            $default_status_id = (int)$status_row['id'];
        } else {
            // Fallback: Verwende den ersten verfügbaren Status (kleinste ID)
            $status_check = $conn->query("SELECT id FROM teacher_stati ORDER BY id ASC LIMIT 1");
            if ($status_check && $status_check->num_rows > 0) {
                $status_row = $status_check->fetch_assoc();
                $default_status_id = (int)$status_row['id'];
            } else {
                // Kein Status gefunden - setze auf NULL und logge Warnung
                error_log('[register.php] WARNUNG: Kein Status in teacher_stati gefunden. Status wird nicht gesetzt.');
                $default_status_id = null;
            }
        }
        
        // 1. Lehrer in teachers Tabelle einfügen
        // Prüfe welche Spalten existieren
        $check_register_date = $conn->query("SHOW COLUMNS FROM teachers LIKE 'register_date'");
        $has_register_date = $check_register_date && $check_register_date->num_rows > 0;
        
        $check_status_id = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id = $check_status_id && $check_status_id->num_rows > 0;
        
        $check_register_schoolcode = $conn->query("SHOW COLUMNS FROM teachers LIKE 'register_schoolcode'");
        $has_register_schoolcode = $check_register_schoolcode && $check_register_schoolcode->num_rows > 0;
        
        // Baue INSERT-Statement dynamisch auf
        $teacher_sql = "INSERT INTO teachers (";
        $teacher_values = "VALUES (";
        $teacher_params = [];
        $teacher_types = "";
        
        $teacher_sql .= "school_id";
        $teacher_values .= "NULL";
        
        if ($has_register_date) {
            $teacher_sql .= ", register_date";
            $teacher_values .= ", ?";
            $teacher_params[] = $created_at;
            $teacher_types .= "s";
        }
        
        if ($has_status_id && $default_status_id !== null) {
            $teacher_sql .= ", status_id";
            $teacher_values .= ", ?";
            $teacher_params[] = $default_status_id;
            $teacher_types .= "i";
        }
        
        // Speichere register_schoolcode, wenn vorhanden und schulcode übergeben wurde
        if ($has_register_schoolcode && $school_code && !empty($school_code)) {
            $teacher_sql .= ", register_schoolcode";
            $teacher_values .= ", ?";
            $teacher_params[] = $school_code;
            $teacher_types .= "s";
        }
        
        $teacher_sql .= ") " . $teacher_values . ")";
        
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        if (!empty($teacher_params)) {
            $bind_params = array_merge([$teacher_types], $teacher_params);
            $refs = [];
            foreach ($bind_params as $key => $value) {
                $refs[$key] = &$bind_params[$key];
            }
            call_user_func_array([$teacher_stmt, 'bind_param'], $refs);
        }
        
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_id = $teacher_stmt->insert_id;
        $teacher_stmt->close();
        
        // 1.1. Status-Historie-Eintrag erstellen (wenn Status gesetzt wurde)
        // Der Trigger funktioniert nur bei UPDATEs, daher müssen wir den initialen Status manuell eintragen
        if ($has_status_id && $default_status_id !== null) {
            $check_history_table = $conn->query("SHOW TABLES LIKE 'teacher_status_history'");
            if ($check_history_table && $check_history_table->num_rows > 0) {
                $history_sql = "INSERT INTO teacher_status_history (teacher_id, status_id, previous_status_id, changed_at) VALUES (?, ?, NULL, ?)";
                $history_stmt = $conn->prepare($history_sql);
                if ($history_stmt) {
                    $history_stmt->bind_param('iis', $teacher_id, $default_status_id, $created_at);
                    if (!$history_stmt->execute()) {
                        // Nicht kritisch - nur loggen
                        error_log('[register.php] Fehler beim Erstellen des Status-Historie-Eintrags: ' . $history_stmt->error);
                    }
                    $history_stmt->close();
                }
            }
        }
        
        // 2. Lehrer in users Tabelle einfügen
        // users Tabelle enthält: role_id, role, first_name, last_name, email, password, created_at
        // Prüfe ob zusätzliche Spalten existieren (salutation, phone, newsletter)
        $user_sql = "INSERT INTO users (role_id, role, first_name, last_name, email, password, created_at";
        $user_values = "?, 'teacher', ?, ?, ?, ?, ?";
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
        
        // Prüfe ob newsletter Spalte existiert
        $check_newsletter = $conn->query("SHOW COLUMNS FROM users LIKE 'newsletter'");
        if ($check_newsletter && $check_newsletter->num_rows > 0) {
            $user_sql .= ", newsletter";
            $user_values .= ", ?";
            $user_params[] = $newsletter ? 1 : 0;
            $user_types .= "i";
        }
        
        // Prüfe ob email_verified Spalte existiert
        $check_email_verified = $conn->query("SHOW COLUMNS FROM users LIKE 'email_verified'");
        if ($check_email_verified && $check_email_verified->num_rows > 0) {
            $user_sql .= ", email_verified";
            $user_values .= ", 0"; // Standardmäßig auf 0 setzen
            // Kein Parameter nötig, da fest auf 0 gesetzt
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
        
        // 3. Placeholder-Eintrag in students Tabelle für Lehrer erstellen
        // Prüfe ob is_teacher_placeholder Spalte existiert
        $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
        $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
        
        // Hole school_id des Lehrers (wird später gesetzt, aber für jetzt NULL)
        $student_school_id = null; // Wird später beim Zuweisen der Schule gesetzt
        
        $student_id = null;
        
        if ($has_is_teacher_placeholder) {
            // Mit Flag
            $student_sql = "INSERT INTO students (class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins, is_teacher_placeholder) VALUES (NULL, ?, 0, 0, 0, 0, 0, 1)";
            $student_stmt = $conn->prepare($student_sql);
            if ($student_stmt) {
                $student_stmt->bind_param('i', $student_school_id);
                if ($student_stmt->execute()) {
                    $student_id = $student_stmt->insert_id;
                } else {
                    // Nicht kritisch - nur loggen
                    error_log('[register.php] Fehler beim Erstellen des Student-Placeholders: ' . $student_stmt->error);
                }
                $student_stmt->close();
            }
        } else {
            // Ohne Flag - verwende class_id = NULL als Marker (wird in Queries ausgeschlossen)
            $student_sql = "INSERT INTO students (class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins) VALUES (NULL, ?, 0, 0, 0, 0, 0)";
            $student_stmt = $conn->prepare($student_sql);
            if ($student_stmt) {
                $student_stmt->bind_param('i', $student_school_id);
                if ($student_stmt->execute()) {
                    $student_id = $student_stmt->insert_id;
                } else {
                    // Nicht kritisch - nur loggen
                    error_log('[register.php] Fehler beim Erstellen des Student-Placeholders: ' . $student_stmt->error);
                }
                $student_stmt->close();
            }
        }
        
        // 4. student_id in teachers Tabelle aktualisieren (falls Student-Eintrag erstellt wurde)
        if ($student_id && $student_id > 0) {
            // Prüfe ob student_id Spalte in teachers existiert
            $check_student_id = $conn->query("SHOW COLUMNS FROM teachers LIKE 'student_id'");
            $has_student_id = $check_student_id && $check_student_id->num_rows > 0;
            
            if ($has_student_id) {
                $update_teacher_sql = "UPDATE teachers SET student_id = ? WHERE id = ?";
                $update_teacher_stmt = $conn->prepare($update_teacher_sql);
                if ($update_teacher_stmt) {
                    $update_teacher_stmt->bind_param('ii', $student_id, $teacher_id);
                    if (!$update_teacher_stmt->execute()) {
                        // Nicht kritisch - nur loggen
                        error_log('[register.php] Fehler beim Aktualisieren der student_id: ' . $update_teacher_stmt->error);
                    }
                    $update_teacher_stmt->close();
                }
            }
        }
        
        // 5. E-Mail-Verifizierungscode generieren und speichern
        // Standard-Code: 123456 (später wird hier eine E-Mail versendet)
        $verification_code = '123456';
        
        // Prüfe ob email_verification_code Spalte existiert
        $check_code_column = $conn->query("SHOW COLUMNS FROM users LIKE 'email_verification_code'");
        $has_code_column = $check_code_column && $check_code_column->num_rows > 0;
        
        if ($has_code_column) {
            $code_sql = "UPDATE users SET email_verification_code = ? WHERE id = ?";
            $code_stmt = $conn->prepare($code_sql);
            if ($code_stmt) {
                $code_stmt->bind_param('si', $verification_code, $user_id);
                if (!$code_stmt->execute()) {
                    error_log('[register.php] Fehler beim Speichern des Verifizierungscodes: ' . $code_stmt->error);
                }
                $code_stmt->close();
            }
        } else {
            error_log("[register.php] Spalte email_verification_code existiert nicht - Fallback-Code 123456 wird verwendet");
        }
        
        // Transaction committen
        $conn->commit();
        
        $conn->close();
        
        // Erfolgreiche Antwort
        echo json_encode([
            'success' => true,
            'message' => 'Registrierung erfolgreich',
            'user' => [
                'id' => $user_id,
                'teacher_id' => $teacher_id,
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