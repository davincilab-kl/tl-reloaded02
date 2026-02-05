-- Script: Foreign Key von school_year_id komplett entfernen
-- WARNUNG: Dies entfernt die referentielle Integrität!
-- Die Spalte bleibt editierbar, aber es gibt keine automatische Prüfung mehr.

-- Schritt 1: Finde den Namen des Foreign Key Constraints
SET @fk_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'class_orders' 
    AND COLUMN_NAME = 'school_year_id'
    AND REFERENCED_TABLE_NAME = 'school_years'
    LIMIT 1
);

-- Schritt 2: Entferne den Foreign Key
SET @sql_drop = IF(@fk_name IS NOT NULL, 
    CONCAT('ALTER TABLE class_orders DROP FOREIGN KEY ', @fk_name),
    'SELECT ''Kein Foreign Key gefunden - bereits entfernt'' AS message'
);

PREPARE stmt_drop FROM @sql_drop;
EXECUTE stmt_drop;
DEALLOCATE PREPARE stmt_drop;

-- Hinweis: Der Index idx_school_year_id bleibt erhalten und kann weiterhin verwendet werden
-- Die Spalte school_year_id ist jetzt editierbar ohne Foreign Key Constraint

