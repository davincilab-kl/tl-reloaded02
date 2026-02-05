<?php
    // Fehlerberichterstattung aktivieren für Debugging
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    
    // Log-Datei im Root-Verzeichnis
    $log_file = __DIR__ . '/../../php_error.log';
    ini_set('error_log', $log_file);
    
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // User-ID aus GET-Parameter holen
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

    if (!$user_id || $user_id <= 0) {
        error_log("[get_profile.php] Invalid user ID: " . ($_GET['user_id'] ?? 'not set'));
        http_response_code(400);
        echo json_encode(['error' => 'Invalid user ID']);
        exit;
    }

    $conn = null;
    
    try {
        $conn = db_connect();
        
        if (!$conn) {
            throw new Exception('Database connection failed');
        }
        
        // Profildaten aus users und teachers Tabelle abrufen
        // Unterstützt sowohl 'teacher' als auch 'admin' Rollen, die mit teachers verknüpft sind
        $sql = "SELECT u.id, u.role_id, u.role, u.first_name, u.last_name, u.email, u.password,
                       u.phone, u.salutation, u.newsletter,
                       t.school_id,
                       s.name as school_name
                FROM users u
                LEFT JOIN teachers t ON u.role_id = t.id AND (u.role = 'teacher' OR u.role = 'admin')
                LEFT JOIN schools s ON t.school_id = s.id
                WHERE u.id = ? AND (u.role = 'teacher' OR u.role = 'admin')
                LIMIT 1";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            $error_msg = 'Prepare failed: ' . $conn->error . ' | SQL: ' . $sql;
            error_log("[get_profile.php] ERROR: $error_msg");
            throw new Exception($error_msg);
        }

        $stmt->bind_param('i', $user_id);
        
        if (!$stmt->execute()) {
            $error_msg = 'Execute failed: ' . $stmt->error . ' | User ID: ' . $user_id;
            error_log("[get_profile.php] ERROR: $error_msg");
            throw new Exception($error_msg);
        }

        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            error_log("[get_profile.php] WARNING: No profile found for user_id: $user_id");
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found']);
            $stmt->close();
            if ($conn) {
                $conn->close();
            }
            exit;
        }

        $row = $result->fetch_assoc();
        
        if (!$row) {
            error_log("[get_profile.php] ERROR: Failed to fetch row data");
            throw new Exception('Failed to fetch row data');
        }
        
        // Namen kombinieren (last_name kann NULL sein)
        $user_full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
        
        // Profildaten zurückgeben (Passwort nicht zurückgeben)
        $profile = [
            'id' => (int)$row['id'],
            'role_id' => (int)$row['role_id'],
            'name' => $user_full_name,
            'email' => $row['email'] ?? '',
            'phone' => $row['phone'] ?? null,
            'salutation' => $row['salutation'] ?? null,
            'newsletter' => isset($row['newsletter']) ? (bool)$row['newsletter'] : false,
            'school_id' => $row['school_id'] ? (int)$row['school_id'] : null,
            'school_name' => $row['school_name'] ?? null
        ];

        $stmt->close();
        
        echo json_encode($profile);
        
    } catch (Exception $e) {
        $error_msg = sprintf(
            "[get_profile.php] EXCEPTION: %s | File: %s | Line: %s | User ID: %s | Trace: %s",
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $user_id ?? 'not set',
            $e->getTraceAsString()
        );
        error_log($error_msg);
        
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } catch (Error $e) {
        $error_msg = sprintf(
            "[get_profile.php] PHP ERROR: %s | File: %s | Line: %s | User ID: %s | Trace: %s",
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $user_id ?? 'not set',
            $e->getTraceAsString()
        );
        error_log($error_msg);
        
        http_response_code(500);
        echo json_encode(['error' => 'PHP Error: ' . $e->getMessage()]);
    } finally {
        if ($conn) {
            $conn->close();
        }
    }
?>

