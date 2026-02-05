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
    
    if (!$input || !isset($input['waitlist_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }

    $waitlist_id = (int)$input['waitlist_id'];

    if ($waitlist_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid waitlist ID']);
        exit;
    }

    $conn = db_connect();

    // Hole aktuelle User-ID
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        $conn->close();
        exit;
    }

    try {
        // Hole school_id und teacher_id des aktuellen Lehrers (unterstützt sowohl 'teacher' als auch 'admin' Rollen)
        $teacher_sql = "SELECT t.id as teacher_id, t.school_id 
                       FROM teachers t 
                       INNER JOIN users u ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin') 
                       WHERE u.id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $teacher_stmt->bind_param('i', $user_id);
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_result = $teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Teacher not found']);
            $teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_data = $teacher_result->fetch_assoc();
        $school_id = $teacher_data['school_id'];
        $current_teacher_id = $teacher_data['teacher_id'];
        $teacher_stmt->close();
        
        if (!$school_id) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No school assigned']);
            $conn->close();
            exit;
        }
        
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
        
        // Prüfe ob waitlist Tabelle existiert
        $check_waitlist = $conn->query("SHOW TABLES LIKE 'teacher_waitlist'");
        if (!$check_waitlist || $check_waitlist->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Waitlist table not found']);
            $conn->close();
            exit;
        }
        
        // Hole Waitlist-Eintrag
        $waitlist_sql = "SELECT id, teacher_id, school_id, status 
                        FROM teacher_waitlist 
                        WHERE id = ? AND school_id = ? AND status = 'pending' LIMIT 1";
        $waitlist_stmt = $conn->prepare($waitlist_sql);
        if (!$waitlist_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $waitlist_stmt->bind_param('ii', $waitlist_id, $school_id);
        if (!$waitlist_stmt->execute()) {
            throw new Exception('Execute failed: ' . $waitlist_stmt->error);
        }
        
        $waitlist_result = $waitlist_stmt->get_result();
        if ($waitlist_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Waitlist entry not found or already processed']);
            $waitlist_stmt->close();
            $conn->close();
            exit;
        }
        
        $waitlist_data = $waitlist_result->fetch_assoc();
        $target_teacher_id = $waitlist_data['teacher_id'];
        $waitlist_stmt->close();
        
        // Transaction starten
        $conn->begin_transaction();
        
        // 1. Update Waitlist-Eintrag
        $update_waitlist_sql = "UPDATE teacher_waitlist 
                               SET status = 'accepted', 
                                   accepted_at = NOW(), 
                                   accepted_by = ? 
                               WHERE id = ?";
        $update_waitlist_stmt = $conn->prepare($update_waitlist_sql);
        if (!$update_waitlist_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $update_waitlist_stmt->bind_param('ii', $current_teacher_id, $waitlist_id);
        if (!$update_waitlist_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_waitlist_stmt->error);
        }
        $update_waitlist_stmt->close();
        
        // 2. Setze school_id beim Lehrer
        $update_teacher_sql = "UPDATE teachers SET school_id = ? WHERE id = ?";
        $update_teacher_stmt = $conn->prepare($update_teacher_sql);
        if (!$update_teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $update_teacher_stmt->bind_param('ii', $school_id, $target_teacher_id);
        if (!$update_teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_teacher_stmt->error);
        }
        $update_teacher_stmt->close();
        
        // 3. Setze waitlist Flag auf 0
        $check_waitlist_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'waitlist'");
        $has_waitlist_column = $check_waitlist_column && $check_waitlist_column->num_rows > 0;
        
        if ($has_waitlist_column) {
            $update_waitlist_flag_sql = "UPDATE teachers SET waitlist = 0 WHERE id = ?";
            $update_waitlist_flag_stmt = $conn->prepare($update_waitlist_flag_sql);
            if ($update_waitlist_flag_stmt) {
                $update_waitlist_flag_stmt->bind_param('i', $target_teacher_id);
                $update_waitlist_flag_stmt->execute();
                $update_waitlist_flag_stmt->close();
            }
        }
        
        // 4. Update Status: Wenn Schule gefördert ist, Status schule_aktiv, sonst Status infowebinar_besuchen
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
                    if (!updateTeacherStatusIfHigher($conn, $target_teacher_id, $target_status_id)) {
                        error_log("[accept_waitlist.php] Status konnte nicht aktualisiert werden (möglicherweise bereits höherer Status)");
                    }
                }
                $target_status_stmt->close();
            }
        }
        
        // Transaction committen
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Lehrkraft erfolgreich akzeptiert'
        ]);

    } catch (Exception $e) {
        // Transaction rollback bei Fehler
        if (isset($conn)) {
            try {
                $conn->rollback();
            } catch (Exception $rollback_error) {
                // Ignoriere Rollback-Fehler
            }
        }
        
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

