// Level-Definitionen: Welche Buchstaben in welchem Level erlaubt sind
const levelChars = {
    1: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', ' '], // Nur mittlere Reihe
    2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', ' '], // Mittlere + obere Reihe
    3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', ' '] // Alle Reihen + Satzzeichen
};

let currentLevel = 1;

// Tastatur-Layout (QWERTZ)
const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
    ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
];

let currentRound = 1;
let roundChars = []; // Array der Buchstaben für die aktuelle Runde
let currentCharIndex = 0; // Index des aktuellen Buchstabens in der Runde
let roundStartTime = null; // Zeitpunkt, wann die Runde gestartet wurde
let roundTimerInterval = null; // Interval für den Timer
let errors = 0;
let correctChars = 0;
let roundComplete = false;
let typedResults = []; // Array mit true/false für jedes getippte Zeichen
let roundStarted = false; // Ob die Runde bereits gestartet wurde (erster Tastendruck)
let levelCorrectChars = 0; // Anzahl richtiger Zeichen im aktuellen Level
let levelTotalChars = 0; // Gesamtanzahl getippter Zeichen im aktuellen Level

// Statistik-Funktionen
function initStats() {
    if (!localStorage.getItem('typingStats')) {
        const initialStats = {
            totalCorrect: 0,
            totalIncorrect: 0,
            charStats: {}, // { 'a': { correct: 10, incorrect: 2 }, ... }
            wpmHistory: [] // Array von WPM-Werten pro Session
        };
        localStorage.setItem('typingStats', JSON.stringify(initialStats));
    }
}

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

function saveStats(stats) {
    localStorage.setItem('typingStats', JSON.stringify(stats));
}

function recordChar(char, isCorrect) {
    const stats = getStats();
    const charLower = char.toLowerCase();
    
    // Stelle sicher, dass charStats existiert
    if (!stats.charStats) {
        stats.charStats = {};
    }
    
    // Stelle sicher, dass der Buchstabe existiert
    if (!stats.charStats[charLower]) {
        stats.charStats[charLower] = { correct: 0, incorrect: 0 };
    }
    
    // Aktualisiere Statistiken
    if (isCorrect) {
        stats.charStats[charLower].correct++;
        stats.totalCorrect = (stats.totalCorrect || 0) + 1;
    } else {
        stats.charStats[charLower].incorrect++;
        stats.totalIncorrect = (stats.totalIncorrect || 0) + 1;
    }
    
    // Speichere Statistiken
    saveStats(stats);
}

function recordWPM(wpm) {
    const stats = getStats();
    if (!stats.wpmHistory) {
        stats.wpmHistory = [];
    }
    stats.wpmHistory.push(wpm);
    saveStats(stats);
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    initStats();
    initializeKeyboard();
    prepareRound(); // Bereite Runde vor, starte aber noch nicht
    
    const restartBtn = document.getElementById('restart-btn');
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Verhindere Scrollen mit Leertaste
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.code === 'Space') {
            // Verhindere Scrollen nur wenn nicht in einem Input-Feld
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        }
    });
    
    // Setze standardmäßig Lexend als Schriftart
    setFont('Lexend');
    
    restartBtn.addEventListener('click', () => prepareRound());
});

