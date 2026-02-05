-- Migration: Füge project_data Spalte zur projects Tabelle hinzu
-- Diese Spalte speichert die Scratch-Projektdatei als JSON

-- Prüfe ob Spalte bereits existiert, bevor sie hinzugefügt wird
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'project_data'
);

-- Füge Spalte hinzu, falls sie nicht existiert
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE projects ADD COLUMN project_data LONGTEXT NULL COMMENT "Scratch-Projektdatei als JSON (.sb3 Format)" AFTER link',
    'SELECT "Spalte project_data existiert bereits" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

