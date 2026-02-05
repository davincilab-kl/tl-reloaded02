-- Entfernt die sponsor Spalte aus der schools Tabelle
-- WARNUNG: Führe dies NUR aus, nachdem alle Daten migriert wurden und alle APIs angepasst sind!

-- Prüfe ob school_school_years.sponsor existiert
SET @has_sponsor_in_school_school_years = (SELECT COUNT(*) FROM information_schema.columns 
                                            WHERE table_schema = DATABASE() 
                                            AND table_name = 'school_school_years' 
                                            AND column_name = 'sponsor');

-- Nur ausführen wenn school_school_years.sponsor existiert
SET @sql = IF(@has_sponsor_in_school_school_years > 0,
    'ALTER TABLE schools DROP COLUMN sponsor',
    'SELECT ''Spalte sponsor existiert nicht in school_school_years. Bitte zuerst add_sponsor_to_school_school_years.sql ausführen.'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Zeige Bestätigung
SELECT 'Spalte sponsor wurde aus schools Tabelle entfernt' as message;
