<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher(); // Erlaube Admin und Teacher
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nachrichten</title>
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
        <div class="messages-header">
            <h1><i class="fas fa-comments"></i> Alle Nachrichten</h1>
        </div>

        <!-- Tab-Navigation -->
        <div class="tab-group">
            <button class="tab-button active" data-tab="active" id="tab-active">
                <i class="fas fa-inbox"></i> Aktive
            </button>
            <button class="tab-button" data-tab="archived" id="tab-archived">
                <i class="fas fa-archive"></i> Archiv
            </button>
        </div>

        <div class="messages-list" id="threads-list">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Nachrichten...</span>
            </div>
        </div>
    </main>

    <!-- Modal: Konversation anzeigen und antworten -->
    <div id="message-thread-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-comments"></i> Konversation</h3>
                <button class="modal-close" id="close-thread-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="thread-messages" class="thread-messages">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Konversation...</span>
                    </div>
                </div>
                <div class="thread-reply-section">
                    <label for="reply-text" class="modal-label">Antwort schreiben</label>
                    <textarea id="reply-text" class="modal-textarea" rows="4" placeholder="Deine Antwort..."></textarea>
                    <div class="modal-hint" id="reply-hint" style="display:none;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="delete-thread-btn" class="btn-secondary btn-delete-thread">
                    <i class="fas fa-archive"></i>
                    <span>Ins Archiv verschieben</span>
                </button>
                <div class="modal-footer-right">
                    <button class="btn-secondary" id="cancel-reply">Schließen</button>
                    <button class="btn-primary" id="send-reply">Antworten</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="./scripts.js"></script>
</body>
</html>

