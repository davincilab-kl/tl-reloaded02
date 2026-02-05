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

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $searchTerm = isset($_GET['q']) ? trim($_GET['q']) : '';
    
    // Bei leerer Suche: Alle Teachers zurückgeben (für Auto-Matching)
    $isAutoMatch = strlen($searchTerm) < 2;

    try {
        $conn = db_connect();
        
        if ($isAutoMatch) {
            // Alle Teachers zurückgeben (für Auto-Matching)
            $stmt = $conn->prepare("
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM users u
                WHERE u.role = 'teacher'
                ORDER BY u.first_name, u.last_name
                LIMIT 500
            ");
            $stmt->execute();
        } else {
            // Suche nach Teachers nur per Name (nicht E-Mail)
            $searchPattern = '%' . $conn->real_escape_string($searchTerm) . '%';
            
            $stmt = $conn->prepare("
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM users u
                WHERE u.role = 'teacher'
                AND (
                    CONCAT(u.first_name, ' ', u.last_name) LIKE ?
                    OR u.first_name LIKE ?
                    OR u.last_name LIKE ?
                )
                ORDER BY 
                    CASE 
                        WHEN CONCAT(u.first_name, ' ', u.last_name) LIKE ? THEN 1
                        WHEN u.first_name LIKE ? THEN 2
                        ELSE 3
                    END,
                    u.first_name, u.last_name
                LIMIT 20
            ");
            
            $namePattern = $searchPattern;
            $nameStartsWith = $searchTerm . '%';
            
            $stmt->bind_param("ssss", 
                $namePattern,      // CONCAT(first_name, ' ', last_name) LIKE
                $namePattern,      // first_name LIKE
                $namePattern,      // last_name LIKE
                $nameStartsWith    // name starts with for ordering
            );
            $stmt->execute();
        }
        
        $result = $stmt->get_result();
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = [
                'id' => (int)$row['id'],
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name'],
                'email' => $row['email'],
                'full_name' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''))
            ];
        }
        $stmt->close();
        
        $conn->close();
        
        echo json_encode([
            'success' => true,
            'users' => $users
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fehler bei der User-Suche: ' . $e->getMessage()
        ]);
    }
?>
