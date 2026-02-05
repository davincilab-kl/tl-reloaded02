<?php
    /**
     * Zentrale Funktion zur Prüfung und Aktualisierung des Lehrer-Status
     * Basierend auf Schüler-Aktivitäten (T!Coins, Projekte, etc.)
     */
    
    require_once __DIR__ . '/../config/access_db.php';
    
    /**
     * Aktualisiert den Status einer Lehrkraft nur, wenn der neue Status eine höhere order hat
     * Verhindert, dass der Status auf einen niedrigeren order-Wert zurückgesetzt wird
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @param int $new_status_id ID des neuen Status
     * @return bool true wenn Status aktualisiert wurde, false wenn nicht (z.B. weil order zu niedrig)
     */
    function updateTeacherStatusIfHigher($conn, $teacher_id, $new_status_id) {
        // Prüfe ob status_id Spalte existiert
        $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
        
        if (!$has_status_id_column) {
            return false;
        }
        
        // Hole aktuellen Status des Lehrers
        $current_status_sql = "SELECT status_id FROM teachers WHERE id = ? LIMIT 1";
        $current_status_stmt = $conn->prepare($current_status_sql);
        if (!$current_status_stmt) {
            error_log("[check_teacher_status.php] Fehler beim Vorbereiten der Status-Abfrage: " . $conn->error);
            return false;
        }
        
        $current_status_stmt->bind_param('i', $teacher_id);
        if (!$current_status_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler beim Ausführen der Status-Abfrage: " . $current_status_stmt->error);
            $current_status_stmt->close();
            return false;
        }
        
        $current_status_result = $current_status_stmt->get_result();
        $current_status_row = $current_status_result->fetch_assoc();
        $current_status_id = $current_status_row ? (int)$current_status_row['status_id'] : null;
        $current_status_stmt->close();
        
        // Wenn kein aktueller Status vorhanden, setze den neuen Status
        if ($current_status_id === null) {
            $update_status_sql = "UPDATE teachers SET status_id = ? WHERE id = ?";
            $update_status_stmt = $conn->prepare($update_status_sql);
            if ($update_status_stmt) {
                $update_status_stmt->bind_param('ii', $new_status_id, $teacher_id);
                if ($update_status_stmt->execute()) {
                    $update_status_stmt->close();
                    return true;
                }
                $update_status_stmt->close();
            }
            return false;
        }
        
        // Hole order-Werte beider Stati
        $order_sql = "SELECT id, `order` FROM teacher_stati WHERE id IN (?, ?)";
        $order_stmt = $conn->prepare($order_sql);
        if (!$order_stmt) {
            error_log("[check_teacher_status.php] Fehler beim Vorbereiten der Order-Abfrage: " . $conn->error);
            return false;
        }
        
        $order_stmt->bind_param('ii', $current_status_id, $new_status_id);
        if (!$order_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler beim Ausführen der Order-Abfrage: " . $order_stmt->error);
            $order_stmt->close();
            return false;
        }
        
        $order_result = $order_stmt->get_result();
        $current_order = 0;
        $new_order = 0;
        
        while ($row = $order_result->fetch_assoc()) {
            if ((int)$row['id'] === $current_status_id) {
                $current_order = (int)$row['order'];
            }
            if ((int)$row['id'] === $new_status_id) {
                $new_order = (int)$row['order'];
            }
        }
        $order_stmt->close();
        
        // Nur updaten, wenn neuer Status eine höhere order hat
        if ($new_order > $current_order) {
            $update_status_sql = "UPDATE teachers SET status_id = ? WHERE id = ?";
            $update_status_stmt = $conn->prepare($update_status_sql);
            if ($update_status_stmt) {
                $update_status_stmt->bind_param('ii', $new_status_id, $teacher_id);
                if ($update_status_stmt->execute()) {
                    $update_status_stmt->close();
                    return true;
                } else {
                    error_log("[check_teacher_status.php] Fehler beim Aktualisieren des Status: " . $update_status_stmt->error);
                    $update_status_stmt->close();
                }
            }
        }
        
        return false;
    }
    
    /**
     * Prüft alle relevanten Status-Bedingungen für einen Lehrer und aktualisiert den Status falls nötig
     * Alle Prüfungen werden in zentralen Abfragen durchgeführt, um die Performance zu optimieren
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return int|null Status-ID die gesetzt wurde, oder null wenn kein Update nötig war
     */
    function checkAndUpdateTeacherStatus($conn, $teacher_id) {
        // Prüfe ob status_id Spalte existiert
        $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
        
        if (!$has_status_id_column) {
            return null;
        }
        
        // Hole aktuellen Status des Lehrers
        $current_status_sql = "SELECT status_id FROM teachers WHERE id = ? LIMIT 1";
        $current_status_stmt = $conn->prepare($current_status_sql);
        if (!$current_status_stmt) {
            error_log("[check_teacher_status.php] Fehler beim Vorbereiten der Status-Abfrage: " . $conn->error);
            return null;
        }
        
        $current_status_stmt->bind_param('i', $teacher_id);
        if (!$current_status_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler beim Ausführen der Status-Abfrage: " . $current_status_stmt->error);
            $current_status_stmt->close();
            return null;
        }
        
        $current_status_result = $current_status_stmt->get_result();
        $current_status_row = $current_status_result->fetch_assoc();
        $current_status_id = $current_status_row ? (int)$current_status_row['status_id'] : null;
        $current_status_stmt->close();
        
        if ($current_status_id === null) {
            return null;
        }
        
        // Hole order-Wert des aktuellen Status
        $current_order_sql = "SELECT `order` FROM teacher_stati WHERE id = ? LIMIT 1";
        $current_order_stmt = $conn->prepare($current_order_sql);
        if (!$current_order_stmt) {
            error_log("[check_teacher_status.php] Fehler beim Vorbereiten der Order-Abfrage: " . $conn->error);
            return null;
        }
        
        $current_order_stmt->bind_param('i', $current_status_id);
        if (!$current_order_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler beim Ausführen der Order-Abfrage: " . $current_order_stmt->error);
            $current_order_stmt->close();
            return null;
        }
        
        $current_order_result = $current_order_stmt->get_result();
        $current_order_row = $current_order_result->fetch_assoc();
        $current_order = $current_order_row ? (int)$current_order_row['order'] : 0;
        $current_order_stmt->close();
        
        // Prüfe ob benötigte Spalten existieren
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;
        
        // Zentrale Abfrage: Hole alle benötigten Daten in einem Durchgang
        $base_condition = "c.teacher_id = ? 
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        
        // Schüler-Daten (für Status 10, 11, 18, 19)
        $students_sql = "SELECT 
                    COALESCE(SUM(s.t_coins), 0) AS total_t_coins,
                    COUNT(DISTINCT s.id) AS student_count,
                    COUNT(DISTINCT CASE WHEN s.t_coins > 5 THEN s.id END) AS students_with_5plus_tcoins,
                    COUNT(DISTINCT CASE WHEN COALESCE(s.t_coins, 0) >= 100 THEN s.id END) AS students_with_100plus_tcoins
                FROM students s 
                INNER JOIN classes c ON s.class_id = c.id 
                WHERE $base_condition";
        
        // Projekt-Daten (für Status 12, 13, 14, 15, 16, 17)
        $projects_sql = "SELECT 
                    COUNT(DISTINCT p.id) AS total_projects,
                    COUNT(DISTINCT CASE WHEN p.status = 'check' THEN p.id END) AS projects_check,
                    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) AS projects_published,
                    COUNT(DISTINCT CASE WHEN COALESCE(p.likes, 0) >= 3 THEN p.id END) AS projects_3plus_likes
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE $base_condition";
        
        // Führe beide Abfragen aus
        $students_stmt = $conn->prepare($students_sql);
        if (!$students_stmt) {
            error_log("[check_teacher_status.php] Fehler bei Schüler-Abfrage: " . $conn->error);
            return null;
        }
        
        $students_stmt->bind_param('i', $teacher_id);
        if (!$students_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Schüler-Abfrage: " . $students_stmt->error);
            $students_stmt->close();
            return null;
        }
        
        $students_result = $students_stmt->get_result();
        $students_data = $students_result->fetch_assoc();
        $students_stmt->close();
        
        $projects_stmt = $conn->prepare($projects_sql);
        if (!$projects_stmt) {
            error_log("[check_teacher_status.php] Fehler bei Projekt-Abfrage: " . $conn->error);
            return null;
        }
        
        $projects_stmt->bind_param('i', $teacher_id);
        if (!$projects_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Projekt-Abfrage: " . $projects_stmt->error);
            $projects_stmt->close();
            return null;
        }
        
        $projects_result = $projects_stmt->get_result();
        $projects_data = $projects_result->fetch_assoc();
        $projects_stmt->close();
        
        // Extrahiere Werte
        $total_t_coins = (int)($students_data['total_t_coins'] ?? 0);
        $student_count = (int)($students_data['student_count'] ?? 0);
        $students_with_5plus_tcoins = (int)($students_data['students_with_5plus_tcoins'] ?? 0);
        $students_with_100plus_tcoins = (int)($students_data['students_with_100plus_tcoins'] ?? 0);
        
        $total_projects = (int)($projects_data['total_projects'] ?? 0);
        $projects_check = (int)($projects_data['projects_check'] ?? 0);
        $projects_published = (int)($projects_data['projects_published'] ?? 0);
        $projects_3plus_likes = (int)($projects_data['projects_3plus_likes'] ?? 0);
        
        // Hole alle Status-IDs und order-Werte in einer Abfrage
        $status_labels = [
            '10_tcoins_gesammelt',
            '10_schueler_5_tcoins',
            '5_projekte_erstellt',
            'erstes_projekt_eingereicht',
            'erstes_projekt_bewertet',
            'projekt_oeffentlich',
            'projekt_3_likes',
            '10_projekte_veroeffentlicht',
            '1_schueler_100_punkte',
            '3_schueler_100_punkte'
        ];
        
        $placeholders = implode(',', array_fill(0, count($status_labels), '?'));
        $status_sql = "SELECT id, `order`, label FROM teacher_stati WHERE label IN ($placeholders)";
        $status_stmt = $conn->prepare($status_sql);
        
        if (!$status_stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status-Abfrage: " . $conn->error);
            return null;
        }
        
        $status_stmt->bind_param(str_repeat('s', count($status_labels)), ...$status_labels);
        if (!$status_stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status-Abfrage: " . $status_stmt->error);
            $status_stmt->close();
            return null;
        }
        
        $status_result = $status_stmt->get_result();
        $status_map = [];
        while ($row = $status_result->fetch_assoc()) {
            $status_map[$row['label']] = [
                'id' => (int)$row['id'],
                'order' => (int)$row['order']
            ];
        }
        $status_stmt->close();
        
        // Prüfe alle Status-Bedingungen und finde den höchsten erfüllten Status
        $highest_status_id = null;
        $highest_order = $current_order;
        
        // Status 10: 10 T!Coins gesammelt (>= 10 + Anzahl Schüler)
        if (isset($status_map['10_tcoins_gesammelt'])) {
            $required_t_coins = 10 + $student_count;
            if ($total_t_coins >= $required_t_coins && $status_map['10_tcoins_gesammelt']['order'] > $highest_order) {
                $highest_status_id = $status_map['10_tcoins_gesammelt']['id'];
                $highest_order = $status_map['10_tcoins_gesammelt']['order'];
            }
        }
        
        // Status 11: 10 Schüler haben mehr als 5 T!Coins
        if (isset($status_map['10_schueler_5_tcoins']) && $students_with_5plus_tcoins >= 10) {
            if ($status_map['10_schueler_5_tcoins']['order'] > $highest_order) {
                $highest_status_id = $status_map['10_schueler_5_tcoins']['id'];
                $highest_order = $status_map['10_schueler_5_tcoins']['order'];
            }
        }
        
        // Status 12: 5 Projekte erstellt
        if (isset($status_map['5_projekte_erstellt']) && $total_projects >= 5) {
            if ($status_map['5_projekte_erstellt']['order'] > $highest_order) {
                $highest_status_id = $status_map['5_projekte_erstellt']['id'];
                $highest_order = $status_map['5_projekte_erstellt']['order'];
            }
        }
        
        // Status 13: Erstes Projekt eingereicht
        if ($has_status_column && isset($status_map['erstes_projekt_eingereicht']) && $projects_check >= 1) {
            if ($status_map['erstes_projekt_eingereicht']['order'] > $highest_order) {
                $highest_status_id = $status_map['erstes_projekt_eingereicht']['id'];
                $highest_order = $status_map['erstes_projekt_eingereicht']['order'];
            }
        }
        
        // Status 14: Erstes Projekt mit Bewertung von Lehrkraft
        if ($has_status_column && isset($status_map['erstes_projekt_bewertet']) && $projects_published >= 1) {
            if ($status_map['erstes_projekt_bewertet']['order'] > $highest_order) {
                $highest_status_id = $status_map['erstes_projekt_bewertet']['id'];
                $highest_order = $status_map['erstes_projekt_bewertet']['order'];
            }
        }
        
        // Status 15: Projekt öffentlich
        if ($has_status_column && isset($status_map['projekt_oeffentlich']) && $projects_published >= 1) {
            if ($status_map['projekt_oeffentlich']['order'] > $highest_order) {
                $highest_status_id = $status_map['projekt_oeffentlich']['id'];
                $highest_order = $status_map['projekt_oeffentlich']['order'];
            }
        }
        
        // Status 16: Projekt mit 3+ Likes
        if ($has_likes_column && isset($status_map['projekt_3_likes']) && $projects_3plus_likes >= 1) {
            if ($status_map['projekt_3_likes']['order'] > $highest_order) {
                $highest_status_id = $status_map['projekt_3_likes']['id'];
                $highest_order = $status_map['projekt_3_likes']['order'];
            }
        }
        
        // Status 17: 10+ Projekte veröffentlicht
        if ($has_status_column && isset($status_map['10_projekte_veroeffentlicht']) && $projects_published >= 10) {
            if ($status_map['10_projekte_veroeffentlicht']['order'] > $highest_order) {
                $highest_status_id = $status_map['10_projekte_veroeffentlicht']['id'];
                $highest_order = $status_map['10_projekte_veroeffentlicht']['order'];
            }
        }
        
        // Status 18: 1 Schüler hat 100+ T!Coins
        if (isset($status_map['1_schueler_100_punkte']) && $students_with_100plus_tcoins >= 1) {
            if ($status_map['1_schueler_100_punkte']['order'] > $highest_order) {
                $highest_status_id = $status_map['1_schueler_100_punkte']['id'];
                $highest_order = $status_map['1_schueler_100_punkte']['order'];
            }
        }
        
        // Status 19: 3 Schüler haben 100+ T!Coins
        if (isset($status_map['3_schueler_100_punkte']) && $students_with_100plus_tcoins >= 3) {
            if ($status_map['3_schueler_100_punkte']['order'] > $highest_order) {
                $highest_status_id = $status_map['3_schueler_100_punkte']['id'];
                $highest_order = $status_map['3_schueler_100_punkte']['order'];
            }
        }
        
        // Update Status falls nötig (verwende Hilfsfunktion, die verhindert, dass Status zurückgesetzt wird)
        if ($highest_status_id !== null && $highest_order > $current_order) {
            if (updateTeacherStatusIfHigher($conn, $teacher_id, $highest_status_id)) {
                return $highest_status_id;
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 10: 10 T!Coins gesammelt (Summe aller T!Coins der Schüler >= 10 + Anzahl Schüler)
     * Jeder Schüler erhält bei der Erstellung bereits 1 T!Coin, daher wird die Anzahl Schüler addiert
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus10($conn, $teacher_id) {
        // Summe aller T!Coins und Anzahl der Schüler des Lehrers
        $sql = "SELECT 
                    COALESCE(SUM(s.t_coins), 0) AS total_t_coins,
                    COUNT(DISTINCT s.id) AS student_count
                FROM students s 
                INNER JOIN classes c ON s.class_id = c.id 
                WHERE c.teacher_id = ? 
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 10 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 10 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $total_t_coins = (int)($row['total_t_coins'] ?? 0);
        $student_count = (int)($row['student_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 10 + Anzahl Schüler T!Coins)
        // Jeder Schüler erhält bei Erstellung 1 T!Coin, daher wird die Anzahl addiert
        $required_t_coins = 10 + $student_count;
        if ($total_t_coins >= $required_t_coins) {
            // Hole Status-ID über Label
            $status_label = '10_tcoins_gesammelt';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 11: 10 Schüler haben mehr als 5 T!Coins gesammelt
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus11($conn, $teacher_id) {
        // Zähle Schüler mit mehr als 5 T!Coins
        $sql = "SELECT COUNT(DISTINCT s.id) AS student_count
                FROM students s 
                INNER JOIN classes c ON s.class_id = c.id 
                WHERE c.teacher_id = ? 
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND s.t_coins > 5";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 11 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 11 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $student_count = (int)($row['student_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 10 Schüler)
        if ($student_count >= 10) {
            // Hole Status-ID über Label
            $status_label = '10_schueler_5_tcoins';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 12: 5 Projekte erstellt
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus12($conn, $teacher_id) {
        // Zähle alle Projekte der Schüler des Lehrers
        $sql = "SELECT COUNT(DISTINCT p.id) AS project_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 12 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 12 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $project_count = (int)($row['project_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 5 Projekte)
        if ($project_count >= 5) {
            // Hole Status-ID über Label
            $status_label = '5_projekte_erstellt';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 13: Erstes Projekt eingereicht (mindestens 1 Projekt mit Status 'check')
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus13($conn, $teacher_id) {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        if (!$has_status_column) {
            // Wenn status Spalte nicht existiert, kann kein Projekt eingereicht sein
            return null;
        }
        
        // Zähle Projekte mit Status 'check' der Schüler des Lehrers
        $sql = "SELECT COUNT(DISTINCT p.id) AS project_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND p.status = 'check'";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 13 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 13 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $project_count = (int)($row['project_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 1 Projekt mit Status 'check')
        if ($project_count >= 1) {
            // Hole Status-ID über Label
            $status_label = 'erstes_projekt_eingereicht';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 14: Erstes Projekt mit Bewertung von Lehrkraft
     * Ein Projekt wurde bewertet, wenn es akzeptiert (published) wurde
     * Da der allgemeine Sicherheitsmechanismus verhindert, dass der Status zurückgesetzt wird,
     * reicht es, den Status einmal zu setzen - er bleibt dann erhalten.
     * Beim Ablehnen wird auch checkAndUpdateTeacherStatus() aufgerufen, aber wenn noch kein
     * 'published' Projekt existiert, wird Status 14 nicht gesetzt. Sobald das erste Projekt
     * akzeptiert wird, wird Status 14 gesetzt und bleibt dann erhalten.
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus14($conn, $teacher_id) {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        if (!$has_status_column) {
            // Wenn status Spalte nicht existiert, kann kein Projekt bewertet sein
            return null;
        }
        
        // Zähle Projekte mit Status 'published' (akzeptiert) der Schüler des Lehrers
        // Ein Projekt wurde bewertet, wenn es den Status 'published' hat (akzeptiert)
        $sql = "SELECT COUNT(DISTINCT p.id) AS project_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND p.status = 'published'";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 14 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 14 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $project_count = (int)($row['project_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 1 Projekt mit Status 'published')
        if ($project_count >= 1) {
            // Hole Status-ID über Label
            $status_label = 'erstes_projekt_bewertet';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 15: Projekt öffentlich
     * Mindestens ein Projekt der Schüler des Lehrers hat den Status 'published' (ist öffentlich)
     * 
     * Hinweis: Diese Bedingung ist identisch mit Status 14 (Erstes Projekt mit Bewertung von Lehrkraft).
     * Der Mechanismus wählt automatisch den Status mit der höheren order, daher gibt es keinen Konflikt.
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus15($conn, $teacher_id) {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        if (!$has_status_column) {
            // Wenn status Spalte nicht existiert, kann kein Projekt öffentlich sein
            return null;
        }
        
        // Zähle Projekte mit Status 'published' (öffentlich) der Schüler des Lehrers
        $sql = "SELECT COUNT(DISTINCT p.id) AS project_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND p.status = 'published'";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 15 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 15 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $project_count = (int)($row['project_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 1 Projekt mit Status 'published')
        if ($project_count >= 1) {
            // Hole Status-ID über Label
            $status_label = 'projekt_oeffentlich';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 16: Projekt mit 3+ Likes
     * Mindestens ein Projekt der Schüler des Lehrers hat 3 oder mehr Likes
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus16($conn, $teacher_id) {
        // Prüfe ob likes Spalte existiert
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;
        
        if (!$has_likes_column) {
            // Wenn likes Spalte nicht existiert, kann kein Projekt 3+ Likes haben
            return null;
        }
        
        // Zähle Projekte mit >= 3 Likes der Schüler des Lehrers
        $sql = "SELECT COUNT(DISTINCT p.id) AS project_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND COALESCE(p.likes, 0) >= 3";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 16 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 16 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $project_count = (int)($row['project_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 1 Projekt mit 3+ Likes)
        if ($project_count >= 1) {
            // Hole Status-ID über Label
            $status_label = 'projekt_3_likes';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 17: 10+ Projekte veröffentlicht
     * Mindestens 10 Projekte der Schüler des Lehrers haben den Status 'published' (sind veröffentlicht)
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus17($conn, $teacher_id) {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        if (!$has_status_column) {
            // Wenn status Spalte nicht existiert, können keine Projekte veröffentlicht sein
            return null;
        }
        
        // Zähle Projekte mit Status 'published' (veröffentlicht) der Schüler des Lehrers
        $sql = "SELECT COUNT(DISTINCT p.id) AS project_count
                FROM projects p
                INNER JOIN students s ON p.student_id = s.id
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND p.status = 'published'";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 17 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 17 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $project_count = (int)($row['project_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 10 Projekte mit Status 'published')
        if ($project_count >= 10) {
            // Hole Status-ID über Label
            $status_label = '10_projekte_veroeffentlicht';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 18: 1 Schüler hat 100+ T!Coins
     * Mindestens ein Schüler des Lehrers hat 100 oder mehr T!Coins gesammelt
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus18($conn, $teacher_id) {
        // Zähle Schüler mit >= 100 T!Coins des Lehrers
        $sql = "SELECT COUNT(DISTINCT s.id) AS student_count
                FROM students s
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND COALESCE(s.t_coins, 0) >= 100";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 18 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 18 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $student_count = (int)($row['student_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 1 Schüler mit 100+ T!Coins)
        if ($student_count >= 1) {
            // Hole Status-ID über Label
            $status_label = '1_schueler_100_punkte';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
    
    /**
     * Prüft Status 19: 3 Schüler haben 100+ T!Coins
     * Mindestens drei Schüler des Lehrers haben jeweils 100 oder mehr T!Coins gesammelt
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $teacher_id ID des Lehrers
     * @return array|null Array mit 'status_id' und 'order', oder null wenn Bedingung nicht erfüllt
     */
    function checkStatus19($conn, $teacher_id) {
        // Zähle Schüler mit >= 100 T!Coins des Lehrers
        $sql = "SELECT COUNT(DISTINCT s.id) AS student_count
                FROM students s
                INNER JOIN classes c ON s.class_id = c.id
                WHERE c.teacher_id = ?
                AND s.class_id IS NOT NULL
                AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
                AND COALESCE(s.t_coins, 0) >= 100";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("[check_teacher_status.php] Fehler bei Status 19 Prüfung: " . $conn->error);
            return null;
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            error_log("[check_teacher_status.php] Fehler bei Status 19 Prüfung: " . $stmt->error);
            $stmt->close();
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $student_count = (int)($row['student_count'] ?? 0);
        $stmt->close();
        
        // Prüfe ob Bedingung erfüllt ist (>= 3 Schüler mit 100+ T!Coins)
        if ($student_count >= 3) {
            // Hole Status-ID über Label
            $status_label = '3_schueler_100_punkte';
            $status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $status_stmt = $conn->prepare($status_sql);
            
            if ($status_stmt) {
                $status_stmt->bind_param('s', $status_label);
                $status_stmt->execute();
                $status_result = $status_stmt->get_result();
                
                if ($status_row = $status_result->fetch_assoc()) {
                    $status_stmt->close();
                    return [
                        'status_id' => (int)$status_row['id'],
                        'order' => (int)$status_row['order']
                    ];
                }
                $status_stmt->close();
            }
        }
        
        return null;
    }
?>

