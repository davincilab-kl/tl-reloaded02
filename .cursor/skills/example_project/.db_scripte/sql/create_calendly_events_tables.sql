-- Tabellen für Calendly Scheduled Events und deren Teilnehmer

-- Tabelle für Calendly Events
-- dbgqpq6nxd7mlp.calendly_events definition

CREATE TABLE `calendly_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `calendly_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Calendly Event UUID (eindeutige Identifikation)',
  `event_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name des Events (z.B. "TLr - Infowebinar")',
  `start_time` datetime NOT NULL COMMENT 'Startzeit des Events',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'Status des Events (active, cancelled, etc.)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_calendly_id` (`calendly_id`),
  KEY `idx_event_name` (`event_name`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelle für Calendly Event Teilnehmer (Invitees)
-- dbgqpq6nxd7mlp.calendly_event_attendees definition

CREATE TABLE IF NOT EXISTS calendly_event_attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL COMMENT 'FK zu calendly_events',
    name VARCHAR(255) NOT NULL COMMENT 'Name des Teilnehmers',
    email VARCHAR(255) NOT NULL COMMENT 'E-Mail des Teilnehmers',
    attended TINYINT(1) DEFAULT NULL COMMENT 'Anwesenheit: NULL = noch nicht bewertet, TRUE = anwesend, FALSE = nicht anwesend',
    updated_by_user_id INT DEFAULT NULL COMMENT 'User-ID des Admins, der die Anwesenheit eingetragen hat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_attendee (event_id, email),
    INDEX idx_event_id (event_id),
    INDEX idx_attended (attended),
    INDEX idx_updated_by (updated_by_user_id),
    CONSTRAINT calendly_event_attendees_ibfk_1 FOREIGN KEY (event_id) REFERENCES calendly_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

