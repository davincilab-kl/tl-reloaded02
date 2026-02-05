<?php
    require_once __DIR__ . '/../../../api/config/auth.php';
    require_login();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    $uploadDir = __DIR__ . '/uploads/';
    $images = [];
    
    if (is_dir($uploadDir)) {
        $files = scandir($uploadDir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $filepath = $uploadDir . $file;
            
            // Nur Dateien, keine Verzeichnisse
            if (!is_file($filepath)) {
                continue;
            }
            
            // Prüfe ob es ein Bild ist (Dateiname beginnt mit img_)
            if (preg_match('/^img_\d+\.(jpg|jpeg|png|gif|webp)$/i', $file)) {
                $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
                $url = $baseUrl . '/apps/html-blockly/api/uploads/index.php?file=' . urlencode($file);
                
                $images[] = [
                    'filename' => $file,
                    'url' => $url,
                    'originalName' => $file
                ];
            }
        }
        
        // Sortiere nach Dateiname (numerisch)
        usort($images, function($a, $b) {
            preg_match('/img_(\d+)\./', $a['filename'], $matchA);
            preg_match('/img_(\d+)\./', $b['filename'], $matchB);
            $numA = isset($matchA[1]) ? (int)$matchA[1] : 0;
            $numB = isset($matchB[1]) ? (int)$matchB[1] : 0;
            return $numA - $numB;
        });
    }
    
    echo json_encode([
        'success' => true,
        'images' => $images
    ]);
?>

