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
    <title>Meine Kurse</title>
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
            <h1><i class="fas fa-book"></i> Meine Kurse</h1>
        </div>

        <div id="courses-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Kurse...</span>
            </div>
        </div>
    </main>

    <script src="./scripts.js"></script>
</body>
</html>

