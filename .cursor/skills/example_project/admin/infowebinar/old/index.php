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
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h1><i class="fas fa-video"></i> Infowebinar-Anmeldungen</h1>
            <button class="btn btn-secondary" onclick="infowebinarManager.exportToXLSX()" title="Als Excel-Datei exportieren">
                <i class="fas fa-file-excel"></i> Excel exportieren
            </button>
        </div>

        <div id="infowebinar-content" class="infowebinar-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Anmeldungen...</span>
            </div>
        </div>
    </main>

    <!-- Modal: Infowebinar-Details eintragen -->
    <div id="infowebinar-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Info-Webinar Datum</h3>
                <span class="modal-close" onclick="infowebinarManager.closeInfowebinarModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="infowebinar-date">Datum:</label>
                    <input type="date" id="infowebinar-date" class="form-input">
                </div>
                <div class="form-group">
                    <label for="infowebinar-time">Uhrzeit:</label>
                    <input type="time" id="infowebinar-time" class="form-input" step="1800">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="infowebinarManager.closeInfowebinarModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="infowebinarManager.confirmInfowebinar()">Eintragen</button>
            </div>
        </div>
    </div>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

