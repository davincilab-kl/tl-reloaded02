<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Neue Liste erstellen</title>
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
            <h1>Neue Liste erstellen</h1>
            <a href="./index.php" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Zurück
            </a>
        </div>
        
        <form id="create-list-form" class="create-list-form">
            <div class="form-section">
                <h2>Grundinformationen</h2>
                <div class="form-group">
                    <label for="list-name">Listen-Name *</label>
                    <input type="text" id="list-name" class="form-input" required placeholder="z.B. Lehrer ohne Infowebinar">
                </div>
            </div>
            
            <div class="form-section">
                <h2>Filter</h2>
                <div class="form-group">
                    <label for="filter-schools">Schule</label>
                    <select id="filter-schools" class="form-input" multiple>
                        <option value="">Lade Schulen...</option>
                    </select>
                    <small>Mehrere Schulen mit Strg/Cmd auswählbar</small>
                </div>
                
                <div class="form-group">
                    <label for="filter-infowebinar">Info-Webinar</label>
                    <select id="filter-infowebinar" class="form-input">
                        <option value="">Alle</option>
                        <option value="ja">Teilgenommen</option>
                        <option value="nein">Nicht teilgenommen</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filter-admin-role">Admin-Rolle</label>
                    <select id="filter-admin-role" class="form-input">
                        <option value="">Alle</option>
                        <option value="admin">Nur Admins</option>
                        <option value="teacher">Nur Lehrer</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filter-status">Status</label>
                    <select id="filter-status" class="form-input">
                        <option value="">Alle</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filter-bundesland">Bundesland</label>
                    <select id="filter-bundesland" class="form-input">
                        <option value="">Alle</option>
                        <option value="Wien">Wien</option>
                        <option value="Niederösterreich">Niederösterreich</option>
                        <option value="Oberösterreich">Oberösterreich</option>
                        <option value="Steiermark">Steiermark</option>
                        <option value="Tirol">Tirol</option>
                        <option value="Kärnten">Kärnten</option>
                        <option value="Salzburg">Salzburg</option>
                        <option value="Vorarlberg">Vorarlberg</option>
                        <option value="Burgenland">Burgenland</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filter-foerderung">Förderung</label>
                    <select id="filter-foerderung" class="form-input">
                        <option value="">Alle</option>
                        <option value="ja">Gefördert</option>
                        <option value="nein">Nicht gefördert</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filter-search">Suche (Name/E-Mail)</label>
                    <input type="text" id="filter-search" class="form-input" placeholder="Suchbegriff...">
                </div>
            </div>
            
            <div class="form-section">
                <h2>Spalten-Auswahl</h2>
                <div class="columns-grid">
                    <div class="column-group">
                        <h3>Grunddaten</h3>
                        <label><input type="checkbox" data-column="name" checked> Name</label>
                        <label><input type="checkbox" data-column="email" checked> E-Mail</label>
                        <label><input type="checkbox" data-column="phone"> Telefon</label>
                        <label><input type="checkbox" data-column="school_name" checked> Schule</label>
                        <label><input type="checkbox" data-column="school_bundesland"> Bundesland</label>
                    </div>
                    
                    <div class="column-group">
                        <h3>Info-Webinar</h3>
                        <label><input type="checkbox" data-column="infowebinar"> Info-Webinar Datum</label>
                    </div>
                    
                    <div class="column-group">
                        <h3>Statistiken</h3>
                        <label><input type="checkbox" data-column="class_count"> Klassen-Anzahl</label>
                        <label><input type="checkbox" data-column="student_count"> Schüler-Anzahl</label>
                        <label><input type="checkbox" data-column="total_t_coins"> T!Coins gesamt</label>
                        <label><input type="checkbox" data-column="avg_t_coins"> T!Score (Durchschnitt)</label>
                        <label><input type="checkbox" data-column="project_count"> Projekte</label>
                    </div>
                    
                    <div class="column-group">
                        <h3>Aktivität</h3>
                        <label><input type="checkbox" data-column="last_login"> Letzter Login</label>
                        <label><input type="checkbox" data-column="registered_at"> Registrierungsdatum</label>
                    </div>
                    
                    <div class="column-group">
                        <h3>Status</h3>
                        <label><input type="checkbox" data-column="status_name"> Status-Name</label>
                        <label><input type="checkbox" data-column="admin"> Admin-Rolle</label>
                        <label><input type="checkbox" data-column="school_foerderung"> Förderung</label>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window.location.href='./index.php'">Abbrechen</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Liste erstellen und cachen
                </button>
            </div>
        </form>
    </main>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js?v=<?php echo time(); ?>"></script>
</body>
</html>

