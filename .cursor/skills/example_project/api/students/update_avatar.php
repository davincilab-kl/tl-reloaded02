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

    // JSON-Daten aus Request Body lesen
    $input = json_decode(file_get_contents('php://input'), true);

    // User ID aus POST-Daten (primär) oder Student ID (für Rückwärtskompatibilität)
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $student_id = isset($input['student_id']) ? intval($input['student_id']) : 0;

    // Falls nur student_id übergeben wurde, hole user_id aus users Tabelle
    if ($user_id <= 0 && $student_id > 0) {
        $conn = db_connect();
        $user_lookup_sql = "SELECT id FROM users WHERE role_id = ? AND role = 'student' LIMIT 1";
        $user_lookup_stmt = $conn->prepare($user_lookup_sql);
        if ($user_lookup_stmt) {
            $user_lookup_stmt->bind_param('i', $student_id);
            $user_lookup_stmt->execute();
            $user_lookup_result = $user_lookup_stmt->get_result();
            if ($user_row = $user_lookup_result->fetch_assoc()) {
                $user_id = (int)$user_row['id'];
            }
            $user_lookup_stmt->close();
        }
        $conn->close();
    }

    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid user ID or student ID']);
        exit;
    }

    // Avatar-Daten aus POST-Daten
    $avatar_seed = isset($input['avatar_seed']) ? trim($input['avatar_seed']) : null;
    $avatar_style = isset($input['avatar_style']) ? trim($input['avatar_style']) : 'avataaars';

    // Validiere Avatar-Style (nur erlaubte Styles)
    $allowed_styles = ['avataaars', 'bottts', 'identicon', 'initials', 'micah', 'openPeeps', 'personas', 'pixelArt', 'shapes', 'thumbs'];
    if (!in_array($avatar_style, $allowed_styles)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid avatar style']);
        exit;
    }

    // Validiere Avatar-Seed (max. 255 Zeichen)
    if ($avatar_seed !== null && strlen($avatar_seed) > 255) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Avatar seed too long']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob User existiert
        $check_sql = "SELECT id FROM users WHERE id = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('i', $user_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $check_stmt->close();
        
        if ($check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found']);
            $conn->close();
            exit;
        }

        // Update Avatar-Daten in users Tabelle
        $update_sql = "UPDATE users 
                      SET avatar_seed = ?, 
                          avatar_style = ?
                      WHERE id = ?";
        $stmt = $conn->prepare($update_sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('ssi', $avatar_seed, $avatar_style, $user_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Avatar updated successfully',
            'avatar_seed' => $avatar_seed,
            'avatar_style' => $avatar_style
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

