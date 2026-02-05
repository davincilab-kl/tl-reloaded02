<?php
    require_once __DIR__ . '/../../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Schule bearbeiten</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../../admin-style.css">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="edit-container">
        <div class="edit-header">
            <h1>Schule bearbeiten</h1>
            <a href="../index.php" class="btn btn-secondary">Zurück zur Übersicht</a>
        </div>
        
        <div id="loading" class="loading">Lade Schuldaten...</div>
        
        <form id="school-form" class="school-form" style="display: none;">
            <div class="form-section">
                <h3>Grunddaten</h3>
                <div class="form-group">
                    <label for="school-name">Schulname *</label>
                    <input type="text" id="school-name" name="name" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label for="school-bundesland">Bundesland *</label>
                    <select id="school-bundesland" name="bundesland" class="form-input" required>
                        <option value="">Bundesland auswählen...</option>
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
                
                <div class="form-group">
                    <label for="school-ort">Ort</label>
                    <input type="text" id="school-ort" name="ort" class="form-input">
                </div>
                
                <div class="form-group">
                    <label for="school-schulart">Schulart</label>
                    <input type="text" id="school-schulart" name="schulart" class="form-input" placeholder="z.B. Gymnasium, HTL, etc.">
                </div>
            </div>
            
            <div class="form-section">
                <h3>Förderung</h3>
                <div class="form-group">
                    <label for="school-foerderung">Förderung aktiviert</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="school-foerderung" name="foerderung" class="form-checkbox">
                        <label for="school-foerderung" class="checkbox-label">Förderung ist aktiviert</label>
                    </div>
                </div>
                
                <div class="form-group" id="sponsor-group" style="display: none;">
                    <label for="school-sponsor">Sponsor</label>
                    <select id="school-sponsor" name="sponsor" class="form-input">
                        <option value="">Sponsor auswählen...</option>
                    </select>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Zusätzliche Informationen</h3>
                <div class="form-group">
                    <label for="school-erstelldatum">Erstelldatum</label>
                    <input type="date" id="school-erstelldatum" name="erstelldatum" class="form-input">
                </div>
                
                <div class="form-group">
                    <label>Schul-ID</label>
                    <input type="text" id="school-id-display" class="form-input" readonly>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window.location.href='../index.php'">Abbrechen</button>
                <button type="submit" class="btn btn-primary">Speichern</button>
            </div>
        </form>
        
        <div id="error-message" class="error-message" style="display: none;"></div>
    </main>

    <script src="../../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>
