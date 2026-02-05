<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher();
    header("Permissions-Policy: payment=(self \"https://calendly.com\" \"https://*.calendly.com\")");
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Schulübersicht</title>
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
        <div class="page-header">
            <h1><i class="fas fa-school"></i> Schulübersicht</h1>
        </div>

        <div id="school-overview-content" class="school-overview-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Schulinformationen...</span>
            </div>
        </div>
    </main>

    <!-- Modal: Infowebinar anmelden -->
    <div id="infowebinar-modal" class="modal" style="display:none;">
        <div class="modal-dialog" style="max-width: 800px; width: 90%;">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-check"></i> Infowebinar anmelden</h3>
                <button class="modal-close" id="close-infowebinar-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <!-- Calendly inline widget begin -->
                <div class="calendly-inline-widget" 
                     data-url="https://calendly.com/patrick-thum-davincilab/tlr-infowebinar" 
                     style="min-width:320px;height:700px;"
                     allow="payment">
                </div>
                <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
                <!-- Calendly inline widget end -->
            </div>
        </div>
    </div>

    <script src="./scripts.js"></script>
</body>
</html>

