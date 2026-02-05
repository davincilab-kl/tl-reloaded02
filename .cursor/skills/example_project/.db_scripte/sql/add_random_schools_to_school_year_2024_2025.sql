-- Fügt zufällig 30% der Schulen zum Schuljahr 2024/2025 (id 4) hinzu
-- Setzt den Sponsor auf "Apprentigo"
-- Schulen können dadurch in mehreren Schuljahren aktiv sein

SET @school_year_id = 4;
SET @sponsor = 'Apprentigo';

-- Berechne 30% der Gesamtzahl der Schulen
SET @total_schools = (SELECT COUNT(*) FROM schools);
SET @target_count = FLOOR(@total_schools * 0.3);

-- Zeige Informationen vor dem Insert
SELECT 
    @total_schools as total_schools,
    @target_count as schools_to_add,
    (SELECT COUNT(*) FROM school_school_years WHERE school_year_id = @school_year_id) as existing_entries;

-- Füge zufällig 30% der Schulen hinzu, die noch keinen Eintrag für dieses Schuljahr haben
-- INSERT IGNORE verhindert Duplikate (UNIQUE KEY unique_school_year)
-- Verwende Prepared Statement, da LIMIT keine Variablen direkt unterstützt
SET @sql = CONCAT('
INSERT IGNORE INTO school_school_years (school_id, school_year_id, is_active, sponsor)
SELECT id, ', @school_year_id, ', 1, ''', @sponsor, '''
FROM schools
WHERE id NOT IN (
    SELECT school_id FROM school_school_years WHERE school_year_id = ', @school_year_id, '
)
ORDER BY RAND()
LIMIT ', @target_count);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Zeige Ergebnis
SELECT 
    ROW_COUNT() as inserted_entries,
    (SELECT COUNT(*) FROM school_school_years WHERE school_year_id = @school_year_id AND sponsor = @sponsor) as total_with_sponsor;
