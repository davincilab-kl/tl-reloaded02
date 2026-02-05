<?php
    require_once __DIR__ . '/../../../api/config/auth.php';
    require_once __DIR__ . '/../../../api/config/access_db.php';
    require_login(); // Erlaube Student, Teacher und Admin
    
    // Prüfe ob Lehrer Zugriff hat (Schule muss freigeschaltet sein)
    if (!teacher_has_student_dashboard_access()) {
        header('Location: /access-denied/?message=' . urlencode('Dieser Bereich wird erst freigeschaltet, wenn Ihre Schule freigeschaltet ist.'));
        exit;
    }

    // Projekt-ID aus GET-Parameter
    $project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : null;
    
    // Prüfe Projekt-Status, bevor Scratch-GUI geladen wird
    $project_not_editable = false;
    $project_status_message = '';
    
    if ($project_id) {
        $conn = db_connect();
        
        try {
            // Prüfe ob status Spalte existiert
            $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
            $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
            
            // Hole student_id des aktuellen Users
            $student_id = null;
            $user_role = get_user_role();
            
            if (is_student()) {
                $student_id = get_role_id();
            } else if (is_teacher() || is_admin()) {
                $role_id = get_role_id();
                
                if (is_admin()) {
                    $check_admins_table = $conn->query("SHOW TABLES LIKE 'admins'");
                    if ($check_admins_table && $check_admins_table->num_rows > 0) {
                        $admin_sql = "SELECT student_id FROM admins WHERE id = ? LIMIT 1";
                        $admin_stmt = $conn->prepare($admin_sql);
                        if ($admin_stmt) {
                            $admin_stmt->bind_param('i', $role_id);
                            $admin_stmt->execute();
                            $admin_result = $admin_stmt->get_result();
                            if ($admin_row = $admin_result->fetch_assoc()) {
                                $student_id = !empty($admin_row['student_id']) ? (int)$admin_row['student_id'] : null;
                            }
                            $admin_stmt->close();
                        }
                    }
                }
                
                if ($student_id === null || $student_id <= 0) {
                    $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
                    $teacher_stmt = $conn->prepare($teacher_sql);
                    if ($teacher_stmt) {
                        $teacher_stmt->bind_param('i', $role_id);
                        $teacher_stmt->execute();
                        $teacher_result = $teacher_stmt->get_result();
                        if ($teacher_row = $teacher_result->fetch_assoc()) {
                            $student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
                        }
                        $teacher_stmt->close();
                    }
                }
            }
            
            if ($student_id) {
                // Lade Projekt-Status
                $sql = "SELECT student_id";
                if ($has_status_column) {
                    $sql .= ", status";
                }
                $sql .= " FROM projects WHERE id = ? LIMIT 1";
                $stmt = $conn->prepare($sql);
                
                if ($stmt) {
                    $stmt->bind_param('i', $project_id);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    
                    if ($result->num_rows > 0) {
                        $row = $result->fetch_assoc();
                        $project_student_id = (int)$row['student_id'];
                        
                        // Prüfe ob Benutzer berechtigt ist (Projekt-Besitzer oder Admin)
                        if ($project_student_id === $student_id || is_admin()) {
                            $project_status = $has_status_column ? ($row['status'] ?? 'working') : 'working';
                            
                            if ($project_status === 'check' || $project_status === 'published') {
                                $project_not_editable = true;
                                if ($project_status === 'check') {
                                    $project_status_message = 'Dieses Projekt wurde zur Prüfung eingereicht und kann nicht mehr bearbeitet werden, bis es von der Lehrkraft freigegeben oder abgelehnt wurde.';
                                } else if ($project_status === 'published') {
                                    $project_status_message = 'Dieses Projekt wurde bereits veröffentlicht und kann nicht mehr bearbeitet werden.';
                                }
                            }
                        }
                    }
                    $stmt->close();
                }
            }
        } catch (Exception $e) {
            error_log("[index.php] Fehler beim Prüfen des Projekt-Status: " . $e->getMessage());
        }
        
        $conn->close();
    }
    
    // Konfigurations-Parameter aus URL lesen
    $config = [
        'hideMenuBar' => isset($_GET['hide_menu_bar']) && $_GET['hide_menu_bar'] === '1',
        'hideFileMenu' => isset($_GET['hide_file_menu']) && $_GET['hide_file_menu'] === '1',
        'hideEditMenu' => isset($_GET['hide_edit_menu']) && $_GET['hide_edit_menu'] === '1',
        'hideTutorials' => isset($_GET['hide_tutorials']) && $_GET['hide_tutorials'] === '1',
        'hideShare' => isset($_GET['hide_share']) && $_GET['hide_share'] === '1',
        'hideSave' => isset($_GET['hide_save']) && $_GET['hide_save'] === '1',
        'hideLoad' => isset($_GET['hide_load']) && $_GET['hide_load'] === '1',
        'hidePublish' => isset($_GET['hide_publish']) && $_GET['hide_publish'] === '1',
        'hideTitle' => isset($_GET['hide_title']) && $_GET['hide_title'] === '1',
        'hideBackButton' => isset($_GET['hide_back_button']) && $_GET['hide_back_button'] === '1',
        'hideSpriteLibrary' => isset($_GET['hide_sprite_library']) && $_GET['hide_sprite_library'] === '1',
        'hideBackdropLibrary' => isset($_GET['hide_backdrop_library']) && $_GET['hide_backdrop_library'] === '1',
        'hideSoundLibrary' => isset($_GET['hide_sound_library']) && $_GET['hide_sound_library'] === '1',
        'hideExtensionLibrary' => isset($_GET['hide_extension_library']) && $_GET['hide_extension_library'] === '1',
        'hideExtensionButton' => isset($_GET['hide_extension_button']) && $_GET['hide_extension_button'] === '1',
        'hideCostumesTab' => isset($_GET['hide_costumes_tab']) && $_GET['hide_costumes_tab'] === '1',
        'hideSoundsTab' => isset($_GET['hide_sounds_tab']) && $_GET['hide_sounds_tab'] === '1',
        'hideCodeTab' => isset($_GET['hide_code_tab']) && $_GET['hide_code_tab'] === '1',
        'mode' => isset($_GET['mode']) ? $_GET['mode'] : 'full', // 'full', 'blocks-only', 'player-only'
        // Block-Kategorien ausblenden
        'hideCategoryMotion' => isset($_GET['hide_category_motion']) && $_GET['hide_category_motion'] === '1',
        'hideCategoryLooks' => isset($_GET['hide_category_looks']) && $_GET['hide_category_looks'] === '1',
        'hideCategorySound' => isset($_GET['hide_category_sound']) && $_GET['hide_category_sound'] === '1',
        'hideCategoryEvent' => isset($_GET['hide_category_event']) && $_GET['hide_category_event'] === '1',
        'hideCategoryControl' => isset($_GET['hide_category_control']) && $_GET['hide_category_control'] === '1',
        'hideCategorySensing' => isset($_GET['hide_category_sensing']) && $_GET['hide_category_sensing'] === '1',
        'hideCategoryOperators' => isset($_GET['hide_category_operators']) && $_GET['hide_category_operators'] === '1',
        'hideCategoryData' => isset($_GET['hide_category_data']) && $_GET['hide_category_data'] === '1',
        'hideCategoryProcedures' => isset($_GET['hide_category_procedures']) && $_GET['hide_category_procedures'] === '1'
    ];
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Scratch Editor<?php echo $project_id ? ' - Projekt #' . $project_id : ''; ?></title>
    <link rel="stylesheet" href="/style.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        #scratch-editor-wrapper {
            width: 100%;
            height: 100vh;
            position: relative;
        }
        #scratch-editor-iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        }
        #scratch-editor-iframe.loaded {
            opacity: 1;
        }
        .loading-messages {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #666;
            font-size: 16px;
            z-index: 1000;
            transition: opacity 0.5s ease-in-out;
        }
        .loading-messages.fade-out {
            opacity: 0;
            pointer-events: none;
        }
        .loading-messages .scratch-cat {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            display: block;
            animation: rotate 2s linear infinite;
        }
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        .loading-messages span {
            display: block;
            margin-top: 10px;
        }
        .error-messages {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #d32f2f;
            font-size: 16px;
            padding: 20px;
            background: #ffebee;
            border-radius: 4px;
        }
        .text-center {
            text-align: center;
        }
        .text-muted {
            color: var(--text-muted, #6c757d);
            font-size: 0.85em;
        }
        .project-item {
            padding: 15px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .project-item:hover {
            background-color: #f0f0f0;
        }
        .project-item-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #575e75;
        }
        .project-item-description {
            font-size: 0.9em;
            color: #888;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <?php if ($project_not_editable): ?>
        <!-- Zeige nur Modal, wenn Projekt nicht bearbeitbar ist -->
        <div id="project-not-editable-modal" class="modal" style="display: flex;">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>Projekt kann nicht bearbeitet werden</h3>
                    <button class="modal-close" onclick="closeProjectNotEditableModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p id="project-not-editable-message"><?php echo htmlspecialchars($project_status_message); ?></p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeProjectNotEditableModal()">Zurück zur Projekt-Übersicht</button>
                </div>
            </div>
        </div>
        <script>
            function closeProjectNotEditableModal() {
                window.location.href = '/students/projects/';
            }
        </script>
    <?php else: ?>
        <!-- KEIN Menü, KEIN Header - nur Scratch Editor -->
        <div id="scratch-editor-wrapper">
            <div class="loading-messages">
                <img src="./imgs/scratch_cat.svg" alt="Scratch Cat" class="scratch-cat">
                <span>Lade Scratch Editor...</span>
            </div>
        </div>
    <?php endif; ?>

    <!-- Load Project Modal -->
    <div id="load-project-modal" class="modal" style="display: none;">
        <div class="modal-dialog">
            <div class="modal-header">
                <h3>Projekt laden</h3>
                <button class="modal-close" onclick="closeLoadProjectModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="load-project-loading" class="text-center" style="padding: 40px;">
                    Lade Projekte...
                </div>
                <div id="load-project-error" class="error-message" style="display: none;"></div>
                <div id="load-project-list" style="display: none;"></div>
            </div>
        </div>
    </div>

    <!-- Publish Project Modal -->
    <div id="publish-project-modal" class="modal" style="display: none;">
        <div class="modal-dialog modal-large">
            <div class="modal-header">
                <h3>Projekt veröffentlichen</h3>
                <button class="modal-close" onclick="closePublishProjectModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="publish-project-error" class="error-message" style="display: none;"></div>
                
                <div class="form-group">
                    <label>Projekttitel</label>
                    <input type="text" id="publish-project-title" placeholder="Titel des Projekts">
                    <div class="text-muted" style="font-size: 0.85em; margin-top: 5px;">Dieser Titel überschreibt den Spieltitel</div>
                </div>

                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea id="publish-project-description" placeholder="Beschreibung des Projekts" style="min-height: 80px;"></textarea>
                </div>

                <div class="form-group">
                    <label>Cover-Bild</label>
                    <input type="file" id="publish-project-cover" accept="image/*">
                    <div id="publish-project-cover-preview" style="margin-top: 10px; max-width: 200px; max-height: 200px; border: 1px solid #d9d9d9; border-radius: 4px; overflow: hidden; display: none;">
                        <img id="publish-project-cover-img" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closePublishProjectModal()">Abbrechen</button>
                <button class="btn btn-primary" onclick="handlePublishProject()" id="publish-project-submit">Veröffentlichen</button>
            </div>
        </div>
    </div>

    <!-- Project Not Editable Modal -->
    <div id="project-not-editable-modal" class="modal" style="display: none;">
        <div class="modal-dialog">
            <div class="modal-header">
                <h3>Projekt kann nicht bearbeitet werden</h3>
                <button class="modal-close" onclick="closeProjectNotEditableModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p id="project-not-editable-message"></p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeProjectNotEditableModal()">Zurück zur Projekt-Übersicht</button>
            </div>
        </div>
    </div>

    <?php if (!$project_not_editable): ?>
        <script>
            // Projekt-ID für JavaScript verfügbar machen
            window.PROJECT_ID = <?php echo $project_id ? $project_id : 'null'; ?>;
            
            // Editor-Konfiguration für JavaScript verfügbar machen
            window.EDITOR_CONFIG = <?php echo json_encode($config); ?>;
        </script>
        <script src="./scripts.js"></script>
    <?php endif; ?>
</body>
</html>
