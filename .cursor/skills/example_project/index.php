<?php
    require_once __DIR__ . '/api/config/auth.php';
    $isLoggedIn = is_logged_in();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge - Entdecken. Lernen. Wachsen.</title>
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./landing.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="landing-content">
        <!-- Hero Section -->
        <section class="hero-section" id="home">
            <div class="landing-container">
                <h1 class="hero-title">Willkommen in der <span class="hero-title-highlight">TalentsLounge</span></h1>
                <div class="hero-content">
                    <div class="hero-left">
                        <p class="hero-subtitle">Die TalentsLounge macht digitale Grundbildung einfach, interaktiv und effektiv. Für Lehrkräfte und Schüler:innen – völlig kostenlos.</p>
                        <div class="hero-features">
                            <div class="hero-feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Über 20 interaktive Lektionen mit Wissenchecks</span>
                            </div>
                            <div class="hero-feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Von der KPH Wien/Krems offiziell als Fortbildung anerkannt</span>
                            </div>
                            <div class="hero-feature">
                                <i class="fas fa-check-circle"></i>
                                <span>Ausgezeichnet mit dem Gütesiegel für Lern-Apps des Bundesministeriums für Bildung</span>
                            </div>
                        </div>
                        <div class="hero-buttons">
                            <a href="/register/index.php" class="btn-primary">Kostenlos registrieren</a>
                            <a href="#more-info" class="btn-secondary">Mehr erfahren</a>
                        </div>
                    </div>
                    <div class="hero-right">
                        <img src="/imgs/landingpage/hero_video_placeholder.jpg" alt="TalentsLounge im Einsatz" class="hero-video-placeholder">
                    </div>
                </div>
                <div class="certifications">
                    <p class="cert-label">Zertifiziert von:</p>
                    <div class="cert-badges">
                        <img src="/imgs/landingpage/logo_guetesiegel_lern_apps.svg" alt="Gütesiegel Lern-Apps" class="cert-logo">
                        <img src="/imgs/landingpage/logo_bundesministerium_bildung.png" alt="Bundesministerium für Bildung" class="cert-logo">
                        <img src="/imgs/landingpage/logo_oead.png" alt="Österreichischer Austauschdienst" class="cert-logo">
                        <img src="/imgs/landingpage/logo_digital_austria.png" alt="Digital Austria" class="cert-logo">
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features-section" id="more-info">
            <div class="container">
                <h2 class="section-title">Die beste Wahl für Digitale Grundbildung</h2>
                <p class="section-subtitle">Wir machen die Vermittlung digitaler Kompetenzen einfach, interaktiv und effektiv – für Lehrkräfte und Schüler:innen gleichermaßen.</p>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-number">100%</div>
                        <h3 class="feature-title">Lehrplan-Konformität</h3>
                        <p class="feature-description">Unsere Kurse zu Digitaler Grundbildung und Coding sind lehrplankonform und decken zentrale Kompetenzbereiche des Pflichtfachs Digitale Grundbildung ab. Entwickelt von erfahrenen Lehrkräften.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-number">20+</div>
                        <h3 class="feature-title">Spielerisch lernen</h3>
                        <p class="feature-description">Über 20 interaktive DigiGrubi- und Coding-Lektionen machen das Lernen im Unterricht spielerisch und effektiv.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-number">Null</div>
                        <h3 class="feature-title">Keine Vorkenntnisse nötig</h3>
                        <p class="feature-description">Als Lehrkraft benötigen Sie keine Programmiervorkenntnisse. Die Plattform unterstützt Sie umfassend bei der Vermittlung.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-number">15 UE</div>
                        <h3 class="feature-title">Anerkannte Fortbildung</h3>
                        <p class="feature-description">In Zusammenarbeit mit der KPH Wien/Niederösterreich – ideal zur digitalen Stärkung von Lehrkräften und Schülern.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-number">100%</div>
                        <h3 class="feature-title">Anonymität & Datenschutz</h3>
                        <p class="feature-description">Schüler:innen registrieren sich anonym mit einem individuellen Code, um maximale Privatsphäre zu gewährleisten.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-rocket"></i></div>
                        <h3 class="feature-title">Zukunftsfit</h3>
                        <p class="feature-description">Unser didaktisches Konzept basiert auf internationalen Standards (DigComp) und wurde mit dem offiziellen Lernapp-Gütesiegel ausgezeichnet.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Fortbildung Section -->
        <section class="fortbildung-section">
            <div class="container">
                <h2 class="section-title">Let's code! Fortbildung mit der KPH Wien/Krems</h2>
                <p class="section-subtitle">Die KPH Wien/Krems bietet in Kooperation mit der TalentsLounge eine Fortbildung <strong>"Let's code! Informatische Bildung praxisorientiert im Unterricht einsetzen"</strong> im Bereich der Digitalen Grundbildung für Lehrkräfte an. Nach erfolgreichem Abschluss werden bis zu <strong>15 Unterrichtseinheiten (UE)</strong> als Fortbildung angerechnet.</p>
                
                <div class="fortbildung-features">
                    <div class="fortbildung-feature">
                        <i class="fas fa-check"></i>
                        <div>
                            <h4>Für Anfänger:innen gemacht</h4>
                            <p>Keine Programmierkenntnisse nötig</p>
                        </div>
                    </div>
                    <div class="fortbildung-feature">
                        <i class="fas fa-check"></i>
                        <div>
                            <h4>Flexibles Lernen</h4>
                            <p>Von zuhause, im eigenen Tempo</p>
                        </div>
                    </div>
                    <div class="fortbildung-feature">
                        <i class="fas fa-check"></i>
                        <div>
                            <h4>Umfassende Unterstützung</h4>
                            <p>Materialien, Videos und Live-Support</p>
                        </div>
                    </div>
                </div>
                
                <a href="/register/index.php" class="btn-secondary">Kostenlos registrieren</a>
            </div>
        </section>

        <!-- Steps Section -->
        <section class="steps-section">
            <div class="container">
                <h2 class="section-title">In nur 4 Schritten starten</h2>
                
                <div class="steps-grid">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <h3 class="step-title">Kostenlos anmelden</h3>
                        <p class="step-description">Sichern Sie sich online eine Gratis-Jahreslizenz für Ihre Klasse oder Schule.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <h3 class="step-title">Info-Webinar</h3>
                        <p class="step-description">Lernen Sie alle Inhalte und Funktionen der Plattform für den Unterricht kennen. Nach dem Webinar erhalten Sie Ihre kostenlose Jahreslizenz.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <h3 class="step-title">Lehrer Dashboard-Funktion</h3>
                        <p class="step-description">Erhalten Sie Zugang zum Lehrer-Dashboard zur Fortschrittskontrolle Ihrer Schüler:innen.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">4</div>
                        <h3 class="step-title">Weiterbildung</h3>
                        <p class="step-description">Nehmen Sie bequem von Zuhause an der Weiterbildung teil und bereiten Sie sich optimal vor.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Schools Section -->
        <section class="schools-section">
            <div class="container">
                <h2 class="section-title">Über 120 Schulen vertrauen bereits auf die TalentsLounge</h2>
                <p class="section-subtitle">Von Wien bis Vorarlberg. Die TalentsLounge ist die Plattform für digitale Grundbildung in Österreich.</p>
                <div class="schools-map-container">
                    <iframe 
                        src="/html/my_map.html" 
                        class="schools-map"
                        frameborder="0"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        </section>

        <!-- How it works Section -->
        <section class="how-it-works-section">
            <div class="container">
                <h2 class="section-title">Wie funktioniert der Unterricht mit der TalentsLounge?</h2>
                <div class="how-it-works-grid">
                    <div class="how-item">
                        <i class="fas fa-clock"></i>
                        <p>45-minütige, flexible Unterrichtseinheiten</p>
                    </div>
                    <div class="how-item">
                        <i class="fas fa-book"></i>
                        <p>20+ anpassbare Lektionen im Kompetenzbereich Produktion</p>
                    </div>
                    <div class="how-item">
                        <i class="fas fa-laptop"></i>
                        <p>Web-basiert und für alle Geräte geeignet</p>
                    </div>
                    <div class="how-item">
                        <i class="fas fa-video"></i>
                        <p>Interaktive Videos, Lernkarten, Projekte & Quizze</p>
                    </div>
                    <div class="how-item">
                        <i class="fas fa-chart-line"></i>
                        <p>Lehrkraft-Dashboard zur Fortschrittskontrolle</p>
                    </div>
                    <div class="how-item">
                        <i class="fas fa-users"></i>
                        <p>Entwickelt von Lehrkräften für Lehrkräfte, basierend auf K-12 Standards</p>
                    </div>
                </div>
                <a href="/register/index.php" class="btn-primary">Kostenlos registrieren</a>
            </div>
        </section>

        <!-- Students Love Section -->
        <section class="students-love-section">
            <div class="container">
                <h2 class="section-title">Schüler:innen lieben den Unterricht mit der TalentsLounge! 💖</h2>
                <div class="students-features">
                    <div class="student-feature">
                        <i class="fas fa-venus-mars"></i>
                        <p>Fokus auf genderneutrale Technikvermittlung</p>
                    </div>
                    <div class="student-feature">
                        <i class="fas fa-user-graduate"></i>
                        <p>Individualisiertes und selbstbestimmtes Lernen</p>
                    </div>
                    <div class="student-feature">
                        <i class="fas fa-shield-alt"></i>
                        <p>DSGVO-konforme Anmeldung für Sicherheit</p>
                    </div>
                    <div class="student-feature">
                        <i class="fas fa-certificate"></i>
                        <p>Offizielles DigCom 2.3 Zertifikat nach Abschluss</p>
                    </div>
                    <div class="student-feature">
                        <i class="fas fa-trophy"></i>
                        <p>Optional: Teilnahme am YouthHackathon</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="testimonials-section">
            <div class="container">
                <h2 class="section-title">Was Lehrkräfte sagen</h2>
                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <p class="testimonial-text">"Den Schülern und Schülerinnen hat es viel Freude bereitet, mit der Talentslounge zu arbeiten. Die Videos haben das Programmieren ungemein erleichtert, positiv war vor allem auch, dass jedes Kind in seinem eigenen Tempo arbeiten konnte."</p>
                        <div class="testimonial-author">
                            <strong>Yvonne</strong>
                            <span>MS Brüßlgasse</span>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <p class="testimonial-text">"Die Talentslounge hat insbesondere meinen Schülerinnen die Konzepte des Programmierens und Codierens auf spielerische Art und Weise vermittelt und verborgene Talente in ihnen hervorgebracht."</p>
                        <div class="testimonial-author">
                            <strong>Anja</strong>
                            <span>MS Steinergasse</span>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <p class="testimonial-text">"Die Talentslounge bot unseren Schülerinnen und Schülern einen großartigen, motivierenden Einstieg ins Programmieren!"</p>
                        <div class="testimonial-author">
                            <strong>Cornelia B.</strong>
                            <span>MS Albrechtsberg</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section" id="register">
            <div class="container">
                <h2 class="section-title">Deine Schule ist die Nächste!</h2>
                <p class="section-subtitle">Schließe dich hunderten zufriedenen Lehrkräften an und bringe digitale Bildung in deinen Unterricht.</p>
                <a href="/register/index.php" class="btn-primary btn-large">Kostenlos registrieren</a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="landing-footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Über uns</h3>
                        <ul>
                            <li>Mit der DaVinciLab TalentsLounge unterstützen wir engagierte Lehrkräfte der Sek. 1, das Programmieren-Lernen im Fach "Digitale Grundbildung" einfach und ohne Aufwand umzusetzen.</li>
                            <li>Wir setzen uns dafür ein, allen jungen Menschen den Zugang zu hochwertiger Bildung zu ermöglichen, unabhängig von Geschlecht oder sozialer Herkunft.</li>
                            <li>Dank der Kooperation mit dem Verein MadeByKids und der Unterstützung durch Spenden zahlreicher Partner:innen aus der Wirtschaft streben wir an, österreichweit kostenlosen Programmierunterricht in jeder Schule zu ermöglichen.</li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Kontakt</h3>
                        <p>Eine Plattform von DaVinciLab GmbH</p>
                        <div class="footer-social">
                            <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; DaVinciLab GmbH. All rights reserved</p>
                    <div class="footer-links">
                        <a href="#">Impressum</a>
                        <a href="#">Datenschutz</a>
                        <a href="#">Teilnahme- & Nutzungsbedingungen</a>
                    </div>
                </div>
            </div>
        </footer>
    </main>
</body>
</html>


