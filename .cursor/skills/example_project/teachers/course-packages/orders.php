<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher(); // Erlaube Admin und Teacher
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kurspakete - Bestellverlauf</title>
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
        <div class="course-packages-header">
            <h1>Kurspakete - Bestellverlauf</h1>
        </div>

        <div id="orders-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Bestellungen...</span>
            </div>
        </div>
    </main>
    
    <script src="./scripts.js"></script>
</body>
</html>

