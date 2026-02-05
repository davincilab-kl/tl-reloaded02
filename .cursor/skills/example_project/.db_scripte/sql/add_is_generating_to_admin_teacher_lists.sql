-- Füge is_generating Feld zur admin_teacher_lists Tabelle hinzu
ALTER TABLE admin_teacher_lists 
ADD COLUMN is_generating TINYINT(1) DEFAULT 0 
COMMENT 'Wird gerade generiert/aktualisiert (1 = ja, 0 = nein)';

