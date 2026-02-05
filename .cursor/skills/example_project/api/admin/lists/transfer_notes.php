<?php
    require_once __DIR__ . '/../../config/auth.php';
    require_admin();
    require_once __DIR__ . '/../../config/access_db.php';
    
    header('Content-Type: application/json');
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['list_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'list_id ist erforderlich']);
        exit;
    }
    
    $list_id = intval($input['list_id']);
    $user_id = get_user_id();
    
    if ($list_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid list_id']);
        exit;
    }
    
    $conn = db_connect();
    
    try {
        // Prüfe ob Liste existiert
        $check_sql = "SELECT id, name FROM admin_teacher_lists WHERE id = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param('i', $list_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            $check_stmt->close();
            http_response_code(404);
            echo json_encode(['error' => 'Liste nicht gefunden']);
            $conn->close();
            exit;
        }
        
        $list_data = $check_result->fetch_assoc();
        $list_name = $list_data['name'];
        $check_stmt->close();
        
        // Hole alle Cache-Einträge mit Notizen für diese Liste
        $cache_sql = "SELECT teacher_id, notes, updated_at, updated_by_user_id 
                      FROM admin_teacher_list_cache 
                      WHERE list_id = ? AND notes IS NOT NULL AND notes != '' AND TRIM(notes) != ''";
        $cache_stmt = $conn->prepare($cache_sql);
        $cache_stmt->bind_param('i', $list_id);
        $cache_stmt->execute();
        $cache_result = $cache_stmt->get_result();
        
        $transferred_count = 0;
        $skipped_count = 0;
        $errors = [];
        
        // Erstelle Notiz-Einträge in teacher_notes
        $insert_sql = "INSERT INTO teacher_notes (teacher_id, created_by_user_id, note_text) VALUES (?, ?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        
        while ($row = $cache_result->fetch_assoc()) {
            $teacher_id = intval($row['teacher_id']);
            $notes_text = trim($row['notes']);
            
            if (empty($notes_text)) {
                $skipped_count++;
                continue;
            }
            
            // Erstelle Notiz-Text mit Kontext über die Liste
            $note_text = "[Übertragen aus Liste: " . $list_name . "]\n\n" . $notes_text;
            
            // Prüfe ob Lehrer existiert
            $teacher_check_sql = "SELECT id FROM teachers WHERE id = ?";
            $teacher_check_stmt = $conn->prepare($teacher_check_sql);
            $teacher_check_stmt->bind_param('i', $teacher_id);
            $teacher_check_stmt->execute();
            $teacher_check_result = $teacher_check_stmt->get_result();
            
            if ($teacher_check_result->num_rows === 0) {
                $teacher_check_stmt->close();
                $skipped_count++;
                $errors[] = "Lehrer ID $teacher_id nicht gefunden";
                continue;
            }
            $teacher_check_stmt->close();
            
            // Füge Notiz ein
            $insert_stmt->bind_param('iis', $teacher_id, $user_id, $note_text);
            
            if ($insert_stmt->execute()) {
                $transferred_count++;
            } else {
                $skipped_count++;
                $errors[] = "Fehler beim Übertragen für Lehrer ID $teacher_id: " . $insert_stmt->error;
            }
        }
        
        $insert_stmt->close();
        $cache_stmt->close();
        
        echo json_encode([
            'success' => true,
            'transferred_count' => $transferred_count,
            'skipped_count' => $skipped_count,
            'errors' => $errors,
            'message' => "$transferred_count Notizen erfolgreich übertragen"
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    
    $conn->close();
?>

