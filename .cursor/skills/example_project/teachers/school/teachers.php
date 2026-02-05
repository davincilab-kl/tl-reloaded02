<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lehrkräfte</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../teachers-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="page-container">
        <div class="page-header">
            <h1><i class="fas fa-users"></i> Lehrkräfte</h1>
        </div>

        <div class="page-header-actions">
            <button id="invite-teachers-btn" class="btn-invite-teachers">
                <i class="fas fa-user-plus"></i> Lehrkräfte einladen
            </button>
        </div>

        <div id="invitations-view" class="invitations-view" style="display: none;">
            <div class="invitations-header">
                <h2><i class="fas fa-envelope-open-text"></i> Einladungen</h2>
            </div>
            <div id="invitations-content" class="invitations-content">
                <div class="loading-messages">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Einladungsoptionen...</span>
                </div>
            </div>
        </div>

        <div id="teachers-tabs-view" class="teachers-tabs-view">
        <div class="tab-group">
            <button class="tab-button active" data-tab="teachers">Lehrkräfte</button>
            <button class="tab-button" data-tab="waitlist">Warteliste</button>
        </div>

        <div id="teachers-content" class="tab-content active">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Lehrkräfte...</span>
            </div>
        </div>

        <div id="waitlist-content" class="tab-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Warteliste...</span>
            </div>
        </div>
        </div>
    </main>

    <script src="./scripts.js"></script>
</body>
</html>

