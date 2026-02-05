<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Student ID aus GET-Parameter
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

    if ($student_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid student ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe ob status Spalte existiert
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        // Prüfe ob likes Spalte in projects existiert
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;
        
        // Prüfe ob project_data Spalte existiert
        $check_project_data_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'project_data'");
        $has_project_data_column = $check_project_data_column && $check_project_data_column->num_rows > 0;
        
        // Prüfe ob cover Spalte existiert
        $check_cover_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'cover'");
        $has_cover_column = $check_cover_column && $check_cover_column->num_rows > 0;
        
        // Projekte des Schülers abfragen mit status und Like-Count
        $sql = "SELECT p.id, p.title, p.description, p.student_id";
        
        if ($has_status_column) {
            $sql .= ", p.status";
        } else {
            $sql .= ", 'working' AS status";
        }
        
        if ($has_likes_column) {
            // Verwende likes Spalte direkt
            $sql .= ", COALESCE(p.likes, 0) AS like_count";
        } else {
            $sql .= ", 0 AS like_count";
        }
        
        if ($has_project_data_column) {
            $sql .= ", p.project_data";
        }
        
        if ($has_cover_column) {
            $sql .= ", p.cover";
        }
        
        $sql .= " FROM projects p";
        $sql .= " WHERE p.student_id = ?";
        $sql .= " ORDER BY p.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('i', $student_id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $projects = [];
        
        while ($row = $result->fetch_assoc()) {
            $project = [
                'id' => (int)$row['id'],
                'title' => $row['title'],
                'description' => $row['description'] ?? '',
                'student_id' => (int)$row['student_id'],
                'status' => $row['status'] ?? 'working',
                'like_count' => isset($row['like_count']) ? (int)$row['like_count'] : 0
            ];
            
            // Füge project_data hinzu, falls vorhanden (aber nicht den kompletten Inhalt, nur ob vorhanden)
            if ($has_project_data_column && isset($row['project_data']) && $row['project_data'] !== null) {
                $project['has_project_data'] = true;
            } else {
                $project['has_project_data'] = false;
            }
            
            // Füge cover hinzu, falls vorhanden
            if ($has_cover_column && isset($row['cover']) && $row['cover'] !== null && $row['cover'] !== '') {
                $project['cover'] = $row['cover'];
            }
            
            $projects[] = $project;
        }
        
        $stmt->close();

        echo json_encode([
            'success' => true,
            'projects' => $projects
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

