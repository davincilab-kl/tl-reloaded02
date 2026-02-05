<?php
    require_once __DIR__ . '/../config/access_db.php';
    require_once __DIR__ . '/../config/auth.php';
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Student ID oder User ID aus GET-Parameter
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    // Falls keine student_id, aber user_id vorhanden, hole student_id aus user_id
    if ($student_id <= 0 && $user_id > 0) {
        $conn = db_connect();
        try {
            // Hole User-Rolle
            $user_sql = "SELECT role, role_id FROM users WHERE id = ? LIMIT 1";
            $user_stmt = $conn->prepare($user_sql);
            if ($user_stmt) {
                $user_stmt->bind_param('i', $user_id);
                if ($user_stmt->execute()) {
                    $user_result = $user_stmt->get_result();
                    if ($user_row = $user_result->fetch_assoc()) {
                        if ($user_row['role'] === 'student') {
                            // Direkt Student -> verwende role_id als student_id
                            $student_id = (int)$user_row['role_id'];
                        } else if ($user_row['role'] === 'teacher' || $user_row['role'] === 'admin') {
                            // Lehrer/Admin -> hole student_id aus teachers Tabelle
                            $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
                            $teacher_stmt = $conn->prepare($teacher_sql);
                            if ($teacher_stmt) {
                                $teacher_stmt->bind_param('i', $user_row['role_id']);
                                if ($teacher_stmt->execute()) {
                                    $teacher_result = $teacher_stmt->get_result();
                                    if ($teacher_row = $teacher_result->fetch_assoc()) {
                                        $student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : 0;
                                    }
                                }
                                $teacher_stmt->close();
                            }
                        }
                    }
                }
                $user_stmt->close();
            }
        } catch (Exception $e) {
            // Bei Fehler: weiter mit student_id = 0
        }
        $conn->close();
    }

    if ($student_id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid student ID or user ID']);
        exit;
    }

    $conn = db_connect();

    try {
        // 1. Hole Schüler-Daten mit Klasse, Schule und Avatar
        // Für Platzhalter-Schüler (is_teacher_placeholder = 1) holen wir den Avatar aus der users Tabelle des Lehrers
        // Platzhalter-Schüler können über teachers.student_id verknüpft sein, auch wenn class_id NULL ist
        $student_sql = "SELECT s.id, 
                               COALESCE(u_student.id, u_teacher.id, u_teacher_placeholder.id) as user_id,
                               COALESCE(u_student.first_name, u_teacher.first_name, u_teacher_placeholder.first_name) as first_name,
                               COALESCE(u_student.last_name, u_teacher.last_name, u_teacher_placeholder.last_name) as last_name,
                               s.t_coins, s.projects_public, s.class_id, c.name as class_name, 
                               COALESCE(c.teacher_id, t_placeholder.id) as teacher_id,
                               COALESCE(t.school_id, t_placeholder.school_id) as school_id, 
                               COALESCE(sch.name, sch_placeholder.name) as school_name,
                               COALESCE(u_student.avatar_seed, u_teacher.avatar_seed, u_teacher_placeholder.avatar_seed) as avatar_seed,
                               COALESCE(u_student.avatar_style, u_teacher.avatar_style, u_teacher_placeholder.avatar_style, 'avataaars') as avatar_style,
                               s.is_teacher_placeholder
                        FROM students s
                        LEFT JOIN users u_student ON u_student.role_id = s.id AND u_student.role = 'student'
                        LEFT JOIN classes c ON s.class_id = c.id
                        LEFT JOIN teachers t ON c.teacher_id = t.id
                        LEFT JOIN users u_teacher ON u_teacher.role_id = t.id AND u_teacher.role IN ('teacher', 'admin')
                        LEFT JOIN schools sch ON t.school_id = sch.id
                        -- Für Platzhalter-Schüler: Hole Lehrer über teachers.student_id
                        LEFT JOIN teachers t_placeholder ON t_placeholder.student_id = s.id
                        LEFT JOIN users u_teacher_placeholder ON u_teacher_placeholder.role_id = t_placeholder.id AND u_teacher_placeholder.role IN ('teacher', 'admin')
                        LEFT JOIN schools sch_placeholder ON t_placeholder.school_id = sch_placeholder.id
                        WHERE s.id = ?
                        LIMIT 1";
        $student_stmt = $conn->prepare($student_sql);
        
        if (!$student_stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $student_stmt->bind_param('i', $student_id);
        if (!$student_stmt->execute()) {
            throw new Exception('Execute failed: ' . $student_stmt->error);
        }
        
        $student_result = $student_stmt->get_result();
        if ($student_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            $student_stmt->close();
            $conn->close();
            exit;
        }
        
        $student_row = $student_result->fetch_assoc();
        $student_t_coins = (int)$student_row['t_coins'];
        $student_projects_public = (int)($student_row['projects_public'] ?? 0);
        $class_id = (int)$student_row['class_id'];
        $school_id = (int)$student_row['school_id'];
        $student_stmt->close();

        // 2. Hole Privatsphäre-Einstellungen
        $privacy_sql = "SELECT profile_picture, name, stats, projects
                       FROM student_privacy_settings
                       WHERE student_id = ?
                       LIMIT 1";
        $privacy_stmt = $conn->prepare($privacy_sql);
        $privacy_settings = [
            'profile_picture_visible' => true,
            'name_visible' => true,
            'stats_visible' => true,
            'scratch_projects_visible' => true
        ];
        
        if ($privacy_stmt) {
            $privacy_stmt->bind_param('i', $student_id);
            if ($privacy_stmt->execute()) {
                $privacy_result = $privacy_stmt->get_result();
                if ($privacy_result->num_rows > 0) {
                    $privacy_row = $privacy_result->fetch_assoc();
                    $privacy_settings = [
                        'profile_picture_visible' => (bool)$privacy_row['profile_picture'],
                        'name_visible' => (bool)$privacy_row['name'],
                        'stats_visible' => (bool)$privacy_row['stats'],
                        'scratch_projects_visible' => (bool)$privacy_row['projects']
                    ];
                }
            }
            $privacy_stmt->close();
        }

        // 3. Hole veröffentlichte Projekte
        $projects = [];
        $check_status_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'status'");
        $has_status_column = $check_status_column && $check_status_column->num_rows > 0;
        
        $check_likes_column = $conn->query("SHOW COLUMNS FROM projects LIKE 'likes'");
        $has_likes_column = $check_likes_column && $check_likes_column->num_rows > 0;
        
        $projects_sql = "SELECT p.id, p.title, p.description, p.student_id";
        if ($has_status_column) {
            $projects_sql .= ", p.status";
        } else {
            $projects_sql .= ", 'working' AS status";
        }
        if ($has_likes_column) {
            $projects_sql .= ", COALESCE(p.likes, 0) AS like_count";
        } else {
            $projects_sql .= ", 0 AS like_count";
        }
        $projects_sql .= " FROM projects p WHERE p.student_id = ?";
        if ($has_status_column) {
            $projects_sql .= " AND p.status = 'published'";
        }
        $projects_sql .= " ORDER BY p.id DESC";
        
        $projects_stmt = $conn->prepare($projects_sql);
        if ($projects_stmt) {
            $projects_stmt->bind_param('i', $student_id);
            if ($projects_stmt->execute()) {
                $projects_result = $projects_stmt->get_result();
                while ($project_row = $projects_result->fetch_assoc()) {
                    $projects[] = [
                        'id' => (int)$project_row['id'],
                        'title' => $project_row['title'] ?? '',
                        'description' => $project_row['description'] ?? '',
                        'link' => null,
                        'status' => $project_row['status'] ?? 'working',
                        'like_count' => (int)($project_row['like_count'] ?? 0),
                        'student_id' => (int)$project_row['student_id']
                    ];
                }
            }
            $projects_stmt->close();
        }

        // 4. Hole current_logged_in_student_id (für Like-Funktionalität)
        $current_logged_in_student_id = null;
        if (is_logged_in()) {
            if (is_student()) {
                $current_logged_in_student_id = get_role_id();
            } else if (is_teacher() || is_admin()) {
                $role_id = get_role_id();
                // Prüfe zuerst ob Admin mit student_id in admins Tabelle
                if (is_admin()) {
                    $check_admins_table = $conn->query("SHOW TABLES LIKE 'admins'");
                    if ($check_admins_table && $check_admins_table->num_rows > 0) {
                        $admin_sql = "SELECT student_id FROM admins WHERE id = ? LIMIT 1";
                        $admin_stmt = $conn->prepare($admin_sql);
                        if ($admin_stmt) {
                            $admin_stmt->bind_param('i', $role_id);
                            $admin_stmt->execute();
                            $admin_result = $admin_stmt->get_result();
                            if ($admin_row = $admin_result->fetch_assoc()) {
                                $current_logged_in_student_id = !empty($admin_row['student_id']) ? (int)$admin_row['student_id'] : null;
                            }
                            $admin_stmt->close();
                        }
                    }
                }
                
                // Falls noch keine student_id gefunden, hole aus teachers Tabelle
                if ($current_logged_in_student_id === null || $current_logged_in_student_id <= 0) {
                    $teacher_sql = "SELECT student_id FROM teachers WHERE id = ? LIMIT 1";
                    $teacher_stmt = $conn->prepare($teacher_sql);
                    if ($teacher_stmt) {
                        $teacher_stmt->bind_param('i', $role_id);
                        $teacher_stmt->execute();
                        $teacher_result = $teacher_stmt->get_result();
                        if ($teacher_row = $teacher_result->fetch_assoc()) {
                            $current_logged_in_student_id = !empty($teacher_row['student_id']) ? (int)$teacher_row['student_id'] : null;
                        }
                        $teacher_stmt->close();
                    }
                }
            }
        }

        // 5. Achievements (Top 3 in Klasse und Schule)
        $is_top_class = false;
        $class_rank = null;
        $third_place_t_coins = null;
        
        if ($class_id > 0) {
            $top_class_sql = "SELECT s.id, s.t_coins
                              FROM students s
                              WHERE s.class_id = ?
                              ORDER BY s.t_coins DESC
                              LIMIT 3";
            $top_class_stmt = $conn->prepare($top_class_sql);
            if ($top_class_stmt) {
                $top_class_stmt->bind_param('i', $class_id);
                $top_class_stmt->execute();
                $top_class_result = $top_class_stmt->get_result();
                
                $rank = 1;
                while ($row = $top_class_result->fetch_assoc()) {
                    if ($rank === 3) {
                        $third_place_t_coins = (int)$row['t_coins'];
                    }
                    if ((int)$row['id'] === $student_id) {
                        $is_top_class = true;
                        $class_rank = $rank;
                    }
                    $rank++;
                }
                $top_class_stmt->close();
            }
        }

        $is_top_school = false;
        $school_rank = null;
        
        if ($school_id > 0) {
            $top_school_sql = "SELECT s.id, s.t_coins
                              FROM students s
                              INNER JOIN classes c ON s.class_id = c.id
                              INNER JOIN teachers t ON c.teacher_id = t.id
                              WHERE t.school_id = ?
                              ORDER BY s.t_coins DESC
                              LIMIT 3";
            $top_school_stmt = $conn->prepare($top_school_sql);
            if ($top_school_stmt) {
                $top_school_stmt->bind_param('i', $school_id);
                $top_school_stmt->execute();
                $top_school_result = $top_school_stmt->get_result();
                
                $rank = 1;
                while ($row = $top_school_result->fetch_assoc()) {
                    if ((int)$row['id'] === $student_id) {
                        $is_top_school = true;
                        $school_rank = $rank;
                        break;
                    }
                    $rank++;
                }
                $top_school_stmt->close();
            }
        }

        // Nächster Schüler (mit mehr T-Coins)
        $next_student_t_coins = null;
        
        if ($class_id > 0) {
            $next_in_class_sql = "SELECT s.t_coins
                                  FROM students s
                                  WHERE s.class_id = ? AND s.t_coins > ?
                                  ORDER BY s.t_coins ASC
                                  LIMIT 1";
            $next_in_class_stmt = $conn->prepare($next_in_class_sql);
            if ($next_in_class_stmt) {
                $next_in_class_stmt->bind_param('ii', $class_id, $student_t_coins);
                $next_in_class_stmt->execute();
                $next_in_class_result = $next_in_class_stmt->get_result();
                
                if ($next_in_class_row = $next_in_class_result->fetch_assoc()) {
                    $next_student_t_coins = (int)$next_in_class_row['t_coins'];
                }
                $next_in_class_stmt->close();
            }
        }
        
        if ($next_student_t_coins === null && $school_id > 0) {
            $next_in_school_sql = "SELECT s.t_coins
                                   FROM students s
                                   INNER JOIN classes c ON s.class_id = c.id
                                   INNER JOIN teachers t ON c.teacher_id = t.id
                                   WHERE t.school_id = ? AND s.t_coins > ?
                                   ORDER BY s.t_coins ASC
                                   LIMIT 1";
            $next_in_school_stmt = $conn->prepare($next_in_school_sql);
            if ($next_in_school_stmt) {
                $next_in_school_stmt->bind_param('ii', $school_id, $student_t_coins);
                $next_in_school_stmt->execute();
                $next_in_school_result = $next_in_school_stmt->get_result();
                
                if ($next_in_school_row = $next_in_school_result->fetch_assoc()) {
                    $next_student_t_coins = (int)$next_in_school_row['t_coins'];
                }
                $next_in_school_stmt->close();
            }
        }

        // Namen bestimmen
        $full_name = '';
        if (is_logged_in() && (is_admin() || is_teacher())) {
            if (isset($_SESSION['user_name']) && !empty($_SESSION['user_name'])) {
                $full_name = $_SESSION['user_name'];
            } else {
                $current_user_id = get_user_id();
                if ($current_user_id) {
                    $user_name_sql = "SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1";
                    $user_name_stmt = $conn->prepare($user_name_sql);
                    if ($user_name_stmt) {
                        $user_name_stmt->bind_param('i', $current_user_id);
                        if ($user_name_stmt->execute()) {
                            $user_name_result = $user_name_stmt->get_result();
                            if ($user_name_row = $user_name_result->fetch_assoc()) {
                                $full_name = trim(($user_name_row['first_name'] ?? '') . ' ' . ($user_name_row['last_name'] ?? ''));
                            }
                        }
                        $user_name_stmt->close();
                    }
                }
            }
        } else {
            $full_name = trim($student_row['first_name'] ?? '');
        }
        
        // Bestimme user_id für Avatar
        $avatar_user_id = (int)($student_row['user_id'] ?? 0);
        
        echo json_encode([
            'success' => true,
            'student' => [
                'id' => (int)$student_row['id'],
                'user_id' => $avatar_user_id,
                'name' => $full_name,
                't_coins' => $student_t_coins,
                'projects_public' => $student_projects_public,
                'class_name' => $student_row['class_name'] ?? '',
                'school_name' => $student_row['school_name'] ?? '',
                'avatar_seed' => $student_row['avatar_seed'] ?? null,
                'avatar_style' => $student_row['avatar_style'] ?? 'avataaars',
                'is_teacher_placeholder' => isset($student_row['is_teacher_placeholder']) ? (bool)$student_row['is_teacher_placeholder'] : false
            ],
            'privacy_settings' => $privacy_settings,
            'projects' => $projects,
            'current_logged_in_student_id' => $current_logged_in_student_id,
            'achievements' => [
                'is_top_class' => $is_top_class,
                'class_rank' => $class_rank,
                'is_top_school' => $is_top_school,
                'school_rank' => $school_rank,
                'next_student_t_coins' => $next_student_t_coins,
                'third_place_t_coins' => $third_place_t_coins
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    $conn->close();
?>

