<?php
    /**
     * API-Endpoint: Prüft alle Lehrer-Status mit Server-Sent Events (SSE) für Fortschrittsanzeige
     * Gibt Fortschritt in Echtzeit zurück
     */
    
    // SSE-Header ZUERST setzen (vor jeder Ausgabe)
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no'); // Nginx buffering deaktivieren
    
    // Output-Buffering deaktivieren für sofortige Ausgabe
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Session starten (falls noch nicht gestartet) - muss vor require_once sein
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    
    // Auth-Prüfung manuell (ohne Redirect für SSE)
    if (!is_logged_in()) {
        echo "data: " . json_encode([
            'type' => 'error',
            'message' => 'Nicht eingeloggt'
        ]) . "\n\n";
        flush();
        exit;
    }
    
    if (!is_admin()) {
        echo "data: " . json_encode([
            'type' => 'error',
            'message' => 'Keine Admin-Berechtigung'
        ]) . "\n\n";
        flush();
        exit;
    }
    
    require_once __DIR__ . '/check_all_teacher_status.php';
    
    $conn = db_connect();
    
    if (!$conn) {
        echo "data: " . json_encode([
            'type' => 'error',
            'message' => 'Datenbankverbindung fehlgeschlagen'
        ]) . "\n\n";
        flush();
        exit;
    }
    
    try {
        // Hole alle Lehrer
        $teachers_sql = "SELECT t.id, u.first_name, u.last_name, u.email, t.status_id
                        FROM teachers t
                        INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                        ORDER BY t.id ASC";
        
        $teachers_result = $conn->query($teachers_sql);
        if (!$teachers_result) {
            echo "data: " . json_encode([
                'type' => 'error',
                'message' => 'Fehler bei Lehrer-Abfrage: ' . $conn->error
            ]) . "\n\n";
            flush();
            $conn->close();
            exit;
        }
        
        // Zähle Gesamtanzahl
        $total_count = $teachers_result->num_rows;
        
        // Sende Start-Event
        echo "data: " . json_encode([
            'type' => 'start',
            'total' => $total_count
        ]) . "\n\n";
        flush();
        
        $all_results = [];
        $inconsistent_teachers = [];
        $summary = [
            'total' => 0,
            'correct' => 0,
            'incorrect' => 0,
            'by_status' => []
        ];
        
        $processed = 0;
        $last_update = 0;
        
        while ($teacher_row = $teachers_result->fetch_assoc()) {
            $teacher_id = (int)$teacher_row['id'];
            $summary['total']++;
            $processed++;
            
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
            
            // Sende Fortschritt alle 5 Lehrer oder bei jedem 10. Lehrer (je nach Gesamtanzahl)
            $update_interval = $total_count > 100 ? 10 : 5;
            if ($processed - $last_update >= $update_interval || $processed === $total_count) {
                $progress = ($processed / $total_count) * 100;
                
                echo "data: " . json_encode([
                    'type' => 'progress',
                    'processed' => $processed,
                    'total' => $total_count,
                    'progress' => round($progress, 1),
                    'correct' => $summary['correct'],
                    'incorrect' => $summary['incorrect']
                ]) . "\n\n";
                flush();
                
                $last_update = $processed;
            }
        }
        
        // Sende Finales Ergebnis
        echo "data: " . json_encode([
            'type' => 'complete',
            'total_teachers' => $summary['total'],
            'correct' => $summary['correct'],
            'incorrect' => $summary['incorrect'],
            'inconsistent_teachers' => $inconsistent_teachers,
            'summary' => $summary
        ]) . "\n\n";
        flush();
        
    } catch (Exception $e) {
        error_log("[validate_all_teacher_status_stream.php] Fehler: " . $e->getMessage());
        echo "data: " . json_encode([
            'type' => 'error',
            'message' => 'Fehler beim Prüfen: ' . $e->getMessage()
        ]) . "\n\n";
        flush();
    }
    
    $conn->close();
?>

