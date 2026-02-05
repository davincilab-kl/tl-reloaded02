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
    
    if (!$input || !isset($input['teacher_id']) || !isset($input['school_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $teacher_id = (int)$input['teacher_id'];
    $school_id = (int)$input['school_id'];
    $is_new_school = isset($input['is_new_school']) ? (bool)$input['is_new_school'] : false;

    // Validierung
    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid teacher ID']);
        exit;
    }

    if ($school_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid school ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Lehrer existiert und E-Mail verifiziert ist, hole auch User-Daten für Login
        $check_teacher_sql = "SELECT t.id, u.id as user_id, u.email_verified, u.first_name, u.last_name, u.email, u.role_id, u.role
                             FROM teachers t 
                             INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher' 
                             WHERE t.id = ? LIMIT 1";
        $check_teacher_stmt = $conn->prepare($check_teacher_sql);
        if (!$check_teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_teacher_stmt->bind_param('i', $teacher_id);
        if (!$check_teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_teacher_stmt->error);
        }
        
        $teacher_result = $check_teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Lehrer nicht gefunden']);
            $check_teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_data = $teacher_result->fetch_assoc();
        $check_teacher_stmt->close();
        
        // Prüfe ob E-Mail verifiziert ist
        $email_verified = isset($teacher_data['email_verified']) ? (int)$teacher_data['email_verified'] : 0;
        if ($email_verified !== 1) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'E-Mail muss zuerst verifiziert werden']);
            $conn->close();
            exit;
        }

        // Prüfe ob Schule existiert
        $check_school_sql = "SELECT id FROM schools WHERE id = ? LIMIT 1";
        $check_school_stmt = $conn->prepare($check_school_sql);
        if (!$check_school_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_school_stmt->bind_param('i', $school_id);
        if (!$check_school_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_school_stmt->error);
        }
        
        $school_result = $check_school_stmt->get_result();
        if ($school_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Schule nicht gefunden']);
            $check_school_stmt->close();
            $conn->close();
            exit;
        }
        
        $check_school_stmt->close();
        
        // Prüfe ob die Schule gefördert ist (Eintrag in school_school_years für aktuelles Schuljahr)
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
                $foerderung_stmt->bind_param('i', $school_id);
                if ($foerderung_stmt->execute()) {
                    $foerderung_result = $foerderung_stmt->get_result();
                    $school_foerderung = $foerderung_result->num_rows > 0;
                }
                $foerderung_stmt->close();
            }
        }

        if ($is_new_school) {
            // Neue Schule: Direkt zuweisen (Status 4)
            // Schule dem Lehrer zuweisen
            $update_sql = "UPDATE teachers SET school_id = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if (!$update_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }

            $update_stmt->bind_param('ii', $school_id, $teacher_id);
            
            if (!$update_stmt->execute()) {
                throw new Exception('Execute failed: ' . $update_stmt->error);
            }

            $update_stmt->close();
            
            // Status setzen: Wenn Schule gefördert ist, direkt auf schule_aktiv, sonst auf infowebinar_besuchen
            $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
            $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
            
            if ($has_status_id_column) {
                // Wenn Schule gefördert ist, Status schule_aktiv, sonst Status infowebinar_besuchen
                $target_status_label = $school_foerderung ? 'schule_aktiv' : 'infowebinar_besuchen';
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
                            error_log("[assign_school.php] Status konnte nicht aktualisiert werden (möglicherweise bereits höherer Status)");
                        }
                    }
                    $target_status_stmt->close();
                }
            }
            
            // Aktualisiere auch die school_id im zugehörigen Student-Eintrag (Lehrer-Placeholder)
        // Hole zuerst die student_id des Lehrers
        $student_id_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
        $student_id_stmt = $conn->prepare($student_id_sql);
        if ($student_id_stmt) {
            $student_id_stmt->bind_param('i', $teacher_id);
            if ($student_id_stmt->execute()) {
                $student_id_result = $student_id_stmt->get_result();
                if ($student_id_row = $student_id_result->fetch_assoc()) {
                    $student_id = !empty($student_id_row['student_id']) ? (int)$student_id_row['student_id'] : null;
                    
                    if ($student_id && $student_id > 0) {
                        // Prüfe ob is_teacher_placeholder Spalte existiert
                        $check_is_teacher_placeholder = $conn->query("SHOW COLUMNS FROM students LIKE 'is_teacher_placeholder'");
                        $has_is_teacher_placeholder = $check_is_teacher_placeholder && $check_is_teacher_placeholder->num_rows > 0;
                        
                        if ($has_is_teacher_placeholder) {
                            // Mit Flag
                            $update_student_sql = "UPDATE students SET school_id = ? WHERE id = ? AND is_teacher_placeholder = 1";
                        } else {
                            // Ohne Flag - verwende class_id IS NULL als Marker
                            $update_student_sql = "UPDATE students SET school_id = ? WHERE id = ? AND class_id IS NULL";
                        }
                        
                        $update_student_stmt = $conn->prepare($update_student_sql);
                        if ($update_student_stmt) {
                            $update_student_stmt->bind_param('ii', $school_id, $student_id);
                            if (!$update_student_stmt->execute()) {
                                // Nicht kritisch - nur loggen
                                error_log('[assign_school.php] Fehler beim Aktualisieren der student school_id: ' . $update_student_stmt->error);
                            }
                            $update_student_stmt->close();
                        }
                    }
                }
            }
            $student_id_stmt->close();
        }
        } else {
            // Bestehende Schule: IMMER auf Warteliste setzen (Status 3, KEIN school_id Update)
            // Unabhängig davon, ob die Schule gefördert ist oder nicht
                // Schule ist nicht gefördert: Auf Warteliste setzen (Status 3, KEIN school_id Update)
            // Prüfe ob waitlist Tabelle existiert
            $check_waitlist_table = $conn->query("SHOW TABLES LIKE 'teacher_waitlist'");
            $has_waitlist_table = $check_waitlist_table && $check_waitlist_table->num_rows > 0;
            
            if ($has_waitlist_table) {
                // Prüfe ob bereits ein pending Eintrag existiert
                $check_existing_sql = "SELECT id FROM teacher_waitlist WHERE teacher_id = ? AND school_id = ? AND status = 'pending' LIMIT 1";
                $check_existing_stmt = $conn->prepare($check_existing_sql);
                $check_existing_stmt->bind_param('ii', $teacher_id, $school_id);
                $check_existing_stmt->execute();
                $existing_result = $check_existing_stmt->get_result();
                
                if ($existing_result->num_rows === 0) {
                    // Neuen Waitlist-Eintrag erstellen
                    $waitlist_sql = "INSERT INTO teacher_waitlist (teacher_id, school_id, status, created_at) VALUES (?, ?, 'pending', NOW())";
                    $waitlist_stmt = $conn->prepare($waitlist_sql);
                    if ($waitlist_stmt) {
                        $waitlist_stmt->bind_param('ii', $teacher_id, $school_id);
                        if ($waitlist_stmt->execute()) {
                        } else {
                            error_log("[assign_school.php] Fehler beim Erstellen des Waitlist-Eintrags: " . $waitlist_stmt->error);
                        }
                        $waitlist_stmt->close();
                    }
                } else {
                    error_log("[assign_school.php] INFO: Waitlist-Eintrag existiert bereits für teacher_id={$teacher_id}, school_id={$school_id}");
                }
                $check_existing_stmt->close();
            } else {
                error_log("[assign_school.php] WARNUNG: teacher_waitlist Tabelle existiert nicht");
            }
            
            // waitlist Flag auf 1 setzen
            $check_waitlist_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'waitlist'");
            $has_waitlist_column = $check_waitlist_column && $check_waitlist_column->num_rows > 0;
            
            if ($has_waitlist_column) {
                $update_waitlist_sql = "UPDATE teachers SET waitlist = 1 WHERE id = ?";
                $update_waitlist_stmt = $conn->prepare($update_waitlist_sql);
                if ($update_waitlist_stmt) {
                    $update_waitlist_stmt->bind_param('i', $teacher_id);
                    if (!$update_waitlist_stmt->execute()) {
                        error_log("[assign_school.php] Fehler beim Setzen des waitlist Flags: " . $update_waitlist_stmt->error);
                    }
                    $update_waitlist_stmt->close();
                }
            }
            
            // Status auf warteliste_schule setzen
            $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
            $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
            
            if ($has_status_id_column) {
                $target_status_label = 'warteliste_schule';
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
                            error_log("[assign_school.php] Status konnte nicht aktualisiert werden (möglicherweise bereits höherer Status)");
                        }
                    } else {
                        error_log("[assign_school.php] WARNUNG: Status mit Label '{$target_status_label}' existiert nicht in teacher_stati (teacher_id={$teacher_id}).");
                    }
                    $target_status_stmt->close();
                }
            }
        }
        
        // Benutzer automatisch einloggen
        $user_full_name = trim(($teacher_data['first_name'] ?? '') . ' ' . ($teacher_data['last_name'] ?? ''));
        
        // Session starten
        $_SESSION['user_id'] = $teacher_data['user_id'];
        $_SESSION['role_id'] = $teacher_data['role_id'];
        $_SESSION['user_role'] = $teacher_data['role'];
        $_SESSION['user_name'] = $user_full_name;
        $_SESSION['user_email'] = $teacher_data['email'];
        
        // last_login aktualisieren
        $update_sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if ($update_stmt) {
            $update_stmt->bind_param('i', $teacher_data['user_id']);
            $update_stmt->execute();
            $update_stmt->close();
        }
        
        $conn->close();

        echo json_encode([
            'success' => true,
            'message' => 'Schule erfolgreich zugewiesen',
            'redirect' => '/teachers/dashboard/',
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

