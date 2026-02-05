---
title: School Year Model - Schuljahr-Datenmodell
description: Vollständiges Datenmodell für Schuljahre
enableToc: true
tags:
  - data-models
  - school-year
  - season
---

# 📅 School Year Model - Schuljahr-Datenmodell

> [!abstract] Übersicht
> Das School Year Model repräsentiert Schuljahre (Saisons) für Lizenz-Verwaltung und T!Coins-Tracking.

## Verwandte Dokumentation

- **Admin School Year Management:** [[01_Features/Dashboard/Admin/School_Year_Management|School Year Management]] - Schuljahr-Verwaltung
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen mit Schuljahr-Zuordnung
- **License Model:** [[03_Data_Models/License|License Model]] - Lizenzen pro Schuljahr

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE school_years (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  name VARCHAR(100) NOT NULL, -- z.B. "2024/25"
  start_date DATE NOT NULL, -- Schuljahr-Start (z.B. 2024-09-01)
  end_date DATE NOT NULL, -- Schuljahr-Ende (z.B. 2025-06-30)
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT false, -- Aktuelles Schuljahr
  is_current BOOLEAN NOT NULL DEFAULT false, -- Aktuell aktives Schuljahr (nur eines)
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_dates CHECK (end_date > start_date),
  CONSTRAINT chk_one_current CHECK (
    (is_current = true AND is_active = true) OR
    (is_current = false)
  ),
  
  -- Indizes
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_is_active (is_active),
  INDEX idx_is_current (is_current)
);
```

## TypeScript Interface

```typescript
// school-year.model.ts
export interface SchoolYear {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  name: string; // z.B. "2024/25"
  startDate: Date; // Schuljahr-Start
  endDate: Date; // Schuljahr-Ende
  
  // Status
  isActive: boolean; // Aktuelles Schuljahr
  isCurrent: boolean; // Aktuell aktives Schuljahr (nur eines)
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `name`
- **Typ:** VARCHAR(100)
- **Pflicht:** Ja
- **Beschreibung:** Schuljahr-Name (z.B. "2024/25")
- **Format:** "YYYY/YY" oder "YYYY-YYYY"

#### `start_date`
- **Typ:** DATE
- **Pflicht:** Ja
- **Beschreibung:** Schuljahr-Start (z.B. 2024-09-01)
- **Standard:** 1. September

#### `end_date`
- **Typ:** DATE
- **Pflicht:** Ja
- **Beschreibung:** Schuljahr-Ende (z.B. 2025-06-30)
- **Standard:** 30. Juni
- **Constraint:** Muss nach `start_date` sein

### Status

#### `is_active`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Ob Schuljahr aktiv ist (für Lizenzen verfügbar)

#### `is_current`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Aktuell aktives Schuljahr (nur eines kann current sein)
- **Constraint:** Nur ein Schuljahr kann `is_current = true` sein

## Beziehungen

### Zu anderen Modellen

- **Classes:** `classes.school_year_id` → `school_years.id` (One-to-Many)
- **Licenses:** `licenses.school_year_id` → `school_years.id` (One-to-Many)
- **T!Coins:** T!Coins werden pro Schuljahr getrackt

## Beispiel-Daten

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440006",
  "name": "2024/25",
  "startDate": "2024-09-01",
  "endDate": "2025-06-30",
  "isActive": true,
  "isCurrent": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

> [!tip] Implementation Hint
> - Nur ein Schuljahr kann `is_current = true` sein
> - Automatische Schuljahr-Wechsel implementieren
> - T!Coins werden pro Schuljahr getrackt
> - Lizenzen sind pro Schuljahr gültig
