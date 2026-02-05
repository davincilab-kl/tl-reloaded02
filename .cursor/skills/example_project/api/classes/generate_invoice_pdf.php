<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    
    $order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

    if ($order_id <= 0) {
        die('Ungültige Bestellnummer');
    }

    // Auth-Prüfung
    if (!is_logged_in() || (!is_teacher() && !is_admin())) {
        http_response_code(403);
        die('Unauthorized');
    }

    $conn = db_connect();

    try {
        // Hole teacher_id des aktuellen Users
        $user_id = get_user_id();
        $teacher_id = null;
        
        if (is_teacher()) {
            $teacher_id = get_role_id();
        } else if (is_admin()) {
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
            die('Keine Lehrer-ID gefunden');
        }

        // Lade Bestelldaten mit Schuladresse
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
                    u.last_name,
                    s.name as school_name,
                    s.ort as school_ort,
                    s.bundesland as school_bundesland
                FROM class_orders co
                INNER JOIN classes c ON co.class_id = c.id
                INNER JOIN course_packages cp ON co.course_package_id = cp.id
                LEFT JOIN school_years sy ON co.school_year_id = sy.id
                LEFT JOIN users u ON co.user_id = u.id
                LEFT JOIN teachers t ON t.id = co.user_id
                LEFT JOIN schools s ON s.id = t.school_id
                WHERE co.order_id = ? AND co.user_id = ?
                ORDER BY co.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('ii', $order_id, $teacher_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $items = [];
        $order_data = null;
        
        while ($row = $result->fetch_assoc()) {
            if (!$order_data) {
                $user_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                $order_data = [
                    'order_id' => (int)$row['order_id'],
                    'created_at' => $row['created_at'],
                    'school_year_name' => $row['school_year_name'] ?? null,
                    'ordered_by' => $user_name ?: 'Unbekannt',
                    'school_name' => $row['school_name'] ?? '',
                    'school_ort' => $row['school_ort'] ?? '',
                    'school_bundesland' => $row['school_bundesland'] ?? ''
                ];
            }
            
            $item_price = (float)$row['price_per_student'] * (int)$row['student_count'];
            $tax = $item_price * (float)$row['tax_rate'];
            $item_price_with_tax = $item_price + $tax;
            
            // Nur invoice und uew Items für Rechnung
            if ($row['provisioning_type'] === 'invoice' || $row['provisioning_type'] === 'uew') {
                $items[] = [
                    'class_name' => $row['class_name'],
                    'package_name' => $row['package_name'],
                    'provisioning_type' => $row['provisioning_type'],
                    'student_count' => (int)$row['student_count'],
                    'price_per_student' => (float)$row['price_per_student'],
                    'tax_rate' => (float)$row['tax_rate'],
                    'item_price' => $item_price,
                    'item_price_with_tax' => $item_price_with_tax
                ];
            }
        }
        
        $stmt->close();
        $conn->close();

        if (!$order_data || empty($items)) {
            die('Bestellung nicht gefunden oder keine abrechenbaren Positionen');
        }

        // Berechne Gesamtsummen
        $total_price = array_sum(array_column($items, 'item_price'));
        $total_price_with_tax = array_sum(array_column($items, 'item_price_with_tax'));
        $total_tax = $total_price_with_tax - $total_price;
        $total_students = array_sum(array_column($items, 'student_count'));

        // Formatierung
        $date = new DateTime($order_data['created_at']);
        $formatted_date = $date->format('d.m.Y');
        
        $provisioning_labels = [
            'invoice' => 'Rechnung',
            'uew' => 'Unterrichtsmittel eigener Wahl'
        ];

        // HTML-Seite mit JavaScript-PDF-Generierung ausgeben
        header('Content-Type: text/html; charset=UTF-8');
        $filename = 'Rechnung_' . $order_data['order_id'] . '_' . date('Y-m-d') . '.pdf';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rechnung #<?php echo $order_data['order_id']; ?></title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .download-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .download-button:hover {
            background: #2980b9;
        }
        
        .loading {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
        }
        
        .loading.show {
            display: flex;
        }
        
        .invoice-container {
            background: white;
            padding: 30px;
            width: 210mm;
            max-width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
            flex-shrink: 0;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .invoice-container {
                width: 210mm;
                margin: 0;
                padding: 20mm;
            }
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
        }
        
        .invoice-company {
            font-size: 14px;
            line-height: 1.6;
            color: #2c3e50;
        }
        
        .invoice-company strong {
            font-size: 16px;
            display: block;
            margin-bottom: 8px;
        }
        
        .invoice-recipient {
            margin-top: 20px;
            font-size: 14px;
            line-height: 1.6;
            color: #2c3e50;
        }
        
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            text-align: right;
        }
        
        .invoice-info {
            text-align: right;
            font-size: 14px;
            color: #6c757d;
        }
        
        .invoice-info strong {
            color: #2c3e50;
        }
        
        .invoice-details {
            margin-bottom: 30px;
        }
        
        .invoice-details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .invoice-details-row strong {
            color: #2c3e50;
        }
        
        .invoice-items {
            margin: 30px 0;
        }
        
        .invoice-items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .invoice-items-table th {
            background: #f8f9fa;
            padding: 12px;
            border-bottom: 2px solid #2c3e50;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .invoice-items-table td {
            padding: 12px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .invoice-items-table tr:last-child td {
            border-bottom: none;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-left {
            text-align: left;
        }
        
        .invoice-total {
            margin-top: 10px;
            padding-top: 10px;
        }
        
        .invoice-total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 16px;
        }
        
        .invoice-total-row.grand-total {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #2c3e50;
        }
        
        .invoice-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            font-size: 12px;
            color: #6c757d;
            text-align: center;
        }
    </style>
