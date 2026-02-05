<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // User-ID aus GET-Parameter oder Session holen
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    // Falls keine User-ID übergeben, versuche aus Session zu holen
    if ($user_id <= 0 && is_logged_in()) {
        $user_id = get_user_id();
    }

    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid user ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole User-Informationen aus users Tabelle
        $user_sql = "SELECT id, role_id, role, first_name, last_name FROM users WHERE id = ? LIMIT 1";
        $user_stmt = $conn->prepare($user_sql);
        if (!$user_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $user_stmt->bind_param('i', $user_id);
        if (!$user_stmt->execute()) {
            throw new Exception('Execute failed: ' . $user_stmt->error);
        }
        
        $user_result = $user_stmt->get_result();
        if ($user_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            $user_stmt->close();
            $conn->close();
            exit;
        }
        
        $user_row = $user_result->fetch_assoc();
        $user_role = $user_row['role'];
        // Namen kombinieren (last_name kann NULL sein)
        $user_name = trim(($user_row['first_name'] ?? '') . ' ' . ($user_row['last_name'] ?? ''));
        $user_stmt->close();

        // Wenn User ein Student ist, hole den Student direkt
        if ($user_role === 'student') {
            $student_sql = "SELECT s.id, u.first_name, u.last_name, s.class_id, c.name as class_name, s.t_coins
                            FROM students s
                            LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                            LEFT JOIN classes c ON s.class_id = c.id
                            WHERE s.id = ?
                            LIMIT 1";
            $student_stmt = $conn->prepare($student_sql);
            if (!$student_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $student_stmt->bind_param('i', $user_row['role_id']);
            if (!$student_stmt->execute()) {
                throw new Exception('Execute failed: ' . $student_stmt->error);
            }
            
            $student_result = $student_stmt->get_result();
            if ($student_result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                $student_stmt->close();
                $conn->close();
                exit;
            }
            
            $student_row = $student_result->fetch_assoc();
            $student_stmt->close();
        } 
        // Wenn User ein Teacher oder Admin ist, hole den korrespondierenden Student
        else if ($user_role === 'teacher' || $user_role === 'admin') {
            // Versuche zuerst student_id aus teachers Tabelle zu holen
            $student_id = null;
            $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
            $teacher_stmt = $conn->prepare($teacher_sql);
            if ($teacher_stmt) {
                $teacher_stmt->bind_param('i', $user_row['role_id']);
                $teacher_stmt->execute();
                $teacher_result = $teacher_stmt->get_result();
                if ($teacher_row = $teacher_result->fetch_assoc()) {
                    $student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
                }
                $teacher_stmt->close();
            }
            
            // Wenn student_id nicht vorhanden, Fehler zurückgeben
            if ($student_id === null || $student_id <= 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Keine student_id für diesen Teacher/Admin gefunden. Bitte kontaktieren Sie den Administrator.']);
                $conn->close();
                exit;
            }
            
            // Hole Student mit student_id
            $student_sql = "SELECT s.id, u.first_name, u.last_name, s.class_id, c.name as class_name, s.t_coins
                            FROM students s
                            LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                            LEFT JOIN classes c ON s.class_id = c.id
                            WHERE s.id = ?
                            LIMIT 1";
            $student_stmt = $conn->prepare($student_sql);
            if (!$student_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            $student_stmt->bind_param('i', $student_id);
            if (!$student_stmt->execute()) {
                throw new Exception('Execute failed: ' . $student_stmt->error);
            }
            
            $student_result = $student_stmt->get_result();
            if ($student_result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Student mit student_id ' . $student_id . ' nicht gefunden. Bitte kontaktieren Sie den Administrator.']);
                $student_stmt->close();
                $conn->close();
                exit;
            }
            
            $student_row = $student_result->fetch_assoc();
            $student_stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid user role']);
            $conn->close();
            exit;
        }

        // Namen kombinieren (bei Students: gesamter Name in first_name, last_name kann NULL sein)
        $full_name = trim(($student_row['first_name'] ?? '') . ' ' . ($student_row['last_name'] ?? ''));
        
        echo json_encode([
            'success' => true,
            'student' => [
                'id' => (int)$student_row['id'],
                'name' => $full_name,
                'class_id' => (int)$student_row['class_id'],
                'class_name' => $student_row['class_name'] ?? null,
                't_coins' => (int)$student_row['t_coins']
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

