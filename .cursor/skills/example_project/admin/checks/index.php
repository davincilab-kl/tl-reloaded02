<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Checks</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="checks-container">
        <h1>Checks</h1>
        
        <div class="checks-grid">
            <div class="check-card">
                <div class="check-header">
                    <h3><i class="fas fa-check-circle"></i> Statusprüfung der Lehrkräfte</h3>
                </div>
                <div class="check-content">
                    <p>Prüft alle Lehrkräfte auf korrekte Statuszuordnung und zeigt inkonsistente Fälle an.</p>
                    <button id="check-teacher-status-btn" class="btn btn-primary">
                        <i class="fas fa-play"></i> Status prüfen
                    </button>
                </div>
            </div>
            
            <div class="check-card">
                <div class="check-header">
                    <h3><i class="fas fa-school"></i> Förderungs-Check</h3>
                </div>
                <div class="check-content">
                    <p>Prüft Schulen, bei denen mindestens eine Lehrkraft das Infowebinar besucht hat, aber die Förderung noch nicht eingestellt wurde.</p>
                    <button id="check-funding-btn" class="btn btn-primary">
                        <i class="fas fa-play"></i> Förderung prüfen
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Modal für Status-Prüfung -->
        <div id="status-check-modal" class="modal" style="display: none;">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Status-Prüfung</h3>
                    <span class="modal-close" onclick="checksManager.closeStatusCheckModal()">&times;</span>
                </div>
                <div class="modal-body" id="status-check-body">
                    <div class="loading-status-check">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Status werden geprüft...</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="checksManager.closeStatusCheckModal()">Schließen</button>
                </div>
            </div>
        </div>
        
        <!-- Modal für Förderungs-Check -->
        <div id="funding-check-modal" class="modal" style="display: none;">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Förderungs-Check</h3>
                    <span class="modal-close" onclick="checksManager.closeFundingCheckModal()">&times;</span>
                </div>
                <div class="modal-body" id="funding-check-body">
                    <div class="loading-status-check">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Förderung wird geprüft...</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="checksManager.closeFundingCheckModal()">Schließen</button>
                </div>
            </div>
        </div>
    </main>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js?v=<?php echo time(); ?>"></script>
</body>
</html>

