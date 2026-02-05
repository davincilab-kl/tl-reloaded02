<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if (!is_admin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }

    try {
        $conn = db_connect();
        
        // Hole das neueste updated_at Datum aus calendly_events
        $stmt = $conn->prepare("
            SELECT MAX(updated_at) as last_updated
            FROM calendly_events
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $lastUpdated = null;
        if ($row = $result->fetch_assoc()) {
            $lastUpdated = $row['last_updated'];
        }
        
        $stmt->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'last_updated' => $lastUpdated
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Abrufen des letzten Aktualisierungszeitpunkts: ' . $e->getMessage()
        ]);
    }
?>
