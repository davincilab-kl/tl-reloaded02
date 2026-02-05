-- Erstelle Tabelle für Lehrer-Warteliste

USE dbgqpq6nxd7mlp;
CREATE TABLE IF NOT EXISTS teacher_waitlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    school_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME NULL,
    accepted_by INT NULL COMMENT 'ID der Lehrkraft, die die Anfrage akzeptiert hat',
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_school_id (school_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_school_pending (teacher_id, school_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

