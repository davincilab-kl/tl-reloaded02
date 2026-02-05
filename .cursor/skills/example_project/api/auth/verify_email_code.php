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
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['teacher_id']) || !isset($input['code'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $teacher_id = (int)$input['teacher_id'];
    $code = isset($input['code']) ? trim($input['code']) : '';

    // Validierung
    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid teacher ID']);
        exit;
    }

    if (empty($code) || strlen($code) !== 6 || !ctype_digit($code)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültiger Code. Bitte geben Sie einen 6-stelligen Zahlencode ein.']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole den gespeicherten Verifizierungscode und User-Daten
        $check_sql = "SELECT u.id, u.email_verification_code, u.first_name, u.last_name, u.email, u.role_id, u.role, t.school_id, t.register_schoolcode
                      FROM users u 
                      INNER JOIN teachers t ON u.role_id = t.id AND u.role = 'teacher' 
                      WHERE t.id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('i', $teacher_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $result = $check_stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Lehrer nicht gefunden']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $user_data = $result->fetch_assoc();
        $check_stmt->close();
        
        // Prüfe ob Code-Spalte existiert
        $check_code_column = $conn->query("SHOW COLUMNS FROM users LIKE 'email_verification_code'");
        $has_code_column = $check_code_column && $check_code_column->num_rows > 0;
        
        if (!$has_code_column) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Verifizierungscode-Spalte existiert nicht in der Datenbank']);
            $conn->close();
            exit;
        }
        
        // Code aus Datenbank lesen
        $stored_code = isset($user_data['email_verification_code']) ? trim($user_data['email_verification_code']) : null;
        
        if (empty($stored_code)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Kein Verifizierungscode gefunden. Bitte fordern Sie einen neuen Code an.']);
            $conn->close();
            exit;
        }
        
        // Code normalisieren (trim)
        $code = trim($code);
        
        // Code vergleichen (strikt)
        if ($code !== $stored_code) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Ungültiger Code. Bitte versuchen Sie es erneut.']);
            $conn->close();
            exit;
        }
        
        // Code ist gültig - als verifiziert markieren
        // Prüfe ob email_verified Spalte existiert
        $check_verified_column = $conn->query("SHOW COLUMNS FROM users LIKE 'email_verified'");
        $has_verified_column = $check_verified_column && $check_verified_column->num_rows > 0;
        
        if ($has_code_column) {
            if ($has_verified_column) {
                $update_sql = "UPDATE users SET email_verified = 1, email_verification_code = NULL WHERE id = ?";
            } else {
                $update_sql = "UPDATE users SET email_verification_code = NULL WHERE id = ?";
            }
        } else {
            // Falls Code-Spalte nicht existiert, nur email_verified setzen
            if ($has_verified_column) {
                $update_sql = "UPDATE users SET email_verified = 1 WHERE id = ?";
            } else {
                // Keine Spalten zum Aktualisieren
                $update_sql = null;
            }
        }
        
        if ($update_sql) {
            $update_stmt = $conn->prepare($update_sql);
            if ($update_stmt) {
                $update_stmt->bind_param('i', $user_data['id']);
                $update_stmt->execute();
                $update_stmt->close();
            }
        }
        
        // Status auf schule_verbinden setzen nach erfolgreicher E-Mail-Verifizierung
        $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
        
        if ($has_status_id_column) {
            // Hole Status-ID über Label
            $target_status_label = 'schule_verbinden';
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
                        error_log("[verify_email_code.php] Status konnte nicht aktualisiert werden (möglicherweise bereits höherer Status)");
                    }
                }
                $target_status_stmt->close();
            } else {
                error_log("[verify_email_code.php] WARNUNG: Status mit Label '{$target_status_label}' existiert nicht in teacher_stati (teacher_id={$teacher_id}).");
            }
        }
        
        // Benutzer automatisch einloggen
        $user_full_name = trim(($user_data['first_name'] ?? '') . ' ' . ($user_data['last_name'] ?? ''));
        
        // Session starten
        $_SESSION['user_id'] = $user_data['id'];
        $_SESSION['role_id'] = $user_data['role_id'];
        $_SESSION['user_role'] = $user_data['role'];
        $_SESSION['user_name'] = $user_full_name;
        $_SESSION['user_email'] = $user_data['email'];
        
        // last_login aktualisieren
        $update_sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if ($update_stmt) {
            $update_stmt->bind_param('i', $user_data['id']);
            $update_stmt->execute();
            $update_stmt->close();
        }
        
        // Prüfe ob bereits eine Schule zugewiesen ist
        $school_id = isset($user_data['school_id']) ? (int)$user_data['school_id'] : null;
        $has_school = $school_id !== null && $school_id > 0;
        
        // Hole register_schoolcode aus der Datenbank (wurde bei Registrierung gespeichert)
        $register_schoolcode = isset($user_data['register_schoolcode']) ? trim($user_data['register_schoolcode']) : null;
        
        // Wenn register_schoolcode vorhanden ist, Schule automatisch zuweisen
        if (!$has_school && $register_schoolcode && !empty($register_schoolcode)) {
            // Prüfe ob school_code Spalte existiert
            $check_school_code_column = $conn->query("SHOW COLUMNS FROM schools LIKE 'school_code'");
            $has_school_code_column = $check_school_code_column && $check_school_code_column->num_rows > 0;
            
            if ($has_school_code_column) {
                // Finde Schule über school_code
                $find_school_sql = "SELECT id FROM schools WHERE school_code = ? LIMIT 1";
                $find_school_stmt = $conn->prepare($find_school_sql);
                if ($find_school_stmt) {
                    $find_school_stmt->bind_param('s', $register_schoolcode);
                    $find_school_stmt->execute();
                    $find_school_result = $find_school_stmt->get_result();
                    
                    if ($school_row = $find_school_result->fetch_assoc()) {
                        $found_school_id = (int)$school_row['id'];
                        // Prüfe ob Eintrag in school_school_years für aktuelles Schuljahr existiert
                        $school_foerderung = false;
                        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
                        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
                        if ($check_school_years && $check_school_years->num_rows > 0 && 
                            $check_school_school_years && $check_school_school_years->num_rows > 0) {
                            $foerderung_sql = "SELECT 1 FROM school_school_years ssy
                                               INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                                               WHERE ssy.school_id = ? AND sy.is_current = 1
                                               LIMIT 1";
                            $foerderung_stmt = $conn->prepare($foerderung_sql);
                            if ($foerderung_stmt) {
                                $foerderung_stmt->bind_param('i', $found_school_id);
                                if ($foerderung_stmt->execute()) {
                                    $foerderung_result = $foerderung_stmt->get_result();
                                    $school_foerderung = $foerderung_result->num_rows > 0;
                                }
                                $foerderung_stmt->close();
                            }
                        }
                        
                        // Schule dem Lehrer zuweisen
                        $assign_school_sql = "UPDATE teachers SET school_id = ? WHERE id = ?";
                        $assign_school_stmt = $conn->prepare($assign_school_sql);
                        if ($assign_school_stmt) {
                            $assign_school_stmt->bind_param('ii', $found_school_id, $teacher_id);
                            if ($assign_school_stmt->execute()) {
                                $has_school = true;
                                $school_id = $found_school_id;
                                
                                // Status setzen: Wenn Schule gefördert ist, direkt auf schule_aktiv, sonst auf infowebinar_besuchen
                                $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
                                $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
                                
                                if ($has_status_id_column) {
                                    $target_status_label = $school_foerderung ? 'schule_aktiv' : 'infowebinar_besuchen';
                                    $target_status_sql = "SELECT id FROM teacher_stati WHERE label = ? LIMIT 1";
                                    $target_status_stmt = $conn->prepare($target_status_sql);
                                    if ($target_status_stmt) {
                                        $target_status_stmt->bind_param('s', $target_status_label);
                                        $target_status_stmt->execute();
                                        $target_status_result = $target_status_stmt->get_result();
                                        
                                        if ($target_status_row = $target_status_result->fetch_assoc()) {
                                            $target_status_id = (int)$target_status_row['id'];
                                            updateTeacherStatusIfHigher($conn, $teacher_id, $target_status_id);
                                        }
                                        $target_status_stmt->close();
                                    }
                                }
                                
                                // Aktualisiere auch die school_id im zugehörigen Student-Eintrag (Lehrer-Placeholder)
                                $student_id_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
                                $student_id_stmt = $conn->prepare($student_id_sql);
                                if ($student_id_stmt) {
                                    $student_id_stmt->bind_param('i', $teacher_id);
                                    if ($student_id_stmt->execute()) {
                                        $student_id_result = $student_id_stmt->get_result();
                                        if ($student_id_row = $student_id_result->fetch_assoc()) {
                                            $student_id = !empty($student_id_row['student_id']) ? (int)$student_id_row['student_id'] : null;
                                            
                                            if ($student_id && $student_id > 0) {
                                                $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
                                                $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
                                                
                                                if ($has_is_teacher_placeholder) {
                                                    $update_student_sql = "UPDATE students SET school_id = ? WHERE id = ? AND is_teacher_placeholder = 1";
                                                } else {
                                                    $update_student_sql = "UPDATE students SET school_id = ? WHERE id = ? AND class_id IS NULL";
                                                }
                                                
                                                $update_student_stmt = $conn->prepare($update_student_sql);
                                                if ($update_student_stmt) {
                                                    $update_student_stmt->bind_param('ii', $found_school_id, $student_id);
                                                    $update_student_stmt->execute();
                                                    $update_student_stmt->close();
                                                }
                                            }
                                        }
                                    }
                                    $student_id_stmt->close();
                                }
                            }
                            $assign_school_stmt->close();
                        }
                    }
                    $find_school_stmt->close();
                }
            }
        }
        
        $conn->close();

        // Weiterleitung basierend auf Schulstatus
        $redirect = $has_school ? '/teachers/dashboard/' : '/register/select_school.php?teacher_id=' . $teacher_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'E-Mail erfolgreich bestätigt',
            'redirect' => $redirect,
            'logged_in' => true
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server-Fehler: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

