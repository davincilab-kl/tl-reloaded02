-- Tabelle für Admin-Lehrer-Listen-Konfigurationen
CREATE TABLE IF NOT EXISTS admin_teacher_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Name der Liste (z.B. "Lehrer ohne Infowebinar")',
    created_by_user_id INT NOT NULL COMMENT 'Admin, der die Liste erstellt hat',
    filter_config JSON NOT NULL COMMENT 'Gespeicherte Filter-Konfiguration',
    columns_config JSON NOT NULL COMMENT 'Welche Spalten angezeigt werden sollen',
    last_updated DATETIME NULL COMMENT 'Letzte Aktualisierung des Caches',
    is_generating TINYINT(1) DEFAULT 0 COMMENT 'Wird gerade generiert/aktualisiert (1 = ja, 0 = nein)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_by_user_id (created_by_user_id),
    INDEX idx_name (name),
    INDEX idx_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelle für gecachte Lehrer-Daten in Listen
CREATE TABLE IF NOT EXISTS admin_teacher_list_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL COMMENT 'FK zu admin_teacher_lists',
    teacher_id INT NOT NULL COMMENT 'FK zu teachers',
    cached_data JSON NOT NULL COMMENT 'Alle Daten des Lehrers zum Zeitpunkt der Cachierung',
    cached_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Zeitpunkt der Cachierung',
    color_marker VARCHAR(20) NULL COMMENT 'Farbliche Markierung (z.B. "red", "yellow", "green", "blue", "orange", "purple", "gray")',
    notes TEXT NULL COMMENT 'Notizen/Kommentare zu diesem Eintrag',
    tags JSON NULL COMMENT 'Array von Tags (z.B. ["wichtig", "nachfassen", "erledigt"])',
    updated_by_user_id INT NULL COMMENT 'Admin, der zuletzt geändert hat',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Letzte Änderung',
    INDEX idx_list_id (list_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_color_marker (color_marker),
    INDEX idx_cached_at (cached_at),
    UNIQUE KEY unique_list_teacher (list_id, teacher_id),
    FOREIGN KEY (list_id) REFERENCES admin_teacher_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

