---
title: Admin Teacher List Cache Model
description: Datenmodell für gecachte Listen-Einträge
enableToc: true
tags:
  - data-models
  - admin
  - lists
  - cache
---

# 💾 Admin Teacher List Cache Model

## Übersicht

Das `admin_teacher_list_cache` Model speichert gecachte Einträge für Admin Teacher Listen.

## Datenbank-Schema

```sql
CREATE TABLE `admin_teacher_list_cache` (
  `id` int NOT NULL AUTO_INCREMENT,
  `list_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `cached_data` json NOT NULL,
  `cached_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `color_marker` varchar(20) DEFAULT NULL,
  `notes` text,
  `tags` json DEFAULT NULL,
  `updated_by_user_id` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_list_teacher` (`list_id`,`teacher_id`),
  KEY `idx_list_id` (`list_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_color_marker` (`color_marker`),
  KEY `idx_cached_at` (`cached_at`),
  CONSTRAINT `admin_teacher_list_cache_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `admin_teacher_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_teacher_list_cache_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `list_id` | int | FK zu admin_teacher_lists | NOT NULL, FOREIGN KEY |
| `teacher_id` | int | FK zu teachers | NOT NULL, FOREIGN KEY |
| `cached_data` | json | Gecachte Daten | NOT NULL |
| `cached_at` | datetime | Cache-Zeitpunkt | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `color_marker` | varchar(20) | Farb-Markierung | NULL |
| `notes` | text | Notizen | NULL |
| `tags` | json | Tags | NULL |
| `updated_by_user_id` | int | Zuletzt geändert von | NULL |
| `updated_at` | timestamp | Letzte Änderung | ON UPDATE CURRENT_TIMESTAMP |

## Cached Data (JSON)

```json
{
  "id": 123,
  "name": "Max Mustermann",
  "email": "max@example.com",
  "school": "MS Beispiel",
  "status": "infowebinar_besuchen",
  "class_count": 2,
  "student_count": 45,
  "last_login": "2024-01-20 14:00:00"
}
```

## Farb-Markierungen

- `red` - Wichtig/Dringend
- `yellow` - Aufmerksamkeit erforderlich
- `green` - Erledigt/OK
- `blue` - Information
- `orange` - Warnung
- `purple` - Speziell
- `gray` - Neutral

## Tags (JSON)

```json
["wichtig", "nachfassen", "erledigt"]
```

## Beispiel-Daten

```json
{
  "id": 1,
  "list_id": 1,
  "teacher_id": 123,
  "cached_data": {
    "id": 123,
    "name": "Max Mustermann",
    "email": "max@example.com",
    "school": "MS Beispiel",
    "status": "infowebinar_besuchen"
  },
  "cached_at": "2024-01-15 10:30:00",
  "color_marker": "red",
  "notes": "Sollte kontaktiert werden",
  "tags": ["wichtig", "nachfassen"],
  "updated_by_user_id": 1,
  "updated_at": "2024-01-15 11:00:00"
}
```

## Verwandte Models

- [[03_Data_Models/Admin_Teacher_List|Admin Teacher List]] - Liste
- [[03_Data_Models/User|User Model]] - Lehrer
