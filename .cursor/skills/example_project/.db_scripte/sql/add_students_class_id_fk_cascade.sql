-- Füge Foreign Key Constraint für students.class_id hinzu
-- Schüler werden automatisch gelöscht, wenn ihre Klasse gelöscht wird (CASCADE)
-- ACHTUNG: Beim Löschen einer Klasse werden automatisch alle zugehörigen Schüler gelöscht

USE dbgqpq6nxd7mlp;

-- Prüfe und entferne eventuell vorhandene alte Constraint (falls vorhanden)
-- Hinweis: Falls bereits eine Constraint existiert, muss sie zuerst manuell entfernt werden:
-- ALTER TABLE students DROP FOREIGN KEY <constraint_name>;

-- Füge Index hinzu (falls noch nicht vorhanden - wird ignoriert wenn bereits existiert)
ALTER TABLE students
ADD INDEX idx_students_class_id (class_id);

-- Füge Foreign Key Constraint mit CASCADE hinzu
ALTER TABLE students
ADD CONSTRAINT students_ibfk_class_id 
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

