<?php
    require_once __DIR__ . '/../api/config/auth.php';
    
    // Prüfe ob teacher_id übergeben wurde
    $teacher_id = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;
    
    if ($teacher_id <= 0) {
        header('Location: /register/index.php');
        exit;
    }
    
    // Hole E-Mail-Adresse und Status des Lehrers
    require_once __DIR__ . '/../api/config/access_db.php';
    $conn = db_connect();
    $user_sql = "SELECT u.email, t.status_id 
                 FROM users u 
                 INNER JOIN teachers t ON u.role_id = t.id AND u.role = 'teacher' 
                 WHERE t.id = ? LIMIT 1";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('i', $teacher_id);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user_data = $user_result->fetch_assoc();
    $user_stmt->close();
    
    if (!$user_data) {
        $conn->close();
        header('Location: /register/index.php');
        exit;
    }
    
    // Prüfe ob Status bereits > 1 (E-Mail bereits verifiziert)
    $status_id = isset($user_data['status_id']) ? (int)$user_data['status_id'] : null;
    if ($status_id !== null && $status_id > 1) {
        // E-Mail bereits verifiziert - zur Login-Seite weiterleiten
        $conn->close();
        header('Location: /login/index.php?message=email_already_verified');
        exit;
    }
    
    $conn->close();
    
    $email = $user_data['email'];
    // E-Mail-Adresse maskieren für Anzeige (z.B. t***@example.com)
    $email_parts = explode('@', $email);
    $masked_email = substr($email_parts[0], 0, 1) . '***@' . $email_parts[1];
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge - E-Mail bestätigen</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../partials/main-menu/main-menu.php'; ?>
    </header>
    <div class="register-container">
        <div class="register-box">
            <div class="register-header">
                <img src="/imgs/tl_logo.png" alt="TalentsLounge" class="register-logo">
                <h2>E-Mail bestätigen</h2>
                <p>Wir haben einen 6-stelligen Bestätigungscode an <strong><?php echo htmlspecialchars($masked_email); ?></strong> gesendet.</p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">Bitte geben Sie den Code ein, um fortzufahren.</p>
            </div>
            
            <form id="verify-email-form" autocomplete="off">
                <!-- Verstecktes Dummy-Passwort-Feld, damit Chrome nicht versucht, Passwörter zu speichern -->
                <input type="password" style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" tabindex="-1" autocomplete="new-password">
                
                <div class="form-group">
                    <label for="verification-code">
                        <i class="fas fa-key"></i> Bestätigungscode <span class="required">*</span>
                    </label>
                    <input type="text" id="verification-code" name="verification_code" required maxlength="6" pattern="[0-9]{6}" placeholder="123456" autocomplete="one-time-code" style="text-align: center; font-size: 24px; letter-spacing: 8px;">
                    <small class="form-hint">6-stelliger Zahlencode</small>
                </div>
                
                <div class="error-message" id="verify-error" style="display: none;"></div>
                
                <button type="submit" class="btn-register">
                    <i class="fas fa-check"></i> E-Mail bestätigen
                </button>
            </form>
            
            <div class="register-footer">
                <p>Code nicht erhalten? <a href="#" id="resend-code-link">Code erneut senden</a></p>
            </div>
        </div>
    </div>
    
    <script>
        const teacherId = <?php echo $teacher_id; ?>;
        
        // Verhindere, dass Chrome's Passwort-Manager die Seite blockiert
        document.addEventListener('DOMContentLoaded', function() {
            // Entferne alle Overlays, die möglicherweise von Chrome's Passwort-Manager erstellt wurden
            setTimeout(function() {
                const overlays = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
                overlays.forEach(function(overlay) {
                    if (overlay.style.backgroundColor && overlay.style.backgroundColor.includes('rgba')) {
                        const computedStyle = window.getComputedStyle(overlay);
                        if (computedStyle.position === 'fixed' && parseInt(computedStyle.zIndex) > 1000) {
                            overlay.remove();
                        }
                    }
                });
            }, 100);
        });
    </script>
    <script src="./verify_email.js"></script>
</body>
</html>

