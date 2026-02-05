-- Füge school_code Spalte zur schools Tabelle hinzu
-- Der Code ist ein 5-stelliger alphanumerischer Code (nur Kleinbuchstaben)

ALTER TABLE schools 
ADD COLUMN school_code VARCHAR(5) NULL UNIQUE AFTER name;

-- Erstelle Index für schnelle Suche
CREATE INDEX idx_school_code ON schools(school_code);