</head>
<body>
    <button class="download-button" onclick="generatePDF()">
        <i class="fas fa-download"></i> PDF herunterladen
    </button>
    
    <div class="loading" id="loading">
        <div style="text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <div>PDF wird generiert...</div>
        </div>
    </div>
    
    <div class="invoice-container" id="pdf-content">
        <div class="invoice-header">
            <div>
                <div class="invoice-company">
                    <strong>DaVinciLab GmbH</strong>
                    Poschgasse 3/51<br>
                    1140 Wien<br>
                    Österreich<br><br>
                    ATU77893308<br>
                    FN574068v
                </div>
                <?php if ($order_data['school_name']): ?>
                <div class="invoice-recipient">
                    <?php echo htmlspecialchars($order_data['school_name']); ?><br>
                    <?php if ($order_data['school_ort']): ?>
                    <?php echo htmlspecialchars($order_data['school_ort']); ?><br>
                    <?php endif; ?>
                    Österreich<br><br>
                    z.Hd. <?php echo htmlspecialchars($order_data['ordered_by']); ?>
                </div>
                <?php endif; ?>
            </div>
            <div>
                <div class="invoice-title">Rechnung</div>
                <div class="invoice-info" style="margin-top: 20px;">
                    <div><strong>Rechnungsnummer:</strong> #<?php echo $order_data['order_id']; ?></div>
                    <div><strong>Rechnungsdatum:</strong> <?php echo $formatted_date; ?></div>
                </div>
            </div>
        </div>
        
        <div class="invoice-items">
            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th class="text-center">Position</th>
                        <th class="text-left">Produkt</th>
                        <th class="text-center">Anzahl</th>
                        <th class="text-center">Preis</th>
                        <th class="text-right">Gesamt</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($items as $index => $item): ?>
                    <tr>
                        <td class="text-center"><?php echo ($index + 1); ?></td>
                        <td class="text-left">
                            <strong><?php echo htmlspecialchars($item['package_name']); ?></strong><br>
                            <small><?php echo htmlspecialchars($provisioning_labels[$item['provisioning_type']] ?? $item['provisioning_type']); ?></small>
                        </td>
                        <td class="text-center"><?php echo $item['student_count']; ?></td>
                        <td class="text-center"><?php echo number_format($item['price_per_student'], 2, ',', '.'); ?> €</td>
                        <td class="text-right"><?php echo number_format($item['item_price'], 2, ',', '.'); ?> €</td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <div class="invoice-total">
            <div class="invoice-total-row">
                <span>Zwischensumme:</span>
                <span><?php echo number_format($total_price, 2, ',', '.'); ?> €</span>
            </div>
            <div class="invoice-total-row">
                <span>MwSt. (<?php echo number_format($items[0]['tax_rate'] * 100, 0); ?>%):</span>
                <span><?php echo number_format($total_tax, 2, ',', '.'); ?> €</span>
            </div>
            <div class="invoice-total-row grand-total">
                <span>Gesamtbetrag:</span>
                <span><?php echo number_format($total_price_with_tax, 2, ',', '.'); ?> €</span>
            </div>
        </div>
        
        <div class="invoice-footer">
            <p>Vielen Dank für Ihre Bestellung!</p>
        </div>
    </div>
    
    <script>
        function generatePDF() {
            const loading = document.getElementById('loading');
            const content = document.getElementById('pdf-content');
            const filename = '<?php echo $filename; ?>';
            
            loading.classList.add('show');
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    allowTaint: false
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            
            html2pdf().set(opt).from(content).save().then(function() {
                loading.classList.remove('show');
            }).catch(function(error) {
                console.error('PDF-Generierung fehlgeschlagen:', error);
                alert('Fehler beim Generieren des PDFs. Bitte versuchen Sie es erneut.');
                loading.classList.remove('show');
            });
        }
        
        // Auto-generate PDF nach kurzer Verzögerung (optional)
        // setTimeout(generatePDF, 500);
    </script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</body>
</html>
<?php
    } catch (Exception $e) {
        die('Fehler: ' . $e->getMessage());
    }
?>

