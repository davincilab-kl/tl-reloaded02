<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Infowebinar - Admin</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="page-container">
        <div class="page-header">
            <h1><i class="fas fa-calendar-alt"></i> Infowebinar-Termine</h1>
            <div class="sync-buttons-container">
                <span id="last-sync-time" class="last-sync-time"></span>
                <div class="sync-button-wrapper">
                    <button id="refresh-calendly-btn" class="btn btn-primary sync-main-btn">
                        <i class="fas fa-sync-alt"></i>
                        <span>Aktualisieren (30 Tage)</span>
                    </button>
                </div>
                <button id="refresh-calendly-dropdown-btn" class="btn btn-primary sync-dropdown-btn">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div id="refresh-calendly-dropdown" class="sync-dropdown">
                    <div class="sync-dropdown-header">
                        <label class="sync-dropdown-label">Ab Datum (optional):</label>
                        <input type="datetime-local" id="sync-min-date" class="form-input sync-date-input">
                    </div>
                    <button id="sync-all-btn" class="btn btn-primary sync-all-btn">
                        <i class="fas fa-sync"></i> Alle aktualisieren
                    </button>
                </div>
            </div>
        </div>

        <div id="infowebinar-content" class="infowebinar-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Termine...</span>
            </div>
        </div>
    </main>

    <!-- Modal: Event bearbeiten -->
    <div id="event-edit-modal" class="modal">
        <div class="modal-content event-edit-modal-content">
            <div class="modal-header">
                <h3 id="event-edit-modal-title">Event bearbeiten</h3>
                <span class="modal-close" onclick="infowebinarManager.closeEventEditModal()">&times;</span>
            </div>
            <div class="modal-body" id="event-edit-modal-body">
                <!-- Wird dynamisch gefüllt -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="infowebinarManager.closeEventEditModal()">Schließen</button>
                <button class="btn btn-primary" id="save-all-attendees-btn" onclick="infowebinarManager.saveAllAttendees()">
                    <i class="fas fa-save"></i> Speichern
                </button>
            </div>
        </div>
    </div>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

