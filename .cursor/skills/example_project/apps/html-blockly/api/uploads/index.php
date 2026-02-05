<?php
    // Sicherheitsprüfung: Nur Bilder aus dem uploads-Verzeichnis erlauben
    $filename = basename($_GET['file'] ?? '');
    
    if (empty($filename) || !preg_match('/^img_[a-z0-9_.-]+\.(jpg|jpeg|png|gif|webp)$/i', $filename)) {
        http_response_code(404);
        exit;
    }
    
    $filepath = __DIR__ . '/' . $filename;
    
    if (!file_exists($filepath) || !is_file($filepath)) {
        http_response_code(404);
        exit;
    }
    
    // MIME-Type bestimmen
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filepath);
    finfo_close($finfo);
    
    // Nur Bild-MIME-Types erlauben
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(403);
        exit;
    }
    
    // Bild ausgeben
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . filesize($filepath));
    header('Cache-Control: public, max-age=3600');
    readfile($filepath);
    exit;
?>

