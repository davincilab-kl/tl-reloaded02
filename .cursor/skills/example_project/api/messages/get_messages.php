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
                $diff = 0; // zukünftige Zeitstempel abfangen (Zeitzonen/Uhren-Drift)
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
                return $eventTime->format('d.m.Y');
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

    // User-ID aus GET-Parameter holen (für Teacher-Bereich)
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

    $conn = db_connect();

    try {
        // Prüfe ob archived Spalte existiert
        $check_column = $conn->query("SHOW COLUMNS FROM messages LIKE 'archived'");
        if ($check_column->num_rows == 0) {
            $conn->query("ALTER TABLE messages ADD COLUMN archived BOOLEAN DEFAULT 0");
        }
        
        // Ausstehende Nachrichten abrufen
        // Wenn user_id gesetzt ist: nur Nachrichten, bei denen der User Empfänger ist
        // Sonst: alle ausstehenden Nachrichten für Admins (m_read = 0)
        if ($user_id !== null && $user_id > 0) {
            // Für Teacher: nur ungelesene Nachrichten, bei denen der User der Empfänger ist UND die nicht von einem selbst stammen
            $sql = "SELECT m.id, m.message, m.title, m.sender, m.receiver, m.timestamp, m.thread_id,
                           u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
                    FROM messages m
                    LEFT JOIN teachers t ON m.sender = t.id
                    LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                    WHERE m.receiver = ?
                    AND m.m_read = 0
                    AND (m.sender IS NULL OR m.sender != ?)
                    AND COALESCE(m.archived, 0) = 0
                    AND COALESCE(m.thread_id, m.id) NOT IN (
                        SELECT DISTINCT COALESCE(thread_id, id)
                        FROM messages
                        WHERE archived = 1
                    )
                    ORDER BY m.timestamp DESC
                    LIMIT 10";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ii', $user_id, $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            // Für Admins: nur ungelesene Nachrichten, bei denen Admin der Empfänger ist (receiver = 0) UND die nicht von Admin stammen
            $sql = "SELECT m.id, m.message, m.title, m.sender, m.receiver, m.timestamp, m.thread_id,
                           u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
                    FROM messages m
                    LEFT JOIN teachers t ON m.sender = t.id
                    LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                    WHERE m.receiver = 0
                    AND m.m_read = 0
                    AND (m.sender IS NULL OR m.sender != 0)
                    AND COALESCE(m.archived, 0) = 0
                    AND COALESCE(m.thread_id, m.id) NOT IN (
                        SELECT DISTINCT COALESCE(thread_id, id)
                        FROM messages
                        WHERE archived = 1
                    )
                    ORDER BY m.timestamp DESC
                    LIMIT 10";
            $result = $conn->query($sql);
        }
        
        if (!$result) {
            throw new Exception('SQL Fehler: ' . $conn->error);
        }
        
        $messages = [];
        
        while ($row = $result->fetch_assoc()) {
            $thread_id = isset($row['thread_id']) && $row['thread_id'] !== null 
                ? (int)$row['thread_id'] 
                : (int)$row['id']; // Falls thread_id NULL ist, verwende die eigene id
            
            $sender_id = $row['sender'] !== null ? (int)$row['sender'] : null;
            $sender_role = getUserRole($conn, $sender_id);
            
            // Name des ursprünglichen Users (aus der ersten Nachricht des Threads) holen
            $thread_user_name = trim(($row['sender_first_name'] ?? '') . ' ' . ($row['sender_last_name'] ?? ''));
            $thread_user_id = $sender_id;
            
            // Titel aus der ersten Nachricht des Threads holen
            $thread_title = null;
            if ($row['id'] != $thread_id) {
                $first_msg_sql = "SELECT m.sender, m.title, u.first_name, u.last_name
                                 FROM messages m
                                 LEFT JOIN teachers t ON m.sender = t.id
                                 LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                                 WHERE m.id = ? LIMIT 1";
                $first_msg_stmt = $conn->prepare($first_msg_sql);
                if ($first_msg_stmt) {
                    $first_msg_stmt->bind_param('i', $thread_id);
                    $first_msg_stmt->execute();
                    $first_msg_result = $first_msg_stmt->get_result();
                    if ($first_msg_row = $first_msg_result->fetch_assoc()) {
                        $thread_user_id = $first_msg_row['sender'] !== null ? (int)$first_msg_row['sender'] : null;
                        $thread_user_role = getUserRole($conn, $thread_user_id);
                        $thread_title = $first_msg_row['title'] ?? null;
                        if ($thread_user_role === 'admin') {
                            $thread_user_name = 'TalentsLounge-Team';
                        } else {
                            $thread_user_name = trim(($first_msg_row['first_name'] ?? '') . ' ' . ($first_msg_row['last_name'] ?? '')) ?: 'Unbekannt';
                        }
                    }
                    $first_msg_stmt->close();
                }
            } else {
                // Wenn dies die erste Nachricht ist, prüfe die Rolle
                $thread_title = $row['title'] ?? null;
                if ($sender_role === 'admin') {
                    $thread_user_name = 'TalentsLounge-Team';
                } else {
                    $thread_user_name = $thread_user_name ?: 'Unbekannt';
                }
            }
            
            $messages[] = [
                'id' => (int)$row['id'],
                'message' => $row['message'],
                'title' => $thread_title,
                'sender' => $sender_id,
                'receiver' => (int)$row['receiver'],
                'timestamp' => $row['timestamp'],
                'thread_id' => $thread_id,
                'sender_name' => $thread_user_name, // Name des ursprünglichen Users
                'sender_email' => $row['sender_email'],
                'sender_role' => $sender_role,
                'time_ago' => getTimeAgo($row['timestamp'])
            ];
        }
        
        // Gesamtanzahl ausstehender Nachrichten (nur von anderen, nicht von einem selbst)
        if ($user_id !== null && $user_id > 0) {
            $count_sql = "SELECT COUNT(*) as total FROM messages 
                         WHERE receiver = ? 
                         AND m_read = 0 
                         AND (sender IS NULL OR sender != ?)
                         AND COALESCE(archived, 0) = 0
                         AND COALESCE(thread_id, id) NOT IN (
                             SELECT DISTINCT COALESCE(thread_id, id)
                             FROM messages
                             WHERE archived = 1
                         )";
            $count_stmt = $conn->prepare($count_sql);
            $count_stmt->bind_param('ii', $user_id, $user_id);
            $count_stmt->execute();
            $count_result = $count_stmt->get_result();
        } else {
            $count_sql = "SELECT COUNT(*) as total FROM messages 
                         WHERE receiver = 0 
                         AND m_read = 0 
                         AND (sender IS NULL OR sender != 0)";
            $count_result = $conn->query($count_sql);
        }
        $total_unread = $count_result ? (int)$count_result->fetch_assoc()['total'] : 0;
        
        echo json_encode([
            'messages' => $messages,
            'total_unread' => $total_unread,
            'count' => count($messages)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>
