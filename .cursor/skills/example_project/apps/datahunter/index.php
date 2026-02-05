<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_login();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DataHunter</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <div class="page-container">
        <!-- Welcome Screen -->
        <div id="welcome-screen" class="screen active">
            <div class="welcome-wrapper">
                <div class="app-screens-container">
                    <div class="app-screen-card" style="--rotation: -10deg; z-index: 1;">
                        <img src="imgs/app-screen-1.jpg" alt="App Screen 1" class="app-screen-image">
                    </div>
                    <div class="app-screen-card" style="--rotation: 4deg; z-index: 3;">
                        <img src="imgs/app-screen-2.jpg" alt="App Screen 2" class="app-screen-image">
                    </div>
                    <div class="app-screen-card" style="--rotation: 16deg; z-index: 2;">
                        <img src="imgs/app-screen-3.jpg" alt="App Screen 3" class="app-screen-image">
                    </div>
                </div>
                <div class="container welcome-container">
                    <h1 class="page-header">Social Media Simulator</h1>
                    <p class="intro-text">
                        Du bist in einem simulierten sozialen Netzwerk.<br>
                        Like, kommentiere oder schaue dir Inhalte an - wie du es aus deinen Lieblingsapps kennst.
                    </p>
                    <button id="start-btn" class="btn-primary">Let's scroll!</button>
                </div>
            </div>
        </div>

        <!-- Social Feed Screen -->
        <div id="social-feed" class="screen">
            <div class="feed-header">
                <h2>📱 Dein Feed</h2>
                <div class="action-counter">
                    <span id="action-count">0</span> Aktionen
                </div>
            </div>
            
            <div class="feed-wrapper">
                <div id="feed-container" class="feed-container">
                    <!-- Feed items will be generated here -->
                </div>
                <div class="feed-scroll-control">
                    <button class="scroll-btn scroll-up" id="scroll-up-btn" title="Nach oben">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                    <button class="scroll-btn scroll-down" id="scroll-down-btn" title="Nach unten">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="feed-actions">
                <button id="show-profile-btn" class="btn-continue profile-btn-disabled" style="display: block;">
                    Weiter
                </button>
            </div>
        </div>

        <!-- Profile Popup -->
        <div id="profile-popup" class="popup-overlay">
            <div class="popup-content">
                <h2>Wir haben ein paar Dinge über dich gelernt…</h2>
                <div id="profile-summary" class="profile-summary">
                    <!-- Profile data will be shown here -->
                </div>
                <div class="profile-popup-actions">
                    <button id="go-shopping-from-profile-btn" class="btn-continue">Lass uns Shoppen!</button>
                </div>
            </div>
        </div>

        <!-- Shopping Screen -->
        <div id="shopping-screen" class="screen">
            <div class="shopping-header">
                <h2>🛒 Personalisierte Shopping-Angebote</h2>
                <div class="shopping-controls">
                    <label class="toggle-switch">
                        <input type="checkbox" id="personalization-toggle" checked>
                        <span>Personalisierte Ansicht</span>
                    </label>
                    <button id="transparency-btn" class="btn-secondary">❓ Warum sehe ich das?</button>
                </div>
            </div>
            
            <div id="shopping-container" class="shopping-container">
                <!-- Products will be generated here -->
            </div>

            <div class="shopping-actions">
                <button id="back-to-feed-btn" class="btn-secondary">← Zurück zum Feed</button>
                <button id="reflection-btn" class="btn-primary">🎭 Reflexionsmodus</button>
            </div>
        </div>

        <!-- Transparency Dashboard -->
        <div id="transparency-screen" class="screen">
            <div class="dashboard-header">
                <h2>📊 Das wusste die Seite über dich</h2>
                <button id="close-transparency-btn" class="btn-secondary">✕ Schließen</button>
            </div>
            
            <div class="dashboard-content">
                <section class="dashboard-section">
                    <h3>1️⃣ Inhalte, die dein Profil beeinflusst haben</h3>
                    <div id="influenced-content" class="content-list"></div>
                </section>

                <section class="dashboard-section">
                    <h3>2️⃣ Profil, das aus deinen Daten erzeugt wurde</h3>
                    <div id="generated-profile" class="profile-details"></div>
                </section>

                <section class="dashboard-section">
                    <h3>3️⃣ Welche Schlüsse daraus gezogen wurden</h3>
                    <div id="inferences" class="inferences-list"></div>
                </section>

                <section class="dashboard-section">
                    <h3>4️⃣ Welche Werbetreibenden dich ansprechen würden</h3>
                    <div id="advertisers" class="advertisers-list"></div>
                </section>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button id="summary-from-dashboard-btn" class="btn-primary">🎓 Zusammenfassung ansehen</button>
                </div>
            </div>
        </div>

        <!-- Reflection Mode -->
        <div id="reflection-screen" class="screen">
            <div class="reflection-header">
                <h2>🎭 Reflexionsmodus: Was wäre passiert, wenn…?</h2>
                <button id="close-reflection-btn" class="btn-secondary">✕ Schließen</button>
            </div>
            
            <div class="reflection-content">
                <div class="scenario-selector">
                    <button class="scenario-btn" data-scenario="normal">Aktuelles Profil</button>
                    <button class="scenario-btn" data-scenario="neutral">Neutral (keine Likes)</button>
                    <button class="scenario-btn" data-scenario="sport">Nur Sport</button>
                    <button class="scenario-btn" data-scenario="music">Nur Musik</button>
                    <button class="scenario-btn" data-scenario="gaming">Nur Gaming</button>
                </div>
                
                <div id="reflection-products" class="shopping-container"></div>
            </div>
        </div>

        <!-- Summary Screen -->
        <div id="summary-screen" class="screen">
            <div class="summary-container">
                <h1>🎓 Was hast du über deine Daten gelernt?</h1>
                
                <div class="summary-content">
                    <div class="learning-point">
                        <h3>⚡ Wie schnell Online-Profile entstehen</h3>
                        <p>Schon nach <strong id="summary-actions">0</strong> Aktionen wurde ein detailliertes Profil über dich erstellt.</p>
                    </div>

                    <div class="learning-point">
                        <h3>📊 Wie wenig Daten nötig sind</h3>
                        <p>Jeder Like, jeder Kommentar, jede Sekunde, die du etwas ansiehst, wird gespeichert und analysiert.</p>
                    </div>

                    <div class="learning-point">
                        <h3>🎯 Wie Werbung beeinflusst wird</h3>
                        <p>Dein Profil bestimmt, welche Produkte dir gezeigt werden – nicht zufällig, sondern gezielt!</p>
                    </div>

                    <div class="learning-point">
                        <h3>🔗 Wie Websites Daten verknüpfen</h3>
                        <p>Viele Websites teilen Daten miteinander, um ein noch genaueres Bild von dir zu erstellen.</p>
                    </div>

                    <div class="learning-point">
                        <h3>🛡️ Wie du dich schützen kannst</h3>
                        <ul>
                            <li><strong>DSGVO-Rechte nutzen:</strong> Du hast das Recht zu erfahren, welche Daten gespeichert werden</li>
                            <li><strong>Privatsphäre-Einstellungen:</strong> In Apps und Browsern anpassen</li>
                            <li><strong>Tracking ausschalten:</strong> Browser-Einstellungen für "Do Not Track"</li>
                            <li><strong>Bewusst interagieren:</strong> Überlege, bevor du etwas likest oder teilst</li>
                            <li><strong>Cookies verwalten:</strong> Nur notwendige Cookies akzeptieren</li>
                        </ul>
                    </div>
                </div>

                <div class="summary-actions">
                    <button id="restart-btn" class="btn-primary">🔄 Nochmal starten</button>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>

