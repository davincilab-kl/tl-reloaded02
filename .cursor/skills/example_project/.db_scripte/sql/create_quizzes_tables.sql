-- Tabelle für Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lection_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lection_id (lection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelle für Quiz-Fragen
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- z.B. 'multiple_choice', 'single_choice', 'text', 'true_false', 'drag_drop', 'code'
    title VARCHAR(500),
    text TEXT,
    order_index INT DEFAULT 0, -- Reihenfolge der Fragen
    points INT DEFAULT 1, -- Punkte für diese Frage
    required TINYINT(1) DEFAULT 1, -- Muss die Frage beantwortet werden?
    question_data JSON, -- Alle typspezifischen Daten in einem JSON-Feld:
                        -- - multiple_choice/single_choice: {options: [{text, is_correct, explanation}], min_selections, max_selections}
                        -- - text: {max_length, min_length, pattern, case_sensitive}
                        -- - true_false: {correct_answer: true/false}
                        -- - drag_drop: {items: [{id, text}], correct_order: [2,1,3]}
                        -- - code: {language, template, test_cases: [...]}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_type (type),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelle für Quiz-Ergebnisse (nur ob bestanden, um Lektion als erledigt zu markieren)
CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,
    points_earned INT DEFAULT 0, -- Erreichte Punkte
    points_total INT DEFAULT 0, -- Maximale Punkte des Quiz
    passed TINYINT(1) DEFAULT 0, -- Wurde der Schwellenwert überschritten? (bestanden)
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_passed (passed),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelle für Lektionen ohne Quiz, die als erledigt markiert wurden
CREATE TABLE IF NOT EXISTS lection_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lection_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_lection (student_id, lection_id), -- Ein Student kann eine Lektion nur einmal als erledigt markieren
    INDEX idx_student_id (student_id),
    INDEX idx_lection_id (lection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

