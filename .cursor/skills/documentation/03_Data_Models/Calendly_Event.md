---
title: Calendly Event Model
description: Datenmodell für Calendly Events
enableToc: true
tags:
  - data-models
  - calendly
---

# 📅 Calendly Event Model

## Übersicht

Das `calendly_events` Model speichert synchronisierte Info-Webinar-Termine von Calendly.

## Datenbank-Schema

```sql
CREATE TABLE `calendly_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `calendly_id` varchar(100) NOT NULL COMMENT 'Calendly Event UUID (eindeutige Identifikation)',
  `event_name` varchar(255) NOT NULL COMMENT 'Name des Events (z.B. "TLr - Infowebinar")',
  `start_time` datetime NOT NULL COMMENT 'Startzeit des Events',
  `status` varchar(50) DEFAULT 'active' COMMENT 'Status des Events (active, cancelled, etc.)',
  `location` varchar(500) DEFAULT NULL COMMENT 'Meeting-Link (z.B. Google Meet URL)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_calendly_id` (`calendly_id`),
  KEY `idx_event_name` (`event_name`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `calendly_id` | varchar(100) | Calendly Event UUID | NOT NULL, UNIQUE |
| `event_name` | varchar(255) | Name des Events | NOT NULL |
| `start_time` | datetime | Startzeit des Events | NOT NULL |
| `status` | varchar(50) | Status (active, cancelled) | DEFAULT 'active' |
| `location` | varchar(500) | Meeting-Link | NULL |
| `created_at` | timestamp | Erstellungszeit | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | timestamp | Letzte Aktualisierung | ON UPDATE CURRENT_TIMESTAMP |

## Beziehungen

- **One-to-Many:** `calendly_events` → `calendly_event_attendees`
  - Ein Event hat viele Teilnehmer

## Indizes

- **PRIMARY KEY:** `id`
- **UNIQUE:** `calendly_id` (verhindert Duplikate)
- **INDEX:** `event_name` (für Suche)
- **INDEX:** `start_time` (für Sortierung)
- **INDEX:** `status` (für Filterung)
- **INDEX:** `created_at` (für Sortierung)

## Validierung

### Calendly ID
- Muss eindeutig sein (UUID-Format)
- Wird aus Calendly Event URI extrahiert

### Event Name
- Maximal 255 Zeichen
- Nicht leer

### Start Time
- Muss in der Zukunft oder Vergangenheit liegen
- Format: `YYYY-MM-DD HH:MM:SS`

### Status
- Mögliche Werte: `active`, `cancelled`
- Default: `active`

### Location
- Optional
- Kann Meeting-Link (Google Meet, Zoom, etc.) enthalten
- Maximal 500 Zeichen

## Beispiel-Daten

```json
{
  "id": 1,
  "calendly_id": "abc123-def456-ghi789",
  "event_name": "TLr - Infowebinar",
  "start_time": "2024-01-20 14:00:00",
  "status": "active",
  "location": "https://meet.google.com/xyz-abc-def",
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00"
}
```

## Verwendung

### Event erstellen
```php
INSERT INTO calendly_events (calendly_id, event_name, start_time, status, location)
VALUES (?, ?, ?, ?, ?)
```

### Event aktualisieren
```php
UPDATE calendly_events
SET event_name = ?, start_time = ?, status = ?, location = ?
WHERE calendly_id = ?
```

### Event abrufen
```php
SELECT * FROM calendly_events
WHERE calendly_id = ?
```

### Anstehende Events
```php
SELECT * FROM calendly_events
WHERE start_time >= NOW()
  AND start_time <= DATE_ADD(NOW(), INTERVAL 14 DAY)
ORDER BY start_time ASC
```

## Verwandte Models

- [[03_Data_Models/Calendly_Event_Attendee|Calendly Event Attendee]] - Teilnehmer eines Events

## Migration

Bei der Migration vom alten System:
- Bestehende Events werden über `calendly_id` identifiziert
- Duplikate werden verhindert durch UNIQUE Constraint
- Location wird aus Calendly API Response geparst
