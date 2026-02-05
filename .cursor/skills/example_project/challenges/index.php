<?php
    require_once __DIR__ . '/../api/config/auth.php';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Challenges - TalentsLounge</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="challenges-page-container">
        <!-- Hero Banner -->
        <section class="hero-banner">
            <div class="hero-overlay">
                <h1 class="hero-title">
                    Challenges &<br>
                    <span class="hero-title-gradient">Wettbewerbe</span>
                </h1>
                <p class="hero-description">
                    Nimm an spannenden Wettbewerben teil, lerne neue Skills und gewinne tolle Preise für dich und deine Klasse.
                </p>
                <div class="hero-buttons">
                    <a href="#challenges-content" class="btn-hero btn-hero-primary">
                        <i class="fas fa-eye"></i> Wettbewerbe anschauen
                    </a>
                </div>
            </div>
        </section>

        <div id="challenges-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Challenges...</span>
            </div>
        </div>

        <div id="challenge-details" class="challenge-details-container" style="display: none;">
            <div class="challenge-details-content">
                <div id="challenge-details-body"></div>
            </div>
        </div>
    </main>

    <script src="./scripts.js"></script>
</body>
</html>

