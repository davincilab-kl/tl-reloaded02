---
title: Class Model - Klassen-Datenmodell
description: Vollständiges Datenmodell für Klassen
enableToc: true
tags:
  - data-models
  - class
  - school
---

# 👥 Class Model - Klassen-Datenmodell

> [!abstract] Übersicht
> Das Class Model repräsentiert Klassen mit Schülern, Lehrern, Kursen und Schuljahr-Zuordnung.

## Verwandte Dokumentation

- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Klassen-Verwaltung
- **School Model:** [[03_Data_Models/School|School Model]] - Schule der Klasse
- **User Model:** [[03_Data_Models/User|User Model]] - Schüler und Lehrer
- **School Year Model:** [[03_Data_Models/School_Year|School Year Model]] - Schuljahr-Zuordnung

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE classes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  name VARCHAR(100) NOT NULL, -- z.B. "5A"
  grade VARCHAR(20), -- Stufe (z.B. "5")
  designation VARCHAR(10), -- Klassenbezeichnung (z.B. "A", "B", "AB")
  
  -- Zuordnung
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  school_year_id UUID NOT NULL REFERENCES school_years(id),
  
  -- Verwaltung
  primary_teacher_id UUID NOT NULL REFERENCES users(id), -- Hauptlehrer
  estimated_students INTEGER, -- Geschätzte Schüleranzahl
  
  -- Zahlungsmethode
  payment_method VARCHAR(50), -- 'license', 'sponsor', 'invoice', 'uew'
  payment_status VARCHAR(50), -- 'pending', 'paid', 'free'
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  transferred_from_class_id UUID REFERENCES classes(id), -- Vorjahresklasse
  
  -- Constraints
  CONSTRAINT chk_payment_method CHECK (payment_method IN ('license', 'sponsor', 'invoice', 'uew')),
  CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'paid', 'free')),
  
  -- Indizes
  INDEX idx_school_id (school_id),
  INDEX idx_school_year_id (school_year_id),
  INDEX idx_primary_teacher_id (primary_teacher_id),
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
);

-- Co-Lehrkräfte (Many-to-Many)
CREATE TABLE class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'co_teacher', -- 'primary', 'co_teacher'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, teacher_id),
  INDEX idx_class_id (class_id),
  INDEX idx_teacher_id (teacher_id)
);

-- Kurspakete der Klasse (Many-to-Many)
CREATE TABLE class_course_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  course_package_id UUID NOT NULL REFERENCES course_packages(id),
  school_year_id UUID NOT NULL REFERENCES school_years(id),
  license_count INTEGER NOT NULL DEFAULT 0, -- Anzahl verwendeter Lizenzen
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, course_package_id, school_year_id),
  INDEX idx_class_id (class_id),
  INDEX idx_course_package_id (course_package_id)
);
```

## TypeScript Interface

```typescript
// class.model.ts
export enum PaymentMethod {
  LICENSE = 'license', // Aus aktuellen Lizenzen
  SPONSOR = 'sponsor', // Gefördert durch TalentsLounge Angels
  INVOICE = 'invoice', // Zahlung per Rechnung
  UEW = 'uew' // Unterrichtsmittel eigener Wahl
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FREE = 'free'
}

export enum ClassTeacherRole {
  PRIMARY = 'primary',
  CO_TEACHER = 'co_teacher'
}

export interface Class {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  name: string; // z.B. "5A"
  grade?: string; // Stufe
  designation?: string; // Klassenbezeichnung
  
  // Zuordnung
  schoolId: string;
  schoolYearId: string;
  
  // Verwaltung
  primaryTeacherId: string;
  estimatedStudents?: number;
  
  // Zahlungsmethode
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  transferredFromClassId?: string; // Vorjahresklasse
  
  // Relations (nicht in DB)
  school?: School;
  schoolYear?: SchoolYear;
  primaryTeacher?: User;
  students?: User[];
  teachers?: ClassTeacher[];
  coursePackages?: ClassCoursePackage[];
}

export interface ClassTeacher {
  id: string;
  classId: string;
  teacherId: string;
  role: ClassTeacherRole;
  createdAt: Date;
  
  // Relations
  class?: Class;
  teacher?: User;
}

export interface ClassCoursePackage {
  id: string;
  classId: string;
  coursePackageId: string;
  schoolYearId: string;
  licenseCount: number;
  createdAt: Date;
  
