<?php
    require_once __DIR__ . '/../config/access_db.php';
    
    $class_id = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
    $teacher_id = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

    if ($class_id <= 0 || $teacher_id <= 0) {
        die('Ungültige Parameter');
    }

    $conn = db_connect();

    try {
        // Prüfe ob die Klasse dem Lehrer gehört
        $check_sql = "SELECT c.id, c.name FROM classes c WHERE c.id = ? AND c.teacher_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        if (!$check_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $check_stmt->bind_param('ii', $class_id, $teacher_id);
        if (!$check_stmt->execute()) {
            throw new Exception('Execute failed: ' . $check_stmt->error);
        }
        
        $result = $check_stmt->get_result();
        if ($result->num_rows === 0) {
            die('Klasse nicht gefunden oder kein Zugriff');
        }
        
        $class_row = $result->fetch_assoc();
        $class_name = $class_row['name'];
        $check_stmt->close();

        // Lade Schüler mit Login-Daten
        $students_sql = "SELECT s.id, u.first_name, u.last_name, u.password
                        FROM students s
                        LEFT JOIN users u ON u.role_id = s.id AND u.role = 'student'
                        WHERE s.class_id = ?
                        ORDER BY u.first_name, u.last_name";
        $students_stmt = $conn->prepare($students_sql);
        if (!$students_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $students_stmt->bind_param('i', $class_id);
        if (!$students_stmt->execute()) {
            throw new Exception('Execute failed: ' . $students_stmt->error);
        }
        
        $students_result = $students_stmt->get_result();
        $students = [];
        
        while ($row = $students_result->fetch_assoc()) {
            // Namen kombinieren (bei Students: gesamter Name in first_name, last_name kann NULL sein)
            $full_name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $students[] = [
                'name' => htmlspecialchars($full_name, ENT_QUOTES, 'UTF-8'),
                'password' => htmlspecialchars($row['password'] ?? '', ENT_QUOTES, 'UTF-8')
            ];
        }
        
        $students_stmt->close();
        $conn->close();

        // HTML-Seite mit JavaScript-PDF-Generierung ausgeben
        header('Content-Type: text/html; charset=UTF-8');
        $filename = 'Anmeldekärtchen_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $class_name) . '.pdf';
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anmeldekärtchen - <?php echo htmlspecialchars($class_name); ?></title>
    <link rel="stylesheet" href="/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .pdf-container {
            background: white;
            padding: 8px;
            width: 210mm;
            margin: 0 auto;
            box-sizing: border-box;
        }
        
        .cards-container {
            width: 100%;
            display: block;
            overflow: hidden;
            margin-left: 22px;
        }
        
        .cards-container::after {
            content: "";
            display: table;
            clear: both;
        }
        
        .login-card {
            width: 80mm;
            height: 45mm;
            border: 1px solid #000000;
            border-radius: 13px;
            box-sizing: border-box;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            float: left;
            margin: 0 40px 40px 0;
            page-break-inside: avoid;
            position: relative;
            overflow: hidden;
        }

        .login-card:nth-last-child(1),
        .login-card:nth-last-child(2) {
            margin-bottom: 0;
        }
        
        .card-header {
            text-align: center;
            border-bottom: 1px solid #d5d5d5;
            padding: 8px;
            display: flex;
            background: #e5e5e5;
            width: 100%;
            height: 12mm;
            justify-content: center;
            align-items: center;
        }
        
        .card-logo {
            display: block;
            width: 35%;
        }
        
        .card-class {
            font-size: 18px;
            margin: 0;
            color: #393939;
            display: block;
            width: 60%;
        }
        
        .card-body {
            padding: 6px 0;
            display: block;
            width: 80%;
        }
        
        .card-info {
            margin: 4px 0;
            display: block;
        }
        
        .card-label {
            font-size: 8px;
            color: #666;
            margin-bottom: 2px;
            display: block;
            padding: 5px 0;
            text-align: center;
        }
        
        .card-value {
            font-size: 10px;
            font-weight: bold;
            color: #000000;
            word-break: break-word;
            overflow-wrap: break-word;
            display: block;
            background: #e9e9e9;
            padding: 5px;
            border-radius: 30px;
            border: 1px solid #d5d5d5;
            text-align: center;
        }
        
        .card-password {
            background: #f0f0f0;
            padding: 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5px;
            box-sizing: border-box;
            word-break: break-word;
            overflow-wrap: break-word;
            display: block;
            color: #000000;
            font-size: 9px;
        }
        
        .card-footer {
            text-align: center;
            font-size: 7px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 4px;
            margin-top: 5px;
            display: block;
        }
        
        .download-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .download-button:hover {
            background: #5661e4;
        }
        
        .loading {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 2000;
        }
        
        .loading.show {
            display: block;
        }
        
        @media print {
            .download-button, .loading {
                display: none !important;
            }
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
    
    <div class="pdf-container" id="pdf-content">
        <div class="cards-container">
            <?php foreach ($students as $student): ?>
            <div class="login-card">
                <div class="card-header">
                    <img src="/imgs/tl_logo.png" alt="TalentsLounge" class="card-logo">
                    <p class="card-class"><?php echo htmlspecialchars($class_name); ?></p>
                </div>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-label">Benutzername</div>
                        <div class="card-value"><?php echo $student['name']; ?></div>
                    </div>
                    <div class="card-info">
                        <div class="card-label">Passwort</div>
                        <div class="card-value"><?php echo $student['password']; ?></div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
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
    </script>
</body>
</html>
<?php
    } catch (Exception $e) {
        die('Fehler: ' . $e->getMessage());
    }
?>

