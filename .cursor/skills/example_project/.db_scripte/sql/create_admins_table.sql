-- Erstelle Tabelle für Admin-Verknüpfungen
-- Diese Tabelle speichert die Verknüpfung zwischen Admin-User, verknüpftem Teacher und verknüpftem Student

USE dbgqpq6nxd7mlp;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL COMMENT 'ID des verknüpften Teachers in teachers Tabelle',
    student_id INT NOT NULL COMMENT 'ID des verknüpften Students in students Tabelle',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_student_id (student_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_teacher_id (teacher_id),
    UNIQUE KEY unique_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
