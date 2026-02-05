<?php
    /**
     * Authentifizierungs- und Session-Verwaltung
     */
    
    session_start();
    
    require_once __DIR__ . '/access_db.php';
    
    /**
     * Prüft ob ein Benutzer eingeloggt ist
     */
    function is_logged_in() {
        return isset($_SESSION['user_id']) && isset($_SESSION['user_role']);
    }
    
    /**
     * Prüft ob der eingeloggte Benutzer eine bestimmte Rolle hat
     */
    function has_role($role) {
        return is_logged_in() && $_SESSION['user_role'] === $role;
    }
    
    /**
     * Prüft ob der Benutzer Admin oder Lehrer ist (direkt oder über korrespondierenden Student)
     */
    function is_admin_or_teacher() {
        if (has_role('admin') || has_role('teacher')) {
            return true;
        }
        // Prüfe ob eingeloggter Student einem Admin oder Teacher zugeordnet ist
        if (has_role('student')) {
            return is_student_linked_to_admin_or_teacher();
        }
        return false;
    }
    
    /**
     * Prüft ob der Benutzer Admin ist (direkt oder über korrespondierenden Student)
     */
    function is_admin() {
        if (has_role('admin')) {
            return true;
        }
        // Prüfe ob eingeloggter Student einem Admin zugeordnet ist
        if (has_role('student')) {
            return is_student_linked_to_admin_or_teacher('admin');
        }
        return false;
    }
    
    /**
     * Prüft ob der Benutzer Lehrer ist (direkt oder über korrespondierenden Student)
     */
    function is_teacher() {
        if (has_role('teacher')) {
            return true;
        }
        // Prüfe ob eingeloggter Student einem Teacher zugeordnet ist
        if (has_role('student')) {
            return is_student_linked_to_admin_or_teacher('teacher');
        }
        return false;
    }
    
    /**
     * Prüft ob der Benutzer Schüler ist
     */
    function is_student() {
        return has_role('student');
    }
    
    /**
     * Prüft ob der eingeloggte Student einem Admin oder Teacher zugeordnet ist
     */
    function is_student_linked_to_admin_or_teacher($role = null) {
        if (!is_logged_in() || !has_role('student')) {
            return false;
        }
        
        $conn = db_connect();
        $role_id = get_role_id();
        
        try {
            // Prüfe zuerst ob dieser Student einem Admin zugeordnet ist (neue admins Tabelle)
            if ($role === 'admin' || $role === null) {
                $check_admins_table = $conn->query("SHOW TABLES LIKE 'admins'");
                if ($check_admins_table && $check_admins_table->num_rows > 0) {
                    $admin_sql = "SELECT a.id 
                                FROM admins a 
                                WHERE a.student_id = ? 
                                LIMIT 1";
                    $admin_stmt = $conn->prepare($admin_sql);
                    if ($admin_stmt) {
                        $admin_stmt->bind_param('i', $role_id);
                        $admin_stmt->execute();
                        $admin_result = $admin_stmt->get_result();
                        if ($admin_result->num_rows > 0) {
                            $admin_stmt->close();
                            $conn->close();
                            return true; // Student ist einem Admin zugeordnet
                        }
                        $admin_stmt->close();
                    }
                }
            }
            
            // Prüfe ob dieser Student einem Teacher zugeordnet ist
            $sql = "SELECT t.id 
                    FROM teachers t 
                    WHERE t.student_id = ? 
                    LIMIT 1";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                $conn->close();
                return false;
            }
            
            $stmt->bind_param('i', $role_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $stmt->close();
                $conn->close();
                
                if ($role === 'admin') {
                    // Wenn nach Admin gefragt wurde, aber nur Teacher gefunden wurde
                    return false;
                } elseif ($role === 'teacher') {
                    return true; // Jeder Teacher mit student_id ist ein Teacher
                } else {
                    return true; // Irgendein Teacher/Admin
                }
            }
            
            $stmt->close();
        } catch (Exception $e) {
            // Fehler ignorieren
        }
        
        $conn->close();
        return false;
    }
    
    /**
     * Gibt die aktuelle User-ID zurück
     */
    function get_user_id() {
        return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    }
    
    /**
     * Gibt die aktuelle User-Rolle zurück
     */
    function get_user_role() {
        return isset($_SESSION['user_role']) ? $_SESSION['user_role'] : null;
    }
    
    /**
     * Gibt die aktuelle role_id zurück
     */
    function get_role_id() {
        return isset($_SESSION['role_id']) ? $_SESSION['role_id'] : null;
    }
    
    /**
     * Leitet zu Login-Seite weiter wenn nicht eingeloggt
     */
    function require_login() {
        if (!is_logged_in()) {
            header('Location: /login/');
            exit;
        }
    }
    
    /**
     * Leitet zu Zugriff-verweigert-Seite weiter wenn nicht Admin oder Lehrer
     */
    function require_admin_or_teacher() {
        require_login();
        if (!is_admin_or_teacher()) {
            header('Location: /access-denied/');
            exit;
        }
    }
    
    /**
     * Leitet zu Zugriff-verweigert-Seite weiter wenn nicht Admin (direkt oder über korrespondierenden Student)
     */
    function require_admin() {
        require_login();
        if (!is_admin()) {
            header('Location: /access-denied/');
            exit;
        }
    }
    
    /**
     * Leitet zu Zugriff-verweigert-Seite weiter wenn nicht Lehrer (direkt oder über korrespondierenden Student)
     */
    function require_teacher() {
        require_login();
        if (!is_teacher()) {
            header('Location: /access-denied/');
            exit;
        }
    }
    
    /**
     * Leitet zu Zugriff-verweigert-Seite weiter wenn nicht Schüler
     */
    function require_student() {
        require_login();
        if (!is_student()) {
            header('Location: /access-denied/');
            exit;
        }
    }
    
    /**
     * Leitet eingeloggte Benutzer weiter (z.B. von Login-Seite)
     */
    function redirect_if_logged_in() {
        if (is_logged_in()) {
            $role = get_user_role();
            if ($role === 'admin') {
                header('Location: /admin/dashboard/index.php');
            } elseif ($role === 'teacher') {
                header('Location: /teachers/dashboard/index.php');
            } elseif ($role === 'student') {
                header('Location: /students/courses/index.php');
            }
            exit;
        }
    }
    
    /**
     * Prüft ob ein Lehrer Zugriff auf das Schüler-Dashboard hat (Schule muss freigeschaltet sein)
     */
    function teacher_has_student_dashboard_access() {
        if (!is_logged_in()) {
            return false;
        }
        
        $userRole = get_user_role();
        
        // Admins haben immer Zugriff
        if ($userRole === 'admin') {
            return true;
        }
        
        // Schüler haben immer Zugriff
        if ($userRole === 'student') {
            return true;
        }
        
        // Für Lehrer: Prüfe ob Schule freigeschaltet ist
        if ($userRole === 'teacher') {
            $user_id = get_user_id();
            if (!$user_id) {
                return false;
            }
            
            $conn = db_connect();
            try {
                $check_sql = "SELECT t.school_id, t.waitlist, t.status_id
                            FROM teachers t 
                            INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher' 
                            WHERE u.id = ? LIMIT 1";
                $check_stmt = $conn->prepare($check_sql);
                if ($check_stmt) {
                    $check_stmt->bind_param('i', $user_id);
                    if ($check_stmt->execute()) {
                        $check_result = $check_stmt->get_result();
                        if ($check_row = $check_result->fetch_assoc()) {
                            // Hat school_id UND (waitlist ist NULL oder 0)
                            $hasSchoolAccess = !empty($check_row['school_id']) && 
                                             ($check_row['waitlist'] == 0 || $check_row['waitlist'] === null);
                            
                            if (!$hasSchoolAccess) {
                                $check_stmt->close();
                                $conn->close();
                                return false;
                            }
                            
                            // Prüfe ob Schule freigeschaltet ist (Eintrag in school_school_years für aktuelles Schuljahr ODER Status schule_aktiv)
                            $school_id = (int)$check_row['school_id'];
                            $status_id = isset($check_row['status_id']) ? (int)$check_row['status_id'] : null;
                            
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
                            
                            // Hole Status-ID für schule_aktiv
                            $status_check_sql = "SELECT id FROM teacher_stati WHERE label = 'schule_aktiv' LIMIT 1";
                            $status_check_result = $conn->query($status_check_sql);
                            $schule_aktiv_id = null;
                            if ($status_check_result && $status_check_result->num_rows > 0) {
                                $status_row = $status_check_result->fetch_assoc();
                                $schule_aktiv_id = (int)$status_row['id'];
                            }
                            
                            // Schule ist freigeschaltet wenn: Eintrag in school_school_years für aktuelles Schuljahr ODER Status = schule_aktiv
                            $hasActivatedSchool = $school_foerderung || ($status_id === $schule_aktiv_id);
                            
                            $check_stmt->close();
                            $conn->close();
                            return $hasActivatedSchool;
                        }
                    }
                    $check_stmt->close();
                }
            } catch (Exception $e) {
                // Bei Fehler: kein Zugriff
            }
            $conn->close();
            return false;
        }
        
        return false;
    }
?>

