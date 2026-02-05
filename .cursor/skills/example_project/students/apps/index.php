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
    <title>Meine Apps</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="../courses/style.css">
    <link rel="stylesheet" href="../students-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="student-page-container">
        <div class="page-header">
            <h1><i class="fas fa-mobile-alt"></i> Meine Apps</h1>
        </div>

        <div id="apps-content">
            <div class="courses-grid">
                <a href="/apps/html-blockly/index.php" class="course-card">
                    <div class="course-image">
                        <img src="./imgs/cover_htmlblockly.png" alt="HTML Blockly" class="course-cover-image">
                    </div>
                    <div class="course-content">
                        <h3 class="course-title">HTML Blockly</h3>
                        <p class="course-description">Baue deine erste Website mit Programmier-Blöcken!</p>
                    </div>
                </a>

                <a href="/apps/typeflow/index.php" class="course-card">
                    <div class="course-image">
                        <img src="./imgs/cover_typeflow.png" alt="TypeFlow" class="course-cover-image">
                    </div>
                    <div class="course-content">
                        <h3 class="course-title">TypeFlow</h3>
                        <p class="course-description">Lerne das Tippen mit 10 Fingern</p>
                    </div>
                </a>

                <a href="/apps/datahunter/index.php" class="course-card">
                    <div class="course-image">
                        <img src="./imgs/cover_datahunter.png" alt="DataHunter" class="course-cover-image">
                    </div>
                    <div class="course-content">
                        <h3 class="course-title">DataHunter</h3>
                        <p class="course-description">Erkunde und analysiere Daten spielerisch</p>
                    </div>
                </a>
            </div>
        </div>
    </main>
</body>
</html>

