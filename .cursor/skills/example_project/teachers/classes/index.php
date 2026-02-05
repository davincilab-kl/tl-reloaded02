<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin_or_teacher(); // Erlaube Admin und Teacher
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Klassenmanagement</title>
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
        <div class="classes-header">
            <h1><i class="fas fa-users"></i> Klassenmanagement</h1>
            <button class="btn-create-class" id="open-create-class-modal">
                <i class="fas fa-plus"></i> Neue Klasse
            </button>
        </div>

        <div id="classes-content">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Klassen...</span>
            </div>
        </div>
    </main>

    <!-- Modal: Klassendetails und Schülerliste -->
    <div id="class-details-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3 id="modal-class-name"><i class="fas fa-users"></i> Klassendetails</h3>
                <button class="modal-close" id="close-class-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="class-stats" class="class-stats">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Statistiken...</span>
                    </div>
                </div>
                <div class="tab-group">
                    <button class="tab-button active" data-tab="students">
                        <i class="fas fa-user-graduate"></i> Schüler:innen
                    </button>
                    <button class="tab-button" data-tab="projects">
                        <i class="fas fa-project-diagram"></i> Projekte
                    </button>
                </div>
                <div id="tab-content">
                    <div id="students-list" class="tab-pane active">
                        <div class="loading-messages">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Lade Schüler:innen...</span>
                        </div>
                    </div>
                    <div id="projects-list" class="tab-pane">
                        <div class="loading-messages">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Lade Projekte...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="generate-login-cards">
                    <i class="fas fa-file-pdf"></i> Anmeldekärtchen drucken
                </button>
                <button class="btn btn-secondary" id="close-class-details">Schließen</button>
            </div>
        </div>
    </div>

    <!-- Modal: Neue Klasse erstellen (Multi-Step) -->
    <div id="create-class-modal" class="modal" style="display:none;">
        <div class="modal-dialog">
            <div class="modal-header">
                <h3><i class="fas fa-plus"></i> Neue Klasse erstellen</h3>
                <button class="modal-close" id="close-create-class-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <!-- Schritt 1: Details & Kurspaket -->
                <div id="create-class-step-1" class="create-class-step active">
                <label for="class-name-input" class="modal-label">Klassenname</label>
                <input type="text" id="class-name-input" class="modal-input" placeholder="z.B. 1A, 2B..." maxlength="100">
                <label for="student-count-input" class="modal-label">Anzahl Schüler:innen</label>
                <input type="number" id="student-count-input" class="modal-input" placeholder="Anzahl Schüler:innen..." min="1" max="50" value="20">
                    
                    <label class="modal-label" style="margin-top: 20px;">Kurspaket</label>
                    <div id="course-packages-list" class="course-packages-list">
                        <div class="loading-messages">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Lade Kurspakete...</span>
                        </div>
                    </div>
                <div class="modal-hint" id="create-class-hint" style="display:none;"></div>
                </div>

                <!-- Schritt 2: Bereitstellungsform -->
                <div id="create-class-step-2" class="create-class-step" style="display:none;">
                    <h4 class="step-title">Bereitstellungsform wählen</h4>
                    <p class="step-description">Wie soll die Klasse bereitgestellt werden?</p>
                    
                    <div class="provisioning-options">
                        <div class="provisioning-option selected" data-type="funded" data-value="funded">
                            <div class="provisioning-option-check">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="provisioning-option-content">
                                <div class="provisioning-option-header">
                                    <strong>Gefördert durch TalentsLounge-Angels</strong>
                                </div>
                                <div class="provisioning-option-description">
                                    Kostenlos, solange Kontingent besteht
                                </div>
                            </div>
                        </div>

                        <div class="provisioning-option" data-type="invoice" data-value="invoice">
                            <div class="provisioning-option-check">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="provisioning-option-content">
                                <div class="provisioning-option-header">
                                    <strong>Zahlung per Rechnung</strong>
                                </div>
                                <div class="provisioning-option-description">
                                    z.B. über Elternverein
                                </div>
                                <div class="provisioning-option-price" id="price-invoice">
                                    14,40€ pro Schüler:in
                                </div>
                            </div>
                        </div>

                        <div class="provisioning-option" data-type="uew" data-value="uew">
                            <div class="provisioning-option-check">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="provisioning-option-content">
                                <div class="provisioning-option-header">
                                    <strong>Unterrichtsmittel eigener Wahl (UeW)</strong>
                                </div>
                                <div class="provisioning-option-price" id="price-uew">
                                    14,40€ pro Schüler:in
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-hint" id="create-class-hint-step2" style="display:none;"></div>
                </div>

                <!-- Schritt 3: Erfolg -->
                <div id="create-class-step-3" class="create-class-step" style="display:none;">
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h4>Klasse erfolgreich erstellt!</h4>
                        <p id="success-message-text"></p>
                    </div>
                    <div class="success-actions">
                        <button class="btn btn-primary" id="download-login-cards-success">
                            <i class="fas fa-file-pdf"></i> Anmeldekärtchen herunterladen
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-create-class">Abbrechen</button>
                <button class="btn btn-secondary" id="back-create-class" style="display:none;">Zurück</button>
                <button class="btn btn-primary" id="next-create-class">Weiter</button>
                <button class="btn btn-primary" id="confirm-create-class" style="display:none;">Kostenpflichtig bestellen</button>
                <button class="btn btn-primary" id="confirm-create-class-free" style="display:none;">Kostenlos beantragen</button>
                <button class="btn btn-primary" id="finish-create-class" style="display:none;">Beenden</button>
            </div>
        </div>
    </div>

    <!-- Modal: Kurspaket-Info -->
    <div id="package-info-modal" class="modal" style="display:none;">
        <div class="modal-dialog">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Kurspaket-Informationen</h3>
                <button class="modal-close" id="close-package-info-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="package-info-content">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Informationen...</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="close-package-info-btn">Schließen</button>
            </div>
        </div>
    </div>

    <!-- Modal: Bestätigung zum Löschen -->
    <div id="delete-confirm-modal" class="modal" style="display:none;">
        <div class="modal-dialog">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Löschen bestätigen</h3>
                <button class="modal-close" id="close-delete-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="delete-confirm-message" class="delete-confirm-message">
                    <!-- Wird dynamisch gefüllt -->
                </div>
                <div id="delete-confirm-input-container" class="delete-confirm-input-container" style="display:none;">
                    <label for="delete-confirm-input" class="modal-label">
                        Geben Sie "LÖSCHEN" ein, um zu bestätigen:
                    </label>
                    <input type="text" id="delete-confirm-input" class="modal-input" placeholder="LÖSCHEN eingeben..." autocomplete="off">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-delete">Abbrechen</button>
                <button class="btn btn-danger" id="confirm-delete" disabled>Löschen</button>
            </div>
        </div>
    </div>

    <!-- Modal: Projekt-Prüfung und Challenge-Auswahl -->
    <div id="project-review-modal" class="modal" style="display:none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3><i class="fas fa-clipboard-check"></i> Projekt prüfen und freigeben</h3>
                <button class="modal-close" id="close-project-review-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div id="project-review-content">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Projekt-Details...</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-project-review">Abbrechen</button>
                <button class="btn btn-danger" id="reject-project-review">Ablehnen</button>
                <button class="btn btn-primary" id="approve-project-review">Projekt freigeben</button>
            </div>
        </div>
    </div>
    
    <script src="./scripts.js"></script>
</body>
</html>