function setFont(fontName) {
    const belt = document.getElementById('conveyor-belt');
    if (belt) {
        belt.style.fontFamily = `'${fontName}', sans-serif`;
    }
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
            rowDiv.style.marginLeft = '0px'; // Eine ganze Taste (50px + 6px gap)
        }
        
        row.forEach((key, keyIndex) => {
            const keyElement = createKey(key, '', false); // Keine Statistiken auf Hauptseite
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
    
    const spaceKey = createKey(' ', 'space', false); // Keine Statistiken auf Hauptseite
    spaceKey.style.background = 'linear-gradient(90deg, #ff8c42 42%, #4a90e2 58%)';
    // Event-Listener für Tooltip bei Leertaste hinzufügen
    spaceKey.addEventListener('mouseenter', showFingerTooltip);
    spaceKey.addEventListener('mouseleave', hideFingerTooltip);
    spaceRow.appendChild(spaceKey);
    
    // Platzhalter für die letzten drei Tasten (n, m, -) - jeweils 50px + 6px gap
    const placeholder2 = document.createElement('div');
    placeholder2.style.width = '168px'; // 3 * (50px + 6px gap)
    placeholder2.style.visibility = 'hidden';
    spaceRow.appendChild(placeholder2);
    
    keyboard.appendChild(spaceRow);
}

function createKey(key, extraClass = '', showStats = false) {
    const keyElement = document.createElement('div');
    const keyLower = key.toLowerCase();
    
    // Nur Grundpositionstasten einfärben
    const homeRowKeys = {
        'a': 'finger-left-home',
        's': 'finger-left-home',
        'd': 'finger-left-home',
        'f': 'finger-left-home',
        'j': 'finger-right-home',
        'k': 'finger-right-home',
        'l': 'finger-right-home',
        'ö': 'finger-right-home'
    };
    
    const fingerClass = homeRowKeys[keyLower] || '';
    keyElement.className = `key ${fingerClass} ${extraClass}`;
    
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
    
    keyElement.dataset.key = keyLower;
    
    // Event-Listener für Tooltip bei Ruhetasten hinzufügen
    if (fingerClass) {
        keyElement.addEventListener('mouseenter', showFingerTooltip);
        keyElement.addEventListener('mouseleave', hideFingerTooltip);
    }
    
    return keyElement;
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
        
        if (stat && (stat.correct > 0 || stat.incorrect > 0)) {
            const total = stat.correct + stat.incorrect;
            const accuracy = Math.round((stat.correct / total) * 100);
            statsElement.textContent = `${accuracy}%`;
            statsElement.title = `Richtig: ${stat.correct}, Falsch: ${stat.incorrect}`;
        } else {
            statsElement.textContent = '—';
            statsElement.title = '';
        }
    });
}

function generateTextForLevel(level) {
    if (level === 1) {
        // Level 1: Einfache Muster mit Grundposition
        const homeRowPairs = [
            ['f', 'f', 'j', 'j'],
            ['d', 'd', 'k', 'k'],
            ['s', 's', 'l', 'l'],
            ['a', 'a', 'ö', 'ö'],
            ['f', 'j', 'f', 'j'],
            ['d', 'k', 'd', 'k'],
            ['s', 'l', 's', 'l'],
            ['a', 'ö', 'a', 'ö'],
            ['f', 'f', 'f', 'f'],
            ['j', 'j', 'j', 'j'],
            ['d', 'd', 'd', 'd'],
            ['k', 'k', 'k', 'k'],
            ['s', 's', 's', 's'],
            ['l', 'l', 'l', 'l'],
            ['a', 'a', 'a', 'a'],
            ['ö', 'ö', 'ö', 'ö']
        ];
        
        let text = '';
        const numPairs = 12; // Anzahl der Paare für einen Text
        
        for (let i = 0; i < numPairs; i++) {
            const pair = homeRowPairs[Math.floor(Math.random() * homeRowPairs.length)];
            text += pair.join('');
            if (i < numPairs - 1) {
                text += ' ';
            }
        }
        
        return text;
    } else {
        // Level 2 und 3: Zufällige Texte mit erlaubten Zeichen
        const allowedChars = levelChars[level];
        const textLength = 50;
        let text = '';
        
        for (let i = 0; i < textLength; i++) {
            const randomChar = allowedChars[Math.floor(Math.random() * allowedChars.length)];
            text += randomChar;
            
            // Füge gelegentlich Leerzeichen ein (aber nicht am Anfang/Ende)
            if (i > 0 && i < textLength - 1 && Math.random() < 0.15) {
                text += ' ';
            }
        }
        
        // Entferne doppelte Leerzeichen und trimme
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
}

function setLevel(level) {
    currentLevel = level;
    currentRound = 1;
    
    // Setze Level-Genauigkeits-Zähler zurück
    levelCorrectChars = 0;
    levelTotalChars = 0;
    
    // Aktualisiere Level-Anzeige
    document.getElementById('level-number').textContent = currentLevel;
    
    // Aktiviere den entsprechenden Button
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.level) === level) {
            btn.classList.add('active');
        }
    });
    
    startNewRound();
}

