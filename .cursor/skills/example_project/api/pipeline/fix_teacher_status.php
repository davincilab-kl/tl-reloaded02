<?php
    /**
     * API-Endpoint: Korrigiert Lehrer-Status (einzeln)
     */
    
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    require_once __DIR__ . '/check_all_teacher_status.php';
    require_once __DIR__ . '/check_teacher_status.php';
    
    header('Content-Type: application/json');
    
    $input = json_decode(file_get_contents('php://input'), true);
    $teacher_id = isset($input['teacher_id']) ? (int)$input['teacher_id'] : null;
    
    if (!$teacher_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'teacher_id muss angegeben werden'
        ]);
        exit;
    }
    
    $conn = db_connect();
    
    if (!$conn) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Datenbankverbindung fehlgeschlagen'
        ]);
        exit;
    }
    
    try {
        $fixed_teachers = [];
        
        if ($teacher_id) {
            // Korrigiere einzelnen Lehrer
            // WICHTIG: Prüfe nochmal aktuell, welcher Status passt (kann sich geändert haben)
            $result = checkTeacherStatusWithoutUpdate($conn, $teacher_id);
            
            if ($result === null) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Lehrer nicht gefunden'
                ]);
                $conn->close();
                exit;
            }
            
            // Wenn Status bereits korrekt ist, nichts zu tun
            if ($result['is_correct']) {
                echo json_encode([
                    'success' => true,
                    'fixed_count' => 0,
                    'fixed_teachers' => [],
                    'message' => 'Status ist bereits korrekt'
                ]);
                $conn->close();
                exit;
            }
            
            if ($result['expected_status_id'] !== null) {
                // Versuche Status zu korrigieren
                if (updateTeacherStatusIfHigher($conn, $teacher_id, $result['expected_status_id'])) {
                    $fixed_teachers[] = [
                        'teacher_id' => $teacher_id,
                        'old_status_id' => $result['current_status_id'],
                        'new_status_id' => $result['expected_status_id'],
                        'status_label' => $result['expected_status_label']
                    ];
                } else {
                    // Status ist inkorrekt, aber erwarteter Status hat niedrigeren order
                    // In diesem Fall müssen wir trotzdem korrigieren (Status nach unten setzen)
                    // Hole order-Werte um zu prüfen
                    $current_status_id = $result['current_status_id'];
                    
                    $order_sql = "SELECT id, `order` FROM teacher_stati WHERE id IN (?, ?)";
                    $order_stmt = $conn->prepare($order_sql);
                    if ($order_stmt) {
                        $order_stmt->bind_param('ii', $current_status_id, $result['expected_status_id']);
                        if ($order_stmt->execute()) {
                            $order_result = $order_stmt->get_result();
                            $current_order = 0;
                            $expected_order = 0;
                            while ($row = $order_result->fetch_assoc()) {
                                if ((int)$row['id'] === $current_status_id) {
                                    $current_order = (int)$row['order'];
                                }
                                if ((int)$row['id'] === $result['expected_status_id']) {
                                    $expected_order = (int)$row['order'];
                                }
                            }
                            
                            // Wenn Status inkorrekt ist, korrigiere immer (auch nach unten)
                            // Nur wenn erwarteter Status höher oder gleich ist, ODER wenn Status inkorrekt ist
                            if ($expected_order >= $current_order || !$result['is_correct']) {
                                $update_sql = "UPDATE teachers SET status_id = ? WHERE id = ?";
                                $update_stmt = $conn->prepare($update_sql);
                                if ($update_stmt) {
                                    $update_stmt->bind_param('ii', $result['expected_status_id'], $teacher_id);
                                    if ($update_stmt->execute()) {
                                        $fixed_teachers[] = [
                                            'teacher_id' => $teacher_id,
                                            'old_status_id' => $current_status_id,
                                            'new_status_id' => $result['expected_status_id'],
                                            'status_label' => $result['expected_status_label']
                                        ];
                                    }
                                    $update_stmt->close();
                                }
                            }
                        }
                        $order_stmt->close();
                    }
                }
            }
        }
        
        echo json_encode([
            'success' => true,
            'fixed_count' => count($fixed_teachers),
            'fixed_teachers' => $fixed_teachers
        ]);
        
    } catch (Exception $e) {
        error_log("[fix_teacher_status.php] Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Korrigieren: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
?>

