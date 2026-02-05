<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur POST-Requests erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // JSON-Daten lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['class_id']) || !isset($input['school_year_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters: class_id and school_year_id']);
        exit;
    }

    $class_id = (int)$input['class_id'];
    $school_year_id = (int)$input['school_year_id'];
    $is_active = isset($input['is_active']) ? (bool)$input['is_active'] : true;

    if ($class_id <= 0 || $school_year_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid class_id or school_year_id']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Tabellen existieren
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_class_school_years = $conn->query("SHOW TABLES LIKE 'class_school_years'");
        
        if (!$check_school_years || $check_school_years->num_rows === 0) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Tabelle school_years existiert noch nicht']);
            $conn->close();
            exit;
        }
        
        if (!$check_class_school_years || $check_class_school_years->num_rows === 0) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Tabelle class_school_years existiert noch nicht']);
            $conn->close();
            exit;
        }

        // Prüfe ob Klasse existiert
        $check_class = $conn->prepare("SELECT id FROM classes WHERE id = ?");
        $check_class->bind_param('i', $class_id);
        $check_class->execute();
        $class_result = $check_class->get_result();
        if ($class_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Class not found']);
            $check_class->close();
            $conn->close();
            exit;
        }
        $check_class->close();

        // Prüfe ob Schuljahr existiert
        $check_year = $conn->prepare("SELECT id FROM school_years WHERE id = ?");
        $check_year->bind_param('i', $school_year_id);
        $check_year->execute();
        $year_result = $check_year->get_result();
        if ($year_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'School year not found']);
            $check_year->close();
            $conn->close();
            exit;
        }
        $check_year->close();

        // Prüfe ob Verknüpfung bereits existiert
        $check_link = $conn->prepare("SELECT id, is_active FROM class_school_years WHERE class_id = ? AND school_year_id = ?");
        $check_link->bind_param('ii', $class_id, $school_year_id);
        $check_link->execute();
        $link_result = $check_link->get_result();
        
        if ($link_result->num_rows > 0) {
            // Verknüpfung existiert bereits - aktualisiere is_active
            $link_row = $link_result->fetch_assoc();
            $link_id = (int)$link_row['id'];
            
            $update_sql = "UPDATE class_school_years SET is_active = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param('ii', $is_active, $link_id);
            
            if (!$update_stmt->execute()) {
                throw new Exception('Update failed: ' . $update_stmt->error);
            }
            
            $update_stmt->close();
            $check_link->close();
            
            echo json_encode([
                'success' => true,
                'class_id' => $class_id,
                'school_year_id' => $school_year_id,
                'is_active' => $is_active,
                'action' => 'updated'
            ]);
        } else {
            // Verknüpfung existiert nicht - erstelle neue
            $insert_sql = "INSERT INTO class_school_years (class_id, school_year_id, is_active) VALUES (?, ?, ?)";
            $insert_stmt = $conn->prepare($insert_sql);
            $insert_stmt->bind_param('iii', $class_id, $school_year_id, $is_active);
            
            if (!$insert_stmt->execute()) {
                throw new Exception('Insert failed: ' . $insert_stmt->error);
            }
            
            $insert_stmt->close();
            $check_link->close();
            
            echo json_encode([
                'success' => true,
                'class_id' => $class_id,
                'school_year_id' => $school_year_id,
                'is_active' => $is_active,
                'action' => 'created'
            ]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        $error_msg = 'Exception: ' . $e->getMessage() . ' | File: ' . __FILE__ . ' | Line: ' . $e->getLine();
        error_log('[update_class_school_year.php] ' . $error_msg);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
