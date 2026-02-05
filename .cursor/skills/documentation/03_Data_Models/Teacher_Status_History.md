---
title: Teacher Status History Model
description: Datenmodell für Teacher Status Verlauf
enableToc: true
tags:
  - data-models
  - teacher
  - status
  - history
---

# 📜 Teacher Status History Model

## Übersicht

Das `teacher_status_history` Model protokolliert alle Status-Änderungen von Lehrkräften.

## Datenbank-Schema

```sql
CREATE TABLE `teacher_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `status_id` int NOT NULL,
  `previous_status_id` int DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_status_id` (`status_id`),
  KEY `idx_changed_at` (`changed_at`),
  CONSTRAINT `teacher_status_history_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `teacher_id` | int | FK zu teachers | NOT NULL, FOREIGN KEY |
| `status_id` | int | Neuer Status | NOT NULL |
| `previous_status_id` | int | Vorheriger Status | NULL |
| `changed_at` | datetime | Zeitpunkt der Änderung | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `changed_by` | int | User der Änderung verursacht hat | NULL, FK zu users |

## Beziehungen

- **Many-to-One:** `teacher_status_history` → `teachers`
  - Viele Status-Änderungen gehören zu einem Lehrer
- **Many-to-One:** `teacher_status_history` → `users` (changed_by)
  - User der Änderung verursacht hat (Admin oder System)

## Indizes

- **PRIMARY KEY:** `id`
- **INDEX:** `teacher_id` (für Lehrer-Historie)
- **INDEX:** `status_id` (für Status-Filterung)
- **INDEX:** `changed_at` (für Zeit-basierte Abfragen)

## Validierung

### Teacher ID
- Muss existieren in `teachers`
- CASCADE DELETE: Bei Lehrer-Löschung wird Historie gelöscht

### Status ID
- Muss existieren in `teacher_stati`
- Nicht leer

### Previous Status ID
- Optional
- Kann NULL sein (erster Status)
- Muss existieren in `teacher_stati` (falls gesetzt)

### Changed At
- Automatisch gesetzt bei INSERT
- Format: `YYYY-MM-DD HH:MM:SS`

### Changed By
- Optional
- NULL = Automatische Änderung (System)
- User ID = Manuelle Änderung (Admin)

## Beispiel-Daten

```json
{
  "id": 1,
  "teacher_id": 123,
  "status_id": 8,
  "previous_status_id": 6,
  "changed_at": "2024-01-15 10:30:00",
  "changed_by": 1
}
```

## Verwendung

### Status-Änderung protokollieren
```php
INSERT INTO teacher_status_history (teacher_id, status_id, previous_status_id, changed_by)
VALUES (?, ?, ?, ?)
```

### Lehrer-Historie abrufen
```php
SELECT 
  tsh.*,
  ts.label as status_label,
  ts.display_name as status_display_name,
  prev_ts.label as previous_status_label
FROM teacher_status_history tsh
LEFT JOIN teacher_stati ts ON tsh.status_id = ts.id
LEFT JOIN teacher_stati prev_ts ON tsh.previous_status_id = prev_ts.id
WHERE tsh.teacher_id = ?
ORDER BY tsh.changed_at DESC
```

### Status zu einem Datum
```php
SELECT 
  tsh.status_id,
  ts.label as status_label
FROM teacher_status_history tsh
LEFT JOIN teacher_stati ts ON tsh.status_id = ts.id
WHERE tsh.teacher_id = ?
  AND tsh.changed_at <= ?
ORDER BY tsh.changed_at DESC
LIMIT 1
```

### Status-Statistiken
```php
SELECT 
  ts.label,
  COUNT(*) as count
FROM teacher_status_history tsh
LEFT JOIN teacher_stati ts ON tsh.status_id = ts.id
WHERE tsh.changed_at >= ? AND tsh.changed_at <= ?
GROUP BY tsh.status_id
ORDER BY count DESC
```

## Verwandte Models

- [[03_Data_Models/User|User Model]] - Lehrer
- [[03_Data_Models/Teacher_Status|Teacher Status]] - Status-Definitionen
