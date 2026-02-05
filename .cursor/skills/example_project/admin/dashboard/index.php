<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge Dashboard</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="dashboard-container">
        <div class="dashboard-header">
            <h1><i class="fas fa-tachometer-alt"></i> Dashboard</h1>
        </div>

        <div class="dashboard-widgets">
            <div id="stats-widget" class="widget">
                <div class="widget-content" id="stats-grid">
                    <div class="stat-card schools">
                        <div class="stat-icon">
                            <i class="fas fa-school"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Schulen</div>
                            <div class="stat-value" id="count-schools">…</div>
                        </div>
                    </div>
                    
                    <div class="stat-card teachers">
                        <div class="stat-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Lehrkräfte</div>
                            <div class="stat-value" id="count-teachers">…</div>
                        </div>
                    </div>
                    
                    <div class="stat-card classes">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Klassen</div>
                            <div class="stat-value" id="count-classes">…</div>
                        </div>
                    </div>
                    
                    <div class="stat-card students">
                        <div class="stat-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Schüler</div>
                            <div class="stat-value" id="count-students">…</div>
                        </div>
                    </div>
                    
                    <div class="stat-card tcoins">
                        <div class="stat-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">T-Coins (14 Tage)</div>
                            <div class="stat-value" id="count-tcoins">…</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="widget" id="upcoming-events-widget">
                <div class="widget-header">
                    <h3><i class="fas fa-calendar-alt"></i> Anstehende Termine</h3>
                    <a href="/admin/infowebinar/" class="widget-header-link">
                        <i class="fas fa-external-link-alt"></i> Zu Infowebinaren
                    </a>
                </div>
                <div class="widget-content" id="upcoming-events-content">
                    <div class="loading-events">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Termine...</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Diagramm-Bereich -->
        <div class="charts-section" id="charts-section" style="display: none;">
            <div class="chart-container">
                <div class="chart-header">
                    <h3 id="chart-title">Diagramm</h3>
                    <button class="close-chart" id="close-chart">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chart-content">
                    <canvas id="main-chart"></canvas>
                </div>
            </div>
            
            <!-- Zweites Diagramm für Schulen -->
            <div class="chart-container" id="second-chart-container" style="display: none;">
                <div class="chart-header">
                    <h3 id="second-chart-title">Zeitlicher Verlauf</h3>
                </div>
                <div class="chart-content">
                    <canvas id="second-chart"></canvas>
                </div>
            </div>
        </div>

        <div class="dashboard-widgets">
            <div class="widget pending-messages">
                <div class="widget-header">
                    <h3><i class="fas fa-envelope"></i> Ausstehende Nachrichten</h3>
                    <span class="message-count" id="message-count">0</span>
                </div>
                <div class="widget-content" id="messages-content">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Nachrichten...</span>
                    </div>
                </div>
            </div>

            <div class="widget quick-actions">
                <div class="widget-header">
                    <h3><i class="fas fa-bolt"></i> Schnellaktionen</h3>
                </div>
                <div class="widget-content">
                    <button class="action-btn" id="create-admin-btn">
                        <i class="fas fa-user-shield"></i>
                        Admin anlegen
                    </button>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal: Admin anlegen -->
    <div id="create-admin-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-user-shield"></i> Admin anlegen</h3>
                <button class="modal-close" id="close-admin-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="create-admin-form">
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label for="admin-first-name">
                                <i class="fas fa-user"></i> Vorname <span class="required">*</span>
                            </label>
                            <input type="text" id="admin-first-name" name="first_name" required autocomplete="given-name">
                        </div>
                        
                        <div class="form-group form-group-half">
                            <label for="admin-last-name">
                                <i class="fas fa-user"></i> Nachname <span class="required">*</span>
                            </label>
                            <input type="text" id="admin-last-name" name="last_name" required autocomplete="family-name">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-salutation">
                            <i class="fas fa-venus-mars"></i> Geschlecht <span class="required">*</span>
                        </label>
                        <select id="admin-salutation" name="salutation" required>
                            <option value="">Bitte wählen</option>
                            <option value="männlich">männlich</option>
                            <option value="weiblich">weiblich</option>
                            <option value="divers">divers</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-email">
                            <i class="fas fa-envelope"></i> E-Mail-Adresse <span class="required">*</span>
                        </label>
                        <input type="email" id="admin-email" name="email" required autocomplete="email">
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-phone">
                            <i class="fas fa-phone"></i> Telefonnummer <span class="required">*</span>
                        </label>
                        <input type="tel" id="admin-phone" name="phone" required autocomplete="tel" placeholder="z.B. +43 123456789">
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-password">
                            <i class="fas fa-lock"></i> Passwort <span class="required">*</span>
                        </label>
                        <input type="password" id="admin-password" name="password" required autocomplete="new-password" minlength="6">
                        <small class="form-hint">Min. 6 Zeichen</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-password-confirm">
                            <i class="fas fa-lock"></i> Passwort wiederholen <span class="required">*</span>
                        </label>
                        <input type="password" id="admin-password-confirm" name="password_confirm" required autocomplete="new-password">
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="admin-terms" name="terms" required>
                            <span>Ich habe die Teilnahmebedingungen und Datenschutzbestimmungen gelesen und akzeptiere diese. <span class="required">*</span></span>
                        </label>
                    </div>
                    
                    <div class="error-message" id="admin-error" style="display: none;"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-admin">Abbrechen</button>
                <button class="btn btn-primary" id="submit-admin">Admin anlegen</button>
            </div>
        </div>
    </div>

    <!-- Modal: Konversation anzeigen und antworten -->
    <div id="message-thread-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-comments"></i> Konversation</h3>
                <button class="modal-close" id="close-thread-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="thread-messages" class="thread-messages">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Konversation...</span>
                    </div>
                </div>
                <div class="thread-reply-section">
                    <label for="reply-text" class="modal-label">Antwort schreiben</label>
                    <textarea id="reply-text" class="modal-textarea" rows="4" placeholder="Ihre Antwort..."></textarea>
                    <div class="modal-hint" id="reply-hint" style="display:none;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-reply">Schließen</button>
                <button class="btn btn-primary" id="send-reply">Antworten</button>
            </div>
        </div>
    </div>
    
    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

