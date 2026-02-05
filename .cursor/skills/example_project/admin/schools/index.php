<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Schulen</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="schools-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1 style="margin: 0;">Schulen</h1>
            <button class="btn btn-secondary" onclick="schoolsManager.exportToXLSX()" title="Als Excel-Datei exportieren">
                <i class="fas fa-file-excel"></i> Excel exportieren
            </button>
        </div>
        
        <!-- Such- und Filterbereich -->
        <div class="search-filters">
            <div class="search-box">
                <input type="text" id="search-input" placeholder="Schule suchen..." />
                <button id="search-btn">Suchen</button>
            </div>
            <div class="filter-box">
                <select id="bundesland-filter">
                    <option value="">Alle Bundesländer</option>
                    <option value="Burgenland">Burgenland</option>
                    <option value="Kärnten">Kärnten</option>
                    <option value="Niederösterreich">Niederösterreich</option>
                    <option value="Oberösterreich">Oberösterreich</option>
                    <option value="Salzburg">Salzburg</option>
                    <option value="Steiermark">Steiermark</option>
                    <option value="Tirol">Tirol</option>
                    <option value="Vorarlberg">Vorarlberg</option>
                    <option value="Wien">Wien</option>
                </select>
                <select id="infowebinar-filter">
                    <option value="">Alle Info-Webinare</option>
                    <option value="ja">Info-Webinar teilgenommen</option>
                    <option value="nein">Info-Webinar nicht teilgenommen</option>
                </select>
                <select id="sponsor-filter">
                    <option value="">Alle Sponsoren</option>
                    <option value="keine">Keine Förderung</option>
                    <option value="mit">Mit Förderung</option>
                </select>
                <button id="clear-filters">Reset</button>
            </div>
        </div>

        <!-- Pagination (oben) -->
        <div id="pagination-top" class="pagination">
            <!-- Pagination wird hier dynamisch erstellt -->
        </div>

        <!-- Ergebnisse -->
        <div class="results-info">
            <span id="results-count">Lade...</span>
        </div>

        <!-- Schulen-Liste -->
        <div id="schools-list" class="schools-list">
            <!-- Schulen werden hier dynamisch geladen -->
        </div>

        <!-- Pagination -->
        <div id="pagination" class="pagination">
            <!-- Pagination wird hier dynamisch erstellt -->
        </div>
    </main>

    <!-- Förderung Modal -->
    <div id="foerderung-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Förderung aktivieren</h3>
                <span class="modal-close" onclick="schoolsManager.closeFoerderungModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="sponsor-select">Sponsor:</label>
                    <select id="sponsor-select" class="form-input">
                        <option value="">Sponsor auswählen...</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="schoolsManager.closeFoerderungModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="schoolsManager.confirmFoerderung()">Bestätigen</button>
            </div>
        </div>
    </div>

    <!-- Infowebinar Modal -->
    <div id="infowebinar-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Info-Webinar Datum</h3>
                <span class="modal-close" onclick="schoolsManager.closeInfowebinarModal()">&times;</span>
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
                <button class="btn btn-secondary" onclick="schoolsManager.closeInfowebinarModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="schoolsManager.confirmInfowebinar()">Eintragen</button>
            </div>
        </div>
    </div>

    <!-- Schuljahre mit Sponsor Modal -->
    <div id="school-years-modal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3 id="school-years-modal-title">Schuljahre mit Sponsor</h3>
                <span class="modal-close" onclick="schoolsManager.closeSchoolYearsModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div id="school-years-modal-content">
                    <!-- Inhalt wird dynamisch geladen -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="schoolsManager.closeSchoolYearsModal()">Schließen</button>
            </div>
        </div>
    </div>

    <!-- Scroll to Top Button -->
    <button id="scroll-to-top" class="scroll-to-top-btn" onclick="scrollToTop()">
        <img src="../../imgs/scroll_up.png" alt="Nach oben" />
    </button>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

