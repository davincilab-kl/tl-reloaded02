---
title: Course Model - Kurs-Datenmodell
description: Vollständiges Datenmodell für Kurse (modular aufgebaut)
enableToc: true
tags:
  - data-models
  - course
  - lesson
  - modular
---

# 📚 Course Model - Kurs-Datenmodell

> [!abstract] Übersicht
> Das Course Model repräsentiert Kurse, die modular aus Lektionen aufgebaut werden können. Kurse können in Kurspaketen zusammengestellt werden.

## Verwandte Dokumentation

- **Admin Course Management:** [[01_Features/Dashboard/Admin/Course_Management|Admin Course Management]] - Kurs-Erstellung
- **Student Course Workflow:** [[01_Features/Dashboard/Student/Course_Workflow|Course Workflow]] - Kurs-Durcharbeitung
- **Lesson Model:** [[03_Data_Models/Lesson|Lesson Model]] - Lektionen des Kurses
- **Course Package Model:** [[03_Data_Models/Course_Package|Course Package Model]] - Kurspakete

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE courses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL, -- z.B. "Grundkurs: Coding & Game Design mit Scratch"
  description TEXT NOT NULL,
  thumbnail_url TEXT, -- Kurs-Bild URL
  
  -- Kategorisierung
  category VARCHAR(100), -- z.B. "Coding", "Game Design"
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
  estimated_duration INTEGER, -- Geschätzte Dauer in Minuten
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Reihenfolge
  order_index INTEGER NOT NULL DEFAULT 0, -- Reihenfolge in Kurspaketen
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'archived')),
  CONSTRAINT chk_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  
  -- Indizes
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_difficulty_level (difficulty_level),
  INDEX idx_order_index (order_index),
  INDEX idx_created_at (created_at)
);

-- Kurs-Module/Kapitel (optional, für Strukturierung)
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_course_id (course_id),
  INDEX idx_order_index (order_index)
);

-- Kurs-Lektionen (Many-to-Many mit Reihenfolge)
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id), -- Optional: Zu welchem Modul gehört die Lektion?
  order_index INTEGER NOT NULL DEFAULT 0, -- Reihenfolge im Kurs
  is_required BOOLEAN NOT NULL DEFAULT true, -- Muss Lektion abgeschlossen werden?
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, lesson_id),
  INDEX idx_course_id (course_id),
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_module_id (module_id),
  INDEX idx_order_index (order_index)
);
```

## TypeScript Interface

```typescript
// course.model.ts
export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface Course {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  title: string;
  description: string;
  thumbnailUrl?: string;
  
  // Kategorisierung
  category?: string;
  difficultyLevel?: DifficultyLevel;
  estimatedDuration?: number; // Minuten
  
  // Status
  status: CourseStatus;
  isPublished: boolean;
  
  // Reihenfolge
  orderIndex: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  modules?: CourseModule[];
  lessons?: CourseLesson[];
  coursePackages?: CoursePackageCourse[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  createdAt: Date;
  
  // Relations
  course?: Course;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  courseId: string;
  lessonId: string;
  moduleId?: string;
  orderIndex: number;
  isRequired: boolean;
  createdAt: Date;
  
  // Relations
  course?: Course;
  lesson?: Lesson;
  module?: CourseModule;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `title`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Beschreibung:** Kursname (z.B. "Grundkurs: Coding & Game Design mit Scratch")

#### `description`
- **Typ:** TEXT
- **Pflicht:** Ja
- **Beschreibung:** Vollständige Kursbeschreibung

#### `thumbnail_url`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** URL zum Kurs-Thumbnail
- **Format:** JPG, PNG (empfohlen: 800x450px)

### Kategorisierung

#### `category`
- **Typ:** VARCHAR(100)
- **Pflicht:** Nein
- **Beschreibung:** Kurs-Kategorie (z.B. "Coding", "Game Design")

#### `difficulty_level`
- **Typ:** VARCHAR(50)
- **Pflicht:** Nein
- **Werte:** 'beginner', 'intermediate', 'advanced', 'expert'
- **Beschreibung:** Schwierigkeitsgrad

#### `estimated_duration`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Geschätzte Gesamtdauer in Minuten

### Status

#### `status`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'draft'
- **Werte:**
  - 'draft' - Entwurf
  - 'active' - Aktiv
  - 'archived' - Archiviert
- **Beschreibung:** Kurs-Status

#### `is_published`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Ob Kurs veröffentlicht ist (sichtbar für Lehrer)

### Reihenfolge

#### `order_index`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Reihenfolge in Kurspaketen

## Modulare Struktur

### Module/Kapitel

- **Zweck:** Optionale Strukturierung von Kursen in Module/Kapitel
- **Verwendung:** Für komplexere Kurse mit mehreren Themenbereichen
- **Optional:** Kurse können auch ohne Module erstellt werden

### Lektionen

- **Zuordnung:** Lektionen werden Kursen zugewiesen
- **Reihenfolge:** `order_index` bestimmt Reihenfolge
- **Pflicht:** `is_required` bestimmt, ob Lektion abgeschlossen werden muss
- **Modul:** Optional zu Modul zugewiesen

## Beziehungen

### Zu anderen Modellen

- **Lessons:** `course_lessons.lesson_id` → `lessons.id` (Many-to-Many)
- **Course Modules:** `course_modules.course_id` → `courses.id` (One-to-Many)
- **Course Packages:** `course_package_courses.course_id` → `courses.id` (Many-to-Many)

## Beispiel-Daten

```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440009",
  "title": "Grundkurs: Coding & Game Design mit Scratch",
  "description": "Ein umfassender Grundkurs für Scratch-Programmierung...",
  "thumbnailUrl": "https://cdn.example.com/courses/grundkurs-scratch.jpg",
  "category": "Coding",
  "difficultyLevel": "beginner",
  "estimatedDuration": 1200,
  "status": "active",
  "isPublished": true,
  "orderIndex": 1,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Kurse sind modular aufgebaut - Lektionen können wiederverwendet werden
> - Reihenfolge wird durch `order_index` gesteuert
> - Module sind optional, aber nützlich für komplexe Kurse
> - Cache Kurs-Fortschritt für Performance
> - Validierung: Prüfe, ob alle Lektionen existieren
