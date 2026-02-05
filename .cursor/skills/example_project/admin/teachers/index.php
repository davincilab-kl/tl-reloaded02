<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lehrkräfte</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="teachers-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1 style="margin: 0;">Lehrkräfte</h1>
            <button class="btn btn-secondary" onclick="teachersManager.exportToXLSX()" title="Als Excel-Datei exportieren">
                <i class="fas fa-file-excel"></i> Excel exportieren
            </button>
        </div>
        
        <!-- Such- und Filterbereich -->
        <div class="search-filters">
            <div class="search-box">
                <input type="text" id="search-input" placeholder="Lehrkräfte suchen..." />
            </div>
            <div class="filter-box">
                <input type="text" id="school-filter" placeholder="Schule suchen..." />
                <button id="search-btn">Suchen</button>
                <select id="infowebinar-filter">
                    <option value="">Alle Info-Webinare</option>
                    <option value="ja">Info-Webinar teilgenommen</option>
                    <option value="nein">Info-Webinar nicht teilgenommen</option>
                </select>
                <select id="admin-filter">
                    <option value="">Alle Rollen</option>
                    <option value="admin">Nur Admins</option>
                    <option value="teacher">Nur Lehrkräfte</option>
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

        <!-- Lehrkräfte-Liste -->
        <div id="teachers-list" class="teachers-list">
            <!-- Lehrkräfte werden hier dynamisch geladen -->
        </div>

        <!-- Pagination -->
        <div id="pagination" class="pagination">
            <!-- Pagination wird hier dynamisch erstellt -->
        </div>
    </main>

    <!-- Info-Webinar Modal -->
    <div id="infowebinar-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Info-Webinar Datum</h3>
                <span class="modal-close" onclick="teachersManager.closeInfowebinarModal()">&times;</span>
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
                <button class="btn btn-secondary" onclick="teachersManager.closeInfowebinarModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="teachersManager.confirmInfowebinar()">Eintragen</button>
            </div>
        </div>
    </div>

    <!-- Notizen Modal -->
    <div id="notes-modal" class="modal" style="display: none;">
        <div class="modal-content notes-modal-content">
            <div class="modal-header">
                <h3 id="notes-modal-title">Notizen</h3>
                <span class="modal-close" onclick="teachersManager.closeNotesModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div id="notes-list-container">
                    <div class="loading">Lade Notizen...</div>
                </div>
                <div class="notes-actions">
                    <button class="btn btn-primary" onclick="teachersManager.showNoteEditModal(null)">
                        <i class="fas fa-plus"></i> Neue Notiz hinzufügen
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Notiz Bearbeiten Modal -->
    <div id="note-edit-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="note-edit-modal-title">Neue Notiz</h3>
                <span class="modal-close" onclick="teachersManager.closeNoteEditModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="note-text-input">Notiz:</label>
                    <textarea id="note-text-input" class="form-input" rows="6" placeholder="Notiz eingeben..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="teachersManager.closeNoteEditModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="teachersManager.saveNote()">Speichern</button>
            </div>
        </div>
    </div>

    <!-- Scroll to Top Button -->
    <button id="scroll-to-top" class="scroll-to-top-btn" onclick="scrollToTop()">
        <img src="../../imgs/scroll_up.png" alt="Nach oben" />
    </button>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js?v=<?php echo time(); ?>"></script>
</body>
</html>

