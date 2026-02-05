-- Fügt die Spalte created_by_user_id zur schools Tabelle hinzu
-- Diese Spalte speichert die user_id des Benutzers, der die Schule erstellt hat

ALTER TABLE schools 
ADD COLUMN created_by_user_id INT NULL AFTER erstelldatum,
ADD INDEX idx_created_by_user_id (created_by_user_id);

-- Optional: Foreign Key Constraint (falls gewünscht)
-- ALTER TABLE schools 
-- ADD CONSTRAINT fk_schools_created_by_user 
-- FOREIGN KEY (created_by_user_id) REFERENCES users(id) 
-- ON DELETE SET NULL;

