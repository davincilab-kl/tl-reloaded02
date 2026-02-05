<?php
    require_once __DIR__ . '/../api/config/auth.php';
    
    // Nur weiterleiten wenn wirklich eingeloggt
    if (is_logged_in()) {
        $role = get_user_role();
        if ($role === 'admin') {
            header('Location: /admin/dashboard/index.php');
            exit;
        } elseif ($role === 'teacher') {
            header('Location: /teachers/dashboard/index.php');
            exit;
        } elseif ($role === 'student') {
            header('Location: /students/courses/index.php');
            exit;
        }
    }
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge - Login</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../partials/main-menu/main-menu.php'; ?>
    </header>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <img src="/imgs/tl_logo.png" alt="TalentsLounge" class="login-logo">
            </div>
            
            <div class="tab-group" style="justify-content: center;">
                <button class="tab-button active" data-tab="admin-teacher">
                    <i class="fas fa-user-shield"></i> Admin / Lehrkräfte
                </button>
                <button class="tab-button" data-tab="student">
                    <i class="fas fa-user-graduate"></i> Schüler
                </button>
            </div>
            
            <!-- Admin/Lehrkräfte Login -->
            <div class="tab-content active" id="admin-teacher-tab">
                <?php if (isset($_GET['registered']) && $_GET['registered'] == '1'): ?>
                    <div class="success-message" style="display: block; margin: 0 30px 16px;">
                        <i class="fas fa-check-circle"></i> Registrierung erfolgreich! Bitte melden Sie sich jetzt an.
                    </div>
                <?php endif; ?>
                <form id="admin-teacher-login-form">
                    <div class="form-group">
                        <label for="admin-email">
                            <i class="fas fa-envelope"></i> E-Mail
                        </label>
                        <input type="email" id="admin-email" name="email" required autocomplete="email">
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-password">
                            <i class="fas fa-lock"></i> Passwort
                        </label>
                        <input type="password" id="admin-password" name="password" required autocomplete="current-password">
                    </div>
                    
                    <div class="error-message" id="admin-error" style="display: none;"></div>
                    
                    <button type="submit" class="btn-login">
                        <i class="fas fa-sign-in-alt"></i> Anmelden
                    </button>
                </form>
                
                <div class="login-footer">
                    <p>Noch kein Konto? <a href="/register/index.php">Jetzt registrieren</a></p>
                </div>
            </div>
            
            <!-- Schüler Login -->
            <div class="tab-content" id="student-tab">
                <form id="student-login-form">
                    <div class="form-group">
                        <label for="student-password">
                            <i class="fas fa-lock"></i> Passwort
                        </label>
                        <input type="text" id="student-password" name="password" required autocomplete="current-password" placeholder="Dein Passwort">
                    </div>
                    
                    <div class="error-message" id="student-error" style="display: none;"></div>
                    
                    <button type="submit" class="btn-login">
                        <i class="fas fa-sign-in-alt"></i> Anmelden
                    </button>
                </form>
            </div>
        </div>
    </div>
    
    <script src="./script.js"></script>
</body>
</html>

