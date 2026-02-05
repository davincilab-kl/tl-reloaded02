<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../students/tcoins_manager.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $class_name = isset($input['class_name']) ? trim($input['class_name']) : null;
    $student_count = isset($input['student_count']) ? (int)$input['student_count'] : null;
    $teacher_id = isset($input['teacher_id']) ? (int)$input['teacher_id'] : null;
    $course_package_id = isset($input['course_package_id']) ? (int)$input['course_package_id'] : null;
    $provisioning_type = isset($input['provisioning_type']) ? trim($input['provisioning_type']) : null;
    $school_year_id = isset($input['school_year_id']) ? (int)$input['school_year_id'] : null;

    // Validierung
    if (empty($class_name)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Klassenname fehlt']);
        exit;
    }

    if ($student_count === null || $student_count < 1 || $student_count > 50) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige Schüleranzahl (1-50)']);
        exit;
    }

    if ($teacher_id === null || $teacher_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'teacher_id fehlt oder ungültig']);
        exit;
    }

    // Validierung Kurspaket
    if ($course_package_id === null || $course_package_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Kurspaket muss ausgewählt werden']);
        exit;
    }

    // Validierung Bereitstellungsform
    $valid_provisioning_types = ['funded', 'invoice', 'uew'];
    if ($provisioning_type === null || !in_array($provisioning_type, $valid_provisioning_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige Bereitstellungsform']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole school_id des Lehrers
        $teacher_sql = "SELECT t.school_id 
                       FROM teachers t 
                       WHERE t.id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if (!$teacher_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $teacher_stmt->bind_param('i', $teacher_id);
        if (!$teacher_stmt->execute()) {
            throw new Exception('Execute failed: ' . $teacher_stmt->error);
        }
        
        $teacher_result = $teacher_stmt->get_result();
        if ($teacher_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Lehrer nicht gefunden']);
            $teacher_stmt->close();
            $conn->close();
            exit;
        }
        
        $teacher_row = $teacher_result->fetch_assoc();
        $school_id = (int)$teacher_row['school_id'];
        $teacher_stmt->close();
        
        // Prüfe ob die Schule gefördert wird (Eintrag in school_school_years für aktuelles Schuljahr)
        $foerderung = false;
        $check_school_years = $conn->query("SHOW TABLES LIKE 'school_years'");
        $check_school_school_years = $conn->query("SHOW TABLES LIKE 'school_school_years'");
        if ($check_school_years && $check_school_years->num_rows > 0 && 
            $check_school_school_years && $check_school_school_years->num_rows > 0) {
            $foerderung_sql = "SELECT 1 FROM school_school_years ssy
                               INNER JOIN school_years sy ON ssy.school_year_id = sy.id
                               WHERE ssy.school_id = ? AND sy.is_current = 1
                               LIMIT 1";
            
            $foerderung_stmt = $conn->prepare($foerderung_sql);
            if ($foerderung_stmt) {
                $foerderung_stmt->bind_param('i', $school_id);
                if ($foerderung_stmt->execute()) {
                    $foerderung_result = $foerderung_stmt->get_result();
                    $foerderung = $foerderung_result->num_rows > 0;
                }
                $foerderung_stmt->close();
            }
        }
        
        // Prüfe ob die Schule gefördert wird
        if (!$foerderung) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Die Schule muss gefördert werden, bevor Klassen erstellt werden können']);
            $conn->close();
            exit;
        }

        // Hole user_id aus users Tabelle (für class_orders)
        // Unterstützt sowohl 'teacher' als auch 'admin' Rollen, die mit teachers verknüpft sind
        $user_id_sql = "SELECT id FROM users WHERE role_id = ? AND (role = 'teacher' OR role = 'admin') LIMIT 1";
        $user_id_stmt = $conn->prepare($user_id_sql);
        if (!$user_id_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $user_id_stmt->bind_param('i', $teacher_id);
        if (!$user_id_stmt->execute()) {
            $user_id_stmt->close();
            throw new Exception('Execute failed: ' . $user_id_stmt->error);
        }
        $user_id_result = $user_id_stmt->get_result();
        if ($user_id_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User-ID für Lehrer nicht gefunden']);
            $user_id_stmt->close();
            $conn->close();
            exit;
        }
        $user_id_row = $user_id_result->fetch_assoc();
        $user_id = (int)$user_id_row['id'];
        $user_id_stmt->close();

        // Prüfe ob Kurspaket existiert
        $package_check_sql = "SELECT id FROM course_packages WHERE id = ? LIMIT 1";
        $package_check_stmt = $conn->prepare($package_check_sql);
        if (!$package_check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $package_check_stmt->bind_param('i', $course_package_id);
        if (!$package_check_stmt->execute()) {
            $package_check_stmt->close();
            throw new Exception('Execute failed: ' . $package_check_stmt->error);
        }
        $package_check_result = $package_check_stmt->get_result();
        if ($package_check_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Kurspaket nicht gefunden']);
            $package_check_stmt->close();
            $conn->close();
            exit;
        }
        $package_check_stmt->close();

        // Erstelle die Klasse (ohne Kurspaket-Informationen)
        $created_at = date('Y-m-d H:i:s');
        $class_sql = "INSERT INTO classes (name, teacher_id, school_id, created_at) VALUES (?, ?, ?, ?)";
        $class_stmt = $conn->prepare($class_sql);
        if (!$class_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $class_stmt->bind_param('siis', $class_name, $teacher_id, $school_id, $created_at);
        if (!$class_stmt->execute()) {
            throw new Exception('Execute failed: ' . $class_stmt->error);
        }
        
        $class_id = $class_stmt->insert_id;
        $class_stmt->close();

        // Generiere neue order_id (nächste verfügbare ID)
        $order_id_result = $conn->query("SELECT COALESCE(MAX(order_id), 0) + 1 as next_order_id FROM class_orders");
        $order_id_row = $order_id_result->fetch_assoc();
        $order_id = (int)$order_id_row['next_order_id'];
        
        // Bestimme Status basierend auf Bereitstellungsform
        // Preis ist immer 12.00€ pro Schüler (bei funded wird später per Gutschein abgezogen)
        $price_per_student = 12.00;
        $status = 'pending';
        
        if ($provisioning_type === 'funded') {
            $status = 'completed'; // Geförderte Klassen sind sofort abgeschlossen (Gutschein wird später abgezogen)
        } else {
            $status = 'pending'; // Rechnung/UeW müssen noch bezahlt werden
        }
        
        $tax_rate = 0.2000; // 20% Steuersatz
        
        // Hole aktuelles Schuljahr, falls nicht übergeben (bei invoice/uew)
        if (($provisioning_type === 'invoice' || $provisioning_type === 'uew') && !$school_year_id) {
            $current_year_sql = "SELECT id FROM school_years WHERE is_current = 1 LIMIT 1";
            $current_year_result = $conn->query($current_year_sql);
            if ($current_year_result && $current_year_result->num_rows > 0) {
                $current_year_row = $current_year_result->fetch_assoc();
                $school_year_id = (int)$current_year_row['id'];
            }
        }
        
        // Erstelle Bestellung in class_orders Tabelle
        // school_year_id nur bei invoice/uew setzen
        if (($provisioning_type === 'invoice' || $provisioning_type === 'uew') && $school_year_id) {
            $order_sql = "INSERT INTO class_orders (order_id, class_id, course_package_id, provisioning_type, student_count, user_id, status, price_per_student, tax_rate, school_year_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $order_stmt = $conn->prepare($order_sql);
            if (!$order_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $order_stmt->bind_param('iiisissddi', $order_id, $class_id, $course_package_id, $provisioning_type, $student_count, $user_id, $status, $price_per_student, $tax_rate, $school_year_id);
        } else {
            $order_sql = "INSERT INTO class_orders (order_id, class_id, course_package_id, provisioning_type, student_count, user_id, status, price_per_student, tax_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $order_stmt = $conn->prepare($order_sql);
            if (!$order_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            $order_stmt->bind_param('iiisissdd', $order_id, $class_id, $course_package_id, $provisioning_type, $student_count, $user_id, $status, $price_per_student, $tax_rate);
        }
        if (!$order_stmt->execute()) {
            $order_stmt->close();
            throw new Exception('Execute failed: ' . $order_stmt->error);
        }
        
        $order_stmt->close();

        // Funktion zum Generieren von Passwörtern
        function generatePassword($length = 5) {
            $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            $password = '';
            for ($i = 0; $i < $length; $i++) {
                $password .= $characters[random_int(0, strlen($characters) - 1)];
            }
            return $password;
        }

        // Erstelle Schüler - optimiert mit Batch-Inserts
        $students_created = 0;
        $users_created = 0;
        $student_ids = [];
        $created_at = date('Y-m-d H:i:s');
        
        // Beginne Transaktion für Schüler-Erstellung
        $conn->begin_transaction();
        
        try {
            // Erstelle alle Schüler in einem Batch
            $student_sql = "INSERT INTO students (class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins) VALUES (?, ?, 0, 0, 0, 0, 0)";
            $student_stmt = $conn->prepare($student_sql);
            if (!$student_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            for ($i = 1; $i <= $student_count; $i++) {
                $student_stmt->bind_param('ii', $class_id, $school_id);
                if (!$student_stmt->execute()) {
                    throw new Exception('Execute failed: ' . $student_stmt->error);
                }
                $student_ids[] = $student_stmt->insert_id;
                $students_created++;
            }
            $student_stmt->close();
            
            // Erstelle alle User-Accounts in einem Batch
            $user_sql = "INSERT INTO users (role_id, role, first_name, last_name, email, password, created_at) VALUES (?, 'student', ?, NULL, NULL, ?, ?)";
            $user_stmt = $conn->prepare($user_sql);
            if (!$user_stmt) {
                throw new Exception('Prepare failed: ' . $conn->error);
            }
            
            foreach ($student_ids as $index => $student_id) {
                $student_name = "Schüler " . ($index + 1);
                $password = generatePassword();
                $user_stmt->bind_param('isss', $student_id, $student_name, $password, $created_at);
                if (!$user_stmt->execute()) {
                    throw new Exception('Execute failed: ' . $user_stmt->error);
                }
                $users_created++;
            }
            $user_stmt->close();
            
            // Vergibe T!Coins in einem Batch (ohne unnötige Prüfungen)
            $conn->commit(); // Commit Schüler-Erstellung
            
            // T!Coins-Vergabe optimiert: Batch-Insert für Transaktionen und Batch-Update für T!Coins
            $conn->begin_transaction();
            
            try {
                // Batch-Insert für T!Coin-Transaktionen
                $transaction_sql = "INSERT INTO tcoins_transactions (student_id, amount, reason, reference_id, reference_type) VALUES (?, 1, 'class_creation', ?, 'class')";
                $transaction_stmt = $conn->prepare($transaction_sql);
                if (!$transaction_stmt) {
                    throw new Exception('Prepare failed: ' . $conn->error);
                }
                
                foreach ($student_ids as $student_id) {
                    $transaction_stmt->bind_param('ii', $student_id, $class_id);
                    if (!$transaction_stmt->execute()) {
                        throw new Exception('Execute failed: ' . $transaction_stmt->error);
                    }
                }
                $transaction_stmt->close();
                
                // Batch-Update für T!Coins (alle Schüler auf einmal)
                $student_ids_str = implode(',', array_map('intval', $student_ids));
                $update_tcoins_sql = "UPDATE students SET t_coins = t_coins + 1 WHERE id IN ($student_ids_str)";
                if (!$conn->query($update_tcoins_sql)) {
                    throw new Exception('Update failed: ' . $conn->error);
                }
                
                $conn->commit();
            } catch (Exception $e) {
                $conn->rollback();
                // Nicht kritisch - nur loggen
                error_log("[create_class.php] Fehler bei T!Coin-Vergabe: " . $e->getMessage());
            }
            
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }

        // Status auf klasse_erstellt setzen, falls nicht bereits in einem höheren Status
        $check_status_id_column = $conn->query("SHOW COLUMNS FROM teachers LIKE 'status_id'");
        $has_status_id_column = $check_status_id_column && $check_status_id_column->num_rows > 0;
        
        if ($has_status_id_column) {
            // Hole Status-ID über Label
            $target_status_label = 'klasse_erstellt';
            $target_status_sql = "SELECT id, `order` FROM teacher_stati WHERE label = ? LIMIT 1";
            $target_status_stmt = $conn->prepare($target_status_sql);
            if ($target_status_stmt) {
                $target_status_stmt->bind_param('s', $target_status_label);
                $target_status_stmt->execute();
                $target_status_result = $target_status_stmt->get_result();
                
                if ($target_status_row = $target_status_result->fetch_assoc()) {
                    $target_status_id = (int)$target_status_row['id'];
                    
                    // Verwende Hilfsfunktion, die verhindert, dass Status zurückgesetzt wird
                    updateTeacherStatusIfHigher($conn, $teacher_id, $target_status_id);
                }
                $target_status_stmt->close();
            }
        }

        echo json_encode([
            'success' => true,
            'class_id' => $class_id,
            'class_name' => $class_name,
            'students_created' => $students_created,
            'users_created' => $users_created,
            'message' => "Klasse '{$class_name}' mit {$students_created} Schülern erfolgreich erstellt"
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

