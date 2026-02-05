<?php
    /**
     * Zentrale T!Coins-Verwaltungsfunktion
     * Verhindert Doppelvergabe und protokolliert alle Transaktionen
     */
    
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
    
    /**
     * Vergibt T!Coins an einen Schüler
     * 
     * @param mysqli $conn Datenbankverbindung
     * @param int $student_id ID des Schülers
     * @param int $amount Anzahl der T!Coins (muss > 0 sein)
     * @param string $reason Grund für die Vergabe (z.B. 'lection_completed', 'project_published')
     * @param int|null $reference_id ID der referenzierten Entität (z.B. lection_id, project_id)
     * @param string|null $reference_type Typ der Referenz (z.B. 'lection', 'project', 'like')
     * @return bool true bei Erfolg, false bei Fehler
     */
    function awardTcoins($conn, $student_id, $amount, $reason, $reference_id = null, $reference_type = null) {
        // Validierung
        if (!is_numeric($student_id) || $student_id <= 0) {
            error_log("[tcoins_manager] Ungültige student_id: " . $student_id);
            return false;
        }
        
        if (!is_numeric($amount) || $amount <= 0) {
            error_log("[tcoins_manager] Ungültiger amount: " . $amount);
            return false;
        }
        
        if (empty($reason) || !is_string($reason)) {
            error_log("[tcoins_manager] Ungültiger reason: " . $reason);
            return false;
        }
        
        // Prüfe ob Schüler existiert
        $check_sql = "SELECT id FROM students WHERE id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            error_log("[tcoins_manager] Prepare failed: " . $conn->error);
            return false;
        }
        
        $check_stmt->bind_param('i', $student_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            error_log("[tcoins_manager] Schüler mit ID " . $student_id . " existiert nicht");
            $check_stmt->close();
            return false;
        }
        $check_stmt->close();
        
        // Prüfe auf Doppelvergabe (nur wenn reference_id und reference_type vorhanden)
        if ($reference_id !== null && $reference_type !== null) {
            $duplicate_sql = "SELECT id FROM tcoins_transactions 
                             WHERE student_id = ? 
                             AND reason = ? 
                             AND reference_id = ? 
                             AND reference_type = ? 
                             LIMIT 1";
            $duplicate_stmt = $conn->prepare($duplicate_sql);
            
            if ($duplicate_stmt) {
                $duplicate_stmt->bind_param('isis', $student_id, $reason, $reference_id, $reference_type);
                $duplicate_stmt->execute();
                $duplicate_result = $duplicate_stmt->get_result();
                
                if ($duplicate_result->num_rows > 0) {
                    // Doppelvergabe erkannt - bereits belohnt
                    error_log("[tcoins_manager] Doppelvergabe verhindert: student_id=" . $student_id . ", reason=" . $reason . ", reference=" . $reference_type . ":" . $reference_id);
                    $duplicate_stmt->close();
                    return false;
                }
                $duplicate_stmt->close();
            }
        } else {
            // Für Aktionen ohne Referenz (z.B. avatar_created) prüfe nur reason
            // Ausnahme: "project_liked" - jeder Like gibt 1 T!Coin, daher keine Doppelvergabe-Prüfung
            if ($reason !== 'project_liked') {
                $duplicate_sql = "SELECT id FROM tcoins_transactions 
                                 WHERE student_id = ? 
                                 AND reason = ? 
                                 AND reference_id IS NULL 
                                 AND reference_type IS NULL 
                                 LIMIT 1";
                $duplicate_stmt = $conn->prepare($duplicate_sql);
                
                if ($duplicate_stmt) {
                    $duplicate_stmt->bind_param('is', $student_id, $reason);
                    $duplicate_stmt->execute();
                    $duplicate_result = $duplicate_stmt->get_result();
                    
                    if ($duplicate_result->num_rows > 0) {
                        // Doppelvergabe erkannt
                        error_log("[tcoins_manager] Doppelvergabe verhindert: student_id=" . $student_id . ", reason=" . $reason);
                        $duplicate_stmt->close();
                        return false;
                    }
                    $duplicate_stmt->close();
                }
            }
            // Für "project_liked" wird keine Doppelvergabe-Prüfung durchgeführt,
            // damit jeder Like einzeln gezählt wird
        }
        
        // Beginne Transaktion
        $conn->begin_transaction();
        
        try {
            // 1. Füge Transaktion in Historie ein
            $insert_sql = "INSERT INTO tcoins_transactions (student_id, amount, reason, reference_id, reference_type) 
                         VALUES (?, ?, ?, ?, ?)";
            $insert_stmt = $conn->prepare($insert_sql);
            
            if (!$insert_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $insert_stmt->bind_param('iisis', $student_id, $amount, $reason, $reference_id, $reference_type);
            
            if (!$insert_stmt->execute()) {
                throw new Exception('Execute failed: ' . $insert_stmt->error);
            }
            
            $insert_stmt->close();
            
            // 2. Aktualisiere T!Coins-Stand des Schülers
            $update_sql = "UPDATE students SET t_coins = t_coins + ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            
            if (!$update_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $update_stmt->bind_param('ii', $amount, $student_id);
            
            if (!$update_stmt->execute()) {
                throw new Exception('Execute failed: ' . $update_stmt->error);
            }
            
            $update_stmt->close();
            
            // Commit Transaktion
            $conn->commit();
            
            // Prüfe und aktualisiere Lehrer-Status nach erfolgreicher T!Coin-Vergabe
            // Hole teacher_id über class_id des Schülers
            $teacher_sql = "SELECT c.teacher_id 
                          FROM students s 
                          INNER JOIN classes c ON s.class_id = c.id 
                          WHERE s.id = ? 
                          AND s.class_id IS NOT NULL
                          LIMIT 1";
            $teacher_stmt = $conn->prepare($teacher_sql);
            
            if ($teacher_stmt) {
                $teacher_stmt->bind_param('i', $student_id);
                if ($teacher_stmt->execute()) {
                    $teacher_result = $teacher_stmt->get_result();
                    if ($teacher_row = $teacher_result->fetch_assoc()) {
                        $teacher_id = (int)$teacher_row['teacher_id'];
                        // Status-Prüfung auslösen (nicht-blockierend, Fehler werden geloggt)
                        try {
                            checkAndUpdateTeacherStatus($conn, $teacher_id);
                        } catch (Exception $status_error) {
                            // Nicht kritisch - nur loggen
                            error_log("[tcoins_manager] Fehler bei Status-Prüfung: " . $status_error->getMessage());
                        }
                    }
                }
                $teacher_stmt->close();
            }
            
            return true;
            
        } catch (Exception $e) {
            // Rollback bei Fehler
            $conn->rollback();
            error_log("[tcoins_manager] Fehler: " . $e->getMessage());
            return false;
        }
    }
?>