function generateRoundChars() {
    const allowedChars = levelChars[currentLevel];
    const chars = [];
    
    if (currentLevel === 1) {
        // Level 1: Gruppen wie "aaff gghh lklk"
        const homeRowPairs = [
            ['f', 'f', 'j', 'j'],
            ['d', 'd', 'k', 'k'],
            ['s', 's', 'l', 'l'],
            ['a', 'a', 'ö', 'ö'],
            ['f', 'j', 'f', 'j'],
            ['d', 'k', 'd', 'k'],
            ['s', 'l', 's', 'l'],
            ['a', 'ö', 'a', 'ö'],
            ['f', 'f', 'f', 'f'],
            ['j', 'j', 'j', 'j'],
            ['d', 'd', 'd', 'd'],
            ['k', 'k', 'k', 'k'],
            ['s', 's', 's', 's'],
            ['l', 'l', 'l', 'l'],
            ['a', 'a', 'a', 'a'],
            ['ö', 'ö', 'ö', 'ö'],
            ['g', 'g', 'h', 'h'],
            ['g', 'h', 'g', 'h'],
            ['a', 's', 'd', 'f'],
            ['j', 'k', 'l', 'ö']
        ];
        
        // Generiere 100 Zeichen in Gruppen
        let charCount = 0;
        while (charCount < 100) {
            const pair = homeRowPairs[Math.floor(Math.random() * homeRowPairs.length)];
            for (let i = 0; i < pair.length && charCount < 100; i++) {
                chars.push(pair[i]);
                charCount++;
            }
            // Füge Leerzeichen zwischen Gruppen ein (außer am Ende)
            if (charCount < 100) {
                chars.push(' ');
                charCount++;
            }
        }
    } else {
        // Level 2 und 3: Zufällige Zeichen in Gruppen
        let charCount = 0;
        while (charCount < 100) {
            // Gruppe von 3-6 Zeichen
            const groupLength = Math.floor(Math.random() * 4) + 3; // 3-6 Zeichen
            for (let i = 0; i < groupLength && charCount < 100; i++) {
                const randomChar = allowedChars[Math.floor(Math.random() * allowedChars.length)];
                if (randomChar !== ' ') {
                    chars.push(randomChar);
                    charCount++;
                }
            }
            // Füge Leerzeichen zwischen Gruppen ein (außer am Ende)
            if (charCount < 100) {
                chars.push(' ');
                charCount++;
            }
        }
    }
    
    // Stelle sicher, dass das letzte Zeichen kein Leerzeichen ist
    while (chars.length > 0 && chars[chars.length - 1] === ' ') {
        chars.pop();
        // Füge ein zufälliges Zeichen hinzu, das kein Leerzeichen ist
        const nonSpaceChars = allowedChars.filter(c => c !== ' ');
        if (nonSpaceChars.length > 0) {
            const randomChar = nonSpaceChars[Math.floor(Math.random() * nonSpaceChars.length)];
            chars.push(randomChar);
        }
    }
    
    return chars;
}

function prepareRound() {
    roundChars = generateRoundChars();
    currentCharIndex = 0;
    errors = 0;
    correctChars = 0;
    roundComplete = false;
    typedResults = [];
    roundStarted = false;
    
    // Stoppe Timer falls vorhanden
    if (roundTimerInterval) {
        clearInterval(roundTimerInterval);
    }
    roundStartTime = null;
    document.getElementById('round-timer').textContent = '00:00';
    
    displayConveyorBelt();
    updateStats();
    document.getElementById('level-number').textContent = currentLevel;
    updateProgressBar();
    
    // Initialisiere Genauigkeitsfarbe
    updateAccuracyColor(100);
}

