<?php
    require_once __DIR__ . '/../api/config/auth.php';
    require_login(); // Nur eingeloggte Benutzer können diese Seite sehen
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Zugriff verweigert - TalentsLounge</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="access-denied-container">
        <div class="access-denied-content">
            <div class="access-denied-icon">
                <i class="fas fa-lock"></i>
            </div>
            <h1>Zugriff verweigert</h1>
            <p><?php 
                if (isset($_GET['message']) && !empty($_GET['message'])) {
                    echo htmlspecialchars($_GET['message']);
                } else {
                    echo 'Sie haben keine Berechtigung, auf diese Seite zuzugreifen.';
                }
            ?></p>
            <div class="access-denied-actions">
                <?php
                    $userRole = get_user_role();
                    if ($userRole === 'admin' || is_admin()) {
                        echo '<a href="/admin/dashboard/index.php" class="btn btn-primary"><i class="fas fa-tachometer-alt"></i> Zum Admin-Dashboard</a>';
                    } elseif ($userRole === 'teacher' || is_teacher()) {
                        echo '<a href="/teachers/dashboard/index.php" class="btn btn-primary"><i class="fas fa-chalkboard-teacher"></i> Zum Lehrkraft-Dashboard</a>';
                    } elseif ($userRole === 'student' || is_student()) {
                        echo '<a href="/students/courses/index.php" class="btn btn-primary"><i class="fas fa-book"></i> Zum Schüler-Dashboard</a>';
                    } else {
                        echo '<a href="/" class="btn btn-primary"><i class="fas fa-home"></i> Zur Startseite</a>';
                    }
                ?>
            </div>
        </div>
    </main>
</body>
</html>

