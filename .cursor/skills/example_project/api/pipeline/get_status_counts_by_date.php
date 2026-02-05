<?php
    // Error-Logging aktivieren
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../../php_error.log');
    
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $conn = db_connect();

    // Parameter aus GET-Request
    $target_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    $get_max_only = isset($_GET['max_only']) && $_GET['max_only'] === 'true';
    $get_all_days = isset($_GET['all_days']) && $_GET['all_days'] === 'true';

    try {
        // Hole alle Stati
        $all_statuses_sql = "SELECT id, label, display_name, description FROM teacher_stati ORDER BY `order` ASC";
        $all_statuses_result = $conn->query($all_statuses_sql);
        $all_statuses = [];
        while ($row = $all_statuses_result->fetch_assoc()) {
            $all_statuses[] = [
                'status_id' => (int)$row['id'],
                'label' => $row['label'],
                'display_name' => $row['display_name'],
                'description' => $row['description']
            ];
        }
        
        // Bestimme Status jedes Lehrers zum gewählten Datum
        // Optimiert: Eine einzige Abfrage für alle Lehrer statt N+1 Abfragen
        $teacher_statuses = [];
        $target_datetime = $target_date . ' 23:59:59';
        
        // Hole alle Status-Änderungen bis zum gewählten Datum, gruppiert nach teacher_id
        // Verwende eine Window-Funktion oder Subquery, um den letzten Status pro Lehrer zu finden
        $status_sql = "SELECT tsh1.teacher_id, tsh1.status_id
                       FROM teacher_status_history tsh1
                       INNER JOIN (
                           SELECT teacher_id, MAX(changed_at) as max_changed_at
                           FROM teacher_status_history
                           WHERE changed_at <= ?
                           GROUP BY teacher_id
                       ) tsh2 ON tsh1.teacher_id = tsh2.teacher_id 
                              AND tsh1.changed_at = tsh2.max_changed_at
                       WHERE tsh1.changed_at <= ?";
        $status_stmt = $conn->prepare($status_sql);
        $status_stmt->bind_param('ss', $target_datetime, $target_datetime);
        $status_stmt->execute();
        $status_result = $status_stmt->get_result();
        
        while ($status_row = $status_result->fetch_assoc()) {
            $teacher_statuses[(int)$status_row['teacher_id']] = (int)$status_row['status_id'];
        }
        $status_stmt->close();
        
        // Zähle Lehrer pro Status
        $status_counts = [];
        foreach ($all_statuses as $status) {
            $status_counts[$status['status_id']] = 0;
        }
        
        foreach ($teacher_statuses as $status_id) {
            if (isset($status_counts[$status_id])) {
                $status_counts[$status_id]++;
            }
        }
        
        // Formatiere für Frontend
        $statusCounts = [];
        foreach ($all_statuses as $status) {
            $statusCounts[] = [
                'id' => $status['status_id'],
                'label' => $status['label'],
                'display_name' => $status['display_name'],
                'description' => $status['description'],
                'count' => $status_counts[$status['status_id']]
            ];
        }

        // Wenn nur Maximalwert gewünscht, berechne für alle Tage im Zeitraum (optimiert)
        if ($get_max_only) {
            $start_date = date('Y-m-d', strtotime('-29 days'));
            $end_date = date('Y-m-d');
            $start_datetime = $start_date . ' 00:00:00';
            $end_datetime = $end_date . ' 23:59:59';
            
            // Lade alle Status-Änderungen bis zum Enddatum (nicht nur im Zeitraum)
            $history_sql = "SELECT teacher_id, status_id, changed_at 
                          FROM teacher_status_history 
                          WHERE changed_at <= ?
                          ORDER BY changed_at ASC";
            $history_stmt = $conn->prepare($history_sql);
            $history_stmt->bind_param('s', $end_datetime);
            $history_stmt->execute();
            $history_result = $history_stmt->get_result();
            
            $all_changes = [];
            while ($row = $history_result->fetch_assoc()) {
                $all_changes[] = [
                    'teacher_id' => (int)$row['teacher_id'],
                    'status_id' => (int)$row['status_id'],
                    'changed_at' => $row['changed_at']
                ];
            }
            $history_stmt->close();
            
            // Initialisiere Status-Array mit Statusen, die vor dem Startdatum existierten
            // Optimiert: Eine einzige Abfrage für alle Lehrer statt N+1 Abfragen
            $teacher_statuses = [];
            $init_sql = "SELECT tsh1.teacher_id, tsh1.status_id
                         FROM teacher_status_history tsh1
                         INNER JOIN (
                             SELECT teacher_id, MAX(changed_at) as max_changed_at
                             FROM teacher_status_history
                             WHERE changed_at < ?
                             GROUP BY teacher_id
                         ) tsh2 ON tsh1.teacher_id = tsh2.teacher_id 
                                AND tsh1.changed_at = tsh2.max_changed_at
                         WHERE tsh1.changed_at < ?";
            $init_stmt = $conn->prepare($init_sql);
            $init_stmt->bind_param('ss', $start_datetime, $start_datetime);
            $init_stmt->execute();
            $init_result = $init_stmt->get_result();
            while ($init_row = $init_result->fetch_assoc()) {
                $teacher_statuses[(int)$init_row['teacher_id']] = (int)$init_row['status_id'];
            }
            $init_stmt->close();
            
            // Generiere alle Tage im Zeitraum
            $current_date = new DateTime($start_date);
            $end_datetime_obj = new DateTime($end_date);
            $max_count = 0;
            $change_index = 0;
            
            while ($current_date <= $end_datetime_obj) {
                $check_date = $current_date->format('Y-m-d');
                $check_datetime = $check_date . ' 23:59:59';
                
                // Wende alle Änderungen an, die bis zu diesem Zeitpunkt passiert sind
                while ($change_index < count($all_changes) && $all_changes[$change_index]['changed_at'] <= $check_datetime) {
                    $change = $all_changes[$change_index];
                    $teacher_statuses[$change['teacher_id']] = $change['status_id'];
                    $change_index++;
                }
                
                // Zähle Lehrer pro Status für diesen Tag
                $day_status_counts = [];
                foreach ($all_statuses as $status) {
                    $day_status_counts[$status['status_id']] = 0;
                }
                
                foreach ($teacher_statuses as $status_id) {
                    if (isset($day_status_counts[$status_id])) {
                        $day_status_counts[$status_id]++;
                    }
                }
                
                // Finde Maximum für diesen Tag
                $day_max = max($day_status_counts);
                if ($day_max > $max_count) {
                    $max_count = $day_max;
                }
                
                $current_date->modify('+1 day');
            }
            
            echo json_encode([
                'success' => true,
                'max_count' => $max_count
            ]);
            $conn->close();
            exit;
        }
        
        // Wenn alle Tage gewünscht, berechne für alle Tage im Zeitraum
        if ($get_all_days) {
            $start_date = date('Y-m-d', strtotime('-29 days'));
            $end_date = date('Y-m-d');
            $start_datetime = $start_date . ' 00:00:00';
            $end_datetime = $end_date . ' 23:59:59';
            
            // Lade alle Status-Änderungen bis zum Enddatum (nicht nur im Zeitraum)
            $history_sql = "SELECT teacher_id, status_id, changed_at 
                          FROM teacher_status_history 
                          WHERE changed_at <= ?
                          ORDER BY changed_at ASC";
            $history_stmt = $conn->prepare($history_sql);
            $history_stmt->bind_param('s', $end_datetime);
            $history_stmt->execute();
            $history_result = $history_stmt->get_result();
            
            $all_changes = [];
            while ($row = $history_result->fetch_assoc()) {
                $all_changes[] = [
                    'teacher_id' => (int)$row['teacher_id'],
                    'status_id' => (int)$row['status_id'],
                    'changed_at' => $row['changed_at']
                ];
            }
            $history_stmt->close();
            
            // Initialisiere Status-Array mit Statusen, die vor dem Startdatum existierten
            // Optimiert: Eine einzige Abfrage für alle Lehrer statt N+1 Abfragen
            $teacher_statuses = [];
            $init_sql = "SELECT tsh1.teacher_id, tsh1.status_id
                         FROM teacher_status_history tsh1
                         INNER JOIN (
                             SELECT teacher_id, MAX(changed_at) as max_changed_at
                             FROM teacher_status_history
                             WHERE changed_at < ?
                             GROUP BY teacher_id
                         ) tsh2 ON tsh1.teacher_id = tsh2.teacher_id 
                                AND tsh1.changed_at = tsh2.max_changed_at
                         WHERE tsh1.changed_at < ?";
            $init_stmt = $conn->prepare($init_sql);
            $init_stmt->bind_param('ss', $start_datetime, $start_datetime);
            $init_stmt->execute();
            $init_result = $init_stmt->get_result();
            while ($init_row = $init_result->fetch_assoc()) {
                $teacher_statuses[(int)$init_row['teacher_id']] = (int)$init_row['status_id'];
            }
            $init_stmt->close();
            
            // Generiere alle Tage im Zeitraum
            $current_date = new DateTime($start_date);
            $end_datetime_obj = new DateTime($end_date);
            $all_days_data = [];
            $change_index = 0;
            
            while ($current_date <= $end_datetime_obj) {
                $check_date = $current_date->format('Y-m-d');
                $check_datetime = $check_date . ' 23:59:59';
                
                // Wende alle Änderungen an, die bis zu diesem Zeitpunkt passiert sind
                while ($change_index < count($all_changes) && $all_changes[$change_index]['changed_at'] <= $check_datetime) {
                    $change = $all_changes[$change_index];
                    $teacher_statuses[$change['teacher_id']] = $change['status_id'];
                    $change_index++;
                }
                
                // Zähle Lehrer pro Status für diesen Tag
                $day_status_counts = [];
                foreach ($all_statuses as $status) {
                    $day_status_counts[$status['status_id']] = 0;
                }
                
                foreach ($teacher_statuses as $status_id) {
                    if (isset($day_status_counts[$status_id])) {
                        $day_status_counts[$status_id]++;
                    }
                }
                
                // Formatiere für Frontend
                $day_statusCounts = [];
                foreach ($all_statuses as $status) {
                    $day_statusCounts[] = [
                        'id' => $status['status_id'],
                        'label' => $status['label'],
                        'display_name' => $status['display_name'],
                        'description' => $status['description'],
                        'count' => $day_status_counts[$status['status_id']]
                    ];
                }
                
                $all_days_data[$check_date] = $day_statusCounts;
                
                $current_date->modify('+1 day');
            }
            
            echo json_encode([
                'success' => true,
                'all_days_data' => $all_days_data
            ]);
            $conn->close();
            exit;
        }

        echo json_encode([
            'success' => true,
            'statusCounts' => $statusCounts,
            'date' => $target_date
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }

    $conn->close();
?>

