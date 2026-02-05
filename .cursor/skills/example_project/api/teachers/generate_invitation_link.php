<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // Prüfe ob Lehrer eingeloggt ist
    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole aktuelle User-ID und Teacher-ID
        $user_id = get_user_id();
        if (!$user_id) {
            throw new Exception('User ID not found');
        }

        // Hole Teacher-ID
        $teacher_sql = "SELECT t.id, t.school_id 
                       FROM teachers t 
                       INNER JOIN users u ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin') 
                       WHERE u.id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $teacher_stmt->bind_param('i', $user_id);
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_result = $teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Teacher not found']);
            $teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_data = $teacher_result->fetch_assoc();
        $teacher_id = (int)$teacher_data['id'];
        $school_id = $teacher_data['school_id'];
        $teacher_stmt->close();

        // JSON-Daten lesen
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['link_type'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing link_type parameter']);
            $conn->close();
            exit;
        }

        $link_type = $input['link_type'];
        if (!in_array($link_type, ['same_school', 'other_school'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid link_type. Must be "same_school" or "other_school"']);
            $conn->close();
            exit;
        }

        // Prüfe ob school_id vorhanden ist (für same_school)
        if ($link_type === 'same_school' && !$school_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No school assigned. Cannot invite to same school.']);
            $conn->close();
            exit;
        }

        // Erstelle Einladungslink
        $base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
        
        if ($link_type === 'same_school' && $school_id) {
            // Schulinterne Einladung: Nur mit schulcode Parameter
            $check_school_code = $conn->query("SHOW COLUMNS FROM schools LIKE 'school_code'");
            $has_school_code = $check_school_code && $check_school_code->num_rows > 0;
            
            if ($has_school_code) {
                $school_code_sql = "SELECT school_code FROM schools WHERE id = ? LIMIT 1";
                $school_code_stmt = $conn->prepare($school_code_sql);
                if ($school_code_stmt) {
                    $school_code_stmt->bind_param('i', $school_id);
                    $school_code_stmt->execute();
                    $school_code_result = $school_code_stmt->get_result();
                    if ($school_code_row = $school_code_result->fetch_assoc()) {
                        $school_code = $school_code_row['school_code'];
                        if ($school_code) {
                            $invitation_link = $base_url . '/register?schulcode=' . urlencode($school_code);
                        } else {
                            http_response_code(400);
                            echo json_encode(['success' => false, 'error' => 'School code not found for this school']);
                            $school_code_stmt->close();
                            $conn->close();
                            exit;
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'School code not found for this school']);
                        $school_code_stmt->close();
                        $conn->close();
                        exit;
                    }
                    $school_code_stmt->close();
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Could not retrieve school code']);
                    $conn->close();
                    exit;
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'School code column does not exist']);
                $conn->close();
                exit;
            }
        } else {
            // Schulexterne Einladung: Normaler Registrierungslink ohne Parameter
            $invitation_link = $base_url . '/register';
        }

        echo json_encode([
            'success' => true,
            'invitation_link' => $invitation_link,
            'link_type' => $link_type
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

