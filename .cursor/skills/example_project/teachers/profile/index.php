<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher(); // Erlaube Admin und Teacher
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Profil - TalentsLounge</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../teachers-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="page-container profile-container">
        <div class="profile-content">
            <div class="profile-card">
                <div class="card-header">
                    <h2><i class="fas fa-id-card"></i> Profilinformationen</h2>
                </div>
                <div class="card-body">
                    <div id="profile-info">
                        <div class="loading-messages">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Lade Profildaten...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: E-Mail ändern -->
        <div id="email-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-envelope"></i> E-Mail ändern</h3>
                    <button class="modal-close" id="close-email-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="email-form">
                        <div class="form-group">
                            <label for="email-input" class="modal-label">Neue E-Mail-Adresse</label>
                            <input type="email" id="email-input" class="modal-input" placeholder="ihre.email@beispiel.de" required>
                            <div class="modal-hint" id="email-hint" style="display:none;"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-email">Abbrechen</button>
                    <button class="btn btn-primary" id="save-email">Speichern</button>
                </div>
            </div>
        </div>

        <!-- Modal: Name ändern -->
        <div id="name-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> Name ändern</h3>
                    <button class="modal-close" id="close-name-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="name-form">
                        <div class="form-group">
                            <label for="first-name-input" class="modal-label">Vorname</label>
                            <input type="text" id="first-name-input" class="modal-input" placeholder="Vorname" required>
                        </div>
                        <div class="form-group">
                            <label for="last-name-input" class="modal-label">Nachname</label>
                            <input type="text" id="last-name-input" class="modal-input" placeholder="Nachname" required>
                            <div class="modal-hint" id="name-hint" style="display:none;"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-name">Abbrechen</button>
                    <button class="btn btn-primary" id="save-name">Speichern</button>
                </div>
            </div>
        </div>

        <!-- Modal: Geschlecht ändern -->
        <div id="salutation-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-venus-mars"></i> Geschlecht ändern</h3>
                    <button class="modal-close" id="close-salutation-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="salutation-form">
                        <div class="form-group">
                            <label for="salutation-input" class="modal-label">Geschlecht</label>
                            <select id="salutation-input" class="modal-input" required>
                                <option value="">Bitte wählen</option>
                                <option value="männlich">männlich</option>
                                <option value="weiblich">weiblich</option>
                                <option value="divers">divers</option>
                            </select>
                            <div class="modal-hint" id="salutation-hint" style="display:none;"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-salutation">Abbrechen</button>
                    <button class="btn btn-primary" id="save-salutation">Speichern</button>
                </div>
            </div>
        </div>

        <!-- Modal: Telefon ändern -->
        <div id="phone-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-phone"></i> Telefonnummer ändern</h3>
                    <button class="modal-close" id="close-phone-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="phone-form">
                        <div class="form-group">
                            <label for="phone-input" class="modal-label">Telefonnummer</label>
                            <input type="tel" id="phone-input" class="modal-input" placeholder="z.B. +43 123456789" required>
                            <div class="modal-hint" id="phone-hint" style="display:none;"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-phone">Abbrechen</button>
                    <button class="btn btn-primary" id="save-phone">Speichern</button>
                </div>
            </div>
        </div>

        <!-- Modal: Newsletter ändern -->
        <div id="newsletter-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-bell"></i> Newsletter-Einstellung ändern</h3>
                    <button class="modal-close" id="close-newsletter-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="newsletter-form">
                        <div class="form-group">
                            <label class="modal-label">
                                <input type="checkbox" id="newsletter-input" style="margin-right: 10px;">
                                Ich stimme dem Erhalt von Neuigkeiten, Gutscheinen, Angeboten, Newslettern und Gewinnspielen der DaVinciLab GmbH per E-Mail zu.
                            </label>
                            <div class="modal-hint" id="newsletter-hint" style="display:none;"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-newsletter">Abbrechen</button>
                    <button class="btn btn-primary" id="save-newsletter">Speichern</button>
                </div>
            </div>
        </div>

        <!-- Modal: Passwort ändern -->
        <div id="password-modal" class="modal" style="display:none;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3><i class="fas fa-lock"></i> Passwort ändern</h3>
                    <button class="modal-close" id="close-password-modal" aria-label="Schließen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="password-form">
                        <div class="form-group">
                            <label for="current-password" class="modal-label">Aktuelles Passwort</label>
                            <input type="password" id="current-password" class="modal-input" placeholder="Aktuelles Passwort" required>
                        </div>
                        <div class="form-group">
                            <label for="new-password" class="modal-label">Neues Passwort</label>
                            <input type="password" id="new-password" class="modal-input" placeholder="Neues Passwort (mind. 6 Zeichen)" required minlength="6">
                            <div class="modal-hint">
                                Das Passwort muss mindestens 6 Zeichen lang sein.
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="confirm-password" class="modal-label">Passwort bestätigen</label>
                            <input type="password" id="confirm-password" class="modal-input" placeholder="Passwort wiederholen" required minlength="5">
                            <div class="modal-hint" id="password-hint" style="display:none;"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-password">Abbrechen</button>
                    <button class="btn btn-primary" id="save-password">Speichern</button>
                </div>
            </div>
        </div>
    </main>

    <script src="./scripts.js"></script>
</body>
</html>

