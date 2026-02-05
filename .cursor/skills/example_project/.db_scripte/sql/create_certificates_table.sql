-- Tabelle für Urkunden-Typen
CREATE TABLE IF NOT EXISTS certificate_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    template_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelle für Urkunden/Zertifikate
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    certificate_type VARCHAR(50) NOT NULL,
    earned_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    -- Foreign Key für certificate_type ist optional - kann später hinzugefügt werden
    -- FOREIGN KEY (certificate_type) REFERENCES certificate_types(type) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_certificate_type (certificate_type),
    INDEX idx_earned_date (earned_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

