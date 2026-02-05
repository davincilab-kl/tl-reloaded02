<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
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
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }

    $name = isset($input['name']) ? trim($input['name']) : '';
    $bundesland = isset($input['bundesland']) ? trim($input['bundesland']) : '';
    $ort = isset($input['ort']) ? trim($input['ort']) : '';
    $schulart = isset($input['schulart']) ? trim($input['schulart']) : '';
    $school_type = isset($input['school_type']) ? trim($input['school_type']) : '';

    // Validierung
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Schulname ist erforderlich']);
        exit;
    }

    if (empty($bundesland)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Bundesland ist erforderlich']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob Schule bereits existiert
        $check_sql = "SELECT id FROM schools WHERE name = ? AND bundesland = ? LIMIT 1";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('ss', $name, $bundesland);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Eine Schule mit diesem Namen existiert bereits in diesem Bundesland']);
            $check_stmt->close();
            $conn->close();
            exit;
        }
        $check_stmt->close();

        // Prüfe welche Spalten existieren
        $columns_to_check = ['ort', 'schulart', 'erstelldatum', 'schultyp', 'created_by_user_id', 'school_code'];
        $existing_columns = [];
        foreach ($columns_to_check as $column) {
            $check_column = $conn->query("SHOW COLUMNS FROM schools LIKE '$column'");
            if ($check_column && $check_column->num_rows > 0) {
                $existing_columns[] = $column;
            }
        }
        
        // Hole user_id des aktuellen Benutzers
        $created_by_user_id = get_user_id();

        // Aktuelles Datum für erstelldatum
        $created_at = date('Y-m-d H:i:s');

        // Generiere eindeutigen school_code (5-stellig, alphanumerisch, nur Kleinbuchstaben)
        $school_code = null;
        if (in_array('school_code', $existing_columns)) {
            $max_attempts = 100;
            $attempts = 0;
            do {
                // Generiere 5-stelligen Code: a-z und 0-9
                $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
                $code = '';
                for ($i = 0; $i < 5; $i++) {
                    $code .= $characters[random_int(0, strlen($characters) - 1)];
                }
                
                // Prüfe ob Code bereits existiert
                $check_code_sql = "SELECT id FROM schools WHERE school_code = ? LIMIT 1";
                $check_code_stmt = $conn->prepare($check_code_sql);
                if ($check_code_stmt) {
                    $check_code_stmt->bind_param('s', $code);
                    $check_code_stmt->execute();
                    $check_code_result = $check_code_stmt->get_result();
                    $code_exists = $check_code_result->num_rows > 0;
                    $check_code_stmt->close();
                    
                    if (!$code_exists) {
                        $school_code = $code;
                        break;
                    }
                }
                $attempts++;
            } while ($attempts < $max_attempts);
            
            if (!$school_code) {
                throw new Exception('Konnte keinen eindeutigen school_code generieren');
            }
        }

        // Schule erstellen
        $school_sql = "INSERT INTO schools (name";
        $school_values = "?";
        $school_params = [$name];
        $school_types = "s";
        
        // school_code direkt nach name einfügen
        if ($school_code) {
            $school_sql .= ", school_code";
            $school_values .= ", ?";
            $school_params[] = $school_code;
            $school_types .= "s";
        }
        
        $school_sql .= ", bundesland";
        $school_values .= ", ?";
        $school_params[] = $bundesland;
        $school_types .= "s";
        
        if (in_array('ort', $existing_columns) && !empty($ort)) {
            $school_sql .= ", ort";
            $school_values .= ", ?";
            $school_params[] = $ort;
            $school_types .= "s";
        }
        
        if (in_array('schulart', $existing_columns) && !empty($schulart)) {
            $school_sql .= ", schulart";
            $school_values .= ", ?";
            $school_params[] = $schulart;
            $school_types .= "s";
        }
        
        if (in_array('schultyp', $existing_columns) && !empty($school_type)) {
            $school_sql .= ", schultyp";
            $school_values .= ", ?";
            $school_params[] = $school_type;
            $school_types .= "s";
        }
        
        if (in_array('erstelldatum', $existing_columns)) {
            $school_sql .= ", erstelldatum";
            $school_values .= ", ?";
            $school_params[] = $created_at;
            $school_types .= "s";
        }
        
        if (in_array('created_by_user_id', $existing_columns) && $created_by_user_id) {
            $school_sql .= ", created_by_user_id";
            $school_values .= ", ?";
            $school_params[] = $created_by_user_id;
            $school_types .= "i";
        }
        
        $school_sql .= ") VALUES ($school_values)";
        
        $school_stmt = $conn->prepare($school_sql);
        if (!$school_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $bind_params = array_merge([$school_types], $school_params);
        $refs = [];
        foreach ($bind_params as $key => $value) {
            $refs[$key] = &$bind_params[$key];
        }
        call_user_func_array([$school_stmt, 'bind_param'], $refs);
        
        if (!$school_stmt->execute()) {
            throw new Exception('Execute failed: ' . $school_stmt->error);
        }
        
        $school_id = $school_stmt->insert_id;
        $school_stmt->close();
        
        $conn->close();

        echo json_encode([
            'success' => true,
            'message' => 'Schule erfolgreich erstellt',
            'school' => [
                'id' => $school_id,
                'name' => $name,
                'school_code' => $school_code,
                'bundesland' => $bundesland,
                'ort' => $ort,
                'schulart' => $schulart
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server-Fehler: ' . $e->getMessage()]);
        if (isset($conn)) {
            $conn->close();
        }
    }
?>

