-- Migration: Füge location Feld zu calendly_events hinzu

ALTER TABLE `calendly_events`
ADD COLUMN `location` VARCHAR(500) NULL COMMENT 'Meeting-Link (z.B. Google Meet URL)' AFTER `status`;
