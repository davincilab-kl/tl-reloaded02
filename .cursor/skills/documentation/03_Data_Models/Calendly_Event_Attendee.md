---
title: Calendly Event Attendee Model
description: Datenmodell für Calendly Event Teilnehmer
enableToc: true
tags:
  - data-models
  - calendly
---

# 👥 Calendly Event Attendee Model

## Übersicht

Das `calendly_event_attendees` Model speichert Teilnehmer von Calendly Events mit Anwesenheits-Tracking und zusätzlichen Informationen.

## Datenbank-Schema

```sql
CREATE TABLE `calendly_event_attendees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL COMMENT 'FK zu calendly_events',
  `name` varchar(255) NOT NULL COMMENT 'Name des Teilnehmers',
  `email` varchar(255) NOT NULL COMMENT 'E-Mail des Teilnehmers',
  `attended` tinyint(1) DEFAULT NULL COMMENT 'Anwesenheit: NULL = noch nicht bewertet, TRUE = anwesend, FALSE = nicht anwesend',
  `updated_by_user_id` int DEFAULT NULL COMMENT 'User-ID des Admins, der die Anwesenheit eingetragen hat',
  `user_id` int DEFAULT NULL COMMENT 'FK zu users.id - Zuordnung zu User im System',
  `prognosis_class_count` int DEFAULT NULL COMMENT 'Prognose Anzahl Klassen',
  `prognosis_start` varchar(255) DEFAULT NULL COMMENT 'Prognose Start (Textfeld, z.B. "Q1 2025", "September 2025")',
  `notes` text COMMENT 'Formloses Notizfeld',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_attendee` (`event_id`,`email`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_attended` (`attended`),
  KEY `idx_updated_by` (`updated_by_user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `calendly_event_attendees_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `calendly_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calendly_event_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `event_id` | int | FK zu calendly_events | NOT NULL, FOREIGN KEY |
| `name` | varchar(255) | Name des Teilnehmers | NOT NULL |
| `email` | varchar(255) | E-Mail des Teilnehmers | NOT NULL |
| `attended` | tinyint(1) | Anwesenheits-Status | NULL, TRUE, FALSE |
| `updated_by_user_id` | int | Admin der Anwesenheit eingetragen hat | NULL, FK zu users |
| `user_id` | int | Zuordnung zu User-Account | NULL, FK zu users |
| `prognosis_class_count` | int | Prognose Anzahl Klassen | NULL |
| `prognosis_start` | varchar(255) | Prognose Start | NULL |
| `notes` | text | Formlose Notizen | NULL |
| `created_at` | timestamp | Erstellungszeit | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | timestamp | Letzte Aktualisierung | ON UPDATE CURRENT_TIMESTAMP |

## Beziehungen

- **Many-to-One:** `calendly_event_attendees` → `calendly_events`
  - Viele Teilnehmer gehören zu einem Event
- **Many-to-One:** `calendly_event_attendees` → `users` (user_id)
  - Teilnehmer kann mit User-Account verknüpft sein
- **Many-to-One:** `calendly_event_attendees` → `users` (updated_by_user_id)
  - Admin der Anwesenheit eingetragen hat

## Indizes

- **PRIMARY KEY:** `id`
- **UNIQUE:** `event_id` + `email` (verhindert Duplikate pro Event)
- **INDEX:** `event_id` (für JOINs)
- **INDEX:** `attended` (für Filterung)
- **INDEX:** `updated_by_user_id` (für Tracking)
- **INDEX:** `user_id` (für User-Zuordnung)

## Validierung

### Event ID
- Muss existieren in `calendly_events`
- CASCADE DELETE: Bei Event-Löschung werden Teilnehmer gelöscht

### Name
- Maximal 255 Zeichen
- Nicht leer

### Email
- Maximal 255 Zeichen
- E-Mail-Format
- Zusammen mit `event_id` eindeutig

### Attended
- **NULL:** Noch nicht bewertet
- **TRUE (1):** Teilgenommen
- **FALSE (0):** Nicht teilgenommen

### User ID
- Optional
- Verknüpfung zu User-Account
- SET NULL bei User-Löschung

### Prognosis Class Count
- Optional
- Positive Zahl
- Prognose für Anzahl Klassen

### Prognosis Start
- Optional
- Freitext (z.B. "Q1 2025", "September 2025")
- Maximal 255 Zeichen

### Notes
- Optional
- Freitext
- Unbegrenzte Länge

## Beispiel-Daten

```json
{
  "id": 1,
  "event_id": 1,
  "name": "Max Mustermann",
  "email": "max@example.com",
  "attended": true,
  "updated_by_user_id": 1,
  "user_id": 123,
  "prognosis_class_count": 2,
  "prognosis_start": "Q1 2024",
  "notes": "Interessiert an Coding-Kursen",
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-20 15:00:00"
}
```

## Verwendung

### Teilnehmer erstellen
```php
INSERT INTO calendly_event_attendees (event_id, name, email)
VALUES (?, ?, ?)
```

### Anwesenheit aktualisieren
```php
UPDATE calendly_event_attendees
SET attended = ?, updated_by_user_id = ?
WHERE id = ?
```

### User zuordnen
```php
UPDATE calendly_event_attendees
SET user_id = ?
WHERE id = ?
```

### Teilnehmer abrufen
```php
SELECT * FROM calendly_event_attendees
WHERE event_id = ?
ORDER BY name ASC
```

### Anwesenheits-Statistik
```php
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN attended IS NULL THEN 1 END) as pending,
  COUNT(CASE WHEN attended = 1 THEN 1 END) as attended,
  COUNT(CASE WHEN attended = 0 THEN 1 END) as not_attended
FROM calendly_event_attendees
WHERE event_id = ?
```

## Verwandte Models

- [[03_Data_Models/Calendly_Event|Calendly Event]] - Event zu dem Teilnehmer gehört
- [[03_Data_Models/User|User]] - Verknüpfter User-Account

## Migration

Bei der Migration vom alten System:
- Bestehende Teilnehmer werden über `event_id` + `email` identifiziert
- Duplikate werden verhindert durch UNIQUE Constraint
- User-Zuordnung kann nachträglich erfolgen
