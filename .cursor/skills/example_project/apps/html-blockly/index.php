<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_login();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMLblockly</title>
    <script src="js/lib/blockly.min.js"></script>
    <script src="js/lib/msg_de.js"></script>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    <div class="page-container">
        <div class="page-header">
            <h1><i class="fas fa-code"></i> HTMLblockly</h1>
        </div>
        
        <!-- Fortschrittsanzeige -->
        <div class="progress-indicator">
            <div class="progress-dots">
                <span class="progress-dot active" data-exercise="0"></span>
                <span class="progress-dot" data-exercise="1"></span>
                <span class="progress-dot" data-exercise="2"></span>
                <span class="progress-dot" data-exercise="3"></span>
                <span class="progress-dot" data-exercise="4"></span>
                <span class="progress-dot" data-exercise="5"></span>
            </div>
        </div>
        
        <!-- Übungscontainer -->
        <div class="exercises-container">
            <!-- Übung 1: HTML und Text -->
            <div class="exercise-section active" data-exercise="0">
                <div class="exercise-intro">
                    <h2>Übung 1: HTML-Grundlagen und Text</h2>
                    <p>In dieser Übung lernst du die Grundlagen von HTML kennen. Du kannst HTML-Dokumente erstellen und Text-Elemente wie Überschriften und Absätze hinzufügen.</p>
                </div>
                <div id="exercise-0-widget"></div>
            </div>
            
            <!-- Übung 2: HTML, Text und Medien -->
            <div class="exercise-section" data-exercise="1">
                <div class="exercise-intro">
                    <h2>Übung 2: Medien hinzufügen</h2>
                    <p>Jetzt kannst du auch Bilder in deine HTML-Seite einfügen. Probiere aus, wie du Medien-Elemente verwenden kannst.</p>
                </div>
                <div id="exercise-1-widget"></div>
            </div>
            
            <!-- Übung 3: HTML, Text, Medien und Interaktion -->
            <div class="exercise-section" data-exercise="2">
                <div class="exercise-intro">
                    <h2>Übung 3: Interaktive Elemente</h2>
                    <p>Lerne, wie du Links zu anderen Seiten oder Websites erstellen kannst. Interaktive Elemente machen deine Website lebendig!</p>
                </div>
                <div id="exercise-2-widget"></div>
            </div>
            
            <!-- Übung 4: HTML, Text, Medien, Interaktion und Listen -->
            <div class="exercise-section" data-exercise="3">
                <div class="exercise-intro">
                    <h2>Übung 4: Listen erstellen</h2>
                    <p>Mit Listen kannst du Informationen strukturiert darstellen. Du kannst sowohl Aufzählungslisten als auch nummerierte Listen erstellen.</p>
                </div>
                <div id="exercise-3-widget"></div>
            </div>
            
            <!-- Übung 5: Alles + Container (divs) -->
            <div class="exercise-section" data-exercise="4">
                <div class="exercise-intro">
                    <h2>Übung 5: Organisation mit Containern</h2>
                    <p>Jetzt lernst du, wie du deine Website mit div-Containern organisieren kannst. Container helfen dir, verschiedene Bereiche deiner Seite zu strukturieren und zu gestalten.</p>
                </div>
                <div id="exercise-4-widget"></div>
            </div>
            
            <!-- Übung 6: HTML-Code-Editor -->
            <div class="exercise-section" data-exercise="5">
                <div class="exercise-intro">
                    <h2>Übung 6: HTML direkt schreiben</h2>
                    <p>Jetzt kannst du HTML-Code direkt schreiben! Nutze den Editor links, um deinen HTML-Code zu schreiben. Die Vorschau rechts zeigt dir sofort, wie deine Website aussieht.</p>
                </div>
                <div class="code-editor-container">
                    <div class="code-editor-wrapper">
                        <div class="code-editor-header">
                            <span><i class="fas fa-code"></i> HTML-Code</span>
                            <div class="header-buttons">
                                <input type="file" id="image-upload-input" accept="image/*" style="display: none;">
                                <button class="btn-upload" id="btn-upload-image" title="Bild hochladen und einfügen">
                                    <i class="fas fa-image"></i> Bild hochladen
                                </button>
                                <button class="btn-download" id="btn-download-html" title="HTML-Code herunterladen">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </div>
                        </div>
                        <div class="code-editor-content">
                            <textarea id="html-code-editor" class="html-code-editor" placeholder="Schreibe hier deinen HTML-Code..."><html>
    <head>
        <title>Meine Website</title>
    </head>
    <body>
        <h1>Willkommen!</h1>
        <p>Das ist meine erste HTML-Seite.</p>
    </body>
</html></textarea>
                            <pre id="html-code-highlight" class="html-code-highlight"></pre>
                        </div>
                        <div class="uploaded-images-section">
                            <div class="uploaded-images-header">
                                <span><i class="fas fa-images"></i> Hochgeladene Bilder</span>
                            </div>
                            <div id="uploaded-images-list" class="uploaded-images-list">
                                <p class="no-images-message">Noch keine Bilder hochgeladen</p>
                            </div>
                        </div>
                    </div>
                    <div class="code-preview-wrapper">
                        <div class="code-preview-header">
                            <span><i class="fas fa-eye"></i> Vorschau</span>
                        </div>
                        <div class="code-preview-content">
                            <iframe id="html-code-preview" class="html-code-preview" sandbox="allow-same-origin"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Navigation -->
        <div class="exercise-navigation">
            <button class="btn-nav btn-prev" id="btn-prev" disabled>
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button class="btn-nav btn-next" id="btn-next">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>
    
    <script src="js/blocks.js"></script>
    <script src="js/generator.js"></script>
    <script src="js/app.js"></script>
    <script src="js/exercises.js"></script>
</body>
</html>
