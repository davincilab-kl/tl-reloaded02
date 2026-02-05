<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_login();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeFlow - 10-Finger-System Trainer</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <div class="page-container">
        <div class="page-header">
            <h1><i class="fas fa-keyboard"></i> TypeFlow</h1>
        </div>

        <div class="intro-text">
            <p>
                <strong>💡 Tipp:</strong> Einfach lostippen! Die Zeit startet automatisch beim ersten Tastendruck.
            </p>
        </div>

        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">Runden-Zeit</span>
                <span class="stat-value" id="round-timer">00:00</span>
                <span class="stat-unit"></span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Level</span>
                <span class="stat-value" id="level-number">1</span>
                <span class="stat-unit"></span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Geschwindigkeit</span>
                <span class="stat-value" id="cpm">0</span>
                <span class="stat-unit">Zeichen pro Minute</span>
            </div>
            <div class="stat-item" id="accuracy-stat">
                <span class="stat-label">Genauigkeit</span>
                <span class="stat-value" id="accuracy">100</span>
                <span class="stat-unit">%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Zeichen</span>
                <span class="stat-value" id="chars">0</span>
                <span class="stat-unit">/ <span id="total-chars">0</span></span>
            </div>
        </div>

        <div class="text-display">
            <div class="conveyor-belt" id="conveyor-belt"></div>
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
            </div>
        </div>

        <div class="keyboard-container">
            <h3 class="finger-hint-title">Ruhetasten</h3>
            <div class="finger-hint">
                <p>Lege deine Finger auf die farbigen Tasten - die Daumen auf die Leertaste.</p>
            </div>
            <div class="keyboard" id="keyboard"></div>
        </div>

        <div class="controls">
            <button id="restart-btn" class="btn btn-secondary">Neustart</button>
            <a href="stats/index.php" class="btn btn-primary">Statistiken</a>
        </div>

        <div class="instructions">
            <h3>Anleitung</h3>
            <ul>
                <li>Platziere deine Finger auf der Grundposition (ASDF und JKLÖ)</li>
                <li>Tippe den Text ab, der oben angezeigt wird</li>
                <li>Die Tastatur zeigt dir, welcher Finger für welche Taste verwendet werden sollte</li>
                <li>Versuche, möglichst schnell und genau zu tippen</li>
            </ul>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>

