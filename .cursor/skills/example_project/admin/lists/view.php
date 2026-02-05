<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
    
    $list_id = isset($_GET['list_id']) ? intval($_GET['list_id']) : 0;
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Liste anzeigen</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="lists-container">
        <div class="lists-header">
            <div class="header-left">
                <a href="./index.php" class="back-link">
                    <i class="fas fa-arrow-left"></i>
                </a>
                <h1 id="list-title">Liste</h1>
            </div>
            <div class="header-actions">
                <button class="btn btn-secondary" onclick="listsManager.exportToXLSX()" title="Als Excel-Datei exportieren">
                    <i class="fas fa-file-excel"></i> Excel exportieren
                </button>
                <button class="btn btn-secondary" id="fullscreen-toggle" onclick="listsManager.toggleFullscreen()">
                    <i class="fas fa-expand"></i> Vollbild
                </button>
                <button class="btn btn-secondary" onclick="listsManager.transferNotes()" title="Alle Notizen aus dieser Liste in die Lehrkräfte-Notizen übertragen">
                    <i class="fas fa-file-export"></i> Notizen übertragen
                </button>
                <button class="btn btn-secondary" onclick="listsManager.refreshList()">
                    <i class="fas fa-sync-alt"></i> Aktualisieren
                </button>
            </div>
        </div>
        
        <div class="list-filters">
            <div class="filter-group">
                <label for="filter-color">Farbe:</label>
                <select id="filter-color" class="form-input">
                    <option value="">Alle</option>
                    <option value="red">Rot</option>
                    <option value="yellow">Gelb</option>
                    <option value="green">Grün</option>
                    <option value="blue">Blau</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Lila</option>
                    <option value="gray">Grau</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="filter-tag">Tag:</label>
                <input type="text" id="filter-tag" class="form-input" placeholder="Tag suchen...">
            </div>
            
            <div class="filter-group">
                <label for="filter-search">Suche:</label>
                <input type="text" id="filter-search" class="form-input" placeholder="Name/E-Mail suchen...">
            </div>
            
            <button class="btn btn-secondary" onclick="listsManager.clearFilters()">Filter zurücksetzen</button>
        </div>
        
        <div class="results-info">
            <span id="results-count">Lade...</span>
            <div class="per-page-selector">
                <label for="per-page-select">Einträge pro Seite:</label>
                <select id="per-page-select" class="form-input" onchange="listsManager.changePerPage(this.value)">
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="all">Alle</option>
                </select>
            </div>
        </div>
        
        <div id="pagination-top" class="pagination"></div>
        
        <div id="list-entries" class="list-entries">
            <div class="loading">Lade Einträge...</div>
        </div>
        
        <div id="pagination" class="pagination"></div>
    </main>
    
    <!-- Vollbildmodus Exit Button -->
    <button id="fullscreen-exit-btn" class="fullscreen-exit-btn" onclick="listsManager.toggleFullscreen()" style="display: none;">
        <i class="fas fa-compress"></i>
    </button>
    
    <!-- Notizen Modal -->
    <div id="notes-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="notes-modal-title">Notizen</h3>
                <span class="modal-close" onclick="listsManager.closeNotesModal()">
                    <i class="fas fa-times"></i>
                </span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="notes-text">Notizen:</label>
                    <textarea id="notes-text" class="form-input" rows="8" placeholder="Notizen eingeben..."></textarea>
                </div>
                <div id="notes-meta" class="notes-meta"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="listsManager.closeNotesModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="listsManager.saveNotes()">Speichern</button>
            </div>
        </div>
    </div>
    
    <!-- Tags Modal -->
    <div id="tags-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="tags-modal-title">Tags bearbeiten</h3>
                <span class="modal-close" onclick="listsManager.closeTagModal()">
                    <i class="fas fa-times"></i>
                </span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Bereits bekannte Tags:</label>
                    <div id="available-tags" class="tags-flexbox"></div>
                </div>
                <div class="form-group">
                    <label for="new-tag-input">Neues Tag hinzufügen:</label>
                    <div class="tag-input-container">
                        <input type="text" id="new-tag-input" class="form-input" placeholder="Tag eingeben und Enter drücken...">
                        <button class="btn btn-primary" onclick="listsManager.addNewTag()">Hinzufügen</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="listsManager.closeTagModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="listsManager.saveTags()">Speichern</button>
            </div>
        </div>
    </div>

    <script>
        const LIST_ID = <?php echo $list_id; ?>;
    </script>
    <script src="../admin-common.js"></script>
    <script src="./scripts.js?v=<?php echo time(); ?>"></script>
</body>
</html>

