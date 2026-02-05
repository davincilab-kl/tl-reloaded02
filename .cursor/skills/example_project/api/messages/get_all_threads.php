<?php
    require_once __DIR__ . '/../config/access_db.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    function getTimeAgo($timestamp) {
        try {
            $tz = new DateTimeZone('Europe/Vienna');
            $now = new DateTime('now', $tz);
            $eventTime = new DateTime($timestamp, $tz);
            
            $diff = $now->getTimestamp() - $eventTime->getTimestamp();
            
            if ($diff < 0) {
                $diff = 0;
            }
            
            if ($diff < 60) {
                return $diff === 0 ? 'gerade eben' : ('vor ' . $diff . ' Sekunden');
            } elseif ($diff < 3600) {
                $minutes = floor($diff / 60);
                return 'vor ' . $minutes . ' Minute' . ($minutes !== 1 ? 'n' : '');
            } elseif ($diff < 86400) {
                $hours = floor($diff / 3600);
                return 'vor ' . $hours . ' Stunde' . ($hours !== 1 ? 'n' : '');
            } elseif ($diff < 2592000) {
                $days = floor($diff / 86400);
                return 'vor ' . $days . ' Tag' . ($days !== 1 ? 'en' : '');
            } else {
                return $eventTime->format('d.m.Y H:i');
            }
        } catch (Exception $e) {
            return 'gerade eben';
        }
    }

    function getUserRole($conn, $user_id) {
        if ($user_id === null || $user_id == 0) {
            return 'admin';
        }
        
        // Zuerst in users Tabelle schauen
        $user_sql = "SELECT role FROM users WHERE role_id = ? LIMIT 1";
        $user_stmt = $conn->prepare($user_sql);
        if ($user_stmt) {
            $user_stmt->bind_param('i', $user_id);
            $user_stmt->execute();
            $user_result = $user_stmt->get_result();
            if ($user_row = $user_result->fetch_assoc()) {
                $user_stmt->close();
                return $user_row['role']; // 'teacher', 'student', etc.
            }
            $user_stmt->close();
        }
        
        // Falls nicht in users Tabelle, in teachers Tabelle schauen
        $teacher_sql = "SELECT school_admin FROM teachers WHERE id = ? LIMIT 1";
        $teacher_stmt = $conn->prepare($teacher_sql);
        if ($teacher_stmt) {
            $teacher_stmt->bind_param('i', $user_id);
            $teacher_stmt->execute();
            $teacher_result = $teacher_stmt->get_result();
            if ($teacher_row = $teacher_result->fetch_assoc()) {
                $teacher_stmt->close();
                return $teacher_row['school_admin'] == 1 ? 'admin' : 'teacher';
            }
            $teacher_stmt->close();
        }
        
        // Default: teacher
        return 'teacher';
    }

    // Unterstütze sowohl GET als auch POST
    $archived = false;
    $user_id = null;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $archived = isset($input['archived']) ? (bool)$input['archived'] : false;
        $user_id = isset($input['user_id']) ? (int)$input['user_id'] : null;
    } else {
        $archived = isset($_GET['archived']) ? (bool)$_GET['archived'] : false;
        $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    }

    $conn = db_connect();

    try {
        // Prüfe ob archived Spalte existiert
        $check_column = $conn->query("SHOW COLUMNS FROM messages LIKE 'archived'");
        if ($check_column->num_rows == 0) {
            $conn->query("ALTER TABLE messages ADD COLUMN archived BOOLEAN DEFAULT 0");
        }
        
        // Alle eindeutigen Thread-IDs holen
        // COALESCE gibt thread_id zurück, wenn vorhanden, sonst die id (für die erste Nachricht)
        // Filtere nach archivierten Threads und User-ID (falls gesetzt)
        if ($user_id !== null && $user_id > 0) {
            // Für Teacher: nur Threads, bei denen der User beteiligt ist (sender oder receiver)
            if ($archived) {
                $thread_sql = "SELECT DISTINCT COALESCE(thread_id, id) as thread_id 
                              FROM messages 
                              WHERE (sender = ? OR receiver = ?)
                              AND COALESCE(thread_id, id) IN (
                                  SELECT DISTINCT COALESCE(thread_id, id)
                                  FROM messages
                                  WHERE archived = 1
                              )";
            } else {
                $thread_sql = "SELECT DISTINCT COALESCE(thread_id, id) as thread_id 
                              FROM messages 
                              WHERE (sender = ? OR receiver = ?)
                              AND COALESCE(thread_id, id) NOT IN (
                                  SELECT DISTINCT COALESCE(thread_id, id)
                                  FROM messages
                                  WHERE archived = 1
                              )";
            }
            $thread_stmt = $conn->prepare($thread_sql);
            $thread_stmt->bind_param('ii', $user_id, $user_id);
            $thread_stmt->execute();
            $thread_result = $thread_stmt->get_result();
        } else {
            // Für Admins: alle Threads
            if ($archived) {
                // Archivierte Threads: Threads, die mindestens eine archivierte Nachricht haben
                $thread_sql = "SELECT DISTINCT COALESCE(thread_id, id) as thread_id 
                              FROM messages 
                              WHERE COALESCE(thread_id, id) IN (
                                  SELECT DISTINCT COALESCE(thread_id, id)
                                  FROM messages
                                  WHERE archived = 1
                              )";
            } else {
                // Aktive Threads: Threads ohne archivierte Nachrichten
                $thread_sql = "SELECT DISTINCT COALESCE(thread_id, id) as thread_id 
                              FROM messages 
                              WHERE COALESCE(thread_id, id) NOT IN (
                                  SELECT DISTINCT COALESCE(thread_id, id)
                                  FROM messages
                                  WHERE archived = 1
                              )";
            }
            $thread_result = $conn->query($thread_sql);
        }
        
        if (!$thread_result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $threads = [];
        
        while ($thread_row = $thread_result->fetch_assoc()) {
            $thread_id = (int)$thread_row['thread_id'];
            
            // Letzte Nachricht des Threads holen
            $last_sql = "SELECT m.id, m.message, m.sender, m.receiver, m.timestamp, m.m_read,
                               u.first_name as sender_first_name, u.last_name as sender_last_name
                        FROM messages m
                        LEFT JOIN teachers t ON m.sender = t.id
                        LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                        WHERE (m.thread_id = ? OR m.id = ?)
                        ORDER BY m.timestamp DESC, m.id DESC
                        LIMIT 1";
            
            $last_stmt = $conn->prepare($last_sql);
            if (!$last_stmt) {
                continue;
            }
            
            $last_stmt->bind_param('ii', $thread_id, $thread_id);
            $last_stmt->execute();
            $last_result = $last_stmt->get_result();
            
            if ($last_row = $last_result->fetch_assoc()) {
                // Namen kombinieren (last_name kann NULL sein)
                $last_sender_name = trim(($last_row['sender_first_name'] ?? '') . ' ' . ($last_row['sender_last_name'] ?? ''));
                // Erste Nachricht für Receiver-Info, Namen des ursprünglichen Senders und Titel
                $first_sql = "SELECT m.sender, m.title, u.first_name, u.last_name, u.email as sender_email
                              FROM messages m
                              LEFT JOIN teachers t ON m.sender = t.id
                              LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                              WHERE m.id = ? LIMIT 1";
                $first_stmt = $conn->prepare($first_sql);
                $receiver_id = null;
                $thread_user_name = 'Unbekannt';
                $thread_title = null;
                
                if ($first_stmt) {
                    $first_stmt->bind_param('i', $thread_id);
                    $first_stmt->execute();
                    $first_result = $first_stmt->get_result();
                    if ($first_row_data = $first_result->fetch_assoc()) {
                        $receiver_id = $first_row_data['sender'];
                        $thread_user_id = $first_row_data['sender'] !== null ? (int)$first_row_data['sender'] : null;
                        $thread_user_role = getUserRole($conn, $thread_user_id);
                        $thread_title = $first_row_data['title'] ?? null;
                        
                        if ($thread_user_role === 'admin') {
                            $thread_user_name = 'TalentsLounge-Team';
                        } else {
                            $thread_user_name = trim(($first_row_data['first_name'] ?? '') . ' ' . ($first_row_data['last_name'] ?? '')) ?: 'Unbekannt';
                        }
                    }
                    $first_stmt->close();
                }
                
                // Anzahl der Nachrichten im Thread
                $count_sql = "SELECT COUNT(*) as count FROM messages WHERE thread_id = ? OR id = ?";
                $count_stmt = $conn->prepare($count_sql);
                $message_count = 1;
                
                if ($count_stmt) {
                    $count_stmt->bind_param('ii', $thread_id, $thread_id);
                    $count_stmt->execute();
                    $count_result = $count_stmt->get_result();
                    if ($count_row = $count_result->fetch_assoc()) {
                        $message_count = (int)$count_row['count'];
                    }
                    $count_stmt->close();
                }
                
                $sender_id = $last_row['sender'] !== null ? (int)$last_row['sender'] : null;
                $sender_role = getUserRole($conn, $sender_id);
                
                // Namen des letzten Absenders bestimmen
                if ($sender_role === 'admin') {
                    $last_message_sender_name = 'TalentsLounge-Team';
                } else {
                    $last_message_sender_name = $last_sender_name ?: 'Unbekannt';
                }
                
                $threads[] = [
                    'thread_id' => $thread_id,
                    'last_message_id' => (int)$last_row['id'],
                    'last_message_time' => $last_row['timestamp'],
                    'last_message_text' => $last_row['message'],
                    'last_message_read' => (int)$last_row['m_read'],
                    'last_message_sender' => $sender_id,
                    'last_message_sender_role' => $sender_role,
                    'last_message_sender_name' => $last_message_sender_name, // Name des letzten Absenders
                    'thread_user_name' => $thread_user_name, // Name des ursprünglichen Users
                    'thread_title' => $thread_title, // Titel des Threads (aus erster Nachricht)
                    'receiver_id' => $receiver_id !== null ? (int)$receiver_id : null,
                    'message_count' => $message_count,
                    'time_ago' => getTimeAgo($last_row['timestamp'])
                ];
            }
            
            $last_stmt->close();
        }
        
        // Threads nach neueste zu älteste sortieren (nach last_message_time DESC)
        usort($threads, function($a, $b) {
            return strtotime($b['last_message_time']) - strtotime($a['last_message_time']);
        });
        
        echo json_encode([
            'threads' => $threads,
            'count' => count($threads)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

