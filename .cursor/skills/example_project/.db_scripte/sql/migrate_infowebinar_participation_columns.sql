-- Migration: Umbenennung und Entfernung von Spalten in infowebinar_participation
-- 1. Entferne registered_at (redundant zu created_at)
-- 2. Benenne registered_by_user_id zu updated_by_user_id um

-- Schritt 1: Entferne registered_at Spalte
ALTER TABLE infowebinar_participation 
DROP COLUMN IF EXISTS registered_at;

-- Schritt 2: Benenne registered_by_user_id zu updated_by_user_id um
ALTER TABLE infowebinar_participation 
CHANGE COLUMN registered_by_user_id updated_by_user_id INT COMMENT 'User-ID des Admins, der die Bewertung (teilgenommen/nicht teilgenommen) eingetragen hat';

-- Schritt 3: Aktualisiere Index (falls vorhanden)
ALTER TABLE infowebinar_participation 
DROP INDEX IF EXISTS idx_registered_by;

ALTER TABLE infowebinar_participation 
ADD INDEX idx_updated_by (updated_by_user_id);

