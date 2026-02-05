---
title: School Model - Schul-Datenmodell
description: Vollständiges Datenmodell für Schulen
enableToc: true
tags:
  - data-models
  - school
  - organization
---

# 🏫 School Model - Schul-Datenmodell

> [!abstract] Übersicht
> Das School Model repräsentiert Schulen mit allen relevanten Informationen, Status, Lizenzen und Förderern.

## Verwandte Dokumentation

- **Admin School Management:** [[01_Features/Dashboard/Admin/School_Management|Admin School Management]] - Schul-Verwaltung
- **Teacher School Management:** [[01_Features/Dashboard/Teacher/School_Management|Teacher School Management]] - Schul-Verwaltung durch Lehrer
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen der Schule

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE schools (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  name VARCHAR(255) NOT NULL,
  school_type VARCHAR(100), -- 'AHS', 'MS', 'VS', etc.
  skz VARCHAR(20) UNIQUE, -- Schulkennzahl (Schulkennziffer)
  is_private BOOLEAN NOT NULL DEFAULT false,
  
  -- Adresse
  street VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL, -- Österreichische PLZ
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL, -- Bundesland
  
  -- Demografische Daten
  non_native_german_percentage DECIMAL(5, 2), -- 0-100%
  
  -- Umfang
  estimated_classes INTEGER, -- Geschätzte Anzahl Klassen
  estimated_teachers INTEGER, -- Geschätzte Anzahl Lehrkräfte
  
  -- Status & Verwaltung
  status VARCHAR(50) NOT NULL DEFAULT 'pending_approval', -- 'active', 'pending_approval', 'waitlist'
  school_code VARCHAR(20) UNIQUE, -- z.B. "tribc7" für Lehrer-Verbindung
  free_licenses_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Förderer
  sponsor_id UUID REFERENCES sponsors(id), -- Optional: Förderer
  
  -- Anmerkung
  notes TEXT, -- Zusätzliche Informationen
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP, -- Wann wurde Schule freigeschaltet
  approved_by UUID REFERENCES users(id), -- Admin, der freigeschaltet hat
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('active', 'pending_approval', 'waitlist')),
  CONSTRAINT chk_non_native_percentage CHECK (non_native_german_percentage >= 0 AND non_native_german_percentage <= 100),
  
  -- Indizes
  INDEX idx_status (status),
  INDEX idx_state (state),
  INDEX idx_school_code (school_code),
  INDEX idx_skz (skz),
  INDEX idx_sponsor_id (sponsor_id),
  INDEX idx_created_at (created_at)
);
```

## TypeScript Interface

```typescript
// school.model.ts
export enum SchoolStatus {
  ACTIVE = 'active',
  PENDING_APPROVAL = 'pending_approval',
  WAITLIST = 'waitlist'
}

export enum SchoolType {
  AHS = 'AHS', // Allgemeinbildende höhere Schule
  MS = 'MS', // Mittelschule
  VS = 'VS', // Volksschule
  // Weitere Schularten...
}

export enum AustrianState {
  BURGENLAND = 'Burgenland',
  KAERNTEN = 'Kärnten',
  NIEDEROESTERREICH = 'Niederösterreich',
  OBEROESTERREICH = 'Oberösterreich',
  SALZBURG = 'Salzburg',
  STEIERMARK = 'Steiermark',
  TIROL = 'Tirol',
  VORARLBERG = 'Vorarlberg',
  WIEN = 'Wien'
}

export interface School {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  name: string;
  schoolType?: SchoolType;
  skz?: string; // Schulkennzahl
  isPrivate: boolean;
  
  // Adresse
  street: string;
  postalCode: string;
  city: string;
  state: AustrianState;
  
  // Demografische Daten
  nonNativeGermanPercentage?: number; // 0-100%
  
  // Umfang
  estimatedClasses?: number;
  estimatedTeachers?: number;
  
  // Status & Verwaltung
  status: SchoolStatus;
  schoolCode?: string; // z.B. "tribc7"
  freeLicensesEnabled: boolean;
  
  // Förderer
  sponsorId?: string;
  
