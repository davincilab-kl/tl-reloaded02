-- Migration: Ändere DEFAULT-Wert von participated von FALSE auf NULL
-- und setze bestehende Einträge ohne explizite Bewertung auf NULL

-- 1. Ändere den DEFAULT-Wert der Spalte
ALTER TABLE infowebinar_participation 
MODIFY COLUMN participated BOOLEAN DEFAULT NULL 
COMMENT 'Ob der Lehrer tatsächlich teilgenommen hat (NULL = noch nicht bewertet, TRUE = teilgenommen, FALSE = nicht teilgenommen)';

-- 2. Optional: Setze bestehende Einträge, die noch nicht bewertet wurden, auf NULL
-- (Dies setzt alle Einträge auf NULL, die noch nicht explizit als teilgenommen/nicht teilgenommen markiert wurden)
-- UPDATE infowebinar_participation SET participated = NULL WHERE participated = FALSE AND updated_at = created_at;

