---
title: Lesson Model - Lektions-Datenmodell
description: Vollständiges Datenmodell für Lektionen (modular, wiederverwendbar)
enableToc: true
tags:
  - data-models
  - lesson
  - course
  - modular
---

# 📖 Lesson Model - Lektions-Datenmodell

> [!abstract] Übersicht
> Das Lesson Model repräsentiert einzelne Lektionen, die modular in verschiedenen Kursen wiederverwendet werden können.

## Verwandte Dokumentation

- **Admin Course Management:** [[01_Features/Dashboard/Admin/Course_Management|Admin Course Management]] - Lektionen verwalten
- **Student Course Workflow:** [[01_Features/Dashboard/Student/Course_Workflow|Course Workflow]] - Lektionen durcharbeiten
- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurse mit Lektionen
- **Quiz Model:** [[03_Data_Models/Quiz|Quiz Model]] - Quizzes zu Lektionen

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE lessons (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Inhalt
  video_url TEXT, -- Video URL oder Upload
  video_duration INTEGER, -- Dauer in Sekunden
  subtitle_url TEXT, -- Untertitel-URL (optional)
  
  -- Lernkarten
  flashcard_data JSONB, -- Lernkarten-Daten
  
  -- Text-Inhalt
  content TEXT, -- Rich Text Inhalt
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'archived')),
  
  -- Indizes
  INDEX idx_status (status),
  INDEX idx_is_published (is_published),
  INDEX idx_created_at (created_at)
);

-- Lernkarten (separate Tabelle für bessere Struktur)
CREATE TABLE lesson_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  front TEXT NOT NULL, -- Vorderseite (Frage/Begriff)
  back TEXT NOT NULL, -- Rückseite (Antwort/Erklärung)
  image_url TEXT, -- Optional: Bild
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_order_index (order_index)
);

-- Lernmaterial (PDFs, Bilder, etc.)
CREATE TABLE lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'pdf', 'image', 'document'
  file_size INTEGER NOT NULL, -- Größe in Bytes
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_file_type (file_type)
);
```

## TypeScript Interface

```typescript
// lesson.model.ts
export enum LessonStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
  DOCUMENT = 'document'
}

export interface Lesson {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  title: string;
  description?: string;
  
  // Inhalt
  videoUrl?: string;
  videoDuration?: number; // Sekunden
  subtitleUrl?: string;
  
  // Lernkarten
  flashcardData?: FlashcardData;
  
  // Text-Inhalt
  content?: string; // Rich Text
  
  // Status
  status: LessonStatus;
  isPublished: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  flashcards?: Flashcard[];
  materials?: LessonMaterial[];
  quizzes?: Quiz[];
  courseLessons?: CourseLesson[];
}

export interface FlashcardData {
  cards: Flashcard[];
}

export interface Flashcard {
  id: string;
  lessonId: string;
  front: string; // Vorderseite (Frage/Begriff)
  back: string; // Rückseite (Antwort/Erklärung)
  imageUrl?: string;
  orderIndex: number;
  createdAt: Date;
  
  // Relations
  lesson?: Lesson;
}

export interface LessonMaterial {
  id: string;
  lessonId: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
  fileSize: number; // Bytes
  orderIndex: number;
  createdAt: Date;
  
  // Relations
  lesson?: Lesson;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `title`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Beschreibung:** Lektionsname

#### `description`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Lektionsbeschreibung

### Inhalt

#### `video_url`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Video URL oder Upload-Pfad
- **Formate:** MP4, WebM
- **Max. Größe:** 500 MB

#### `video_duration`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Video-Dauer in Sekunden

#### `subtitle_url`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Untertitel-URL (optional)

#### `flashcard_data`
- **Typ:** JSONB
- **Pflicht:** Nein
- **Beschreibung:** Lernkarten-Daten (alternativ in separater Tabelle)
- **Struktur:** Array von Flashcard-Objekten

#### `content`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Rich Text Inhalt
- **Format:** HTML oder Markdown

### Status

#### `status`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'draft'
- **Werte:**
  - 'draft' - Entwurf
  - 'active' - Aktiv
  - 'archived' - Archiviert
- **Beschreibung:** Lektions-Status

#### `is_published`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Ob Lektion veröffentlicht ist

## Lernkarten

### `lesson_flashcards` Tabelle

- **Zweck:** Strukturierte Speicherung von Lernkarten
- **Felder:**
  - `front` - Vorderseite (Frage/Begriff)
  - `back` - Rückseite (Antwort/Erklärung)
  - `image_url` - Optional: Bild
  - `order_index` - Reihenfolge

## Lernmaterial

### `lesson_materials` Tabelle

- **Zweck:** Speicherung von Lernmaterialien (PDFs, Bilder, etc.)
- **Felder:**
  - `file_name` - Dateiname
  - `file_url` - URL zur Datei
  - `file_type` - Typ ('pdf', 'image', 'document')
  - `file_size` - Größe in Bytes
  - `order_index` - Reihenfolge

## Beziehungen

### Zu anderen Modellen

- **Courses:** `course_lessons.lesson_id` → `lessons.id` (Many-to-Many)
- **Quizzes:** `quizzes.lesson_id` → `lessons.id` (One-to-Many)
- **Flashcards:** `lesson_flashcards.lesson_id` → `lessons.id` (One-to-Many)
- **Materials:** `lesson_materials.lesson_id` → `lessons.id` (One-to-Many)

## Beispiel-Daten

```json
{
  "id": "dd0e8400-e29b-41d4-a716-446655440010",
  "title": "Einführung in Scratch",
  "description": "Lerne die Grundlagen von Scratch kennen",
  "videoUrl": "https://cdn.example.com/videos/intro-scratch.mp4",
  "videoDuration": 600,
  "subtitleUrl": "https://cdn.example.com/subtitles/intro-scratch.vtt",
  "content": "<h1>Einführung</h1><p>Scratch ist eine visuelle Programmiersprache...</p>",
  "status": "active",
  "isPublished": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Lektionen sind modular und wiederverwendbar
> - Video-Streaming für große Dateien implementieren
> - Lernkarten können in JSONB oder separater Tabelle gespeichert werden
> - Cache Lektions-Inhalt für Performance
> - Validierung: Prüfe Video-Formate und Dateigrößen
