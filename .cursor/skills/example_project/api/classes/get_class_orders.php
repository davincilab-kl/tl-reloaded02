<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    // Auth-Prüfung
    if (!is_logged_in() || (!is_teacher() && !is_admin())) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }

    $conn = db_connect();

    try {
        // Hole teacher_id des aktuellen Users
        $user_id = get_user_id();
        $teacher_id = null;
        
        if (is_teacher()) {
            $teacher_id = get_role_id();
        } else if (is_admin()) {
            // Für Admins: hole teacher_id aus users.role_id
            $user_sql = "SELECT role_id FROM users WHERE id = ? AND role = 'teacher' LIMIT 1";
            $user_stmt = $conn->prepare($user_sql);
            if ($user_stmt) {
                $user_stmt->bind_param('i', $user_id);
                $user_stmt->execute();
                $user_result = $user_stmt->get_result();
                if ($user_row = $user_result->fetch_assoc()) {
                    $teacher_id = (int)$user_row['role_id'];
                }
                $user_stmt->close();
            }
        }
        
        if (!$teacher_id) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Keine Lehrer-ID gefunden']);
            $conn->close();
            exit;
        }

        // Prüfe ob Tabelle class_orders existiert
        $check_table = $conn->query("SHOW TABLES LIKE 'class_orders'");
        if (!$check_table || $check_table->num_rows === 0) {
            echo json_encode([
                'success' => true,
                'orders' => [],
                'message' => 'Bestellungen-System noch nicht initialisiert'
            ]);
            $conn->close();
            exit;
        }

        // Lade alle Bestellungen des Lehrers, gruppiert nach order_id
        $sql = "SELECT 
                    co.order_id,
                    co.id,
                    co.class_id,
                    co.course_package_id,
                    co.provisioning_type,
                    co.student_count,
                    co.status,
                    co.price_per_student,
                    co.tax_rate,
                    co.created_at,
                    co.school_year_id,
                    c.name as class_name,
                    cp.name as package_name,
                    sy.name as school_year_name,
                    u.first_name,
                    u.last_name
                FROM class_orders co
                INNER JOIN classes c ON co.class_id = c.id
                INNER JOIN course_packages cp ON co.course_package_id = cp.id
                LEFT JOIN school_years sy ON co.school_year_id = sy.id
                LEFT JOIN users u ON co.user_id = u.id
                WHERE co.user_id = ?
                ORDER BY co.order_id DESC, co.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $teacher_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $orders = [];
        $orders_by_id = [];
        
        while ($row = $result->fetch_assoc()) {
            $order_id = (int)$row['order_id'];
            
            if (!isset($orders_by_id[$order_id])) {
                $user_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                $orders_by_id[$order_id] = [
                    'order_id' => $order_id,
                    'items' => [],
                    'total_students' => 0,
                    'total_price' => 0.0,
                    'total_price_with_tax' => 0.0,
                    'status' => $row['status'],
                    'created_at' => $row['created_at'],
                    'school_year_name' => $row['school_year_name'] ?? null,
                    'ordered_by' => $user_name ?: 'Unbekannt'
                ];
            }
            
            $item_price = (float)$row['price_per_student'] * (int)$row['student_count'];
            $tax = $item_price * (float)$row['tax_rate'];
            $item_price_with_tax = $item_price + $tax;
            
            $orders_by_id[$order_id]['items'][] = [
                'id' => (int)$row['id'],
                'class_id' => (int)$row['class_id'],
                'class_name' => $row['class_name'],
                'package_id' => (int)$row['course_package_id'],
                'package_name' => $row['package_name'],
                'provisioning_type' => $row['provisioning_type'],
                'student_count' => (int)$row['student_count'],
                'price_per_student' => (float)$row['price_per_student'],
                'tax_rate' => (float)$row['tax_rate'],
                'item_price' => $item_price,
                'item_price_with_tax' => $item_price_with_tax,
                'school_year_name' => $row['school_year_name'] ?? null
            ];
            
            $orders_by_id[$order_id]['total_students'] += (int)$row['student_count'];
            $orders_by_id[$order_id]['total_price'] += $item_price;
            $orders_by_id[$order_id]['total_price_with_tax'] += $item_price_with_tax;
            
            // Status: Wenn ein Item pending ist, ist die ganze Order pending
            if ($row['status'] === 'pending' && $orders_by_id[$order_id]['status'] !== 'pending') {
                $orders_by_id[$order_id]['status'] = 'pending';
            }
        }
        
        $stmt->close();
        
        // Konvertiere zu Array
        $orders = array_values($orders_by_id);
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

