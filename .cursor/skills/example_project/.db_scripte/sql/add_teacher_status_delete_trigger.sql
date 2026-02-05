-- Füge BEFORE DELETE Trigger hinzu, der beim Löschen eines Lehrers
-- automatisch alle zugehörigen Einträge in teacher_status_history löscht
-- (Alternative zu ON DELETE CASCADE, falls dieses nicht funktioniert)

DELIMITER $$

-- Entferne den Trigger falls er bereits existiert
DROP TRIGGER IF EXISTS teacher_status_delete_trigger$$

CREATE TRIGGER teacher_status_delete_trigger
BEFORE DELETE ON teachers
FOR EACH ROW
BEGIN
    -- Lösche alle Historie-Einträge des Lehrers
    DELETE FROM teacher_status_history 
    WHERE teacher_id = OLD.id;
END$$

DELIMITER ;

