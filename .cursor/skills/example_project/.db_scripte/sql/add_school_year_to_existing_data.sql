-- Migrationsskript: Schuljahre für bestehende Daten
-- Erstellt ein Standard-Schuljahr für das aktuelle Jahr und verknüpft alle bestehenden Schulen/Klassen

-- Bestimme das aktuelle Schuljahr basierend auf dem aktuellen Datum
-- In Österreich: Schuljahr startet im September (z.B. 2024/2025 = 01.09.2024 - 31.08.2025)
SET @current_year = YEAR(CURDATE());
SET @current_month = MONTH(CURDATE());

-- Wenn wir nach September sind, ist das Schuljahr bereits das nächste Jahr
SET @school_year_start = IF(@current_month >= 9, @current_year, @current_year - 1);
SET @school_year_end = @school_year_start + 1;
SET @school_year_name = CONCAT(@school_year_start, '/', @school_year_end);
SET @start_date = CONCAT(@school_year_start, '-09-01');
SET @end_date = CONCAT(@school_year_end, '-08-31');

-- Erstelle das Standard-Schuljahr, falls es noch nicht existiert
INSERT IGNORE INTO school_years (name, start_date, end_date, is_current)
VALUES (@school_year_name, @start_date, @end_date, 1);

-- Setze alle anderen Schuljahre auf is_current = 0 (nur ein Schuljahr sollte aktuell sein)
UPDATE school_years SET is_current = 0 WHERE name COLLATE utf8mb4_unicode_ci != @school_year_name COLLATE utf8mb4_unicode_ci;

-- Hole die ID des erstellten/gefundenen Schuljahrs
SET @school_year_id = (SELECT id FROM school_years WHERE name COLLATE utf8mb4_unicode_ci = @school_year_name COLLATE utf8mb4_unicode_ci LIMIT 1);

-- Verknüpfe alle bestehenden Schulen mit dem Standard-Schuljahr
-- Übernehme den Sponsor aus der schools Tabelle, falls vorhanden
INSERT IGNORE INTO school_school_years (school_id, school_year_id, is_active, sponsor)
SELECT id, @school_year_id, 1, 
    CASE 
        WHEN foerderung = 1 AND sponsor IS NOT NULL AND sponsor != '' THEN sponsor
        ELSE NULL
    END
FROM schools
WHERE id NOT IN (
    SELECT school_id FROM school_school_years WHERE school_year_id = @school_year_id
);

-- Verknüpfe alle bestehenden Klassen mit dem Standard-Schuljahr
INSERT IGNORE INTO class_school_years (class_id, school_year_id, is_active)
SELECT id, @school_year_id, 1
FROM classes
WHERE id NOT IN (
    SELECT class_id FROM class_school_years WHERE school_year_id = @school_year_id
);
