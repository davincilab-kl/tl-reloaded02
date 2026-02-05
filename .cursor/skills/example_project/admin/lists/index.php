<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Listen</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="lists-container">
        <div class="lists-header">
            <h1>Listen</h1>
            <button onclick="listsManager.createNewList()">
                <i class="fas fa-plus"></i> Neue Liste erstellen
            </button>
        </div>
        
        <div id="lists-content" class="lists-content">
            <div class="loading">Lade Listen...</div>
        </div>
    </main>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js?v=<?php echo time(); ?>"></script>
</body>
</html>

