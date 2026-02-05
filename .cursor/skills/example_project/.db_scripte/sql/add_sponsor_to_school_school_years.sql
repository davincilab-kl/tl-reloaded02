-- Fügt die Spalte sponsor zur school_school_years Tabelle hinzu
-- Diese Spalte speichert den Sponsor für eine Schule in einem bestimmten Schuljahr

ALTER TABLE school_school_years 
ADD COLUMN sponsor VARCHAR(50) NULL COMMENT 'Sponsor für diese Schule in diesem Schuljahr' 
AFTER is_active;

-- Optional: Migriere bestehende Sponsor-Daten aus der schools Tabelle
-- für alle Verknüpfungen im aktuellen Schuljahr
UPDATE school_school_years ssy
INNER JOIN schools s ON ssy.school_id = s.id
INNER JOIN school_years sy ON ssy.school_year_id = sy.id
SET ssy.sponsor = s.sponsor
WHERE sy.is_current = 1 
AND s.foerderung = 1 
AND s.sponsor IS NOT NULL 
AND s.sponsor != ''
AND ssy.sponsor IS NULL;
