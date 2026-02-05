<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_login(); // Erlaube Student, Teacher und Admin
    
    // Prüfe ob Lehrer Zugriff hat (Schule muss freigeschaltet sein)
    if (!teacher_has_student_dashboard_access()) {
        header('Location: /access-denied/?message=' . urlencode('Dieser Bereich wird erst freigeschaltet, wenn Ihre Schule freigeschaltet ist.'));
        exit;
    }
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Schule - Projekte der Klasse</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../students-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="student-page-container">
        <div class="page-header">
            <h1 id="page-title"></h1>
        </div>

        <div class="tab-group">
            <button class="tab-button active" data-tab="projects">
                <i class="fas fa-project-diagram"></i>
                Projekte
            </button>
            <button class="tab-button" data-tab="leaderboard">
                <i class="fas fa-trophy"></i>
                Top 3 Klassen
            </button>
        </div>

        <div id="tab-projects" class="tab-content active">
            <div id="projects-content">
                <div class="loading-messages">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Projekte...</span>
                </div>
            </div>
        </div>

        <div id="tab-leaderboard" class="tab-content">
            <div id="leaderboard-content">
                <div class="loading-messages">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Top 3 Klassen...</span>
                </div>
            </div>
        </div>
    </main>

    <script src="./scripts.js"></script>
</body>
</html>
