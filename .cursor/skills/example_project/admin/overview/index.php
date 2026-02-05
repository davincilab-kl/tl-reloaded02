<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Übersicht - Visualisierungen</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="overview-container">
        <div class="overview-header">
            <h1><i class="fas fa-chart-network"></i> Übersicht - Visualisierungen</h1>
        </div>

        <!-- Boxen-Menü zur Auswahl der Visualisierung -->
        <div class="visualization-selector">
            <h2>Visualisierung auswählen</h2>
            <div class="visualization-boxes">
                <div class="visualization-box active" data-visualization="database-schema">
                    <div class="box-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="box-title">Datenbank-Schema</div>
                    <div class="box-description">Tabellen und Abhängigkeiten visuell darstellen</div>
                </div>
                <div class="visualization-box" data-visualization="api-table-access">
                    <div class="box-icon">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <div class="box-title">API-Tabellen-Zugriffe</div>
                    <div class="box-description">Welche APIs auf welche Tabellen zugreifen</div>
                </div>
                <!-- Weitere Visualisierungen können hier hinzugefügt werden -->
            </div>
        </div>

        <!-- Visualisierungsbereich -->
        <div class="visualization-area">
            <div id="visualization-container" class="visualization-container">
                <div class="loading-message">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Visualisierung...</span>
                </div>
            </div>
        </div>
    </main>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