  // Anmerkung
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string; // Admin User ID
}
```

## Felder-Erklärung

### Basis-Informationen

#### `name`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Beschreibung:** Schulname (z.B. "MS Demoschule")

#### `school_type`
- **Typ:** VARCHAR(100)
- **Pflicht:** Nein
- **Werte:** 'AHS', 'MS', 'VS', etc.
- **Beschreibung:** Schulart

#### `skz`
- **Typ:** VARCHAR(20)
- **Pflicht:** Nein
- **Unique:** Ja
- **Beschreibung:** Schulkennzahl (z.B. "4301")

#### `is_private`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Ob es eine Privatschule ist

### Adresse

#### `street`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Beschreibung:** Straße und Hausnummer

#### `postal_code`
- **Typ:** VARCHAR(10)
- **Pflicht:** Ja
- **Beschreibung:** Österreichische PLZ (z.B. "1140")

#### `city`
- **Typ:** VARCHAR(100)
- **Pflicht:** Ja
- **Beschreibung:** Ort

#### `state`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:** Alle österreichischen Bundesländer
- **Beschreibung:** Bundesland

### Demografische Daten

#### `non_native_german_percentage`
- **Typ:** DECIMAL(5, 2)
- **Pflicht:** Nein
- **Bereich:** 0-100%
- **Beschreibung:** Geschätzter Anteil der Kinder, die Deutsch nicht als Muttersprache haben
- **Datenschutz:** Wird nur aggregiert verwendet

### Umfang

#### `estimated_classes`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Geschätzte Anzahl teilnehmender Klassen

#### `estimated_teachers`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Geschätzte Anzahl teilnehmender Lehrkräfte

### Status & Verwaltung

#### `status`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'pending_approval'
- **Werte:** 
  - 'active' - Schule ist aktiv
  - 'pending_approval' - Wartet auf Admin-Freigabe
  - 'waitlist' - Auf Warteliste
- **Beschreibung:** Schul-Status

#### `school_code`
- **Typ:** VARCHAR(20)
- **Pflicht:** Nein
- **Unique:** Ja
- **Beschreibung:** Schulcode für Lehrer-Verbindung (z.B. "tribc7")
- **Verwendung:** Lehrkräfte können Code bei Registrierung verwenden

#### `free_licenses_enabled`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Ob Schule für Gratis-Lizenzen freigeschaltet ist

### Förderer

#### `sponsor_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** sponsors(id)
- **Beschreibung:** Zugewiesener Förderer (z.B. "TalentsLounge Angels")

### Anmerkung

#### `notes`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Zusätzliche Informationen für Admin

### Timestamps

#### `created_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Default:** NOW()
- **Beschreibung:** Erstellungsdatum

#### `updated_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Default:** NOW()
- **Beschreibung:** Letztes Update-Datum

#### `approved_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Wann wurde Schule freigeschaltet

#### `approved_by`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** users(id)
- **Beschreibung:** Admin, der Schule freigeschaltet hat

## Beziehungen

### Zu anderen Modellen

- **Users (Teachers):** `users.school_id` → `schools.id` (One-to-Many)
- **Classes:** `classes.school_id` → `schools.id` (One-to-Many)
- **Sponsors:** `schools.sponsor_id` → `sponsors.id` (Many-to-One)
- **Licenses:** `licenses.school_id` → `schools.id` (One-to-Many)

## Beispiel-Daten

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "MS Demoschule",
  "schoolType": "MS",
  "skz": "4301",
  "isPrivate": false,
  "street": "Tusstraße 4321",
  "postalCode": "1140",
  "city": "Wien",
  "state": "Wien",
  "nonNativeGermanPercentage": 25.5,
  "estimatedClasses": 3,
  "estimatedTeachers": 2,
  "status": "active",
  "schoolCode": "tribc7",
  "freeLicensesEnabled": true,
  "sponsorId": "770e8400-e29b-41d4-a716-446655440005",
  "notes": "Startet im Oktober mit zwei 1. Klassen",
  "createdAt": "2023-09-01T08:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "approvedAt": "2023-09-05T12:00:00Z",
  "approvedBy": "990e8400-e29b-41d4-a716-446655440004"
}
```

> [!tip] Implementation Hint
> - Generiere `school_code` automatisch bei Erstellung (z.B. 6-stellig, alphanumerisch)
> - Implementiere Soft Delete mit `status = 'deleted'` (optional)
> - Cache Schul-Statistiken (Anzahl Klassen, Schüler, Lehrer) für Performance
> - Validierung: Österreichische PLZ-Format prüfen
> - Schulcode sollte eindeutig und schwer zu erraten sein
