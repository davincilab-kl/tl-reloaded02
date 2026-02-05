<?php
    // Hauptmenü für Admins, Lehrkräfte und Schüler
?>
<link rel="stylesheet" href="/partials/main-menu/main-menu-style.css">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
<?php
    $currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    
    function is_active($currentPath, $targetPath) {
        return strpos($currentPath, $targetPath) === 0 ? 'active' : '';
    }
    
    // Bestimme, ob wir im Lehrkraft- oder Schüler-Bereich sind
    $isTeacherArea = strpos($currentPath, '/teachers/dashboard/') === 0 ||
                     strpos($currentPath, '/teachers/classes/') === 0 ||
                     strpos($currentPath, '/teachers/messages/') === 0 ||
                     strpos($currentPath, '/teachers/profile/') === 0 ||
                     strpos($currentPath, '/teachers/school/') === 0 ||
                     strpos($currentPath, '/teachers/course-packages/') === 0;
    $isPipelineArea = strpos($currentPath, '/admin/pipeline/') === 0;
    $isStudentArea = strpos($currentPath, '/students/') === 0 || strpos($currentPath, '/apps/') === 0;
    $isAdminArea = strpos($currentPath, '/admin/') === 0;
    $isInfowebinarArea = strpos($currentPath, '/admin/infowebinar/') === 0;
    
    require_once __DIR__ . '/../../api/config/auth.php';
    
    // Prüfe ob Benutzer eingeloggt ist
    $isLoggedIn = is_logged_in();
    
    // Prüfe ob Impersonation aktiv ist
    $isImpersonating = isset($_SESSION['is_impersonating']) && $_SESSION['is_impersonating'];
    
    // Prüfe die tatsächliche Rolle aus der Session (nicht über zugeordnete Schüler)
    $userRole = get_user_role();
    $isDirectAdmin = ($userRole === 'admin');
    $isDirectTeacher = ($userRole === 'teacher');
    $isDirectStudent = ($userRole === 'student');
    
    // Für die Funktionalität (z.B. Admin kann Lehrkräfte-Dashboard sehen)
    $isAdmin = is_admin();
    $isTeacher = is_teacher();
    
    // Prüfe ob Lehrkräfte eine Schule zugewiesen hat, nicht auf Warteliste steht und Schule freigeschaltet ist
    $hasSchoolAccess = false;
    $hasActivatedSchool = false; // Prüft ob Schule freigeschaltet ist
    if ($isLoggedIn && ($isDirectTeacher || $isDirectAdmin)) {
        $user_id = get_user_id();
        if ($user_id) {
            require_once __DIR__ . '/../../api/config/access_db.php';
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
                            
                            // Prüfe ob Schule freigeschaltet ist (Eintrag in school_school_years für aktuelles Schuljahr ODER Status schule_aktiv)
                            if ($hasSchoolAccess) {
                                $school_id = (int)$check_row['school_id'];
                                $status_id = isset($check_row['status_id']) ? (int)$check_row['status_id'] : null;
                                
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
                            }
                        }
                    }
                    $check_stmt->close();
                }
            } catch (Exception $e) {
                // Bei Fehler: kein Zugriff
                $hasSchoolAccess = false;
                $hasActivatedSchool = false;
            }
            $conn->close();
        }
    }
    // Admins haben immer Zugriff
    if ($isDirectAdmin) {
        $hasSchoolAccess = true;
        $hasActivatedSchool = true;
    }
    
    // Wenn Admin-Bereich, zeige auch Admin-Submenu
    if ($isAdminArea) {
        $isTeacherArea = false; // Admin-Bereich hat eigenes Submenu
    }
    
    // Funktion zum Generieren des Avatar-URLs
    function get_avatar_url($user_id) {
        if (!$user_id) {
            return '/imgs/profile_placeholder.png';
        }
        
        require_once __DIR__ . '/../../api/config/access_db.php';
        $conn = db_connect();
        
        try {
            $avatar_sql = "SELECT avatar_seed, avatar_style FROM users WHERE id = ? LIMIT 1";
            $avatar_stmt = $conn->prepare($avatar_sql);
            
            if ($avatar_stmt) {
                $avatar_stmt->bind_param('i', $user_id);
                if ($avatar_stmt->execute()) {
                    $avatar_result = $avatar_stmt->get_result();
                    if ($avatar_row = $avatar_result->fetch_assoc()) {
                        $avatar_seed = $avatar_row['avatar_seed'] ?? null;
                        $avatar_style = $avatar_row['avatar_style'] ?? 'avataaars';
                        
                        if ($avatar_seed) {
                            $avatar_stmt->close();
                            $conn->close();
                            return 'https://api.dicebear.com/7.x/' . htmlspecialchars($avatar_style) . '/svg?seed=' . urlencode($avatar_seed);
                        }
                    }
                }
                $avatar_stmt->close();
            }
        } catch (Exception $e) {
            // Bei Fehler: Platzhalter zurückgeben
        }
        
        $conn->close();
        return '/imgs/profile_placeholder.png';
    }
    
    // Hole Avatar-URLs für Lehrkräfte und Schüler
    $teacher_avatar_url = '/imgs/profile_placeholder.png';
    $student_avatar_url = '/imgs/profile_placeholder.png';
    
    if ($isLoggedIn) {
        $current_user_id = get_user_id();
        
        // Avatar für Lehrkräfte-Bereich
        if ($isDirectTeacher || $isDirectAdmin) {
            $teacher_avatar_url = get_avatar_url($current_user_id);
        }
        
        // Avatar für Schüler-Bereich
        if ($isStudentArea) {
            if ($current_user_id) {
                require_once __DIR__ . '/../../api/config/access_db.php';
                $conn = db_connect();
                try {
                    // Prüfe ob aktueller User ein Student ist
                    $user_check_sql = "SELECT role FROM users WHERE id = ? LIMIT 1";
                    $user_check_stmt = $conn->prepare($user_check_sql);
                    if ($user_check_stmt) {
                        $user_check_stmt->bind_param('i', $current_user_id);
                        if ($user_check_stmt->execute()) {
                            $user_check_result = $user_check_stmt->get_result();
                            if ($user_row = $user_check_result->fetch_assoc()) {
                                if ($user_row['role'] === 'student') {
                                    // Direkt Student -> verwende dessen Avatar
                                    $student_avatar_url = get_avatar_url($current_user_id);
                                } else {
                                    // Lehrkräfte/Admin -> hole Platzhalter-Schüler (student_id aus teachers Tabelle)
                                    // Für Platzhalter-Schüler verwenden wir den Avatar der Lehrkräfte/Admins
                                    $teacher_id_sql = "SELECT role_id, student_id FROM teachers t 
                                                      INNER JOIN users u ON u.role_id = t.id AND u.role IN ('teacher', 'admin')
                                                      WHERE u.id = ? LIMIT 1";
                                    $teacher_id_stmt = $conn->prepare($teacher_id_sql);
                                    if ($teacher_id_stmt) {
                                        $teacher_id_stmt->bind_param('i', $current_user_id);
                                        if ($teacher_id_stmt->execute()) {
                                            $teacher_id_result = $teacher_id_stmt->get_result();
                                            if ($teacher_id_row = $teacher_id_result->fetch_assoc()) {
                                                $student_id = isset($teacher_id_row['student_id']) ? (int)$teacher_id_row['student_id'] : null;
                                                
                                                if ($student_id && $student_id > 0) {
                                                    // Prüfe ob es ein Platzhalter-Schüler ist
                                                    $student_check_sql = "SELECT is_teacher_placeholder FROM students WHERE id = ? LIMIT 1";
                                                    $student_check_stmt = $conn->prepare($student_check_sql);
                                                    if ($student_check_stmt) {
                                                        $student_check_stmt->bind_param('i', $student_id);
                                                        if ($student_check_stmt->execute()) {
                                                            $student_check_result = $student_check_stmt->get_result();
                                                            if ($student_check_row = $student_check_result->fetch_assoc()) {
                                                                $is_placeholder = isset($student_check_row['is_teacher_placeholder']) && $student_check_row['is_teacher_placeholder'] == 1;
                                                                
                                                                if ($is_placeholder) {
                                                                    // Platzhalter-Schüler -> verwende Avatar der Lehrkräfte/Admins
                                                                    $student_avatar_url = get_avatar_url($current_user_id);
                                                                } else {
                                                                    // Echter Schüler -> hole user_id des Schülers
                                                                    $student_user_sql = "SELECT id FROM users WHERE role_id = ? AND role = 'student' LIMIT 1";
                                                                    $student_user_stmt = $conn->prepare($student_user_sql);
                                                                    if ($student_user_stmt) {
                                                                        $student_user_stmt->bind_param('i', $student_id);
                                                                        if ($student_user_stmt->execute()) {
                                                                            $student_user_result = $student_user_stmt->get_result();
                                                                            if ($student_user_row = $student_user_result->fetch_assoc()) {
                                                                                $student_avatar_url = get_avatar_url($student_user_row['id']);
                                                                            }
                                                                        }
                                                                        $student_user_stmt->close();
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        $student_check_stmt->close();
                                                    }
                                                } else {
                                                    // Kein student_id -> verwende Avatar der Lehrkräfte/Admins
                                                    $student_avatar_url = get_avatar_url($current_user_id);
                                                }
                                            }
                                        }
                                        $teacher_id_stmt->close();
                                    }
                                }
                            }
                        }
                        $user_check_stmt->close();
                    }
                } catch (Exception $e) {
                    // Bei Fehler: Platzhalter verwenden
                }
                $conn->close();
            }
        }
    }
?>
<nav class="teacher-main-menu <?php echo $isStudentArea ? 'student-area-menu' : ''; ?>">
    <div class="main-menu-options <?php echo $isStudentArea ? 'student-menu-options' : ''; ?>">
        <a href="/" class="main-menu-logo">
            <img src="/imgs/tl_logo.png" alt="TalentsLounge" class="logo-image">
        </a>
        <a href="/" class="main-menu-option">
            <span>Home</span>
        </a>
        <?php if (!$isLoggedIn): ?>
        <a href="/#partner" class="main-menu-option">
            <span>Partner</span>
        </a>
        <?php endif; ?>
        <a href="/challenges/index.php" class="main-menu-option <?php echo is_active($currentPath, '/challenges/'); ?>">
            <span>Challenges</span>
        </a>
        <?php if (!$isLoggedIn): ?>
        <a href="/#leaderboards" class="main-menu-option">
            <span>Leaderboards</span>
        </a>
        <a href="/#news" class="main-menu-option">
            <span>News</span>
        </a>
        <?php endif; ?>
        <?php if ($isLoggedIn): ?>
        <div class="dashboard-menu-container">
            <?php if ($isDirectAdmin || ($isDirectTeacher && $isAdmin)): ?>
            <a href="/admin/dashboard/index.php" class="main-menu-option <?php echo $isAdminArea ? 'active' : ''; ?>">
                <span>Admin-Dashboard</span>
            </a>
            <?php endif; ?>
            <?php if ($isDirectTeacher || $isDirectAdmin): ?>
            <a href="/teachers/dashboard/index.php" class="main-menu-option <?php echo $isTeacherArea ? 'active' : ''; ?>">
                <span>Lehrkraft-Dashboard</span>
            </a>
            <?php endif; ?>
            <?php if ($isDirectStudent || $isDirectAdmin || $isDirectTeacher): ?>
            <a href="/students/courses/index.php" 
               class="main-menu-option <?php echo $isStudentArea ? 'active' : ''; ?> <?php echo ($isDirectTeacher && !$hasActivatedSchool) ? 'student-dashboard-restricted' : ''; ?>"
               <?php if ($isDirectTeacher && !$hasActivatedSchool): ?>
               onclick="event.preventDefault(); alert('Dieser Bereich wird erst freigeschaltet, wenn Ihre Schule freigeschaltet ist.'); return false;"
               title="Dieser Bereich wird erst freigeschaltet, wenn Ihre Schule freigeschaltet ist."
               <?php endif; ?>>
                <span>Schüler-Dashboard</span>
            </a>
            <?php endif; ?>
        </div>
        <?php if (!$isImpersonating): ?>
        <a href="#" id="logout-btn-main" class="main-menu-option logout-menu-item" title="Abmelden">
            <i class="fas fa-sign-out-alt"></i>
            <span>Abmelden</span>
        </a>
        <?php else: ?>
        <span class="main-menu-option logout-menu-item disabled" title="Im Impersonation-Modus bitte die Leiste am unteren Rand verwenden">
            <i class="fas fa-sign-out-alt"></i>
            <span>Abmelden</span>
        </span>
        <?php endif; ?>
        <?php else: ?>
        <a href="/login/index.php" class="main-menu-option" title="Anmelden">
            <i class="fas fa-sign-in-alt"></i>
            <span>Anmelden</span>
        </a>
        <?php endif; ?>
    </div>
    
    <?php if ($isLoggedIn && ($isTeacherArea || $isAdminArea || $isStudentArea)): ?>
    <div class="menu-bottom-row">
        <?php if ($isTeacherArea && ($isDirectTeacher || $isDirectAdmin)): ?>
        <nav class="sub-menu">
            <a class="sub-menu-option <?php echo is_active($currentPath, '/teachers/dashboard/'); ?>" href="/teachers/dashboard/index.php">Dashboard</a>

            <div class="dropdown-menu <?php echo !$hasSchoolAccess ? 'disabled' : ''; ?>">
                <button class="dropdown-toggle <?php echo (is_active($currentPath, '/teachers/school/')) ? 'active' : ''; ?> <?php echo !$hasSchoolAccess ? 'disabled' : ''; ?>" type="button" <?php echo !$hasSchoolAccess ? 'disabled title="Keine Schule zugewiesen oder auf Warteliste"' : ''; ?>>
                    Schule
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content">
                    <a class="<?php echo is_active($currentPath, '/teachers/school/overview'); ?>" href="/teachers/school/overview.php">Übersicht</a>
                    <?php if ($hasSchoolAccess): ?>
                    <a class="<?php echo is_active($currentPath, '/teachers/school/teachers'); ?>" href="/teachers/school/teachers.php">Lehrkräfte</a>
                    <?php else: ?>
                    <a class="<?php echo is_active($currentPath, '/teachers/school/teachers'); ?> disabled" href="#" onclick="return false;" title="Keine Schule zugewiesen oder auf Warteliste">Lehrkräfte</a>
                    <?php endif; ?>
                </div>
            </div>
            
            <?php if ($hasSchoolAccess): ?>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/teachers/classes/'); ?>" href="/teachers/classes/index.php">Klassen</a>
            <?php else: ?>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/teachers/classes/'); ?> disabled" href="#" onclick="return false;" title="Keine Schule zugewiesen oder auf Warteliste">Klassen</a>
            <?php endif; ?>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/teachers/messages/'); ?>" href="/teachers/messages/index.php">Nachrichten</a>
            
            <div class="dropdown-menu <?php echo !$hasSchoolAccess ? 'disabled' : ''; ?>">
                <button class="dropdown-toggle <?php echo (is_active($currentPath, '/teachers/course-packages/')) ? 'active' : ''; ?> <?php echo !$hasSchoolAccess ? 'disabled' : ''; ?>" type="button" <?php echo !$hasSchoolAccess ? 'disabled title="Keine Schule zugewiesen oder auf Warteliste"' : ''; ?>>
                    Kurspakete
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content">
                    <a class="<?php echo is_active($currentPath, '/teachers/course-packages/index'); ?>" href="/teachers/course-packages/index.php">Übersicht</a>
                    <a class="<?php echo is_active($currentPath, '/teachers/course-packages/orders'); ?>" href="/teachers/course-packages/orders.php">Bestellverlauf</a>
                </div>
            </div>
            
            <a href="/teachers/profile/index.php" class="sub-menu-profile-picture-link">
                <div class="sub-menu-profile-picture">
                    <img src="<?php echo htmlspecialchars($teacher_avatar_url); ?>" alt="Profilbild" onerror="this.src='/imgs/profile_placeholder.png'">
                </div>
            </a>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/teachers/profile/'); ?>" href="/teachers/profile/index.php">Profil</a>
        </nav>
        <div class="menu-right-controls">
        </div>
        <?php elseif ($isLoggedIn && $isAdminArea && $isDirectAdmin): ?>
        <nav class="sub-menu">
            <a class="sub-menu-option <?php echo is_active($currentPath, '/admin/dashboard/'); ?>" href="/admin/dashboard/index.php">Dashboard</a>
            
            <div class="dropdown-menu">
                <button class="dropdown-toggle <?php echo (is_active($currentPath, '/admin/overview/') || is_active($currentPath, '/admin/schools/') || is_active($currentPath, '/admin/teachers/') || is_active($currentPath, '/admin/pipeline/') || is_active($currentPath, '/admin/infowebinar/') || is_active($currentPath, '/admin/checks/') || is_active($currentPath, '/admin/challenges/') || is_active($currentPath, '/admin/lists/')) ? 'active' : ''; ?>" type="button">
                    Übersicht
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content">
                    <a class="<?php echo is_active($currentPath, '/admin/schools/'); ?>" href="/admin/schools/index.php">Schulen</a>
                    <a class="<?php echo is_active($currentPath, '/admin/teachers/'); ?>" href="/admin/teachers/index.php">Lehrkräfte</a>
                    <a class="<?php echo is_active($currentPath, '/admin/pipeline/'); ?>" href="/admin/pipeline/index.php">Pipeline</a>
                    <a class="<?php echo is_active($currentPath, '/admin/infowebinar/'); ?>" href="/admin/infowebinar/index.php">Infowebinar</a>
                    <a class="<?php echo is_active($currentPath, '/admin/checks/'); ?>" href="/admin/checks/index.php">Checks</a>
                    <a class="<?php echo is_active($currentPath, '/admin/challenges/'); ?>" href="/admin/challenges/index.php">Challenges</a>
                    <a class="<?php echo is_active($currentPath, '/admin/lists/'); ?>" href="/admin/lists/index.php">Listen</a>
                    <a class="<?php echo is_active($currentPath, '/admin/overview/'); ?>" href="/admin/overview/index.php">Visualisierungen</a>
                </div>
            </div>
            
            <div class="dropdown-menu">
                <button class="dropdown-toggle <?php echo (is_active($currentPath, '/admin/messages/') || is_active($currentPath, '/admin/email-templates/')) ? 'active' : ''; ?>" type="button">
                    Nachrichten
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content">
                    <a class="<?php echo is_active($currentPath, '/admin/messages/'); ?>" href="/admin/messages/index.php">Nachrichten</a>
                    <a class="<?php echo is_active($currentPath, '/admin/email-templates/'); ?>" href="/admin/email-templates/index.php">E-Mail-Vorlagen</a>
                </div>
            </div>
            
            <div class="dropdown-menu">
                <button class="dropdown-toggle <?php echo is_active($currentPath, '/admin/leaderboards/') ? 'active' : ''; ?>" type="button">
                    Statistiken
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content">
                    <a class="<?php echo is_active($currentPath, '/admin/leaderboards/'); ?>" href="/admin/leaderboards/index.php">Leaderboards</a>
                </div>
            </div>
        </nav>
        <div class="menu-right-controls">
        </div>
    <?php elseif ($isLoggedIn && $isStudentArea): ?>
        <nav class="sub-menu student-sub-menu">
            <a class="sub-menu-option <?php echo is_active($currentPath, '/students/courses/'); ?>" href="/students/courses/index.php">Kurse</a>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/students/projects/'); ?>" href="/students/projects/index.php">Projekte</a>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/students/school/'); ?>" href="/students/school/index.php">Schule</a>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/students/apps/') || is_active($currentPath, '/apps/') ? 'active' : ''; ?>" href="/students/apps/index.php">Apps</a>
            
            <a href="/students/profile/index.php" class="sub-menu-option sub-menu-profile-picture-link">
                <div class="sub-menu-profile-picture">
                    <img src="<?php echo htmlspecialchars($student_avatar_url); ?>" alt="Profilbild" onerror="this.src='/imgs/profile_placeholder.png'">
                </div>
            </a>
            <a class="sub-menu-option <?php echo is_active($currentPath, '/students/profile/'); ?>" href="/students/profile/index.php">Profil</a>
        </nav>
        <div class="menu-right-controls">
            <?php if ($isStudentArea): ?>
            <button id="toggle-main-menu" class="main-menu-toggle-btn student-area-toggle" title="Hauptmenü ausklappen/einklappen">
                <i class="fas fa-chevron-up"></i>
                <span>Hauptmenü</span>
            </button>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
    <?php endif; ?>
</nav>
<script>
    // Logout-Funktionalität
    function setupLogout(buttonId) {
        const logoutBtn = document.getElementById(buttonId);
        if (logoutBtn) {
            // Prüfe ob Impersonation aktiv ist
            const isImpersonating = <?php echo $isImpersonating ? 'true' : 'false'; ?>;
            
            if (isImpersonating) {
                // Im Impersonation-Modus: Button deaktivieren
                logoutBtn.style.opacity = '0.5';
                logoutBtn.style.cursor = 'not-allowed';
                logoutBtn.style.pointerEvents = 'none';
                logoutBtn.title = 'Im Impersonation-Modus bitte die Leiste am unteren Rand verwenden';
                return;
            }
            
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                if (confirm('Möchten Sie sich wirklich abmelden?')) {
                    try {
                        const response = await fetch('/api/auth/logout.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        const data = await response.json();
                        if (data.success) {
                            window.location.href = '/';
                        } else {
                            alert('Fehler beim Abmelden');
                        }
                    } catch (error) {
                        console.error('Logout-Fehler:', error);
                        window.location.href = '/';
                    }
                }
            });
        }
    }
    
    // Logout-Button im Hauptmenü (nur für eingeloggte Benutzer, nicht im Impersonation-Modus)
    setupLogout('logout-btn-main');
    
    // Lade aktiven Schüler für Schüler-Submenü
    (async function() {
        const studentInfo = document.getElementById('active-student-info');
        if (!studentInfo) return;
        
        // Versuche zuerst Session-User-ID zu holen
        let userId = null;
        try {
            const userResponse = await fetch('/api/auth/get_current_user.php');
            const userData = await userResponse.json();
            if (userData.success && userData.user_id) {
                userId = userData.user_id;
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der User-ID:', error);
        }
        
        // Fallback auf localStorage
        if (!userId) {
            userId = localStorage.getItem('teacher_user_id');
        }
        
        if (!userId) {
            const nameSpan = document.getElementById('student-name');
            const idSpan = document.getElementById('student-id');
            if (nameSpan) nameSpan.textContent = 'Keine User-ID';
            if (idSpan) idSpan.textContent = '';
            return;
        }
        
        fetch('/api/students/get_first_student.php?user_id=' + userId)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.student) {
                    const nameSpan = document.getElementById('student-name');
                    const idSpan = document.getElementById('student-id');
                    if (nameSpan) nameSpan.textContent = data.student.name;
                    if (idSpan) idSpan.textContent = '(ID: ' + data.student.id + ')';
                } else {
                    if (data.error) {
                        alert(data.error);
                    }
                    const nameSpan = document.getElementById('student-name');
                    const idSpan = document.getElementById('student-id');
                    if (nameSpan) nameSpan.textContent = 'Kein Schüler gefunden';
                    if (idSpan) idSpan.textContent = '';
                }
            })
            .catch(error => {
                console.error('Fehler beim Laden des Schülers:', error);
                const nameSpan = document.getElementById('student-name');
                const idSpan = document.getElementById('student-id');
                if (nameSpan) nameSpan.textContent = 'Fehler';
                if (idSpan) idSpan.textContent = '';
            });
    })();
    
    // Dropdown-Funktionalität für Sub-Menü
    (function() {
        const dropdownMenus = document.querySelectorAll('.sub-menu .dropdown-menu');
        
        // Funktion zum Positionieren des Dropdowns
        function positionDropdown(dropdown) {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const content = dropdown.querySelector('.dropdown-content');
            if (!toggle || !content) return;
            
            const toggleRect = toggle.getBoundingClientRect();
            content.style.position = 'fixed';
            content.style.top = (toggleRect.bottom - 5) + 'px';
            content.style.left = toggleRect.left + 'px';
            content.style.minWidth = toggleRect.width + 'px';
        }
        
        // Öffne Dropdowns beim Hover
        dropdownMenus.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const content = dropdown.querySelector('.dropdown-content');
            let closeTimeout = null;
            
            if (toggle && content) {
                // Funktion zum Öffnen des Dropdowns
                function openDropdown() {
                    // Lösche eventuellen Schließ-Timeout
                    if (closeTimeout) {
                        clearTimeout(closeTimeout);
                        closeTimeout = null;
                    }
                    
                    // Schließe alle anderen Dropdowns
                    dropdownMenus.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('open');
                            const otherContent = other.querySelector('.dropdown-content');
                            if (otherContent) {
                                otherContent.style.position = '';
                                otherContent.style.top = '';
                                otherContent.style.left = '';
                                otherContent.style.minWidth = '';
                            }
                        }
                    });
                    
                    // Öffne aktuelles Dropdown
                    dropdown.classList.add('open');
                    positionDropdown(dropdown);
                }
                
                // Funktion zum Schließen des Dropdowns
                function closeDropdown() {
                    dropdown.classList.remove('open');
                    content.style.position = '';
                    content.style.top = '';
                    content.style.left = '';
                    content.style.minWidth = '';
                }
                
                // Funktion zum Abbrechen des Schließ-Timeout
                function cancelClose() {
                    if (closeTimeout) {
                        clearTimeout(closeTimeout);
                        closeTimeout = null;
                    }
                }
                
                // Öffne beim Hover über Toggle oder Dropdown (nur wenn nicht disabled)
                if (!dropdown.classList.contains('disabled')) {
                    toggle.addEventListener('mouseenter', openDropdown);
                    dropdown.addEventListener('mouseenter', function() {
                        cancelClose();
                        openDropdown();
                    });
                }
                
                // Schließe beim Verlassen mit kleinem Delay
                dropdown.addEventListener('mouseleave', function() {
                    closeTimeout = setTimeout(function() {
                        closeDropdown();
                    }, 200); // 200ms Delay, damit der Wechsel zum Content funktioniert
                });
                
                // Verhindere Schließen, wenn Maus über Content kommt
                content.addEventListener('mouseenter', cancelClose);
                content.addEventListener('mouseleave', function() {
                    closeTimeout = setTimeout(function() {
                        closeDropdown();
                    }, 200);
                });
            }
        });
        
        // Funktion zum Schließen aller Dropdowns
        function closeAllDropdowns() {
            dropdownMenus.forEach(dropdown => {
                dropdown.classList.remove('open');
                const content = dropdown.querySelector('.dropdown-content');
                if (content) {
                    content.style.position = '';
                    content.style.top = '';
                    content.style.left = '';
                    content.style.minWidth = '';
                }
            });
        }
        
        // Positioniere Dropdowns neu beim Resize
        function updateDropdownPositions() {
            dropdownMenus.forEach(dropdown => {
                if (dropdown.classList.contains('open')) {
                    positionDropdown(dropdown);
                }
            });
        }
        
        // Schließe Dropdowns beim Scrollen
        window.addEventListener('scroll', closeAllDropdowns, true);
        window.addEventListener('resize', updateDropdownPositions);
        
        // Schließe Dropdowns beim Klick auf einen Link im Dropdown-Content
        dropdownMenus.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content) {
                const links = content.querySelectorAll('a');
                links.forEach(link => {
                    link.addEventListener('click', function() {
                        closeAllDropdowns();
                    });
                });
            }
        });
    })();
    
    // Toggle-Funktionalität für Hauptmenü im Schüler-Bereich
    (function() {
        const mainMenu = document.querySelector('.teacher-main-menu.student-area-menu');
        const mainMenuOptions = document.querySelector('.main-menu-options.student-menu-options');
        const toggleBtn = document.getElementById('toggle-main-menu');
        
        if (toggleBtn && mainMenuOptions && mainMenu) {
            // Immer standardmäßig eingeklappt (kein localStorage)
            mainMenuOptions.classList.add('collapsed');
            mainMenu.classList.add('main-menu-collapsed');
            
            // Toggle-Funktionalität (ohne Speicherung)
            toggleBtn.addEventListener('click', function() {
                mainMenuOptions.classList.toggle('collapsed');
                mainMenu.classList.toggle('main-menu-collapsed');
            });
        }
    })();
    
    // Aktualisiere Profilbild im Hauptmenü nach Avatar-Änderung
    (function() {
        // Event Listener für Avatar-Updates (wird von der Profilseite ausgelöst)
        window.addEventListener('avatarUpdated', function() {
            // Aktualisiere alle Profilbilder im Hauptmenü durch Cache-Busting
            const profilePictures = document.querySelectorAll('.sub-menu-profile-picture img');
            profilePictures.forEach(img => {
                // Füge Timestamp hinzu, um Cache zu umgehen
                if (img.src.includes('dicebear.com')) {
                    // Entferne alten Timestamp falls vorhanden
                    const baseUrl = img.src.split('&t=')[0].split('?t=')[0];
                    img.src = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
                } else {
                    // Für Platzhalter auch Cache-Busting
                    img.src = '/imgs/profile_placeholder.png?t=' + Date.now();
                    console.log('Platzhalter genutzt, da kein Avatar-URL vorhanden ist');
                }
            });
        });
    })();
</script>

<?php
    // Impersonation-Leiste einbinden (wenn Admin als Lehrkräfte eingeloggt ist)
    include __DIR__ . '/../impersonation-bar/impersonation-bar.php';
?>


