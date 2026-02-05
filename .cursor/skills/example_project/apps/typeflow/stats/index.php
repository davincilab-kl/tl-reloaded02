<?php
    require_once __DIR__ . '/../../../api/config/auth.php';
    require_login();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Statistiken - 10-Finger-System Trainer</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <div class="page-container">
        <div class="page-header">
            <h1><i class="fas fa-chart-bar"></i> Statistiken</h1>
        </div>

        <div class="controls">
            <a href="../index.php" class="btn btn-primary">← Zurück zum Trainer</a>
        </div>

        <div class="stats-section">
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-label">Durchschnittliche Geschwindigkeit</span>
                    <span class="stat-value" id="avg-wpm">0</span>
                    <span class="stat-unit">WPM</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Richtig getippt</span>
                    <span class="stat-value" id="total-correct">0</span>
                    <span class="stat-unit">Zeichen</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Falsch getippt</span>
                    <span class="stat-value" id="total-incorrect">0</span>
                    <span class="stat-unit">Zeichen</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Genauigkeit</span>
                    <span class="stat-value" id="overall-accuracy">100</span>
                    <span class="stat-unit">%</span>
                </div>
            </div>
        </div>

        <div class="stats-section">
            <h2>Buchstaben-Statistiken</h2>
            <div class="keyboard-container">
                <div class="keyboard" id="keyboard"></div>
            </div>
        </div>
    </div>

    <script>
        // Finger-Zuordnung für jede Taste
        const fingerMap = {
            'q': 'finger-left-pinkie', 'a': 'finger-left-pinkie', 'y': 'finger-left-pinkie',
            'w': 'finger-left-ring', 's': 'finger-left-ring', 'x': 'finger-left-ring',
            'e': 'finger-left-middle', 'd': 'finger-left-middle', 'c': 'finger-left-middle',
            'r': 'finger-left-index', 'f': 'finger-left-index', 'v': 'finger-left-index',
            't': 'finger-left-index', 'g': 'finger-left-index', 'b': 'finger-left-index',
            'z': 'finger-left-pinkie', 'ü': 'finger-left-pinkie',
            'u': 'finger-right-index', 'j': 'finger-right-index', 'm': 'finger-right-index',
            'i': 'finger-right-index', 'k': 'finger-right-index',
            'o': 'finger-right-middle', 'l': 'finger-right-middle',
            'p': 'finger-right-ring', 'ö': 'finger-right-ring',
            'ä': 'finger-right-pinkie', '-': 'finger-right-pinkie',
            'h': 'finger-right-index', 'n': 'finger-right-index',
            ' ': 'finger-thumb'
        };

        // Tastatur-Layout (QWERTZ)
        const keyboardLayout = [
            ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
            ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
        ];

        function getStats() {
            const stats = JSON.parse(localStorage.getItem('typingStats') || '{}');
            // Stelle sicher, dass alle benötigten Felder existieren
            if (!stats.charStats) {
                stats.charStats = {};
            }
            if (stats.totalCorrect === undefined) {
                stats.totalCorrect = 0;
            }
            if (stats.totalIncorrect === undefined) {
                stats.totalIncorrect = 0;
            }
            if (!stats.wpmHistory) {
                stats.wpmHistory = [];
            }
            return stats;
        }

        function createKey(key, extraClass = '', showStats = true) {
            const keyElement = document.createElement('div');
            keyElement.className = `key ${extraClass}`;
            
            const keyLabel = document.createElement('div');
            keyLabel.className = 'key-label';
            keyLabel.textContent = key.toUpperCase();
            keyElement.appendChild(keyLabel);
            
            if (showStats) {
                const keyStats = document.createElement('div');
                keyStats.className = 'key-stats';
                keyStats.textContent = '—';
                keyElement.appendChild(keyStats);
            }
            
            keyElement.dataset.key = key.toLowerCase();
            return keyElement;
        }

        function initializeKeyboard() {
            const keyboard = document.getElementById('keyboard');
            keyboard.innerHTML = '';
            
            keyboardLayout.forEach((row, rowIndex) => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'keyboard-row';
                
                // Obere Reihe (rowIndex 0) leicht nach links verschieben
                if (rowIndex === 0) {
                    rowDiv.style.marginLeft = '-28px'; // Etwa halbe Taste nach links
                }
                // Untere Reihe (rowIndex 2) eine ganze Taste nach links verschieben
                else if (rowIndex === 2) {
                    rowDiv.style.marginLeft = '0px';
                }
                
                row.forEach((key, keyIndex) => {
                    const keyElement = createKey(key, '', true); // Mit Statistiken
                    // Event-Listener für Hover-Tooltip hinzufügen
                    keyElement.addEventListener('mouseenter', showKeyTooltip);
                    keyElement.addEventListener('mouseleave', hideKeyTooltip);
                    
                    // Ruhetasten-Tooltip hinzufügen
                    const keyLower = key.toLowerCase();
                    const homeRowKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ö'];
                    if (homeRowKeys.includes(keyLower)) {
                        keyElement.addEventListener('mouseenter', showFingerTooltip);
                        keyElement.addEventListener('mouseleave', hideFingerTooltip);
                    }
                    
                    rowDiv.appendChild(keyElement);
                });
                
                keyboard.appendChild(rowDiv);
            });
            
            // Vierte Reihe mit Leertaste (unter c bis m)
            const spaceRow = document.createElement('div');
            spaceRow.className = 'keyboard-row';
            
            // Platzhalter für die ersten zwei Tasten (y, x) - jeweils 50px + 6px gap
            const placeholder1 = document.createElement('div');
            placeholder1.style.width = '112px'; // 2 * (50px + 6px gap)
            placeholder1.style.visibility = 'hidden';
            spaceRow.appendChild(placeholder1);
            
            const spaceKey = createKey(' ', 'space', true); // Mit Statistiken
            // Event-Listener für Hover-Tooltip hinzufügen
            spaceKey.addEventListener('mouseenter', showKeyTooltip);
            spaceKey.addEventListener('mouseleave', hideKeyTooltip);
            spaceRow.appendChild(spaceKey);
            
            // Platzhalter für die letzten drei Tasten (n, m, -) - jeweils 50px + 6px gap
            const placeholder2 = document.createElement('div');
            placeholder2.style.width = '168px'; // 3 * (50px + 6px gap)
            placeholder2.style.visibility = 'hidden';
            spaceRow.appendChild(placeholder2);
            
            keyboard.appendChild(spaceRow);
        }

        function getAccuracyColor(accuracy) {
            if (accuracy === -1) {
                // Noch nie getippt
                return '#95a5a6'; // Grau
            } else if (accuracy < 50) {
                return '#e74c3c'; // Rot
            } else if (accuracy < 80) {
                return '#f39c12'; // Gelb/Orange
            } else {
                return '#2ecc71'; // Grün
            }
        }

        function updateKeyboardStats() {
            const stats = getStats();
            const charStats = stats.charStats || {};
            
            // Aktualisiere Statistiken für jede Taste
            document.querySelectorAll('.key').forEach(keyElement => {
                const key = keyElement.dataset.key;
                if (!key) return;
                
                const stat = charStats[key.toLowerCase()];
                const statsElement = keyElement.querySelector('.key-stats');
                
                let accuracy = -1; // -1 bedeutet noch nie getippt
                
                if (statsElement) {
                    if (stat && (stat.correct > 0 || stat.incorrect > 0)) {
                        const total = stat.correct + stat.incorrect;
                        accuracy = Math.round((stat.correct / total) * 100);
                        statsElement.textContent = `${accuracy}%`;
                    } else {
                        statsElement.textContent = '—';
                    }
                }
                
                // Statistik für Tooltip speichern
                keyElement.dataset.statCorrect = stat ? stat.correct : 0;
                keyElement.dataset.statIncorrect = stat ? stat.incorrect : 0;
                
                // Farbe basierend auf Genauigkeit setzen
                const color = getAccuracyColor(accuracy);
                keyElement.style.background = color;
            });
        }

        function showKeyTooltip(event) {
            // Entferne vorhandenes Tooltip
            hideKeyTooltip();
            
            const keyElement = event.currentTarget;
            const correct = parseInt(keyElement.dataset.statCorrect) || 0;
            const incorrect = parseInt(keyElement.dataset.statIncorrect) || 0;
            
            // Erstelle Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'key-tooltip';
            
            if (correct === 0 && incorrect === 0) {
                // Keine Daten vorhanden
                tooltip.innerHTML = `
                    <div class="tooltip-stat">Richtig: <strong>—</strong></div>
                    <div class="tooltip-stat">Genauigkeit: <strong>—</strong></div>
                `;
            } else {
                const total = correct + incorrect;
                const accuracy = Math.round((correct / total) * 100);
                tooltip.innerHTML = `
                    <div class="tooltip-stat">Richtig: <strong>${correct}</strong></div>
                    <div class="tooltip-stat">Genauigkeit: <strong>${accuracy}%</strong></div>
                `;
            }
            
            document.body.appendChild(tooltip);
            
            // Positioniere Tooltip über der Taste
            const rect = keyElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltipRect.width / 2)}px`;
            tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
        }

        function hideKeyTooltip() {
            const tooltip = document.querySelector('.key-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        }

        // Finger-Namen für Ruhetasten
        function getFingerName(key) {
            const fingerNames = {
                'a': 'Kleiner Finger (links)',
                's': 'Ringfinger (links)',
                'd': 'Mittelfinger (links)',
                'f': 'Zeigefinger (links)',
                'j': 'Zeigefinger (rechts)',
                'k': 'Mittelfinger (rechts)',
                'l': 'Ringfinger (rechts)',
                'ö': 'Kleiner Finger (rechts)'
            };
            return fingerNames[key.toLowerCase()] || '';
        }

        function showFingerTooltip(event) {
            // Entferne vorhandenes Finger-Tooltip
            hideFingerTooltip();
            
            const keyElement = event.currentTarget;
            const key = keyElement.dataset.key;
            const fingerName = getFingerName(key);
            
            if (!fingerName) return;
            
            // Erstelle Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'key-tooltip finger-tooltip';
            tooltip.textContent = fingerName;
            document.body.appendChild(tooltip);
            
            // Positioniere Tooltip über der Taste (etwas höher als Statistik-Tooltip)
            const rect = keyElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltipRect.width / 2)}px`;
            tooltip.style.top = `${rect.top - tooltipRect.height - 50}px`; // Höher positioniert
        }

        function hideFingerTooltip() {
            const tooltip = document.querySelector('.finger-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        }

        function displayStats() {
            const stats = getStats();
            
            // Übersicht
            const wpmHistory = stats.wpmHistory || [];
            const avgWPM = wpmHistory.length > 0 
                ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
                : 0;
            document.getElementById('avg-wpm').textContent = avgWPM;
            
            const totalCorrect = stats.totalCorrect || 0;
            const totalIncorrect = stats.totalIncorrect || 0;
            document.getElementById('total-correct').textContent = totalCorrect;
            document.getElementById('total-incorrect').textContent = totalIncorrect;
            
            const total = totalCorrect + totalIncorrect;
            const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 100;
            document.getElementById('overall-accuracy').textContent = accuracy;
            
            // Tastatur-Statistiken aktualisieren
            updateKeyboardStats();
        }

        document.addEventListener('DOMContentLoaded', () => {
            initializeKeyboard();
            displayStats();
        });
    </script>
</body>
</html>

