<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    require_admin();
    
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Kein Bild hochgeladen']);
        exit;
    }

    $file = $_FILES['image'];
    
    // Validierung: Nur Bilder erlauben
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // MIME-Type prüfen
    $mimeType = '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
    } else {
        // Fallback: Verwende den MIME-Type vom Browser
        $mimeType = $file['type'] ?? '';
    }
    
    if (empty($mimeType) || !in_array($mimeType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nur Bilddateien sind erlaubt']);
        exit;
    }

    // Maximale Dateigröße: 5MB
    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Datei ist zu groß (max. 5MB)']);
        exit;
    }

    // Upload-Verzeichnis erstellen, falls nicht vorhanden
    $uploadDir = __DIR__ . '/../../challenges/imgs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Eindeutigen Dateinamen generieren
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'challenge_' . time() . '_' . uniqid() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Datei verschieben
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Fehler beim Speichern der Datei']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'image_path' => $filename
    ]);
?>

