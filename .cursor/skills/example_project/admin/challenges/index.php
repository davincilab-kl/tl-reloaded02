<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Challenges verwalten</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="challenges-admin-container">
        <div class="page-header">
            <h1><i class="fas fa-trophy"></i> Challenges verwalten</h1>
            <button class="btn btn-primary" id="create-challenge-btn">
                <i class="fas fa-plus"></i> Neue Challenge erstellen
            </button>
        </div>

        <div id="challenges-list" class="challenges-list">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Challenges...</span>
            </div>
        </div>
    </main>

    <!-- Modal: Challenge erstellen/bearbeiten -->
    <div id="challenge-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-trophy"></i> <span id="modal-title">Challenge erstellen</span></h3>
                <button class="modal-close" id="close-challenge-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="challenge-form">
                    <input type="hidden" id="challenge-id" name="challenge_id">
                    
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <i class="fas fa-info-circle"></i> Grundinformationen
                        </h4>
                        <div class="form-group">
                            <label for="challenge-title">
                                <i class="fas fa-heading"></i> Titel <span class="required">*</span>
                            </label>
                            <input type="text" id="challenge-title" name="title" required placeholder="Challenge-Titel eingeben">
                        </div>
                        
                        <div class="form-group">
                            <label for="challenge-description">
                                <i class="fas fa-align-left"></i> Beschreibung
                            </label>
                            <textarea id="challenge-description" name="description" rows="4" placeholder="Detaillierte Beschreibung der Challenge..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <i class="fas fa-cog"></i> Challenge-Einstellungen
                        </h4>
                        <div class="form-group">
                            <label for="challenge-challenge-type">
                                <i class="fas fa-tasks"></i> Challenge-Typ <span class="required">*</span>
                            </label>
                            <select id="challenge-challenge-type" name="challenge_type" required>
                                <option value="tscore">T!Score (Klassen)</option>
                                <option value="projects">Projekte (Jury-Bewertung)</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group form-group-half">
                                <label for="challenge-state-filter">
                                    <i class="fas fa-map-marker-alt"></i> Bundesland-Filter
                                </label>
                                <select id="challenge-state-filter" name="state_filter">
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
                            </div>
                            
                            <div class="form-group form-group-half">
                                <label for="challenge-sponsor-filter">
                                    <i class="fas fa-hand-holding-usd"></i> Sponsor-Filter
                                </label>
                                <select id="challenge-sponsor-filter" name="sponsor_filter">
                                    <option value="">Alle Sponsoren</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="challenge-state">
                                <i class="fas fa-toggle-on"></i> Status <span class="required">*</span>
                            </label>
                            <select id="challenge-state" name="state" required>
                                <option value="active">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                                <option value="archived">Archiviert</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <i class="fas fa-calendar-alt"></i> Zeitraum
                        </h4>
                        <div class="form-row">
                            <div class="form-group form-group-half">
                                <label for="challenge-start-date">
                                    <i class="far fa-calendar-alt"></i> Startdatum
                                </label>
                                <input type="date" id="challenge-start-date" name="start_date">
                            </div>
                            
                            <div class="form-group form-group-half">
                                <label for="challenge-end-date">
                                    <i class="far fa-calendar"></i> Enddatum
                                </label>
                                <input type="date" id="challenge-end-date" name="end_date">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <i class="fas fa-image"></i> Bild
                        </h4>
                        <div class="form-group">
                            <label for="challenge-image">
                                <i class="fas fa-upload"></i> Challenge-Bild
                            </label>
                            <input type="file" id="challenge-image" name="image" accept="image/*">
                            <div id="challenge-image-preview" class="challenge-image-preview" style="display: none; margin-top: 15px;">
                                <img id="challenge-image-preview-img" src="" alt="Vorschau" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #ddd;">
                                <button type="button" id="challenge-image-remove" class="btn btn-secondary" style="margin-top: 10px;">
                                    <i class="fas fa-times"></i> Bild entfernen
                                </button>
                            </div>
                            <input type="hidden" id="challenge-image-path" name="image_path">
                        </div>
                    </div>
                    
                    <div class="error-message" id="challenge-error" style="display: none;"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-challenge">Abbrechen</button>
                <button class="btn btn-primary" id="submit-challenge">Speichern</button>
            </div>
        </div>
    </div>
    
    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

