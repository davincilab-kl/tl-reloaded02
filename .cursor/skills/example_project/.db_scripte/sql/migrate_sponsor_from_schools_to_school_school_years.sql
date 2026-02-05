-- Migrationsskript: Sponsor von schools.sponsor nach school_school_years.sponsor migrieren
-- Dieses Skript sollte NACH add_school_year_to_existing_data.sql ausgeführt werden

-- Prüfe ob Tabellen existieren
SET @has_school_years = (SELECT COUNT(*) FROM information_schema.tables 
                         WHERE table_schema = DATABASE() 
                         AND table_name = 'school_years');
SET @has_school_school_years = (SELECT COUNT(*) FROM information_schema.tables 
                                WHERE table_schema = DATABASE() 
                                AND table_name = 'school_school_years');
SET @has_sponsor_column = (SELECT COUNT(*) FROM information_schema.columns 
                           WHERE table_schema = DATABASE() 
                           AND table_name = 'school_school_years' 
                           AND column_name = 'sponsor');

-- Nur ausführen wenn alle Tabellen/Spalten existieren
SET @sql = IF(@has_school_years > 0 AND @has_school_school_years > 0 AND @has_sponsor_column > 0,
    'UPDATE school_school_years ssy
    INNER JOIN school_years sy ON ssy.school_year_id = sy.id
    INNER JOIN schools s ON ssy.school_id = s.id
    SET ssy.sponsor = s.sponsor
    WHERE sy.is_current = 1 
    AND s.foerderung = 1 
    AND s.sponsor IS NOT NULL 
    AND s.sponsor != ''
    AND (ssy.sponsor IS NULL OR ssy.sponsor = '')',
    'SELECT ''Tabellen oder Spalten existieren nicht. Bitte zuerst create_school_years_tables.sql und add_sponsor_to_school_school_years.sql ausführen.'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Zeige Anzahl migrierter Einträge
SELECT COUNT(*) as migrated_sponsors 
FROM school_school_years ssy
INNER JOIN school_years sy ON ssy.school_year_id = sy.id
WHERE sy.is_current = 1 
AND ssy.sponsor IS NOT NULL 
AND ssy.sponsor != '';
