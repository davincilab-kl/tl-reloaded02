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

    $input = json_decode(file_get_contents('php://input'), true);
    $thread_id = isset($input['thread_id']) ? (int)$input['thread_id'] : null;
    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : null;

    if ($thread_id === null) {
        http_response_code(400);
        echo json_encode(['error' => 'thread_id fehlt']);
        exit;
    }

    $conn = db_connect();

    try {
        // Prüfe, ob der User Zugriff auf diesen Thread hat (nur wenn user_id gesetzt ist)
        if ($user_id !== null && $user_id > 0) {
            $check_sql = "SELECT COUNT(*) as count FROM messages 
                         WHERE (thread_id = ? OR id = ?) 
                         AND (sender = ? OR receiver = ?)";
            $check_stmt = $conn->prepare($check_sql);
            if ($check_stmt) {
                $check_stmt->bind_param('iiii', $thread_id, $thread_id, $user_id, $user_id);
                $check_stmt->execute();
                $check_result = $check_stmt->get_result();
                $check_row = $check_result->fetch_assoc();
                $check_stmt->close();
                
                if ($check_row && $check_row['count'] == 0) {
                    http_response_code(403);
                    echo json_encode(['error' => 'Zugriff auf diesen Thread nicht erlaubt']);
                    exit;
                }
            }
        }
        
        // Alle Nachrichten des Threads abrufen (basierend auf thread_id)
        // Eine Nachricht ist Teil des Threads wenn:
        // - ihre thread_id gleich der gegebenen thread_id ist, ODER
        // - ihre id gleich der thread_id ist (für die erste Nachricht)
        $sql = "SELECT m.id, m.message, m.title, m.sender, m.receiver, m.timestamp, m.m_read, m.thread_id,
                       u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
                FROM messages m
                LEFT JOIN teachers t ON m.sender = t.id
                LEFT JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
                WHERE (m.thread_id = ? OR m.id = ?)
                ORDER BY m.timestamp ASC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param('ii', $thread_id, $thread_id);
        
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $messages = [];
        
        while ($row = $result->fetch_assoc()) {
            $sender_id = $row['sender'] !== null ? (int)$row['sender'] : null;
            $sender_role = getUserRole($conn, $sender_id);
            
            // Namen kombinieren (last_name kann NULL sein)
            $sender_full_name = trim(($row['sender_first_name'] ?? '') . ' ' . ($row['sender_last_name'] ?? ''));
            if ($sender_role === 'admin') {
                $sender_full_name = 'TalentsLounge-Team';
            } else {
                $sender_full_name = $sender_full_name ?: 'Unbekannt';
            }
            
            $messages[] = [
                'id' => (int)$row['id'],
                'message' => $row['message'],
                'title' => $row['title'] ?? null,
                'sender' => $sender_id,
                'receiver' => (int)$row['receiver'],
                'timestamp' => $row['timestamp'],
                'm_read' => (int)$row['m_read'],
                'thread_id' => $row['thread_id'] !== null ? (int)$row['thread_id'] : null,
                'sender_name' => $sender_full_name,
                'sender_email' => $row['sender_email'] ?? null,
                'sender_role' => $sender_role,
                'time_ago' => getTimeAgo($row['timestamp']),
                'is_admin' => $sender_role === 'admin'
            ];
        }
        
        // Prüfe, wer die letzte Nachricht im Thread gesendet hat
        $last_message_sql = "SELECT sender, receiver FROM messages 
                            WHERE (thread_id = ? OR id = ?) 
                            ORDER BY timestamp DESC, id DESC 
                            LIMIT 1";
        $last_stmt = $conn->prepare($last_message_sql);
        $should_mark_read = false;
        
        if ($last_stmt) {
            $last_stmt->bind_param('ii', $thread_id, $thread_id);
            $last_stmt->execute();
            $last_result = $last_stmt->get_result();
            
            if ($last_row = $last_result->fetch_assoc()) {
                $last_sender = $last_row['sender'] !== null ? (int)$last_row['sender'] : null;
                $last_receiver = (int)$last_row['receiver'];
                
                // Nur markieren, wenn:
                // 1. Der aktuelle User der Empfänger ist UND
                // 2. Die letzte Nachricht NICHT vom aktuellen User stammt
                if ($user_id !== null && $user_id > 0) {
                    // Teacher-Bereich
                    $should_mark_read = ($last_receiver == $user_id && $last_sender != $user_id);
                } else {
                    // Admin-Bereich: Admin ist Empfänger (receiver = 0)
                    $should_mark_read = ($last_receiver == 0 && $last_sender != 0 && $last_sender !== null);
                }
            }
            $last_stmt->close();
        }
        
        // Nur Nachrichten als gelesen markieren, wenn die letzte Nachricht vom anderen kommt
        if ($should_mark_read) {
            if ($user_id !== null && $user_id > 0) {
                // Teacher-Bereich: Nur Nachrichten markieren, wo receiver = user_id
                $update_sql = "UPDATE messages SET m_read = 1 
                              WHERE (thread_id = ? OR (id = ? AND thread_id IS NULL)) 
                              AND receiver = ?";
                $update_stmt = $conn->prepare($update_sql);
                if ($update_stmt) {
                    $update_stmt->bind_param('iii', $thread_id, $thread_id, $user_id);
                    $update_stmt->execute();
                    $update_stmt->close();
                }
            } else {
                // Admin-Bereich: Nur Nachrichten markieren, wo receiver = 0 (Admin ist Empfänger)
                $update_sql = "UPDATE messages SET m_read = 1 
                              WHERE (thread_id = ? OR (id = ? AND thread_id IS NULL)) 
                              AND receiver = 0";
                $update_stmt = $conn->prepare($update_sql);
                if ($update_stmt) {
                    $update_stmt->bind_param('ii', $thread_id, $thread_id);
                    $update_stmt->execute();
                    $update_stmt->close();
                }
            }
        }
        
        $stmt->close();
        
        echo json_encode([
            'messages' => $messages,
            'thread_id' => $thread_id,
            'count' => count($messages)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

