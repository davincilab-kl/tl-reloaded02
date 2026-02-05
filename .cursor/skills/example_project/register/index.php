<?php
    require_once __DIR__ . '/../api/config/auth.php';
    redirect_if_logged_in();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge - Registrierung</title>
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
                <h2>Registrierung für Lehrkräfte</h2>
                <p>Erstellen Sie Ihr kostenloses Konto und starten Sie mit der digitalen Grundbildung</p>
            </div>
            
            <form id="register-form">
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label for="first-name">
                            <i class="fas fa-user"></i> Vorname <span class="required">*</span>
                        </label>
                        <input type="text" id="first-name" name="first_name" required autocomplete="given-name">
                    </div>
                    
                    <div class="form-group form-group-half">
                        <label for="last-name">
                            <i class="fas fa-user"></i> Nachname <span class="required">*</span>
                        </label>
                        <input type="text" id="last-name" name="last_name" required autocomplete="family-name">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="salutation">
                        <i class="fas fa-venus-mars"></i> Geschlecht <span class="required">*</span>
                    </label>
                    <select id="salutation" name="salutation" required>
                        <option value="">Bitte wählen</option>
                        <option value="männlich">männlich</option>
                        <option value="weiblich">weiblich</option>
                        <option value="divers">divers</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="email">
                        <i class="fas fa-envelope"></i> E-Mail-Adresse <span class="required">*</span>
                    </label>
                    <input type="email" id="email" name="email" required autocomplete="email">
                </div>
                
                <div class="form-group">
                    <label for="phone">
                        <i class="fas fa-phone"></i> Telefonnummer <span class="required">*</span>
                    </label>
                    <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="z.B. +43 123456789">
                </div>
                
                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock"></i> Passwort <span class="required">*</span>
                    </label>
                    <input type="password" id="password" name="password" required autocomplete="new-password" minlength="6">
                    <small class="form-hint">Min. 6 Zeichen</small>
                </div>
                
                <div class="form-group">
                    <label for="password-confirm">
                        <i class="fas fa-lock"></i> Passwort wiederholen <span class="required">*</span>
                    </label>
                    <input type="password" id="password-confirm" name="password_confirm" required autocomplete="new-password">
                </div>
                
                <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="is-teacher" name="is_teacher" required>
                        <span>Ich bin eine Lehrkaft. <span class="required">*</span></span>
                    </label>
                </div>
                
                <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="newsletter" name="newsletter">
                        <span>Ich stimme dem Erhalt von Neuigkeiten, Gutscheinen, Angeboten, Newslettern und Gewinnspielen der DaVinciLab GmbH per E-Mail zu. Ich kann diese Einwilligung jederzeit widerrufen.</span>
                    </label>
                </div>
                
                <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="terms" name="terms" required>
                        <span>Ich habe die Teilnahmebedingungen und Datenschutzbestimmungen gelesen und akzeptiere diese. <span class="required">*</span></span>
                    </label>
                </div>
                
                <div class="error-message" id="register-error" style="display: none;"></div>
                
                <button type="submit" class="btn-register">
                    <i class="fas fa-user-plus"></i> Kostenlos registrieren
                </button>
                
                <div class="register-footer">
                    <p>Bereits ein Konto? <a href="/login/index.php">Jetzt anmelden</a></p>
                </div>
            </form>
        </div>
    </div>
    
    <script src="./script.js"></script>
</body>
</html>

