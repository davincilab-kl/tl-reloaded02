<?php
    // Error-Logging aktivieren
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../../php_error.log');
    
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // User-ID aus GET-Parameter holen
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    
    if ($user_id === null || $user_id <= 0) {
        http_response_code(400);
        $error_msg = 'Invalid user ID: ' . var_export($user_id, true);
        error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
        echo json_encode(['error' => 'Invalid user ID']);
        exit;
    }

    $conn = null;
    
    try {
        $conn = db_connect();
        
        if (!$conn) {
            $error_msg = 'Datenbankverbindung fehlgeschlagen';
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }

        // Anzahl Klassen
        $classes_sql = "SELECT COUNT(*) AS cnt FROM classes WHERE teacher_id = ?";
        $classes_stmt = $conn->prepare($classes_sql);
        $classes_count = 0;
        if (!$classes_stmt) {
            $error_msg = 'Fehler beim Vorbereiten der Klassen-Abfrage: ' . $conn->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $classes_stmt->bind_param('i', $user_id);
        if (!$classes_stmt->execute()) {
            $error_msg = 'Fehler beim Ausführen der Klassen-Abfrage: ' . $classes_stmt->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $classes_result = $classes_stmt->get_result();
        if ($classes_row = $classes_result->fetch_assoc()) {
            $classes_count = (int)$classes_row['cnt'];
        }
        $classes_stmt->close();

        // Anzahl Schüler (ohne Lehrer-Placeholder)
        $students_sql = "SELECT COUNT(DISTINCT s.id) AS cnt 
                        FROM students s 
                        INNER JOIN classes c ON s.class_id = c.id 
                        WHERE c.teacher_id = ? 
                        AND s.class_id IS NOT NULL
                        AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        $students_stmt = $conn->prepare($students_sql);
        $students_count = 0;
        if (!$students_stmt) {
            $error_msg = 'Fehler beim Vorbereiten der Schüler-Abfrage: ' . $conn->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $students_stmt->bind_param('i', $user_id);
        if (!$students_stmt->execute()) {
            $error_msg = 'Fehler beim Ausführen der Schüler-Abfrage: ' . $students_stmt->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $students_result = $students_stmt->get_result();
        if ($students_row = $students_result->fetch_assoc()) {
            $students_count = (int)$students_row['cnt'];
        }
        $students_stmt->close();

        // TScore (Summe aller T-Coins der Schüler, ohne Lehrer-Placeholder)
        $tscore_sql = "SELECT COALESCE(SUM(s.t_coins), 0) AS total_t_coins
                      FROM students s 
                      INNER JOIN classes c ON s.class_id = c.id 
                      WHERE c.teacher_id = ? 
                      AND s.class_id IS NOT NULL
                      AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)";
        $tscore_stmt = $conn->prepare($tscore_sql);
        $total_t_coins = 0;
        if (!$tscore_stmt) {
            $error_msg = 'Fehler beim Vorbereiten der T-Coins-Abfrage: ' . $conn->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $tscore_stmt->bind_param('i', $user_id);
        if (!$tscore_stmt->execute()) {
            $error_msg = 'Fehler beim Ausführen der T-Coins-Abfrage: ' . $tscore_stmt->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $tscore_result = $tscore_stmt->get_result();
        if ($tscore_row = $tscore_result->fetch_assoc()) {
            $total_t_coins = (int)$tscore_row['total_t_coins'];
        }
        $tscore_stmt->close();

        // Letzte Aktivität der Schüler (neuester last_login)
        // Filtere ungültige DATETIME-Werte in PHP, nicht in SQL (um MySQL STRICT MODE Probleme zu vermeiden)
        $activity_sql = "SELECT u.last_login
                        FROM students s 
                        INNER JOIN classes c ON s.class_id = c.id 
                        LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                        WHERE c.teacher_id = ? 
                        AND u.last_login IS NOT NULL";
        $activity_stmt = $conn->prepare($activity_sql);
        $last_activity = null;
        if (!$activity_stmt) {
            $error_msg = 'Fehler beim Vorbereiten der Aktivitäts-Abfrage: ' . $conn->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $activity_stmt->bind_param('i', $user_id);
        if (!$activity_stmt->execute()) {
            $error_msg = 'Fehler beim Ausführen der Aktivitäts-Abfrage: ' . $activity_stmt->error;
            error_log("[get_teacher_stats.php] FEHLER: " . $error_msg);
            throw new Exception($error_msg);
        }
        $activity_result = $activity_stmt->get_result();
        
        // Suche das neueste gültige Datum in PHP
        $max_date = null;
        while ($row = $activity_result->fetch_assoc()) {
            $date_value = $row['last_login'];
            // Prüfe ob das Datum gültig ist
            if ($date_value && 
                $date_value !== '0000-00-00 00:00:00' && 
                substr($date_value, 0, 4) !== '0000' &&
                !empty(trim($date_value))) {
                // Vergleiche Datumswerte
                if ($max_date === null || $date_value > $max_date) {
                    $max_date = $date_value;
                }
            }
        }
        $last_activity = $max_date;
        $activity_stmt->close();

        // Formatiere letzte Aktivität
        $last_activity_formatted = null;
        if ($last_activity && $last_activity !== '0000-00-00 00:00:00' && $last_activity !== null) {
            try {
                $date = new DateTime($last_activity, new DateTimeZone('Europe/Vienna'));
                $now = new DateTime('now', new DateTimeZone('Europe/Vienna'));
                $diff = $now->diff($date);
                
                if ($diff->days > 0) {
                    $last_activity_formatted = 'vor ' . $diff->days . ' Tag' . ($diff->days > 1 ? 'en' : '');
                } else if ($diff->h > 0) {
                        $last_activity_formatted = 'vor ' . $diff->h . ' Stunde' . ($diff->h > 1 ? 'n' : '');
                } else if ($diff->i > 0) {
                    $last_activity_formatted = 'vor ' . $diff->i . ' Minute' . ($diff->i > 1 ? 'n' : '');
                } else {
                    $last_activity_formatted = 'Gerade eben';
                }
            } catch (Exception $e) {
                $last_activity_formatted = 'Keine Aktivität';
            }
        } else {
            $last_activity_formatted = 'Keine Aktivität';
        }

        // Berechne T!Score (Durchschnitt = total_t_coins / students_count)
        $avg_t_coins = 0;
        if ($students_count > 0) {
            $avg_t_coins = round($total_t_coins / $students_count, 1);
        }

        $data = [
            'classes_count' => $classes_count,
            'students_count' => $students_count,
            'total_t_coins' => $total_t_coins,
            'avg_t_coins' => $avg_t_coins,
            'last_activity' => $last_activity_formatted,
            'last_activity_raw' => $last_activity
        ];

        echo json_encode($data);

    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Database error: ' . $e->getMessage();
        $error_details = [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];
        error_log("[get_teacher_stats.php] EXCEPTION: " . print_r($error_details, true));
        
        // Prüfe auch auf PHP-Fehler (Fatal Errors etc.)
        $last_error = error_get_last();
        if ($last_error && $last_error['type'] === E_ERROR) {
            error_log("[get_teacher_stats.php] PHP FATAL ERROR: " . print_r($last_error, true));
        }
        
        echo json_encode(['error' => $error_msg]);
    } catch (Error $e) {
        // Fängt auch Fatal Errors ab (PHP 7+)
        http_response_code(500);
        $error_msg = 'Fatal error: ' . $e->getMessage();
        $error_details = [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];
        error_log("[get_teacher_stats.php] FATAL ERROR: " . print_r($error_details, true));
        echo json_encode(['error' => $error_msg]);
    } finally {
        if ($conn) {
            $conn->close();
        }
    }
?>

