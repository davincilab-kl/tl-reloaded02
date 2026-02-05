<?php
    /**
     * Hilfsfunktion zum Aktualisieren der Projektanzahl in der students Tabelle
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $student_id ID des Schülers
     * @return bool true bei Erfolg, false bei Fehler
     */
    function updateStudentProjectCounts($conn, $student_id) {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        if (!$has_status_column) {
            // Wenn status Spalte nicht existiert, setze alle auf 0
            $update_sql = "UPDATE students SET projects_wip = 0, projects_pending = 0, projects_public = 0 WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if (!$update_stmt) {
                error_log("[update_project_counts.php] Fehler beim Vorbereiten des Updates: " . $conn->error);
                return false;
            }
            
            $update_stmt->bind_param('i', $student_id);
            if (!$update_stmt->execute()) {
                error_log("[update_project_counts.php] Fehler beim Ausführen des Updates: " . $update_stmt->error);
                $update_stmt->close();
                return false;
            }
            $update_stmt->close();
            return true;
        }
        
        // Zähle Projekte pro Status
        $count_sql = "SELECT 
                        COUNT(CASE WHEN status = 'working' THEN 1 END) AS wip_count,
                        COUNT(CASE WHEN status = 'check' THEN 1 END) AS pending_count,
                        COUNT(CASE WHEN status = 'published' THEN 1 END) AS public_count
                     FROM projects 
                     WHERE student_id = ?";
        
        $count_stmt = $conn->prepare($count_sql);
        if (!$count_stmt) {
            error_log("[update_project_counts.php] Fehler beim Vorbereiten der Zählung: " . $conn->error);
            return false;
        }
        
        $count_stmt->bind_param('i', $student_id);
        if (!$count_stmt->execute()) {
            error_log("[update_project_counts.php] Fehler beim Ausführen der Zählung: " . $count_stmt->error);
            $count_stmt->close();
            return false;
        }
        
        $result = $count_stmt->get_result();
        $row = $result->fetch_assoc();
        $wip_count = (int)($row['wip_count'] ?? 0);
        $pending_count = (int)($row['pending_count'] ?? 0);
        $public_count = (int)($row['public_count'] ?? 0);
        $count_stmt->close();
        
        // Update students Tabelle
        $update_sql = "UPDATE students 
                      SET projects_wip = ?, 
                          projects_pending = ?, 
                          projects_public = ? 
                      WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            error_log("[update_project_counts.php] Fehler beim Vorbereiten des Updates: " . $conn->error);
            return false;
        }
        
        $update_stmt->bind_param('iiii', $wip_count, $pending_count, $public_count, $student_id);
        if (!$update_stmt->execute()) {
            error_log("[update_project_counts.php] Fehler beim Ausführen des Updates: " . $update_stmt->error);
            $update_stmt->close();
            return false;
        }
        
        $update_stmt->close();
        return true;
    }
?>

