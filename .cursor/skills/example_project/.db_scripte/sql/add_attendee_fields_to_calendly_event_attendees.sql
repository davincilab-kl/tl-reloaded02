-- Migration: Erweitere calendly_event_attendees um neue Felder für Notizen und User-Zuordnung

ALTER TABLE `calendly_event_attendees`
ADD COLUMN `user_id` INT NULL COMMENT 'FK zu users.id - Zuordnung zu User im System' AFTER `updated_by_user_id`,
ADD COLUMN `prognosis_class_count` INT NULL COMMENT 'Prognose Anzahl Klassen' AFTER `user_id`,
ADD COLUMN `prognosis_start` VARCHAR(255) NULL COMMENT 'Prognose Start (Textfeld, z.B. "Q1 2025", "September 2025")' AFTER `prognosis_class_count`,
ADD COLUMN `notes` TEXT NULL COMMENT 'Formloses Notizfeld' AFTER `prognosis_start`,
ADD INDEX `idx_user_id` (`user_id`),
ADD CONSTRAINT `calendly_event_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
