-- Füge strasse und plz Spalten zur schools Tabelle hinzu

ALTER TABLE schools 
ADD COLUMN strasse VARCHAR(255) NULL AFTER ort,
ADD COLUMN plz VARCHAR(10) NULL AFTER strasse;

-- Befülle alle Einträge mit "Straße 99" für strasse
UPDATE schools 
SET strasse = 'Straße 99'
WHERE strasse IS NULL;

-- Befülle alle Einträge mit zufälligen 4-stelligen Zahlen für plz
UPDATE schools 
SET plz = LPAD(FLOOR(1000 + RAND() * 9000), 4, '0')
WHERE plz IS NULL;