function startNewRound() {
    prepareRound();
}


function updateRoundTimer() {
    if (!roundStartTime) {
        document.getElementById('round-timer').textContent = '00:00';
        return;
    }
    
    const elapsed = Math.floor((Date.now() - roundStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('round-timer').textContent = formattedTime;
}

function displayConveyorBelt() {
    const belt = document.getElementById('conveyor-belt');
    belt.innerHTML = '';
    
    // Zeige immer 21 Zeichen: 10 vor, aktueller (in der Mitte), 10 nach
    const charsBefore = 10;
    const charsAfter = 10;
    
    // Berechne wie viele Zeichen vor/nach dem aktuellen angezeigt werden können
    const availableBefore = currentCharIndex;
    const availableAfter = roundChars.length - currentCharIndex - 1;
    
    const showBefore = Math.min(charsBefore, availableBefore);
    const showAfter = Math.min(charsAfter, availableAfter);
    
    // Füge Platzhalter vorne hinzu, wenn nötig (um die Mitte zu halten)
    const placeholderBefore = charsBefore - showBefore;
    for (let i = 0; i < placeholderBefore; i++) {
        const placeholder = document.createElement('span');
        placeholder.className = 'belt-char placeholder';
        placeholder.textContent = '\u00A0';
        belt.appendChild(placeholder);
    }
    
    // Zeige die tatsächlichen Zeichen
    const displayStart = currentCharIndex - showBefore;
    const displayEnd = currentCharIndex + showAfter + 1;
    
    for (let i = displayStart; i < displayEnd; i++) {
        if (i < 0 || i >= roundChars.length) continue;
        
        const charSpan = document.createElement('span');
        charSpan.className = 'belt-char';
        
        if (i < currentCharIndex) {
            // Bereits getippt
            const wasCorrect = typedResults[i];
            charSpan.classList.add('typed');
            if (wasCorrect) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
            }
        } else if (i === currentCharIndex) {
            charSpan.classList.add('current');
        }
        
        charSpan.textContent = roundChars[i] === ' ' ? '\u00A0' : roundChars[i];
        belt.appendChild(charSpan);
    }
    
    // Füge Platzhalter hinten hinzu, wenn nötig (um die Mitte zu halten)
    const placeholderAfter = charsAfter - showAfter;
    for (let i = 0; i < placeholderAfter; i++) {
        const placeholder = document.createElement('span');
        placeholder.className = 'belt-char placeholder';
        placeholder.textContent = '\u00A0';
        belt.appendChild(placeholder);
    }
}

function handleKeyPress(e) {
    if (roundComplete) return;
    
    // Prüfe ob Modal noch offen ist
    const modal = document.getElementById('font-modal');
    if (modal && modal.style.display === 'flex') {
        return; // Ignoriere Tastendrücke wenn Modal offen ist
    }
    
    // Starte Timer beim ersten Tastendruck
    if (!roundStarted) {
        roundStarted = true;
        roundStartTime = Date.now();
        updateRoundTimer();
        roundTimerInterval = setInterval(updateRoundTimer, 1000);
    }
    
    const expectedChar = roundChars[currentCharIndex];
    const typedChar = e.key.toLowerCase();
    
    // Prüfe ob die Taste erlaubt ist
    const allowedChars = levelChars[currentLevel];
    if (!allowedChars.includes(typedChar)) {
        return; // Ignoriere nicht erlaubte Zeichen
    }
    
    const isCorrect = typedChar === expectedChar.toLowerCase();
    typedResults[currentCharIndex] = isCorrect;
    
    // Aktualisiere Level-Genauigkeits-Zähler
    levelTotalChars++;
    if (isCorrect) {
        correctChars++;
        levelCorrectChars++;
        recordChar(expectedChar, true);
    } else {
        errors++;
        recordChar(expectedChar, false);
    }
    
    currentCharIndex++;
    
    // Prüfe ob Runde fertig
    if (currentCharIndex >= roundChars.length) {
        checkRoundComplete();
    } else {
        displayConveyorBelt();
        updateStats();
    }
}

function checkRoundComplete() {
    roundComplete = true;
    if (roundTimerInterval) {
        clearInterval(roundTimerInterval);
    }
    
    // Berechne Statistiken für diese Runde
    const accuracy = (correctChars / roundChars.length) * 100;
    let elapsedSeconds = 0;
    let cpm = 0;
    
    if (roundStartTime && currentCharIndex > 0 && roundStarted) {
        elapsedSeconds = (Date.now() - roundStartTime) / 1000;
        const minutes = elapsedSeconds / 60;
        if (minutes > 0) {
            cpm = Math.round(currentCharIndex / minutes);
            recordWPM(cpm); // Speichere als WPM für Kompatibilität, ist aber jetzt CPM
        }
    }
    
    // Formatiere Zeit
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = Math.floor(elapsedSeconds % 60);
    const timeString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
    
    // Prüfe Level-Genauigkeit (gesamtes Level, nicht nur diese Runde)
    const levelAccuracy = levelTotalChars > 0 ? (levelCorrectChars / levelTotalChars) * 100 : 0;
    
    if (levelAccuracy >= 95 && currentLevel < 3) {
        // Level aufsteigen
        setTimeout(() => {
            showSuccessModal(currentLevel + 1, {
                accuracy: Math.round(levelAccuracy),
                time: timeString,
                cpm: cpm
            });
        }, 500);
    } else {
        // Neue Runde im selben Level
        currentRound++;
        setTimeout(() => {
            showRetryModal({
                accuracy: Math.round(levelAccuracy),
                time: timeString,
                cpm: cpm
            });
        }, 500);
    }
}

function loadNewText() {
    currentText = generateTextForLevel(currentLevel);
    currentIndex = 0;
    errors = 0;
    totalChars = 0;
    startTime = null;
    
    displayText();
    updateStats();
    
    const inputField = document.getElementById('input-field');
    inputField.value = '';
    inputField.focus();
}

function checkLevelProgress() {
    // Prüfe Level-Genauigkeit (gesamtes Level)
    if (levelTotalChars === 0) {
        return false; // Noch keine Zeichen getippt
    }
    
    const levelAccuracy = (levelCorrectChars / levelTotalChars) * 100;
    
    if (levelAccuracy >= 95 && currentLevel < 3) {
        // Berechne Statistiken aus aktuellen Runden-Daten
        let elapsedSeconds = 0;
        let cpm = 0;
        
        if (roundStartTime && currentCharIndex > 0 && roundStarted) {
            elapsedSeconds = (Date.now() - roundStartTime) / 1000;
            const minutes = elapsedSeconds / 60;
            if (minutes > 0) {
                cpm = Math.round(currentCharIndex / minutes);
            }
        }
        
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = Math.floor(elapsedSeconds % 60);
        const timeString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
        
        // Zeige Erfolgsmodal
        showSuccessModal(currentLevel + 1, {
            accuracy: Math.round(levelAccuracy),
            time: timeString,
            cpm: cpm
        });
        return true; // Signalisiert, dass Modal angezeigt wurde
    }
    return false;
}

function showSuccessModal(nextLevel, roundStats) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-icon">🎉</div>
            <h2>Herzlichen Glückwunsch!</h2>
            <p>Du hast mindestens 95% der Zeichen richtig getippt!</p>
            <p class="level-up-text">Jetzt geht's weiter zu Level ${nextLevel}.</p>
            
            <div class="round-stats" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; font-size: 1.1em; color: #333;">Runden-Statistik:</h3>
                <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Genauigkeit</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${roundStats.accuracy}%</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Zeit</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${roundStats.time}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Geschwindigkeit</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${roundStats.cpm} Zeichen/min</div>
                    </div>
                </div>
            </div>
            
            <p class="pulse-hint" style="margin-top: 20px; font-size: 1.1em; color: #666;">
                Drücke <strong>Enter</strong> oder <strong>Leertaste</strong>, um das nächste Level zu starten.
            </p>
        </div>
    `;
    document.body.appendChild(modal);
    
    const continueToNextLevel = () => {
        setLevel(nextLevel);
        document.body.removeChild(modal);
        // Entferne Keyboard-Event-Listener
        document.removeEventListener('keydown', handleModalKeyPress);
    };
    
    // Keyboard-Event-Listener für Enter und Leertaste
    const handleModalKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            continueToNextLevel();
        }
    };
    
    document.addEventListener('keydown', handleModalKeyPress);
}

function showRetryModal(roundStats) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-icon">💪</div>
            <h2>Weiter so!</h2>
            <p>Schaffst du es, mindestens 95% der Zeichen richtig zu tippen?</p>
            <p class="level-up-text">Versuche es gleich nochmal!</p>
            
            <div class="round-stats" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; font-size: 1.1em; color: #333;">Level-Statistik:</h3>
                <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Genauigkeit</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${roundStats.accuracy}%</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Zeit</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${roundStats.time}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Geschwindigkeit</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${roundStats.cpm} Zeichen/min</div>
                    </div>
                </div>
            </div>
            
            <p class="pulse-hint" style="margin-top: 20px; font-size: 1.1em; color: #666;">
                Drücke <strong>Enter</strong> oder <strong>Leertaste</strong>, um es nochmal zu versuchen.
            </p>
        </div>
    `;
    document.body.appendChild(modal);
    
    const continueToNextRound = () => {
        startNewRound();
        document.body.removeChild(modal);
        // Entferne Keyboard-Event-Listener
        document.removeEventListener('keydown', handleModalKeyPress);
    };
    
    // Keyboard-Event-Listener für Enter und Leertaste
    const handleModalKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            continueToNextRound();
        }
    };
    
    document.addEventListener('keydown', handleModalKeyPress);
}

