---
title: Course Package Model - Kurspaket-Datenmodell
description: Vollständiges Datenmodell für Kurspakete
enableToc: true
tags:
  - data-models
  - course-package
  - license
---

# 📦 Course Package Model - Kurspaket-Datenmodell

> [!abstract] Übersicht
> Das Course Package Model repräsentiert Kurspakete, die mehrere Kurse enthalten und Klassen zugewiesen werden können.

## Verwandte Dokumentation

- **Teacher School Management:** [[01_Features/Dashboard/Teacher/School_Management|School Management]] - Kurspakete bestellen
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Kurspakete zuweisen
- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurse im Paket

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE course_packages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL, -- z.B. "Digital Grundbildung & Coding Sek. I"
  description TEXT,
  thumbnail_url TEXT,
  
  -- Lizenzen
  license_count INTEGER NOT NULL DEFAULT 0, -- Anzahl Schülerlizenzen
  free_license_count INTEGER NOT NULL DEFAULT 0, -- Anzahl kostenloser Lizenzen
  
  -- Preis
  price_per_student DECIMAL(10, 2), -- Preis pro Schüler
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indizes
  INDEX idx_is_active (is_active),
  INDEX idx_is_available (is_available)
);

-- Kurse im Paket (Many-to-Many)
CREATE TABLE course_package_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_package_id UUID NOT NULL REFERENCES course_packages(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(course_package_id, course_id),
  INDEX idx_course_package_id (course_package_id),
  INDEX idx_course_id (course_id),
  INDEX idx_order_index (order_index)
);
```

## TypeScript Interface

```typescript
// course-package.model.ts
export interface CoursePackage {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  title: string; // z.B. "Digital Grundbildung & Coding Sek. I"
  description?: string;
  thumbnailUrl?: string;
  
  // Lizenzen
  licenseCount: number; // Anzahl Schülerlizenzen
  freeLicenseCount: number; // Anzahl kostenloser Lizenzen
  
  // Preis
  pricePerStudent?: number;
  currency: string; // 'EUR'
  
  // Status
  isActive: boolean;
  isAvailable: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  courses?: CoursePackageCourse[];
  classPackages?: ClassCoursePackage[];
}

export interface CoursePackageCourse {
  id: string;
  coursePackageId: string;
  courseId: string;
  orderIndex: number;
  createdAt: Date;
  
  // Relations
  coursePackage?: CoursePackage;
  course?: Course;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `title`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Beschreibung:** Kurspaket-Name (z.B. "Digital Grundbildung & Coding Sek. I")

#### `description`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Kurspaket-Beschreibung

#### `thumbnail_url`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** URL zum Kurspaket-Thumbnail

### Lizenzen

#### `license_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl Schülerlizenzen im Paket

#### `free_license_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl kostenloser Lizenzen (z.B. durch Förderer)

### Preis

#### `price_per_student`
- **Typ:** DECIMAL(10, 2)
- **Pflicht:** Nein
- **Beschreibung:** Preis pro Schüler

#### `currency`
- **Typ:** VARCHAR(10)
- **Pflicht:** Ja
- **Default:** 'EUR'
- **Beschreibung:** Währung

### Status

#### `is_active`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** true
- **Beschreibung:** Ob Kurspaket aktiv ist

#### `is_available`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** true
- **Beschreibung:** Ob Kurspaket verfügbar ist

## Beziehungen

### Zu anderen Modellen

- **Courses:** `course_package_courses.course_id` → `courses.id` (Many-to-Many)
- **Classes:** `class_course_packages.course_package_id` → `course_packages.id` (Many-to-Many)

## Beispiel-Daten

```json
{
  "id": "ff0e8400-e29b-41d4-a716-446655440012",
  "title": "Digital Grundbildung & Coding Sek. I",
  "description": "Umfassendes Kurspaket für digitale Grundbildung...",
  "thumbnailUrl": "https://cdn.example.com/packages/digital-grundbildung.jpg",
  "licenseCount": 30,
  "freeLicenseCount": 0,
  "pricePerStudent": 29.99,
  "currency": "EUR",
  "isActive": true,
  "isAvailable": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Kurspakete enthalten mehrere Kurse
> - Lizenzen sind pro Schuljahr gültig
> - Preis kann pro Schüler oder pauschal sein
> - Cache Kurspaket-Statistiken für Performance
