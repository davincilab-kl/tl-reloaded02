-- Script: Foreign Key von RESTRICT zu NO ACTION ändern
-- In MySQL sind RESTRICT und NO ACTION praktisch identisch,
-- aber NO ACTION kann in DBeaver manchmal besser funktionieren

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

-- Schritt 2: Entferne den alten Foreign Key
SET @sql_drop = IF(@fk_name IS NOT NULL, 
    CONCAT('ALTER TABLE class_orders DROP FOREIGN KEY ', @fk_name),
    'SELECT ''Kein Foreign Key gefunden'' AS message'
);

PREPARE stmt_drop FROM @sql_drop;
EXECUTE stmt_drop;
DEALLOCATE PREPARE stmt_drop;

-- Schritt 3: Füge Foreign Key neu hinzu mit NO ACTION
ALTER TABLE class_orders 
ADD CONSTRAINT fk_class_orders_school_year 
FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE NO ACTION;

