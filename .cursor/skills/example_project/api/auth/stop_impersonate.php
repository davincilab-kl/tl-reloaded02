<?php
    /**
     * Stop Impersonation-API-Endpunkt: Admin kehrt zu seinem Account zurück
     */
    
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
    
    // Prüfe ob Impersonation aktiv ist
    if (!isset($_SESSION['is_impersonating']) || !$_SESSION['is_impersonating']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Keine aktive Impersonation']);
        exit;
    }
    
    // Stelle Original-Admin-Session wieder her
    if (isset($_SESSION['original_user_id'])) {
        $_SESSION['user_id'] = $_SESSION['original_user_id'];
        $_SESSION['role_id'] = $_SESSION['original_role_id'];
        $_SESSION['user_role'] = $_SESSION['original_user_role'];
        $_SESSION['user_name'] = $_SESSION['original_user_name'];
        $_SESSION['user_email'] = $_SESSION['original_user_email'];
    }
    
    // Entferne Impersonation-Flags
    unset($_SESSION['is_impersonating']);
    unset($_SESSION['original_user_id']);
    unset($_SESSION['original_role_id']);
    unset($_SESSION['original_user_role']);
    unset($_SESSION['original_user_name']);
    unset($_SESSION['original_user_email']);
    
    // Erfolgreiche Antwort
    echo json_encode([
        'success' => true,
        'redirect' => '/admin/dashboard/'
    ]);
?>

