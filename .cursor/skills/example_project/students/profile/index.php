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
    <title>Profil</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../students-style.css">
    <link rel="stylesheet" href="../courses/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="page-container profile-container">
        <div id="profile-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Profil...</span>
            </div>
        </div>
    </main>

    <script src="./scripts.js"></script>
</body>
</html>

