<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Nur Admin-Zugriff erlauben
    require_admin();

    $conn = db_connect();

    // Parameter aus GET-Request
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

    if ($teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid teacher ID']);
        $conn->close();
        exit;
    }

    try {
        // Hole alle Notizen für den Lehrer, sortiert nach Erstellungsdatum (neueste zuerst)
        // Inkludiert Name des erstellenden Admins
        $sql = "SELECT 
                    tn.id,
                    tn.teacher_id,
                    tn.note_text,
                    tn.created_at,
                    tn.updated_at,
                    u.first_name as created_by_first_name,
                    u.last_name as created_by_last_name
                FROM teacher_notes tn
                LEFT JOIN users u ON tn.created_by_user_id = u.id
                WHERE tn.teacher_id = ?
                ORDER BY tn.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $teacher_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $notes = [];
        
        while ($row = $result->fetch_assoc()) {
            // Namen kombinieren
            $created_by_name = trim(($row['created_by_first_name'] ?? '') . ' ' . ($row['created_by_last_name'] ?? ''));
            if (empty($created_by_name)) {
                $created_by_name = 'Unbekannt';
            }
            
            $notes[] = [
                'id' => (int)$row['id'],
                'teacher_id' => (int)$row['teacher_id'],
                'note_text' => $row['note_text'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'created_by_name' => $created_by_name
            ];
        }
        
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'notes' => $notes
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }

    $conn->close();
?>
