-- Schuljahre System Tabellen

-- Tabelle für Schuljahre
CREATE TABLE IF NOT EXISTS school_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE COMMENT 'Format: 2024/2025',
    start_date DATE NOT NULL COMMENT 'Startdatum des Schuljahrs',
    end_date DATE NOT NULL COMMENT 'Enddatum des Schuljahrs',
    is_current TINYINT(1) DEFAULT 0 COMMENT 'Flag für aktuelles Schuljahr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_current (is_current),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verknüpfungstabelle: Schulen zu Schuljahren
CREATE TABLE IF NOT EXISTS school_school_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    school_year_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Ob die Schule in diesem Schuljahr aktiv ist',
    sponsor VARCHAR(50) NULL COMMENT 'Sponsor für diese Schule in diesem Schuljahr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_school_year (school_id, school_year_id),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    INDEX idx_school (school_id),
    INDEX idx_school_year (school_year_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verknüpfungstabelle: Klassen zu Schuljahren
CREATE TABLE IF NOT EXISTS class_school_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    school_year_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Ob die Klasse in diesem Schuljahr aktiv ist',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class_year (class_id, school_year_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    INDEX idx_class (class_id),
    INDEX idx_school_year (school_year_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
