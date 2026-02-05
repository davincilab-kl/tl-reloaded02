<?php
    require_once __DIR__ . '/../api/config/auth.php';
    
    // Prüfe ob teacher_id übergeben wurde
    $teacher_id = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;
    
    if ($teacher_id <= 0) {
        header('Location: /register/index.php');
        exit;
    }
    
    // Prüfe ob Lehrer bereits eine Schule zugewiesen hat und ob E-Mail verifiziert ist
    require_once __DIR__ . '/../api/config/access_db.php';
    $conn = db_connect();
    $check_sql = "SELECT t.school_id, u.email_verified 
                  FROM teachers t 
                  INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher' 
                  WHERE t.id = ? LIMIT 1";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param('i', $teacher_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    $teacher_data = $check_result->fetch_assoc();
    $check_stmt->close();
    $conn->close();
    
    // Prüfe ob E-Mail verifiziert ist
    $email_verified = isset($teacher_data['email_verified']) ? (int)$teacher_data['email_verified'] : 0;
    if ($email_verified !== 1) {
        // E-Mail noch nicht verifiziert - zur Verifizierungsseite weiterleiten
        header('Location: /register/verify_email.php?teacher_id=' . $teacher_id);
        exit;
    }
    
    // Wenn bereits eine Schule zugewiesen, zum Login weiterleiten
    if ($teacher_data && $teacher_data['school_id'] !== null) {
        header('Location: /login/index.php?registered=1');
        exit;
    }
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TalentsLounge - Schule auswählen</title>
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
                <h2>Schule auswählen</h2>
                <p>Wählen Sie Ihre Schule aus oder legen Sie eine neue an</p>
            </div>
            
            <div class="school-selection-container">
                <!-- Suche nach bestehender Schule -->
                <div class="school-search-section">
                    <h3><i class="fas fa-search"></i> Schule suchen</h3>
                    <div class="form-group">
                        <label for="bundesland-filter">
                            <i class="fas fa-map-marker-alt"></i> Bundesland <span class="required">*</span>
                        </label>
                        <select id="bundesland-filter" class="modal-input" required>
                            <option value="">Bitte wählen</option>
                            <option value="Wien">Wien</option>
                            <option value="Niederösterreich">Niederösterreich</option>
                            <option value="Oberösterreich">Oberösterreich</option>
                            <option value="Salzburg">Salzburg</option>
                            <option value="Tirol">Tirol</option>
                            <option value="Vorarlberg">Vorarlberg</option>
                            <option value="Kärnten">Kärnten</option>
                            <option value="Steiermark">Steiermark</option>
                            <option value="Burgenland">Burgenland</option>
                        </select>
                    </div>
                    <div id="schulart-filter-container" class="form-group" style="display: none;">
                        <label for="schulart-filter">
                            <i class="fas fa-graduation-cap"></i> Schulart
                        </label>
                        <select id="schulart-filter" class="modal-input">
                            <option value="">Alle Schularten</option>
                            <option value="AHS">AHS</option>
                            <option value="MS">MS</option>
                            <option value="PTS">PTS</option>
                            <option value="Andere">Andere</option>
                        </select>
                    </div>
                    <div id="school-search-container" class="form-group" style="display: none;">
                        <label for="school-search">
                            <i class="fas fa-search"></i> Schule filtern
                        </label>
                        <input type="text" id="school-search" class="modal-input" placeholder="Schulname oder Ort eingeben...">
                    </div>
                    <div id="school-results" class="school-results"></div>
                    <div id="create-school-link" class="create-school-link" style="display: none;">
                        <a href="#" id="show-create-form-link">
                            <i class="fas fa-plus-circle"></i> Schule nicht gefunden? Neu anlegen...
                        </a>
                    </div>
                </div>
                
                <!-- Neue Schule anlegen -->
                <div class="school-create-section" id="school-create-section" style="display: none;">
                    <h3><i class="fas fa-plus-circle"></i> Neue Schule anlegen</h3>
                    <form id="create-school-form">
                        <div class="form-group">
                            <label for="school-name">
                                <i class="fas fa-school"></i> Schulname <span class="required">*</span>
                            </label>
                            <input type="text" id="school-name" name="school_name" required autocomplete="school-name">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group form-group-half">
                                <label for="school-bundesland">
                                    <i class="fas fa-map-marker-alt"></i> Bundesland <span class="required">*</span>
                                </label>
                                <select id="school-bundesland" name="bundesland" required autocomplete="bundesland">
                                    <option value="">Bitte wählen</option>
                                    <option value="Wien">Wien</option>
                                    <option value="Niederösterreich">Niederösterreich</option>
                                    <option value="Oberösterreich">Oberösterreich</option>
                                    <option value="Salzburg">Salzburg</option>
                                    <option value="Tirol">Tirol</option>
                                    <option value="Vorarlberg">Vorarlberg</option>
                                    <option value="Kärnten">Kärnten</option>
                                    <option value="Steiermark">Steiermark</option>
                                    <option value="Burgenland">Burgenland</option>
                                </select>
                            </div>
                            
                            <div class="form-group form-group-half">
                                <label for="school-ort">
                                    <i class="fas fa-map-pin"></i> Ort <span class="required">*</span>
                                </label>
                                <input type="text" id="school-ort" name="ort" required autocomplete="address-level2">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group form-group-half">
                                <label for="school-schulart">
                                    <i class="fas fa-graduation-cap"></i> Schulart <span class="required">*</span>
                                </label>
                                <select id="school-schulart" name="schulart" required autocomplete="schulart">
                                    <option value="">Bitte wählen</option>
                                    <option value="AHS">AHS</option>
                                    <option value="MS">MS</option>
                                    <option value="PTS">PTS</option>
                                    <option value="Andere">Andere</option>
                                </select>
                            </div>
                            
                            <div class="form-group form-group-half">
                                <label for="school-type">
                                    <i class="fas fa-building"></i> Schultyp <span class="required">*</span>
                                </label>
                                <select id="school-type" name="school_type" required autocomplete="school_type">
                                    <option value="">Bitte wählen</option>
                                    <option value="Öffentliche Schule">Öffentliche Schule</option>
                                    <option value="Privatschule">Privatschule</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="error-message" id="create-school-error" style="display: none;"></div>
                        
                        <button type="submit" class="btn-register">
                            <i class="fas fa-plus"></i> Schule anlegen und zuweisen
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const teacherId = <?php echo $teacher_id; ?>;
    </script>
    <script src="./select_school.js"></script>
</body>
</html>

