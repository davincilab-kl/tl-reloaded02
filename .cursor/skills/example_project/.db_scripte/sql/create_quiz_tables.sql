-- Quiz-App Tabellen (für Live-Quiz-System)

-- Tabelle für Quizzes
CREATE TABLE IF NOT EXISTS app_quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(10) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    current_question_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher (teacher_id),
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Tabelle für Quiz-Fragen
CREATE TABLE IF NOT EXISTS app_quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_order INT NOT NULL,
    time_limit INT DEFAULT 30 COMMENT 'Zeitlimit in Sekunden',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES app_quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_order (quiz_id, question_order)
);

-- Tabelle für Quiz-Antwortmöglichkeiten
CREATE TABLE IF NOT EXISTS app_quiz_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    answer_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES app_quiz_questions(id) ON DELETE CASCADE,
    INDEX idx_question (question_id)
);

-- Tabelle für Quiz-Sessions (Teilnehmer)
CREATE TABLE IF NOT EXISTS app_quiz_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    student_id INT,
    student_name VARCHAR(255),
    session_code VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES app_quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_session_code (session_code)
);

-- Tabelle für Quiz-Antworten der Teilnehmer
CREATE TABLE IF NOT EXISTS app_quiz_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_id INT,
    response_time INT COMMENT 'Antwortzeit in Sekunden',
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES app_quiz_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES app_quiz_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES app_quiz_answers(id) ON DELETE SET NULL,
    INDEX idx_session (session_id),
    INDEX idx_question (question_id)
);

