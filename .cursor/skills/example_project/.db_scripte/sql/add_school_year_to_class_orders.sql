-- Migration: school_year_id zu class_orders hinzufügen
-- Fügt Schuljahr-Verknüpfung zu Bestellungen hinzu

-- Prüfe ob Spalte bereits existiert
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'class_orders' 
    AND COLUMN_NAME = 'school_year_id'
);

-- Füge school_year_id Spalte hinzu, falls sie noch nicht existiert
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE class_orders 
     ADD COLUMN school_year_id INT NULL COMMENT ''Verknüpfung zum Schuljahr'' AFTER user_id,
     ADD INDEX idx_school_year_id (school_year_id),
     ADD FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE NO ACTION',
    'SELECT ''Spalte school_year_id existiert bereits'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

