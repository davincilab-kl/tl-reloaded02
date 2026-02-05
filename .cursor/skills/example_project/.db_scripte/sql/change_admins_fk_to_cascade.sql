-- Ändere Foreign Key Constraint von RESTRICT auf CASCADE
-- ACHTUNG: Beim Löschen eines Teachers wird automatisch der zugehörige Admin-Eintrag gelöscht

USE dbgqpq6nxd7mlp;

-- Alte Constraint entfernen
ALTER TABLE admins 
DROP FOREIGN KEY admins_ibfk_1;

-- Neue Constraint mit CASCADE hinzufügen
ALTER TABLE admins
ADD CONSTRAINT admins_ibfk_1 
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

