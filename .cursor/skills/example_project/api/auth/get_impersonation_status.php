<?php
    /**
     * Gibt den aktuellen Impersonation-Status zurück
     */
    
    require_once __DIR__ . '/../config/auth.php';
    
    header('Content-Type: application/json');
    
    $is_impersonating = isset($_SESSION['is_impersonating']) && $_SESSION['is_impersonating'];
    
    if ($is_impersonating) {
        echo json_encode([
            'is_impersonating' => true,
            'current_user' => [
                'id' => $_SESSION['user_id'],
                'role_id' => $_SESSION['role_id'],
                'role' => $_SESSION['user_role'],
                'name' => $_SESSION['user_name'] ?? '',
                'email' => $_SESSION['user_email'] ?? ''
            ],
            'original_user' => [
                'id' => $_SESSION['original_user_id'] ?? null,
                'role_id' => $_SESSION['original_role_id'] ?? null,
                'role' => $_SESSION['original_user_role'] ?? null,
                'name' => $_SESSION['original_user_name'] ?? '',
                'email' => $_SESSION['original_user_email'] ?? ''
            ]
        ]);
    } else {
        echo json_encode([
            'is_impersonating' => false
        ]);
    }
?>

