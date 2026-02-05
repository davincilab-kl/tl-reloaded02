-- Generiere zufällige eindeutige school_codes für alle Schulen ohne Code
-- Der Code ist ein 5-stelliger alphanumerischer Code (nur Kleinbuchstaben: a-z und 0-9)

DELIMITER $$

-- Funktion zum Generieren eines zufälligen alphanumerischen Codes (nur Kleinbuchstaben)
DROP FUNCTION IF EXISTS generate_random_code$$
CREATE FUNCTION generate_random_code() RETURNS VARCHAR(5)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE code VARCHAR(5) DEFAULT '';
    DECLARE chars VARCHAR(36) DEFAULT 'abcdefghijklmnopqrstuvwxyz0123456789';
    DECLARE i INT DEFAULT 1;
    DECLARE random_pos INT;
    
    WHILE i <= 5 DO
        SET random_pos = FLOOR(1 + RAND() * 36);
        SET code = CONCAT(code, SUBSTRING(chars, random_pos, 1));
        SET i = i + 1;
    END WHILE;
    
    RETURN code;
END$$

-- Prozedur zum Aktualisieren aller Schulen ohne school_code
DROP PROCEDURE IF EXISTS populate_school_codes$$
CREATE PROCEDURE populate_school_codes()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE school_id INT;
    DECLARE new_code VARCHAR(5);
    DECLARE code_exists INT;
    DECLARE max_attempts INT DEFAULT 100;
    DECLARE attempts INT;
    
    -- Cursor für alle Schulen ohne school_code
    DECLARE school_cursor CURSOR FOR 
        SELECT id FROM schools WHERE school_code IS NULL OR school_code = '';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN school_cursor;
    
    school_loop: LOOP
        FETCH school_cursor INTO school_id;
        
        IF done THEN
            LEAVE school_loop;
        END IF;
        
        -- Generiere eindeutigen Code
        SET attempts = 0;
        code_loop: LOOP
            SET new_code = generate_random_code();
            
            -- Prüfe ob Code bereits existiert
            SELECT COUNT(*) INTO code_exists 
            FROM schools 
            WHERE school_code = new_code;
            
            IF code_exists = 0 THEN
                -- Code ist eindeutig, aktualisiere Schule
                UPDATE schools 
                SET school_code = new_code 
                WHERE id = school_id;
                LEAVE code_loop;
            END IF;
            
            SET attempts = attempts + 1;
            IF attempts >= max_attempts THEN
                -- Fallback: Verwende ID-basierten Code falls zu viele Versuche
                SET new_code = CONCAT(
                    SUBSTRING('abcdefghijklmnopqrstuvwxyz0123456789', 1 + (school_id % 26), 1),
                    SUBSTRING('abcdefghijklmnopqrstuvwxyz0123456789', 1 + ((school_id * 7) % 36), 1),
                    SUBSTRING('abcdefghijklmnopqrstuvwxyz0123456789', 1 + ((school_id * 13) % 36), 1),
                    SUBSTRING('abcdefghijklmnopqrstuvwxyz0123456789', 1 + ((school_id * 17) % 36), 1),
                    SUBSTRING('abcdefghijklmnopqrstuvwxyz0123456789', 1 + ((school_id * 19) % 36), 1)
                );
                UPDATE schools 
                SET school_code = new_code 
                WHERE id = school_id;
                LEAVE code_loop;
            END IF;
        END LOOP code_loop;
        
    END LOOP school_loop;
    
    CLOSE school_cursor;
END$$

DELIMITER ;

-- Führe die Prozedur aus
CALL populate_school_codes();

-- Aufräumen: Lösche die temporären Funktionen und Prozeduren
DROP FUNCTION IF EXISTS generate_random_code;
DROP PROCEDURE IF EXISTS populate_school_codes;










