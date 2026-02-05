<?php
    /**
     * Gibt die aktuelle Session-User-ID zurück
     */
    
    require_once __DIR__ . '/../config/auth.php';
    
    header('Content-Type: application/json');
    
    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode(['error' => 'Not logged in']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'user_id' => get_user_id(),
        'role' => get_user_role(),
        'role_id' => get_role_id()
    ]);
?>

