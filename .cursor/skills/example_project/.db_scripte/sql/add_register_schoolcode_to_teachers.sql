-- Füge register_schoolcode Spalte zur teachers Tabelle hinzu
-- Speichert den school_code, wenn ein Teacher über einen Einladungslink registriert wurde

ALTER TABLE teachers 
ADD COLUMN register_schoolcode VARCHAR(5) NULL AFTER school_id;

-- Erstelle Index für schnelle Suche
CREATE INDEX idx_register_schoolcode ON teachers(register_schoolcode);