function displayText() {
    const textContainer = document.getElementById('text-to-type');
    textContainer.innerHTML = '';
    
    currentText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        
        if (index === currentIndex) {
            span.classList.add('current');
        } else if (index < currentIndex) {
            // Bereits getippte Zeichen werden später aktualisiert
        }
        
        textContainer.appendChild(span);
    });
    
    document.getElementById('total-chars').textContent = currentText.length;
}

function handleInput(e) {
    if (!startTime) {
        startTime = Date.now();
    }
    
    let input = e.target.value;
    const allowedChars = levelChars[currentLevel];
    
    // Entferne nicht erlaubte Zeichen
    const filteredInput = input.split('').filter(char => {
        return allowedChars.includes(char.toLowerCase());
    }).join('');
    
    if (input !== filteredInput) {
        e.target.value = filteredInput;
        input = filteredInput;
    }
    
    const expectedChar = currentText[currentIndex];
    
    if (input.length > currentIndex) {
        const typedChar = input[currentIndex];
        
        const isCorrect = typedChar === expectedChar;
        
        if (isCorrect) {
            markCharCorrect(currentIndex);
            recordChar(expectedChar, true);
        } else {
            markCharIncorrect(currentIndex);
            errors++;
            recordChar(expectedChar, false);
        }
        
        currentIndex++;
        totalChars++;
        
        // Aktiviere entsprechende Taste visuell
        highlightKey(expectedChar);
        
        if (currentIndex >= currentText.length) {
            // Text fertig getippt
            const minutes = (Date.now() - startTime) / 60000;
            const words = currentIndex / 5;
            const finalWPM = Math.round(words / minutes);
            recordWPM(finalWPM);
            
            // Input-Feld leeren
            const inputField = document.getElementById('input-field');
            inputField.value = '';
            
            // Prüfe, ob die letzten 50 Zeichen zu 95% richtig waren
            const modalShown = checkLevelProgress();
            
            // Nur Alert und neuen Text laden, wenn kein Modal angezeigt wurde
            if (!modalShown) {
                setTimeout(() => {
                    alert(`Gut gemacht! Du hast den Text in ${Math.round((Date.now() - startTime) / 1000)} Sekunden getippt.`);
                    loadNewText();
                }, 100);
            } else {
                // Wenn Modal angezeigt wurde, neuen Text laden (Input-Feld wurde bereits geleert)
                setTimeout(() => {
                    loadNewText();
                }, 100);
            }
        }
    } else if (input.length < currentIndex) {
        // Zurück gelöscht
        currentIndex = input.length;
        updateTextDisplay();
    }
    
    updateTextDisplay();
    updateStats();
}

