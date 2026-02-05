-- Migration: Umstellung der Event-Identifikation auf calendly_id (UUID)
-- Statt event_name + start_time wird jetzt nur noch calendly_id verwendet

-- 1. Entferne den alten UNIQUE KEY
ALTER TABLE `calendly_events` DROP INDEX `unique_event_identification`;

-- 2. Stelle sicher, dass calendly_id NOT NULL ist (für neue Einträge)
-- Für bestehende Einträge ohne calendly_id: Diese müssen manuell bereinigt werden
ALTER TABLE `calendly_events` 
MODIFY COLUMN `calendly_id` VARCHAR(100) NOT NULL COMMENT 'Calendly Event UUID (eindeutige Identifikation)';

-- 3. Erstelle neuen UNIQUE KEY auf calendly_id
ALTER TABLE `calendly_events` 
ADD UNIQUE KEY `unique_calendly_id` (`calendly_id`);

-- 4. Optional: Index auf event_name und start_time für Abfragen (aber nicht UNIQUE)
-- Diese Indizes können für Filterungen nützlich sein
ALTER TABLE `calendly_events` 
ADD INDEX `idx_event_name` (`event_name`),
ADD INDEX `idx_start_time` (`start_time`);

