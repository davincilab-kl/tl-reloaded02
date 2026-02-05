-- Tabelle für Infowebinar-Anmeldungen
CREATE TABLE IF NOT EXISTS infowebinar_participation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    webinar_date DATETIME NOT NULL,
    participated BOOLEAN DEFAULT NULL COMMENT 'Ob der Lehrer tatsächlich teilgenommen hat (NULL = noch nicht bewertet, TRUE = teilgenommen, FALSE = nicht teilgenommen)',
    updated_by_user_id INT COMMENT 'User-ID des Admins, der die Bewertung (teilgenommen/nicht teilgenommen) eingetragen hat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_webinar_date (webinar_date),
    INDEX idx_updated_by (updated_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

