<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_admin();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pipeline</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../admin-style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>
    
    <main class="pipeline-container">
        <h1>Pipeline - Lehrkräfte Status</h1>
        
        <div class="tab-group">
            <button id="view-current" class="tab-button active" data-tab="current">Aktuell</button>
            <button id="view-comparison" class="tab-button" data-tab="comparison">Vergleich</button>
        </div>
        
        <div id="current-chart-container" class="pipeline-chart-container">
            <div class="chart-layout">
                <div class="chart-left">
                    <div id="current-slider-container" class="slider-container">
                        <label for="date-slider">Datum:</label>
                        <input type="range" id="date-slider" min="0" max="29" value="29" step="1">
                        <span id="selected-date-display"></span>
                    </div>
                    <canvas id="pipeline-chart"></canvas>
                </div>
                <div class="stats-boxes">
                    <div class="stat-box schools">
                        <div class="stat-box-icon">
                            <i class="fas fa-school"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Schulen</div>
                            <div class="stat-box-value" id="stat-schools">-</div>
                            <div class="stat-box-change" id="stat-schools-change">-</div>
                        </div>
                    </div>
                    <div class="stat-box teachers">
                        <div class="stat-box-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Lehrkräfte</div>
                            <div class="stat-box-value" id="stat-teachers">-</div>
                            <div class="stat-box-change" id="stat-teachers-change">-</div>
                        </div>
                    </div>
                    <div class="stat-box classes">
                        <div class="stat-box-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Klassen</div>
                            <div class="stat-box-value" id="stat-classes">-</div>
                            <div class="stat-box-change" id="stat-classes-change">-</div>
                        </div>
                    </div>
                    <div class="stat-box students">
                        <div class="stat-box-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Schüler</div>
                            <div class="stat-box-value" id="stat-students">-</div>
                            <div class="stat-box-change" id="stat-students-change">-</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="comparison-chart-container" class="pipeline-chart-container" style="display: none;">
            <div class="chart-layout">
                <div class="chart-left">
                    <div id="comparison-controls" class="date-range-selector">
                        <div id="comparison-date-1-container">    
                            <label>Datum 1:</label>
                            <input type="date" id="comparison-date-1" value="<?php echo date('Y-m-d', strtotime('-7 days')); ?>">
                        </div>
                        <div id="comparison-date-2-container">    
                            <label>Datum 2:</label>
                            <input type="date" id="comparison-date-2" value="<?php echo date('Y-m-d'); ?>">
                        </div>
                        <button id="load-comparison-btn">
                            <i class="fas fa-sync-alt"></i> Vergleich laden
                        </button>
                    </div>
                    <canvas id="comparison-chart"></canvas>
                </div>
                <div class="stats-boxes">
                    <div class="stat-box schools">
                        <div class="stat-box-icon">
                            <i class="fas fa-school"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Schulen</div>
                            <div class="stat-box-value" id="stat-schools-comp">-</div>
                            <div class="stat-box-change" id="stat-schools-change-comp">-</div>
                        </div>
                    </div>
                    <div class="stat-box teachers">
                        <div class="stat-box-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Lehrkräfte</div>
                            <div class="stat-box-value" id="stat-teachers-comp">-</div>
                            <div class="stat-box-change" id="stat-teachers-change-comp">-</div>
                        </div>
                    </div>
                    <div class="stat-box classes">
                        <div class="stat-box-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Klassen</div>
                            <div class="stat-box-value" id="stat-classes-comp">-</div>
                            <div class="stat-box-change" id="stat-classes-change-comp">-</div>
                        </div>
                    </div>
                    <div class="stat-box students">
                        <div class="stat-box-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="stat-box-content">
                            <div class="stat-box-label">Schüler</div>
                            <div class="stat-box-value" id="stat-students-comp">-</div>
                            <div class="stat-box-change" id="stat-students-change-comp">-</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="teachers-table-container" class="teachers-table-container" style="display: none;">
            <h2 id="teachers-table-title"></h2>
            <table id="teachers-table" class="teachers-table">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="id" onclick="pipelineManager.sortTable('id')">
                            ID <span class="sort-indicator">↕</span>
                        </th>
                        <th class="sortable" data-sort="firstname" onclick="pipelineManager.sortTable('firstname')">
                            Vorname <span class="sort-indicator">↕</span>
                        </th>
                        <th class="sortable" data-sort="lastname" onclick="pipelineManager.sortTable('lastname')">
                            Nachname <span class="sort-indicator">↕</span>
                        </th>
                        <th>E-Mail</th>
                        <th>Telefonnummer</th>
                        <th class="sortable" data-sort="school" onclick="pipelineManager.sortTable('school')">
                            Schule <span class="sort-indicator">↕</span>
                        </th>
                        <th class="sortable" data-sort="status_reached" onclick="pipelineManager.sortTable('status_reached')">
                            Status erreicht <span class="sort-indicator">↕</span>
                        </th>
                        <th class="sortable" data-sort="last_login" onclick="pipelineManager.sortTable('last_login')">
                            Zuletzt eingeloggt <span class="sort-indicator">↕</span>
                        </th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody id="teachers-table-body">
                    <!-- Wird dynamisch gefüllt -->
                </tbody>
            </table>
        </div>
        
        <!-- Modal für Lehrkraft-Details -->
        <div id="teacher-details-modal" class="modal" style="display: none;">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3 id="teacher-details-title">Lehrkraft-Details</h3>
                    <span class="modal-close" onclick="pipelineManager.closeTeacherDetailsModal()">&times;</span>
                </div>
                <div class="modal-body" id="teacher-details-body">
                    <!-- Wird dynamisch gefüllt -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="pipelineManager.closeTeacherDetailsModal()">Schließen</button>
                </div>
            </div>
        </div>
        
        <div id="pipeline-stats" class="pipeline-stats">
            <!-- Statistiken werden hier dynamisch geladen -->
        </div>
    </main>

    <script src="../admin-common.js"></script>
    <script src="./scripts.js?v=<?php echo time(); ?>"></script>
</body>
</html>