function handleKeyDown(e) {
    if (e.key === 'Backspace' && currentIndex > 0) {
        const inputField = document.getElementById('input-field');
        if (inputField.value.length < currentIndex) {
            currentIndex = inputField.value.length;
            updateTextDisplay();
        }
    }
}

function markCharCorrect(index) {
    const chars = document.querySelectorAll('.char');
    if (chars[index]) {
        chars[index].classList.remove('current', 'incorrect');
        chars[index].classList.add('correct');
    }
}

function markCharIncorrect(index) {
    const chars = document.querySelectorAll('.char');
    if (chars[index]) {
        chars[index].classList.remove('current', 'correct');
        chars[index].classList.add('incorrect');
    }
}

function updateTextDisplay() {
    const chars = document.querySelectorAll('.char');
    chars.forEach((char, index) => {
        char.classList.remove('current');
        if (index === currentIndex) {
            char.classList.add('current');
        }
    });
}

function highlightKey(char) {
    // Entferne alle aktiven Klassen
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('active');
    });
    
    // Aktiviere die entsprechende Taste
    const keyElement = document.querySelector(`[data-key="${char.toLowerCase()}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 200);
    }
}

function updateStats() {
    // CPM (Characters Per Minute) berechnen
    let cpm = 0;
    if (roundStartTime && currentCharIndex > 0 && roundStarted) {
        const elapsedSeconds = (Date.now() - roundStartTime) / 1000;
        const minutes = elapsedSeconds / 60;
        // CPM = Zeichen / Minuten
        if (minutes > 0) {
            cpm = Math.round(currentCharIndex / minutes);
        }
    }
    document.getElementById('cpm').textContent = cpm;
    
    // Genauigkeit berechnen (nur aktuelle Runde)
    const accuracy = roundChars.length > 0 && currentCharIndex > 0 ? Math.round((correctChars / currentCharIndex) * 100) : 100;
    document.getElementById('accuracy').textContent = accuracy;
    
    // Aktualisiere Hintergrundfarbe der Genauigkeit basierend auf Wert
    updateAccuracyColor(accuracy);
    
    // Zeichen
    document.getElementById('chars').textContent = currentCharIndex;
    document.getElementById('total-chars').textContent = roundChars.length;
    
    // Fortschrittsbalken aktualisieren
    updateProgressBar();
}

function updateProgressBar() {
    const progress = (currentCharIndex / roundChars.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function updateAccuracyColor(accuracy) {
    const accuracyStat = document.getElementById('accuracy');
    if (!accuracyStat) return;
    
    let r, g, b;
    
    if (accuracy >= 50) {
        // Gelb zu Grün (50-100%)rgb(210 155 0);
        // Bei 50%: Gelb rgb(255, 193, 7)
        // Bei 100%: Grün rgb(76, 175, 80)
        const factor = (accuracy - 50) / 50; // 0 bis 1 (0 = 50%, 1 = 100%)
        r = Math.round(210 - (210 - 76) * factor); // 255 -> 76
        g = Math.round(155 - (155 - 175) * factor); // 193 -> 175
        b = Math.round(7 + (0 - 7) * factor); // 7 -> 0
    } else {
        // Rot zu Gelb (0-50%)
        // Bei 0%: Rot rgb(244, 67, 54)
        // Bei 50%: Gelb rgb(255, 193, 7)
        const factor = accuracy / 50; // 0 bis 1 (0 = 0%, 1 = 50%)
        r = Math.round(244 + (210 - 244) * factor); // 244 -> 255
        g = Math.round(67 + (155 - 67) * factor); // 67 -> 193
        b = Math.round(54 - (54 - 0) * factor); // 54 -> 0
    }
    
    accuracyStat.style.color = `rgb(${r}, ${g}, ${b})`;
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
        'ö': 'Kleiner Finger (rechts)',
        ' ': 'space' // Spezieller Wert für Leertaste
    };
    return fingerNames[key.toLowerCase()] || '';
}

function showFingerTooltip(event) {
    // Entferne vorhandenes Tooltip
    hideFingerTooltip();
    
    const keyElement = event.currentTarget;
    const key = keyElement.dataset.key;
    const fingerName = getFingerName(key);
    
    if (!fingerName) return;
    
    // Setze Opacity für alle anderen Tasten auf 0.9
    document.querySelectorAll('.key').forEach(keyEl => {
        if (keyEl !== keyElement) {
            keyEl.style.opacity = '0.3';
        }
    });
    
    const rect = keyElement.getBoundingClientRect();
    
    // Bestimme Handfarbe basierend auf Taste
    const leftHandKeys = ['a', 's', 'd', 'f'];
    const rightHandKeys = ['j', 'k', 'l', 'ö'];
    const isLeftHand = leftHandKeys.includes(key.toLowerCase());
    const isRightHand = rightHandKeys.includes(key.toLowerCase());
    
    // Spezielle Behandlung für Leertaste - zwei Tooltips
    if (fingerName === 'space') {
        // Linker Daumen Tooltip (links versetzt über der Taste) - orange
        const leftTooltip = document.createElement('div');
        leftTooltip.className = 'key-tooltip';
        leftTooltip.textContent = 'Linker Daumen';
        leftTooltip.style.background = '#ff8c42';
        document.body.appendChild(leftTooltip);
        
        const leftTooltipRect = leftTooltip.getBoundingClientRect();
        // Positioniere links versetzt über der Taste
        leftTooltip.style.left = `${rect.left + (rect.width * 0.25) - (leftTooltipRect.width / 2)}px`;
        leftTooltip.style.top = `${rect.top - leftTooltipRect.height - 10}px`;
        
        // Rechter Daumen Tooltip (rechts versetzt über der Taste) - blau
        const rightTooltip = document.createElement('div');
        rightTooltip.className = 'key-tooltip';
        rightTooltip.textContent = 'Rechter Daumen';
        rightTooltip.style.background = '#4a90e2';
        document.body.appendChild(rightTooltip);
        
        const rightTooltipRect = rightTooltip.getBoundingClientRect();
        // Positioniere rechts versetzt über der Taste
        rightTooltip.style.left = `${rect.left + (rect.width * 0.75) - (rightTooltipRect.width / 2)}px`;
        rightTooltip.style.top = `${rect.top - rightTooltipRect.height - 10}px`;
    } else {
        // Normale Tooltips für andere Tasten
        const tooltip = document.createElement('div');
        tooltip.className = 'key-tooltip';
        tooltip.textContent = fingerName;
        
        // Setze Hintergrundfarbe basierend auf Hand
        if (isLeftHand) {
            tooltip.style.background = '#ff8c42'; // Orange für linke Hand
        } else if (isRightHand) {
            tooltip.style.background = '#4a90e2'; // Blau für rechte Hand
        }
        
        document.body.appendChild(tooltip);
        
        // Positioniere Tooltip über der Taste
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltipRect.width / 2)}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
    }
}

function hideFingerTooltip() {
    const tooltips = document.querySelectorAll('.key-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
    
    // Setze Opacity für alle Tasten wieder auf 1
    document.querySelectorAll('.key').forEach(keyEl => {
        keyEl.style.opacity = '1';
    });
}

function reset() {
    loadNewText();
}

