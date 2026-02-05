<?php
    /**
     * API-Endpoint: Prüft alle Lehrer-Status (ohne Änderungen)
     * Gibt einen Report zurück mit allen inkonsistenten Lehrern
     */
    
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    require_once __DIR__ . '/check_all_teacher_status.php';
    
    header('Content-Type: application/json');
    
    $conn = db_connect();
    
    if (!$conn) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Datenbankverbindung fehlgeschlagen'
        ]);
        exit;
    }
    
    try {
        $report = checkAllTeachersStatus($conn);
        
        if ($report === null) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Fehler beim Prüfen der Status'
            ]);
            $conn->close();
            exit;
        }
        
        echo json_encode([
            'success' => true,
            'total_teachers' => $report['summary']['total'],
            'correct' => $report['summary']['correct'],
            'incorrect' => $report['summary']['incorrect'],
            'inconsistent_teachers' => $report['inconsistent_teachers'],
            'summary' => $report['summary']
        ]);
        
    } catch (Exception $e) {
        error_log("[validate_all_teacher_status.php] Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler beim Prüfen: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
?>

