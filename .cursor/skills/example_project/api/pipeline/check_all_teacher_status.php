<?php
    /**
     * Prüft alle Stati (1-19) für alle Lehrer und gibt einen Report zurück
     * Ändert KEINE Stati, nur Prüfung und Report
     */
    
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/check_teacher_status.php';
    
    /**
     * Prüft welcher Status für einen Lehrer erfüllt sein sollte (ohne Änderung)
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array Array mit 'current_status_id', 'expected_status_id', 'expected_status_label', 'is_correct'
     */
    function checkTeacherStatusWithoutUpdate($conn, $teacher_id) {
        // Prüfe ob status_id Spalte existiert
        $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
        
        if (!$has_status_id_column) {
            return null;
        }
        
        // Prüfe ob school_years und school_school_years Tabellen existieren
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        $has_school_years = $check_school_years && $check_school_years->num_rows > 0;
        $has_school_school_years = $check_school_school_years && $check_school_school_years->num_rows > 0;
        
        // Hole aktuellen Status und Lehrer-Daten
        $teacher_sql = "SELECT 
                        t.id,
                        t.status_id,
                        t.school_id,
                        u.email_verified
                      FROM teachers t
                      INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                      LEFT JOIN schools s ON t.school_id = s.id
                      WHERE t.id = ? LIMIT 1";
        
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            error_log("[check_all_teacher_status.php] Fehler bei Lehrer-Abfrage: " . $conn->error);
            return null;
        }
        
        $teacher_stmt->bind_param('i', $teacher_id);
        if (!$teacher_stmt->execute()) {
            error_log("[check_all_teacher_status.php] Fehler bei Lehrer-Abfrage: " . $teacher_stmt->error);
            $teacher_stmt->close();
            return null;
        }
        
        $teacher_result = $teacher_stmt->get_result();
        $teacher_data = $teacher_result->fetch_assoc();
        $teacher_stmt->close();
        
        if (!$teacher_data) {
            return null;
        }
        
        $current_status_id = $teacher_data['status_id'] ? (int)$teacher_data['status_id'] : null;
        $email_verified = isset($teacher_data['email_verified']) ? (int)$teacher_data['email_verified'] : 0;
        $school_id = $teacher_data['school_id'] ? (int)$teacher_data['school_id'] : null;
        
        // Prüfe Förderung der Schule separat (wichtig: zuerst prüfen, bevor Infowebinar-Status geprüft wird)
        $school_foerderung = false;
        if ($school_id && $has_school_years && $has_school_school_years) {
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
        
        // Prüfe ob Klasse existiert
        $class_sql = "SELECT COUNT(*) AS class_count FROM classes WHERE teacher_id = ?";
        $class_stmt = $conn->prepare($class_sql);
        $has_class = false;
        if ($class_stmt) {
            $class_stmt->bind_param('i', $teacher_id);
            if ($class_stmt->execute()) {
                $class_result = $class_stmt->get_result();
                $class_row = $class_result->fetch_assoc();
                $has_class = (int)($class_row['class_count'] ?? 0) > 0;
            }
            $class_stmt->close();
        }
        
        // Hole alle Status-IDs und order-Werte
        $status_sql = "SELECT id, `order`, label FROM teacher_stati ORDER BY `order` ASC";
        $status_result = $conn->query($status_sql);
        $status_map = [];
        if ($status_result) {
            while ($row = $status_result->fetch_assoc()) {
                $status_map[$row['label']] = [
                    'id' => (int)$row['id'],
                    'order' => (int)$row['order']
                ];
            }
        }
        
        // Bestimme erwarteten Status basierend auf Bedingungen
        $expected_status_id = null;
        $expected_status_label = null;
        
        // Status 1-2: E-Mail-Verifizierung
        if ($email_verified !== 1) {
            // E-Mail nicht verifiziert -> Status 1
            if (isset($status_map['email_bestaetigen'])) {
                $expected_status_id = $status_map['email_bestaetigen']['id'];
                $expected_status_label = 'email_bestaetigen';
            }
        } else {
            // E-Mail verifiziert
            // Prüfe zuerst ob auf Warteliste (Status 3)
            $on_waitlist = false;
            $check_waitlist = $conn->query("SHOW TABLES LIKE 'teacher_waitlist'");
            if ($check_waitlist && $check_waitlist->num_rows > 0) {
                $waitlist_sql = "SELECT COUNT(*) AS count FROM teacher_waitlist WHERE teacher_id = ? AND status = 'pending'";
                $waitlist_stmt = $conn->prepare($waitlist_sql);
                if ($waitlist_stmt) {
                    $waitlist_stmt->bind_param('i', $teacher_id);
                    if ($waitlist_stmt->execute()) {
                        $waitlist_result = $waitlist_stmt->get_result();
                        $waitlist_row = $waitlist_result->fetch_assoc();
                        $on_waitlist = (int)($waitlist_row['count'] ?? 0) > 0;
                    }
                    $waitlist_stmt->close();
                }
            }
            
            if ($on_waitlist) {
                // Auf Warteliste -> Status 3
                if (isset($status_map['warteliste_schule'])) {
                    $expected_status_id = $status_map['warteliste_schule']['id'];
                    $expected_status_label = 'warteliste_schule';
                }
            } elseif (!$school_id) {
                // Keine Schule zugewiesen -> Status 2
                if (isset($status_map['schule_verbinden'])) {
                    $expected_status_id = $status_map['schule_verbinden']['id'];
                    $expected_status_label = 'schule_verbinden';
                }
            } else {
                // Schule zugewiesen
                if ($school_foerderung) {
                    // Schule gefördert -> Status 8
                    if (isset($status_map['schule_aktiv'])) {
                        $expected_status_id = $status_map['schule_aktiv']['id'];
                        $expected_status_label = 'schule_aktiv';
                    }
                } else {
                    // Schule nicht gefördert
                    // Prüfe ob Infowebinar-Anmeldung existiert
                    $has_infowebinar_registration = false;
                    $infowebinar_participated = null; // null, true oder false
                    $check_participation = $conn->query("SHOW TABLES LIKE 'infowebinar_participation'");
                    if ($check_participation && $check_participation->num_rows > 0) {
                        $participation_sql = "SELECT participated FROM infowebinar_participation WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 1";
                        $participation_stmt = $conn->prepare($participation_sql);
                        if ($participation_stmt) {
                            $participation_stmt->bind_param('i', $teacher_id);
                            if ($participation_stmt->execute()) {
                                $participation_result = $participation_stmt->get_result();
                                if ($participation_row = $participation_result->fetch_assoc()) {
                                    $has_infowebinar_registration = true;
                                    // Speichere participated-Wert (kann null, true oder false sein)
                                    if ($participation_row['participated'] === null) {
                                        $infowebinar_participated = null;
                                    } elseif ($participation_row['participated'] === 1 || $participation_row['participated'] === true) {
                                        $infowebinar_participated = true;
                                    } else {
                                        $infowebinar_participated = false;
                                    }
                                }
                            }
                            $participation_stmt->close();
                        }
                    }
                    
                    if ($has_infowebinar_registration) {
                        if ($infowebinar_participated === false) {
                            // Nicht teilgenommen -> Status 7 (nicht_teilgenommen)
                            if (isset($status_map['nicht_teilgenommen'])) {
                                $expected_status_id = $status_map['nicht_teilgenommen']['id'];
                                $expected_status_label = 'nicht_teilgenommen';
                            }
                        } else {
                            // Angemeldet (NULL) oder teilgenommen (TRUE) -> Status 6 (infowebinar_gebucht)
                            if (isset($status_map['infowebinar_gebucht'])) {
                                $expected_status_id = $status_map['infowebinar_gebucht']['id'];
                                $expected_status_label = 'infowebinar_gebucht';
                            }
                        }
                    } else {
                        // Keine Anmeldung -> Status 4
                        if (isset($status_map['infowebinar_besuchen'])) {
                            $expected_status_id = $status_map['infowebinar_besuchen']['id'];
                            $expected_status_label = 'infowebinar_besuchen';
                        }
                    }
                }
            }
        }
        
        // Status 9: Klasse erstellt (wenn höher als Status 4/8)
        if ($has_class && isset($status_map['klasse_erstellt'])) {
            $klasse_order = $status_map['klasse_erstellt']['order'];
            if ($expected_status_id === null || $klasse_order > $status_map[$expected_status_label]['order']) {
                $expected_status_id = $status_map['klasse_erstellt']['id'];
                $expected_status_label = 'klasse_erstellt';
            }
        }
        
        // Status 10-19: Prüfe mit bestehender Funktion (aber ohne Update)
        // Hole die Daten für Status 10-19
        $base_condition = "c.teacher_id = ? 
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        
        // Schüler-Daten
        $students_sql = "SELECT 
                    COALESCE(SUM(s.t_coins), 0) AS total_t_coins,
                    COUNT(DISTINCT s.id) AS student_count,
                    COUNT(DISTINCT CASE WHEN s.t_coins > 5 THEN s.id END) AS students_with_5plus_tcoins,
                    COUNT(DISTINCT CASE WHEN COALESCE(s.t_coins, 0) >= 100 THEN s.id END) AS students_with_100plus_tcoins
                FROM students s 
                INNER JOIN classes c ON s.class_id = c.id 
                WHERE $base_condition";
        
        // Projekt-Daten
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;
        
        $projects_sql = "SELECT 
                    COUNT(DISTINCT p.id) AS total_projects,
                    COUNT(DISTINCT CASE WHEN p.status = 'check' THEN p.id END) AS projects_check,
                    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) AS projects_published,
                    COUNT(DISTINCT CASE WHEN COALESCE(p.likes, 0) >= 3 THEN p.id END) AS projects_3plus_likes
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE $base_condition";
        
        $students_stmt = $conn->prepare($students_sql);
        $students_data = null;
        if ($students_stmt) {
            $students_stmt->bind_param('i', $teacher_id);
            if ($students_stmt->execute()) {
                $students_result = $students_stmt->get_result();
                $students_data = $students_result->fetch_assoc();
            }
            $students_stmt->close();
        }
        
        $projects_stmt = $conn->prepare($projects_sql);
        $projects_data = null;
        if ($projects_stmt) {
            $projects_stmt->bind_param('i', $teacher_id);
            if ($projects_stmt->execute()) {
                $projects_result = $projects_stmt->get_result();
                $projects_data = $projects_result->fetch_assoc();
            }
            $projects_stmt->close();
        }
        
        // Prüfe Status 10-19 wenn Daten vorhanden
        if ($students_data && $projects_data) {
            $total_t_coins = (int)($students_data['total_t_coins'] ?? 0);
            $student_count = (int)($students_data['student_count'] ?? 0);
            $students_with_5plus_tcoins = (int)($students_data['students_with_5plus_tcoins'] ?? 0);
            $students_with_100plus_tcoins = (int)($students_data['students_with_100plus_tcoins'] ?? 0);
            
            $total_projects = (int)($projects_data['total_projects'] ?? 0);
            $projects_check = (int)($projects_data['projects_check'] ?? 0);
            $projects_published = (int)($projects_data['projects_published'] ?? 0);
            $projects_3plus_likes = (int)($projects_data['projects_3plus_likes'] ?? 0);
            
            // Hole order des aktuell erwarteten Status
            $current_expected_order = $expected_status_id ? $status_map[$expected_status_label]['order'] : 0;
            
            // Status 10: 10 T!Coins gesammelt
            if (isset($status_map['10_tcoins_gesammelt'])) {
                $required_t_coins = 10 + $student_count;
                if ($total_t_coins >= $required_t_coins && $status_map['10_tcoins_gesammelt']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['10_tcoins_gesammelt']['id'];
                    $expected_status_label = '10_tcoins_gesammelt';
                    $current_expected_order = $status_map['10_tcoins_gesammelt']['order'];
                }
            }
            
            // Status 11: 10 Schüler haben mehr als 5 T!Coins
            if (isset($status_map['10_schueler_5_tcoins']) && $students_with_5plus_tcoins >= 10) {
                if ($status_map['10_schueler_5_tcoins']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['10_schueler_5_tcoins']['id'];
                    $expected_status_label = '10_schueler_5_tcoins';
                    $current_expected_order = $status_map['10_schueler_5_tcoins']['order'];
                }
            }
            
            // Status 12: 5 Projekte erstellt
            if (isset($status_map['5_projekte_erstellt']) && $total_projects >= 5) {
                if ($status_map['5_projekte_erstellt']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['5_projekte_erstellt']['id'];
                    $expected_status_label = '5_projekte_erstellt';
                    $current_expected_order = $status_map['5_projekte_erstellt']['order'];
                }
            }
            
            // Status 13: Erstes Projekt eingereicht
            if ($has_status_column && isset($status_map['erstes_projekt_eingereicht']) && $projects_check >= 1) {
                if ($status_map['erstes_projekt_eingereicht']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['erstes_projekt_eingereicht']['id'];
                    $expected_status_label = 'erstes_projekt_eingereicht';
                    $current_expected_order = $status_map['erstes_projekt_eingereicht']['order'];
                }
            }
            
            // Status 14: Erstes Projekt mit Bewertung
            if ($has_status_column && isset($status_map['erstes_projekt_bewertet']) && $projects_published >= 1) {
                if ($status_map['erstes_projekt_bewertet']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['erstes_projekt_bewertet']['id'];
                    $expected_status_label = 'erstes_projekt_bewertet';
                    $current_expected_order = $status_map['erstes_projekt_bewertet']['order'];
                }
            }
            
            // Status 15: Projekt öffentlich
            if ($has_status_column && isset($status_map['projekt_oeffentlich']) && $projects_published >= 1) {
                if ($status_map['projekt_oeffentlich']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['projekt_oeffentlich']['id'];
                    $expected_status_label = 'projekt_oeffentlich';
                    $current_expected_order = $status_map['projekt_oeffentlich']['order'];
                }
            }
            
            // Status 16: Projekt mit 3+ Likes
            if ($has_likes_column && isset($status_map['projekt_3_likes']) && $projects_3plus_likes >= 1) {
                if ($status_map['projekt_3_likes']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['projekt_3_likes']['id'];
                    $expected_status_label = 'projekt_3_likes';
                    $current_expected_order = $status_map['projekt_3_likes']['order'];
                }
            }
            
            // Status 17: 10+ Projekte veröffentlicht
            if ($has_status_column && isset($status_map['10_projekte_veroeffentlicht']) && $projects_published >= 10) {
                if ($status_map['10_projekte_veroeffentlicht']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['10_projekte_veroeffentlicht']['id'];
                    $expected_status_label = '10_projekte_veroeffentlicht';
                    $current_expected_order = $status_map['10_projekte_veroeffentlicht']['order'];
                }
            }
            
            // Status 18: 1 Schüler hat 100+ T!Coins
            if (isset($status_map['1_schueler_100_punkte']) && $students_with_100plus_tcoins >= 1) {
                if ($status_map['1_schueler_100_punkte']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['1_schueler_100_punkte']['id'];
                    $expected_status_label = '1_schueler_100_punkte';
                    $current_expected_order = $status_map['1_schueler_100_punkte']['order'];
                }
            }
            
            // Status 19: 3 Schüler haben 100+ T!Coins
            if (isset($status_map['3_schueler_100_punkte']) && $students_with_100plus_tcoins >= 3) {
                if ($status_map['3_schueler_100_punkte']['order'] > $current_expected_order) {
                    $expected_status_id = $status_map['3_schueler_100_punkte']['id'];
                    $expected_status_label = '3_schueler_100_punkte';
                    $current_expected_order = $status_map['3_schueler_100_punkte']['order'];
                }
            }
        }
        
        // Prüfe ob Status korrekt ist
        $is_correct = ($current_status_id === $expected_status_id);
        
        return [
            'teacher_id' => $teacher_id,
            'current_status_id' => $current_status_id,
            'expected_status_id' => $expected_status_id,
            'expected_status_label' => $expected_status_label,
            'is_correct' => $is_correct
        ];
    }
    
    /**
     * Prüft alle Lehrer und gibt einen Report zurück
     * 
     * @param mysqli $conn Datenbankverbindung
     * @return array Report mit allen Ergebnissen
     */
    function checkAllTeachersStatus($conn) {
        // Hole alle Lehrer
        $teachers_sql = "SELECT t.id, u.first_name, u.last_name, u.email, t.status_id
                        FROM teachers t
                        INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                        ORDER BY t.id ASC";
        
        $teachers_result = $conn->query($teachers_sql);
        if (!$teachers_result) {
            error_log("[check_all_teacher_status.php] Fehler bei Lehrer-Abfrage: " . $conn->error);
            return null;
        }
        
        $all_results = [];
        $inconsistent_teachers = [];
        $summary = [
            'total' => 0,
            'correct' => 0,
            'incorrect' => 0,
            'by_status' => []
        ];
        
        while ($teacher_row = $teachers_result->fetch_assoc()) {
            $teacher_id = (int)$teacher_row['id'];
            $summary['total']++;
            
            $result = checkTeacherStatusWithoutUpdate($conn, $teacher_id);
            
            if ($result) {
                $result['first_name'] = $teacher_row['first_name'];
                $result['last_name'] = $teacher_row['last_name'];
                $result['email'] = $teacher_row['email'];
                
                $all_results[] = $result;
                
                if ($result['is_correct']) {
                    $summary['correct']++;
                } else {
                    $summary['incorrect']++;
                    $inconsistent_teachers[] = $result;
                    
                    // Zähle nach Status
                    $status_label = $result['expected_status_label'] ?? 'unknown';
                    if (!isset($summary['by_status'][$status_label])) {
                        $summary['by_status'][$status_label] = 0;
                    }
                    $summary['by_status'][$status_label]++;
                }
            }
        }
        
        return [
            'all_results' => $all_results,
            'inconsistent_teachers' => $inconsistent_teachers,
            'summary' => $summary
        ];
    }
?>

