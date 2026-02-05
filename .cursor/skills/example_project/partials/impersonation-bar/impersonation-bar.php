<?php
    /**
     * Impersonation-Leiste: Zeigt an, wenn ein Admin als Lehrer eingeloggt ist
     */
    require_once __DIR__ . '/../../api/config/auth.php';
    
    $is_impersonating = isset($_SESSION['is_impersonating']) && $_SESSION['is_impersonating'];
    
    if ($is_impersonating):
        $current_name = $_SESSION['user_name'] ?? 'Unbekannt';
        $original_name = $_SESSION['original_user_name'] ?? 'Admin';
?>
<link rel="stylesheet" href="/partials/impersonation-bar/impersonation-bar.css">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
<div id="impersonation-bar" class="impersonation-bar">
    <button id="toggle-impersonation-bar" class="impersonation-toggle-btn" title="Balken ausblenden/einblenden">
        <i class="fas fa-chevron-down"></i>
    </button>
    <div class="impersonation-bar-content">
        <div class="impersonation-info">
            <i class="fas fa-user-secret"></i>
            <span class="impersonation-text">
                Eingeloggt als <strong><?php echo htmlspecialchars($current_name); ?></strong> (Admin: <?php echo htmlspecialchars($original_name); ?>)
            </span>
        </div>
        <button id="stop-impersonation-btn" class="btn-stop-impersonation">
            <i class="fas fa-sign-out-alt"></i> Zurück zum Admin-Account
        </button>
    </div>
</div>
<script src="/partials/impersonation-bar/impersonation-bar.js"></script>
<?php endif; ?>

