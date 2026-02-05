-- Erstelle Tabelle für Status-Historie
CREATE TABLE IF NOT EXISTS teacher_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    status_id INT NOT NULL,
    previous_status_id INT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by INT NULL,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_status_id (status_id),
    INDEX idx_changed_at (changed_at),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES teacher_stati(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Erstelle Trigger für automatisches Tracking von Status-Änderungen
DELIMITER $$

CREATE TRIGGER teacher_status_update_trigger
AFTER UPDATE ON teachers
FOR EACH ROW
BEGIN
    -- Nur wenn sich status_id geändert hat
    IF OLD.status_id != NEW.status_id THEN
        INSERT INTO teacher_status_history (
            teacher_id,
            status_id,
            previous_status_id,
            changed_at
        ) VALUES (
            NEW.id,
            NEW.status_id,
            OLD.status_id,
            NOW()
        );
    END IF;
END$$

DELIMITER ;

