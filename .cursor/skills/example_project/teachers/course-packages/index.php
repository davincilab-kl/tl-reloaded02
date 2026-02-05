<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher(); // Erlaube Admin und Teacher
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kurspaket</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../teachers-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="page-container">
        <!-- Package Selector Buttons -->
        <div class="package-selector-container">
            <h2 class="package-selector-title">Kurspakete</h2>
            <div class="package-selector-buttons-container">
                <button class="package-selector-btn active" data-package="digigrubi">
                    Digitale Grundbildung & Coding
                </button>
                <button class="package-selector-btn" data-package="digigrubi">
                    Künstliche Intelligenz
                </button>
            </div>
        </div>

        <div id="package-content" data-package="digigrubi">
            <!-- Hero Section -->
            <div class="package-hero">
                <img src="./imgs/digitale-grundbildung-coding/TalentsLounge-Kurspaket-DigitaleGrundbildung-Coding-small.png" alt="Digitale Grundbildung & Coding" class="package-hero-image">
            </div>

            <!-- Package Description -->
            <div class="package-description-section">
                <p class="package-description-text">
                    Das TalentsLounge-Kurspaket ist das ideale Einstiegspaket, um digitale Kompetenzen im Unterricht einfach und wirkungsvoll zu fördern.
                </p>
                <p class="package-description-text">
                    Es enthält vier Kurse, die du nach dem <strong>Cafeteria-Prinzip</strong> flexibel einsetzen kannst – einzeln oder kombiniert.
                </p>
            </div>

            <!-- Features Section -->
            <div class="package-features-section">
                <h3 class="package-features-title">Für dich als Lehrkraft bedeutet das:</h3>
                <div class="package-features-grid">
                    <div class="package-feature-card">
                        <div class="package-feature-icon-wrapper">
                            <i class="fas fa-lightbulb package-feature-icon"></i>
                        </div>
                        <h4 class="package-feature-title">Einfacher Einstieg</h4>
                        <p class="package-feature-text">
                            Die Kursinhalte sind intuitiv nutzbar, interaktiv gestaltet und niederschwellig aufgebaut – ideal, um gemeinsam mit deinen Schüler:innen ohne großen Vorbereitungsaufwand zu starten.
                        </p>
                    </div>

                    <div class="package-feature-card">
                        <div class="package-feature-icon-wrapper">
                            <i class="fas fa-cog package-feature-icon"></i>
                        </div>
                        <h4 class="package-feature-title">Flexibel einsetzbar</h4>
                        <p class="package-feature-text">
                            Ob im Fach Digitale Grundbildung, in Projektphasen oder im Wahlpflichtbereich – die Kurse lassen sich einzeln oder kombiniert einsetzen und passen sich deinem Unterrichtskontext an.
                        </p>
                    </div>

                    <div class="package-feature-card">
                        <div class="package-feature-icon-wrapper">
                            <i class="fas fa-user package-feature-icon"></i>
                        </div>
                        <h4 class="package-feature-title">Selbstgesteuertes Lernen ermöglichen</h4>
                        <p class="package-feature-text">
                            Deine Schüler:innen arbeiten in ihrem eigenen Tempo, wiederholen Inhalte nach Bedarf und wählen Lernwege, die zu ihrem Vorwissen und Interesse passen.
                        </p>
                    </div>

                    <div class="package-feature-card">
                        <div class="package-feature-icon-wrapper">
                            <i class="fas fa-bullseye package-feature-icon"></i>
                        </div>
                        <h4 class="package-feature-title">Praxisnah & projektorientiert</h4>
                        <p class="package-feature-text">
                            Die Lernmodule verbinden Wissen mit Anwendung: Deine Schüler:innen entwickeln eigene Projekte – z. B. ein funktionierendes Spiel – und erleben, wie Lernen durch Tun gelingt.
                        </p>
                    </div>

                    <div class="package-feature-card">
                        <div class="package-feature-icon-wrapper">
                            <i class="fas fa-star package-feature-icon"></i>
                        </div>
                        <h4 class="package-feature-title">Quizzes & T!Coins als Lernmotivation</h4>
                        <p class="package-feature-text">
                            Kurze Quizzes sichern das Wissen, T!Coins sorgen für spielerische Motivation und machen Lernfortschritte sichtbar – individuell und im Klassenkontext.
                        </p>
                    </div>

                    <div class="package-feature-card">
                        <div class="package-feature-icon-wrapper">
                            <i class="fas fa-trophy package-feature-icon"></i>
                        </div>
                        <h4 class="package-feature-title">Erfolgserlebnisse für alle</h4>
                        <p class="package-feature-text">
                            Am Ende jedes Kurses steht ein sichtbares Ergebnis – von Urkunden bis hin zu DigComp-Zertifikaten bei Projekteinsendungen. Deine Schüler:innen können stolz sein.
                        </p>
                    </div>
                </div>
                <p class="package-features-footer">
                    Egal, ob du erste Schritte im Fach Digitale Grundbildung setzt oder bereits Erfahrung mit Coding und Projektarbeit hast: TalentsLounge unterstützt dich dabei, deine Schüler:innen sicher und motiviert durch den Lernprozess zu begleiten.
                </p>
            </div>

            <!-- Project-based Learning Section -->
            <div class="project-learning-section">
                <div class="project-learning-header">
                    <i class="fas fa-rocket project-learning-icon"></i>
                    <h3>Projektbasiertes Lernen mit Erfolgsgarantie</h3>
                </div>
                <p class="project-learning-text">
                    Vor allem im Coding- und Game-Design-Kurs arbeiten deine Schüler:innen <strong>projektbasiert</strong>: Aus denselben Bausteinen entstehen ganz unterschiedliche, kreative Spiele – vergleichbar mit <strong>LEGO</strong>: Alle starten mit dem gleichen Set, doch jedes Projekt wird einzigartig.
                </p>
                <p class="project-learning-text">
                    Deine Schüler:innen lernen, Ideen umzusetzen, Probleme zu lösen und stolz auf das zu sein, was sie selbst geschaffen haben. Am Ende steht immer ein sichtbares Ergebnis – ein Spiel, das funktioniert, begeistert und motiviert, weiterzumachen.
                </p>
                <a href="/challenges/index.php" class="btn-view-projects">
                    Projekte aus dem Vorjahr anschauen
                </a>
            </div>

            <!-- Course Overview -->
            <div class="courses-overview">
                <h3 class="courses-overview-title">Kursübersicht</h3>
                
                <div class="courses-grid">
                    <!-- Course 1 -->
                    <div class="course-card">
                        <div class="course-card-image">
                            <img src="./imgs/digitale-grundbildung-coding/TalentsLounge-Coding-und-Game-Design-mit-Scratch-Grundkurs-Sek.-1-300x169.png" alt="Coding & Game Design mit Scratch Grundkurs Sek. 1">
                        </div>
                        <div class="course-card-content">
                            <h4 class="course-card-title">Coding & Game Design mit Scratch Grundkurs Sek. 1</h4>
                            <p class="course-card-description">
                                Der Einstieg ins Programmieren: Schüler:innen lernen, ihr erstes eigenes Spiel zu entwickeln – Schritt für Schritt.
                            </p>
                            <ul class="course-card-topics">
                                <li>Scratch-Oberfläche & Koordinatensystem</li>
                                <li>Figuren & Animationen</li>
                                <li>Bewegung, Gegner & Punkte</li>
                                <li>Highscore & Spielabschluss</li>
                            </ul>
                            <div class="course-card-meta">
                                <div class="course-meta-item">
                                    <strong>Dauer:</strong> ab 4 UE
                                </div>
                                <div class="course-meta-item">
                                    <strong>Ziel:</strong> Ein eigenes Spiel gestalten und spielerisch Programmierlogik verstehen
                                </div>
                            </div>
                            <a href="/students/courses/view.php?course_id=1" class="btn-course-action">Kurs öffnen</a>
                        </div>
                    </div>

                    <!-- Course 2 -->
                    <div class="course-card">
                        <div class="course-card-image">
                            <img src="./imgs/digitale-grundbildung-coding/TalentsLounge-Coding-und-Game-Design-mit-Scratch-Aufbaukurs-Sek.-1-300x169.png" alt="Coding & Game Design mit Scratch Aufbaukurs Sek. 1">
                        </div>
                        <div class="course-card-content">
                            <h4 class="course-card-title">Coding & Game Design mit Scratch Aufbaukurs Sek. 1</h4>
                            <p class="course-card-description">
                                Vertiefung für kreative Köpfe: Schüler:innen erweitern ihre Kenntnisse und gestalten komplexere Spielideen.
                            </p>
                            <ul class="course-card-topics">
                                <li>Labyrinthe & Hindernisse</li>
                                <li>Sprungfunktionen & Timer</li>
                                <li>Mehrere Level gestalten</li>
                                <li>Expertenlevel "Sky is the Limit"</li>
                            </ul>
                            <div class="course-card-meta">
                                <div class="course-meta-item">
                                    <strong>Dauer:</strong> ab 1 UE (in Kombination mit Grundkurs)
                                </div>
                                <div class="course-meta-item">
                                    <strong>Ziel:</strong> Erweiterte Programmierlogik & kreative Gestaltung eigener Games
                                </div>
                            </div>
                            <a href="/students/courses/view.php?course_id=2" class="btn-course-action">Kurs öffnen</a>
                        </div>
                    </div>

                    <!-- Course 3 -->
                    <div class="course-card">
                        <div class="course-card-image">
                            <img src="./imgs/digitale-grundbildung-coding/TalentsLounge-Digitale-Grundbildung-Sek.-1-300x169.png" alt="ABC der Digitalen Grundbildung Sek. 1">
                        </div>
                        <div class="course-card-content">
                            <h4 class="course-card-title">ABC der Digitalen Grundbildung Sek. 1</h4>
                            <p class="course-card-description">
                                Entwickelt in Zusammenarbeit mit HS-Prof. Mag. Dr. Sonja Gabriel, MA MA (KPH Wien/Krems). Deine Schüler:innen erwerben grundlegende digitale Kompetenzen.
                            </p>
                            <ul class="course-card-topics">
                                <li>Betriebssysteme & Anwendungen</li>
                                <li>Digitale Kommunikation & Social Media</li>
                                <li>Mediengestaltung & Sicherheit</li>
                                <li>Technische Problemlösung</li>
                                <li>Umwelt & Digitalisierung</li>
                            </ul>
                            <div class="course-card-meta">
                                <div class="course-meta-item">
                                    <strong>Dauer:</strong> ab 2 UE
                                </div>
                                <div class="course-meta-item">
                                    <strong>Ziel:</strong> Digitale Welt verstehen, sicher nutzen und kritisch reflektieren
                                </div>
                            </div>
                            <a href="/students/courses/view.php?course_id=3" class="btn-course-action">Kurs öffnen</a>
                        </div>
                    </div>

                    <!-- Course 4 -->
                    <div class="course-card">
                        <div class="course-card-image">
                            <img src="./imgs/digitale-grundbildung-coding/TalentsLounge-Berufsorientierung-Sek.-1-300x169.png" alt="Berufe entdecken & Traumjob finden Sek. 1">
                        </div>
                        <div class="course-card-content">
                            <h4 class="course-card-title">Berufe entdecken & Traumjob finden Sek. 1</h4>
                            <p class="course-card-description">
                                Berufsorientierung modern gedacht: In kurzen Videos stellen Lehrlinge ihre Berufe vor – authentisch und praxisnah.
                            </p>
                            <ul class="course-card-topics">
                                <li>Einblicke in reale Lehrberufe</li>
                                <li>Verbindung von Schule & Arbeitswelt</li>
                            </ul>
                            <div class="course-card-meta">
                                <div class="course-meta-item">
                                    <strong>Dauer:</strong> ab 1 UE
                                </div>
                                <div class="course-meta-item">
                                    <strong>Ziel:</strong> Berufsorientierung stärken & eigene Talente entdecken
                                </div>
                            </div>
                            <a href="/students/courses/view.php?course_id=4" class="btn-course-action">Kurs öffnen</a>
                        </div>
                    </div>
                </div>

                <p class="courses-flexibility-note">
                    <i class="fas fa-star"></i>
                    Auch wenn du über das gesamte Kurspaket verfügst: Du kannst jederzeit auch nur einzelne Kurse einsetzen – so, wie es in deine Unterrichtsplanung passt.
                </p>
            </div>

            <!-- Result Section -->
            <div class="package-result-section">
                <div class="package-result-header">
                    <h3>Das Ergebnis:</h3>
                </div>
                <p class="package-result-text">
                    Ein motivierendes Lernpaket, das digitale Grundbildung, Programmierkompetenz und Berufsorientierung vereint – flexibel, praxisnah und mit echtem Lernfortschritt für jede Klasse.
                </p>
                <p class="package-result-quote">
                    „Mit TalentsLounge wird jeder Unterricht zum Erfolgserlebnis – für Lehrkräfte und Schüler:innen gleichermaßen."
                </p>
            </div>

        </div>
    </main>
    
    <script src="./scripts.js"></script>
</body>
</html>
