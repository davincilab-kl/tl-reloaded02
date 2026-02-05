---
title: Email Template Model
description: Datenmodell für E-Mail-Vorlagen
enableToc: true
tags:
  - data-models
  - email
  - templates
---

# 📧 Email Template Model

## Übersicht

Das `email_templates` Model speichert E-Mail-Vorlagen für den Versand an verschiedene Empfänger-Gruppen.

## Datenbank-Schema

```sql
CREATE TABLE `email_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `body` text NOT NULL,
  `is_html` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `scheduled_at` datetime DEFAULT NULL,
  `recipient_type` varchar(50) DEFAULT NULL,
  `custom_email` varchar(255) DEFAULT NULL,
  `scheduled_sent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_scheduled` (`scheduled_at`,`scheduled_sent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `name` | varchar(255) | Name der Vorlage | NOT NULL |
| `subject` | varchar(500) | E-Mail-Betreff | NOT NULL |
| `body` | text | E-Mail-Nachricht | NOT NULL |
| `is_html` | tinyint(1) | HTML-Format | DEFAULT '0' |
| `created_at` | timestamp | Erstellungszeit | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | timestamp | Letzte Aktualisierung | ON UPDATE CURRENT_TIMESTAMP |
| `scheduled_at` | datetime | Geplantes Versand-Datum | NULL |
| `recipient_type` | varchar(50) | Empfänger-Typ | NULL |
| `custom_email` | varchar(255) | Custom E-Mail | NULL |
| `scheduled_sent` | tinyint(1) | Geplant gesendet | DEFAULT '0' |

## Validierung

### Name
- Maximal 255 Zeichen
- Muss eindeutig sein
- Nicht leer

### Subject
- Maximal 500 Zeichen
- Unterstützt Platzhalter
- Nicht leer

### Body
- Unbegrenzte Länge
- Unterstützt Platzhalter
- Unterstützt HTML (wenn `is_html = 1`)
- Nicht leer

### Is HTML
- Boolean (0 oder 1)
- Default: 0 (Plain Text)

### Scheduled At
- Optional
- Format: `YYYY-MM-DD HH:MM:SS`
- Muss in der Zukunft liegen

### Recipient Type
- Mögliche Werte:
  - `all_teachers` - Alle Lehrkräfte
  - `all_schools` - Alle Schulen
  - `custom` - Einzelne E-Mail
  - `user_ids` - Spezifische User-IDs

## Beispiel-Daten

```json
{
  "id": 1,
  "name": "Willkommens-E-Mail",
  "subject": "Willkommen bei TalentsLounge, {{name}}!",
  "body": "Hallo {{name}},\n\nWillkommen bei TalentsLounge!",
  "is_html": true,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00",
  "scheduled_at": null,
  "recipient_type": null,
  "custom_email": null,
  "scheduled_sent": false
}
```

## Verwendung

### Vorlage erstellen
```php
INSERT INTO email_templates (name, subject, body, is_html)
VALUES (?, ?, ?, ?)
```

### Vorlage aktualisieren
```php
UPDATE email_templates
SET name = ?, subject = ?, body = ?, is_html = ?
WHERE id = ?
```

### Geplante E-Mails
```php
SELECT * FROM email_templates
WHERE scheduled_at IS NOT NULL
  AND scheduled_sent = 0
  AND scheduled_at <= NOW()
```
