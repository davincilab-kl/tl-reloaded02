<?php
    require_once __DIR__ . '/../../api/config/auth.php';
    require_login(); // Erlaube Student, Teacher und Admin
    
    $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;
    if ($course_id <= 0) {
        header('Location: /students/courses/index.php');
        exit;
    }
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kurs</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="./view-style.css">
    <link rel="stylesheet" href="../students-style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <?php include __DIR__ . '/../../partials/main-menu/main-menu.php'; ?>
    </header>

    <main class="course-view-container">
        <div class="course-header">
            <a href="/students/courses/index.php" class="back-link">
                <i class="fas fa-arrow-left"></i> Zurück zu den Kursen
            </a>
            <h1 id="course-title">
                <i class="fas fa-book"></i> <span>Lade Kurs...</span>
            </h1>
        </div>

        <div class="course-layout">
            <aside class="lections-sidebar">
                <h2>Lektionen</h2>
                <div id="lections-list">
                    <div class="loading-messages">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Lade Lektionen...</span>
                    </div>
                </div>
            </aside>

            <div class="course-content-area">
                <div id="course-intro" class="course-intro" style="display: none;">
                    <div id="course-intro-text"></div>
                </div>
                <div id="lection-content" class="lection-content" style="display: none;">
                    <h2 id="lection-title"></h2>
                    <div id="lection-text"></div>
                    <div id="quiz-button-container" class="quiz-button-container"></div>
                    <div id="lection-navigation" class="lection-navigation"></div>
                </div>
                <div id="no-content" class="no-content">
                    <i class="fas fa-info-circle"></i>
                    <p>Wähle eine Lektion aus, um loszulegen.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Quiz Modal -->
    <div id="quiz-modal" class="quiz-modal" style="display: none;">
        <div class="quiz-modal-overlay"></div>
        <div class="quiz-modal-content">
            <div class="quiz-modal-header">
                <h3 id="quiz-modal-title">Quiz</h3>
                <button class="quiz-modal-close" id="quiz-modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="quiz-modal-body">
                <div id="quiz-modal-container"></div>
            </div>
        </div>
    </div>

    <script>
        const courseId = <?php echo $course_id; ?>;
    </script>
    <script src="./view-scripts.js"></script>
</body>
</html>