  // Relations
  class?: Class;
  coursePackage?: CoursePackage;
  schoolYear?: SchoolYear;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `name`
- **Typ:** VARCHAR(100)
- **Pflicht:** Ja
- **Beschreibung:** Klassenname (z.B. "5A")
- **Format:** Kombination aus Stufe und Bezeichnung

#### `grade`
- **Typ:** VARCHAR(20)
- **Pflicht:** Nein
- **Beschreibung:** Stufe (z.B. "5")

#### `designation`
- **Typ:** VARCHAR(10)
- **Pflicht:** Nein
- **Beschreibung:** Klassenbezeichnung (z.B. "A", "B", "AB")

### Zuordnung

#### `school_id`
- **Typ:** UUID
- **Pflicht:** Ja
- **Foreign Key:** schools(id)
- **Beschreibung:** Zugewiesene Schule
- **Cascade:** ON DELETE CASCADE

#### `school_year_id`
- **Typ:** UUID
- **Pflicht:** Ja
- **Foreign Key:** school_years(id)
- **Beschreibung:** Schuljahr der Klasse
- **Wichtig:** Lizenzen sind pro Schuljahr gültig

### Verwaltung

#### `primary_teacher_id`
- **Typ:** UUID
- **Pflicht:** Ja
- **Foreign Key:** users(id)
- **Beschreibung:** Hauptlehrer der Klasse

#### `estimated_students`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Geschätzte Schüleranzahl

### Zahlungsmethode

#### `payment_method`
- **Typ:** VARCHAR(50)
- **Pflicht:** Nein
- **Werte:**
  - 'license' - Aus aktuellen Lizenzen (0,00 €)
  - 'sponsor' - Gefördert durch TalentsLounge Angels (0,00 €)
  - 'invoice' - Zahlung per Rechnung
  - 'uew' - Unterrichtsmittel eigener Wahl
- **Beschreibung:** Zahlungsmethode für Klasse

#### `payment_status`
- **Typ:** VARCHAR(50)
- **Pflicht:** Nein
- **Werte:**
  - 'pending' - Ausstehend
  - 'paid' - Bezahlt
  - 'free' - Kostenlos
- **Beschreibung:** Zahlungsstatus

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

#### `transferred_from_class_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** classes(id)
- **Beschreibung:** Vorjahresklasse (bei Übertragung)
- **Verwendung:** Tracking der Klassen-Übertragung

## Beziehungen

### Zu anderen Modellen

- **School:** `classes.school_id` → `schools.id` (Many-to-One)
- **School Year:** `classes.school_year_id` → `school_years.id` (Many-to-One)
- **Users (Students):** `users.class_id` → `classes.id` (One-to-Many)
- **Users (Teachers):** `class_teachers.teacher_id` → `users.id` (Many-to-Many)
- **Course Packages:** `class_course_packages.course_package_id` → `course_packages.id` (Many-to-Many)

## Co-Lehrkräfte

### `class_teachers` Tabelle

- **Zweck:** Many-to-Many Beziehung zwischen Klassen und Lehrern
- **Felder:**
  - `class_id` - Klasse
  - `teacher_id` - Lehrer
  - `role` - 'primary' oder 'co_teacher'
- **Unique Constraint:** (class_id, teacher_id)

## Kurspakete

### `class_course_packages` Tabelle

- **Zweck:** Many-to-Many Beziehung zwischen Klassen und Kurspaketen
- **Felder:**
  - `class_id` - Klasse
  - `course_package_id` - Kurspaket
  - `school_year_id` - Schuljahr
  - `license_count` - Anzahl verwendeter Lizenzen
- **Unique Constraint:** (class_id, course_package_id, school_year_id)

## Beispiel-Daten

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "5A",
  "grade": "5",
  "designation": "A",
  "schoolId": "660e8400-e29b-41d4-a716-446655440001",
  "schoolYearId": "880e8400-e29b-41d4-a716-446655440006",
  "primaryTeacherId": "880e8400-e29b-41d4-a716-446655440003",
  "estimatedStudents": 25,
  "paymentMethod": "license",
  "paymentStatus": "free",
  "createdAt": "2023-09-01T08:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "transferredFromClassId": null
}
```

## Klassen-Übertragung

### Vorjahresklasse übertragen

- **Prozess:** Klasse wird ins neue Schuljahr übertragen
- **Schüler:** Werden übertragen (Projekte bleiben erhalten)
- **T!Coins:** Historische T!Coins bleiben im alten Schuljahr, neue starten bei 0
- **Tracking:** `transferred_from_class_id` zeigt Vorjahresklasse

> [!tip] Implementation Hint
> - Generiere `name` automatisch aus `grade` + `designation`
> - Implementiere Klassen-Übertragung mit `transferred_from_class_id`
> - T!Coins sollten pro Schuljahr getrackt werden
> - Validierung: Prüfe, ob Lizenzen für Schuljahr verfügbar sind
> - Cache Klassen-Statistiken (Anzahl Schüler, Projekte) für Performance
