---
title: Admin Teacher List Model
description: Datenmodell für Admin Teacher Listen
enableToc: true
tags:
  - data-models
  - admin
  - lists
---

# 📋 Admin Teacher List Model

## Übersicht

Das `admin_teacher_lists` Model speichert dynamische Listen-Konfigurationen für Lehrer-Verwaltung.

## Datenbank-Schema

```sql
CREATE TABLE `admin_teacher_lists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_by_user_id` int NOT NULL,
  `filter_config` json NOT NULL,
  `columns_config` json NOT NULL,
  `last_updated` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_generating` tinyint(1) DEFAULT '0',
  `cache_progress_total` int DEFAULT NULL,
  `cache_progress_processed` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_created_by_user_id` (`created_by_user_id`),
  KEY `idx_name` (`name`),
  KEY `idx_last_updated` (`last_updated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `name` | varchar(255) | Name der Liste | NOT NULL |
| `created_by_user_id` | int | Erstellt von (Admin) | NOT NULL |
| `filter_config` | json | Filter-Konfiguration | NOT NULL |
| `columns_config` | json | Spalten-Konfiguration | NOT NULL |
| `last_updated` | datetime | Letzte Aktualisierung | NULL |
| `created_at` | timestamp | Erstellungszeit | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | timestamp | Letzte Änderung | ON UPDATE CURRENT_TIMESTAMP |
| `is_generating` | tinyint(1) | Wird generiert | DEFAULT '0' |
| `cache_progress_total` | int | Gesamtanzahl Einträge | NULL |
| `cache_progress_processed` | int | Verarbeitete Einträge | NULL |

## Filter-Konfiguration (JSON)

```json
{
  "logic": "AND",
  "filters": [
    {
      "type": "status",
      "operator": "equals",
      "value": 8
    },
    {
      "type": "class_count",
      "operator": "greater_than",
      "value": 0
    }
  ]
}
```

## Spalten-Konfiguration (JSON)

```json
{
  "columns": [
    {
      "key": "id",
      "label": "ID",
      "visible": true,
      "width": 80
    },
    {
      "key": "name",
      "label": "Name",
      "visible": true,
      "width": 200
    }
  ]
}
```

## Beispiel-Daten

```json
{
  "id": 1,
  "name": "Lehrer ohne Infowebinar",
  "created_by_user_id": 1,
  "filter_config": {
    "logic": "AND",
    "filters": [
      {
        "type": "status",
        "operator": "equals",
        "value": 4
      }
    ]
  },
  "columns_config": {
    "columns": [
      {"key": "id", "visible": true},
      {"key": "name", "visible": true},
      {"key": "email", "visible": true}
    ]
  },
  "last_updated": "2024-01-15 10:30:00",
  "created_at": "2024-01-15 10:00:00",
  "updated_at": "2024-01-15 10:30:00",
  "is_generating": false,
  "cache_progress_total": 15,
  "cache_progress_processed": 15
}
```

## Verwandte Models

- [[03_Data_Models/Admin_Teacher_List_Cache|Admin Teacher List Cache]] - Gecachte Einträge
