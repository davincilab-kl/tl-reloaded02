-- Löscht alle school_school_years Einträge, die keinen Sponsor haben
-- Diese Einträge sind noch nicht für das Schuljahr freigeschaltet

-- Zeige zuerst die Anzahl der betroffenen Einträge
SELECT COUNT(*) as entries_to_delete 
FROM school_school_years 
WHERE sponsor IS NULL OR sponsor = '';

-- Lösche alle Einträge ohne Sponsor
DELETE FROM school_school_years 
WHERE sponsor IS NULL OR sponsor = '';

-- Zeige Bestätigung
SELECT CONCAT('Es wurden ', ROW_COUNT(), ' Einträge ohne Sponsor gelöscht') as message;
