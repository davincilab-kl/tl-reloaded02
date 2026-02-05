<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
    require_once __DIR__ . '/update_project_counts.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = isset($input['project_id']) ? (int)$input['project_id'] : null;

    if ($project_id === null || $project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    // Prüfe ob User berechtigt ist (Admin oder Teacher)
    $user_id = get_user_id();
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    $user_role = get_user_role();
    if ($user_role !== 'admin' && $user_role !== 'teacher') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Projekt existiert und hole student_id und aktuellen Status
        $check_sql = "SELECT p.id, p.student_id, p.status
                     FROM projects p
                     WHERE p.id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('i', $project_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        
        $project_row = $check_result->fetch_assoc();
        $student_id = (int)$project_row['student_id'];
        $previous_status = $project_row['status'] ?? 'working';
        $check_stmt->close();
        
        // Prüfe ob das Projekt vorher den Status 'check' hatte (eingereicht)
        // Nur dann zählt es als Bewertung
        $was_submitted = ($previous_status === 'check');

        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;

        if (!$has_status_column) {
            // Falls status Spalte nicht existiert, erstelle sie
            $conn->query("ALTER TABLE projects ADD COLUMN status ENUM('working', 'check', 'published') DEFAULT 'working'");
            $has_status_column = true;
        }

        // Update Status auf working
        $new_status = 'working';
        $update_sql = "UPDATE projects SET status = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $update_stmt->bind_param('si', $new_status, $project_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_stmt->error);
        }
        $update_stmt->close();

        // Aktualisiere Projektanzahl in students Tabelle
        try {
            updateStudentProjectCounts($conn, $student_id);
        } catch (Exception $count_error) {
            error_log("[reject_project.php] Fehler beim Aktualisieren der Projektanzahl: " . $count_error->getMessage());
        }

        // Prüfe und aktualisiere Lehrer-Status nach Projekt-Bewertung (Ablehnung)
        // Wenn ein Projekt abgelehnt wurde (von 'check' auf 'working'), wurde es bewertet.
        // Status 14 sollte gesetzt werden, wenn der Lehrer noch nicht in einer höheren order ist.
        // Der allgemeine Sicherheitsmechanismus verhindert, dass der Status zurückgesetzt wird.
        if ($was_submitted) {
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
                        
                        // Hole Status-ID für 'erstes_projekt_bewertet' (Status 14)
                        $status_label = 'erstes_projekt_bewertet';
                        $status_sql = "SELECT id FROM teacher_stati WHERE label = ? LIMIT 1";
                        $status_stmt = $conn->prepare($status_sql);
                        
                        if ($status_stmt) {
                            $status_stmt->bind_param('s', $status_label);
                            if ($status_stmt->execute()) {
                                $status_result = $status_stmt->get_result();
                                if ($status_row = $status_result->fetch_assoc()) {
                                    $status_14_id = (int)$status_row['id'];
                                    
                                    // Setze Status 14 direkt, wenn der Lehrer noch nicht in einer höheren order ist
                                    // updateTeacherStatusIfHigher() verhindert, dass der Status zurückgesetzt wird
                                    try {
                                        updateTeacherStatusIfHigher($conn, $teacher_id, $status_14_id);
                                    } catch (Exception $status_error) {
                                        error_log("[reject_project.php] Fehler bei Status-Update: " . $status_error->getMessage());
                                    }
                                }
                            }
                            $status_stmt->close();
                        }
                        
                        // Zusätzlich: Prüfe alle anderen Status-Bedingungen (nicht-blockierend)
                        try {
                            checkAndUpdateTeacherStatus($conn, $teacher_id);
                        } catch (Exception $status_error) {
                            error_log("[reject_project.php] Fehler bei Status-Prüfung: " . $status_error->getMessage());
                        }
                    }
                }
                $teacher_stmt->close();
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Projekt zurückgesetzt'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[reject_project.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

