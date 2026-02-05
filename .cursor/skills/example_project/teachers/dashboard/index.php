<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher(); // Erlaube Admin und Teacher
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge Dashboard</title>
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
        <div class="dashboard-header">
            <h1><i class="fas fa-tachometer-alt"></i> Lehrkraft-Dashboard</h1>
        </div>

        <div id="school-status-widget" class="widget school-status-widget" style="display: none;">
            <div class="widget-content" id="school-status-content">
                <div class="loading-messages">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Status...</span>
                </div>
            </div>
        </div>

        <div class="dashboard-widgets">
            <div class="widget messages-widget">
                <div class="widget-header">
                    <h3><i class="fas fa-envelope"></i> Nachrichten</h3>
                    <span class="message-count" id="message-count">0</span>
                </div>
                <div class="widget-content">
                <div class="widget-actions">
                        <button id="open-message-modal" class="action-btn">
                            <i class="fas fa-paper-plane"></i>
                            Nachricht senden
                        </button>
                    </div>
                    <div id="messages-content">
                        <div class="loading-messages">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Lade Nachrichten...</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="widget teacher-stats-widget">
                <div class="widget-header">
                    <h3><i class="fas fa-chart-line"></i> Statistik Schüler:innen</h3>
                </div>
                <div class="widget-content" id="teacher-stats-content">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Statistiken...</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Nachricht an Admin -->
        <div id="message-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-envelope"></i> Nachricht an TalentsLounge-Team</h3>
                    <button class="modal-close" id="close-message-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="message-title" class="modal-label">Betreff</label>
                    <input type="text" id="message-title" class="modal-input" placeholder="Betreff der Nachricht..." maxlength="200">
                    <label for="message-text" class="modal-label">Ihre Nachricht</label>
                    <textarea id="message-text" class="modal-textarea" rows="6" placeholder="Bitte geben Sie Ihre Nachricht ein…"></textarea>
                    <div class="modal-hint" id="message-hint" style="display:none;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-message">Abbrechen</button>
                    <button class="btn btn-primary" id="send-message">Senden</button>
                </div>
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
                    <textarea id="reply-text" class="modal-textarea" rows="4" placeholder="Ihre Antwort..."></textarea>
                    <div class="modal-hint" id="reply-hint" style="display:none;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-reply">Abbrechen</button>
                <button class="btn btn-primary" id="send-reply">Antworten</button>
            </div>
        </div>
    </div>
    
    <script src="./scripts.js"></script>
</body>
</html>

