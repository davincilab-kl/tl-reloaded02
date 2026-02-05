<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_once __DIR__ . '/../pipeline/check_teacher_status.php';
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
    $field = isset($input['field']) ? trim($input['field']) : null;
    $value = isset($input['value']) ? trim($input['value']) : null;

    if ($project_id === null || $project_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid project ID']);
        exit;
    }

    if ($field === null || !in_array($field, ['title', 'description', 'link'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid field. Allowed: title, description, link']);
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
        // Prüfe ob Projekt existiert
        $check_sql = "SELECT id FROM projects WHERE id = ? LIMIT 1";
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
        $check_stmt->close();

        // Update Feld
        $update_sql = "UPDATE projects SET {$field} = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $update_stmt->bind_param('si', $value, $project_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Execute failed: ' . $update_stmt->error);
        }
        $update_stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Feld erfolgreich aktualisiert'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        error_log("[update_project_field.php] Fehler: " . $e->getMessage());
    }

    $conn->close();
?>

