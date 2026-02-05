<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Leaderboards</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="leaderboards-container">
        <h1>Leaderboards</h1>
        
        <!-- Tab-Navigation -->
        <div class="tab-navigation">
            <button class="tab-button active" data-tab="schools">Schulen</button>
            <button class="tab-button" data-tab="teachers">Lehrer</button>
            <button class="tab-button" data-tab="classes">Klassen</button>
            <button class="tab-button" data-tab="students">Schüler</button>
        </div>

        <!-- Schulen Leaderboard -->
        <div id="schools-tab" class="tab-content active">
            <div class="leaderboard-header">
                <h2>Top 100 Schulen</h2>
            </div>
            <div id="schools-leaderboard" class="leaderboard-table">
                <!-- Schulen werden hier dynamisch geladen -->
            </div>
        </div>

        <!-- Lehrer Leaderboard -->
        <div id="teachers-tab" class="tab-content">
            <div class="leaderboard-header">
                <h2>Top 100 Lehrer</h2>
            </div>
            <div id="teachers-leaderboard" class="leaderboard-table">
                <!-- Lehrer werden hier dynamisch geladen -->
            </div>
        </div>

        <!-- Klassen Leaderboard -->
        <div id="classes-tab" class="tab-content">
            <div class="leaderboard-header">
                <h2>Top 100 Klassen</h2>
            </div>
            <div id="classes-leaderboard" class="leaderboard-table">
                <!-- Klassen werden hier dynamisch geladen -->
            </div>
        </div>

        <!-- Schüler Leaderboard -->
        <div id="students-tab" class="tab-content">
            <div class="leaderboard-header">
                <h2>Top 100 Schüler</h2>
            </div>
            <div id="students-leaderboard" class="leaderboard-table">
                <!-- Schüler werden hier dynamisch geladen -->
            </div>
        </div>
    </main>

    <!-- Scroll to Top Button -->
    <button id="scroll-to-top" class="scroll-to-top-btn" onclick="scrollToTop()">
        <img src="../../imgs/scroll_up.png" alt="Nach oben" />
    </button>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>
