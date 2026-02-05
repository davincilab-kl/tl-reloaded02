-- Füge AFTER INSERT Trigger hinzu, der automatisch einen initialen Eintrag in teacher_status_history erstellt
-- Dieser Trigger ergänzt den bestehenden AFTER UPDATE Trigger

DELIMITER $$

-- Entferne den Trigger falls er bereits existiert
DROP TRIGGER IF EXISTS teacher_status_insert_trigger$$

CREATE TRIGGER teacher_status_insert_trigger
AFTER INSERT ON teachers
FOR EACH ROW
BEGIN
    -- Erstelle initialen Eintrag in teacher_status_history, wenn status_id gesetzt ist
    IF NEW.status_id IS NOT NULL THEN
        INSERT INTO teacher_status_history (
            teacher_id,
            status_id,
            previous_status_id,
            changed_at
        ) VALUES (
            NEW.id,
            NEW.status_id,
            NULL,
            NOW()
        );
    END IF;
END$$

DELIMITER ;

