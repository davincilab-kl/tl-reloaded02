<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>E-Mail-Vorlagen</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="email-templates-container">
        <div class="email-templates-header">
            <h1><i class="fas fa-envelope"></i> Automatische E-Mail-Nachrichten</h1>
            <button class="btn btn-primary" id="create-template-btn">
                <i class="fas fa-plus"></i> Neue Vorlage erstellen
            </button>
        </div>

        <!-- Vorlagen-Liste -->
        <div class="templates-section">
            <h2>Gespeicherte Vorlagen</h2>
            <div id="templates-list" class="templates-list">
                <div class="loading-templates">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Vorlagen...</span>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal: Vorlage erstellen/bearbeiten -->
    <div id="template-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> <span id="modal-title">Neue Vorlage</span></h3>
                <button class="modal-close" id="close-template-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="template-form">
                    <input type="hidden" id="template-id" name="template_id">
                    
                    <div class="form-group">
                        <label for="template-name" class="modal-label">Vorlagenname <span class="required">*</span></label>
                        <input type="text" id="template-name" name="name" class="form-input" required 
                               placeholder="z.B. Willkommens-E-Mail, Erinnerung, etc.">
                    </div>

                    <div class="form-group">
                        <label for="template-subject" class="modal-label">Betreff <span class="required">*</span></label>
                        <input type="text" id="template-subject" name="subject" class="form-input" required 
                               placeholder="E-Mail-Betreff">
                        <small class="form-hint">Verfügbare Platzhalter: {{name}}, {{email}}, {{school}}, etc.</small>
                    </div>

                    <div class="form-group">
                        <label for="template-body" class="modal-label">Nachricht <span class="required">*</span></label>
                        <textarea id="template-body" name="body" class="form-textarea" rows="12" required 
                                  placeholder="E-Mail-Nachricht..."></textarea>
                        <small class="form-hint">Verwenden Sie HTML für Formatierung. Platzhalter: {{name}}, {{email}}, {{school}}, {{date}}, etc.</small>
                    </div>

                    <div class="form-group">
                        <label class="modal-label">
                            <input type="checkbox" id="template-is-html" name="is_html">
                            Als HTML senden
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-template">Abbrechen</button>
                <button class="btn btn-primary" id="save-template">Speichern</button>
            </div>
        </div>
    </div>

    <!-- Modal: E-Mail senden -->
    <div id="send-email-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-paper-plane"></i> E-Mail senden</h3>
                <button class="modal-close" id="close-send-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="send-email-form">
                    <input type="hidden" id="send-template-id" name="template_id">
                    
                    <div class="form-group">
                        <label for="send-to" class="modal-label">Empfänger <span class="required">*</span></label>
                        <select id="send-to" name="recipient_type" class="form-input" required>
                            <option value="">Bitte wählen...</option>
                            <option value="all_teachers">Alle Lehrkräfte</option>
                            <option value="all_schools">Alle Schulen</option>
                            <option value="custom">Einzelne E-Mail-Adresse</option>
                            <option value="user_ids">Spezifische User-IDs (zum Testen)</option>
                        </select>
                    </div>

                    <div class="form-group" id="custom-email-group" style="display:none;">
                        <label for="custom-email" class="modal-label">E-Mail-Adresse</label>
                        <input type="email" id="custom-email" name="custom_email" class="form-input" 
                               placeholder="email@beispiel.at">
                    </div>

                    <div class="form-group" id="user-ids-group" style="display:none;">
                        <label for="user-ids" class="modal-label">User-IDs (kommagetrennt) <span class="required">*</span></label>
                        <input type="text" id="user-ids" name="user_ids" class="form-input" 
                               placeholder="1, 5, 10, 23" required>
                        <small class="form-hint">Geben Sie die User-IDs durch Kommas getrennt ein (z.B. 1, 5, 10). Diese Option ist zum Testen gedacht.</small>
                    </div>

                    <div class="form-group">
                        <label for="preview-subject" class="modal-label">Betreff (Vorschau)</label>
                        <input type="text" id="preview-subject" class="form-input" readonly>
                    </div>

                    <div class="form-group">
                        <label for="preview-body" class="modal-label">Nachricht (Vorschau)</label>
                        <div id="preview-body" class="preview-content"></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-send">Abbrechen</button>
                <button class="btn btn-primary" id="send-email-btn">
                    <i class="fas fa-paper-plane"></i> E-Mail senden
                </button>
            </div>
        </div>
    </div>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js"></script>
</body>
</html>

