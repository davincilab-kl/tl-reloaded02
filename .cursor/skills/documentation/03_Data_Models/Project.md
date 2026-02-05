---
title: Project Model - Projekt-Datenmodell
description: Vollständiges Datenmodell für Scratch-Projekte
enableToc: true
tags:
  - data-models
  - project
  - scratch
---

# 🎮 Project Model - Projekt-Datenmodell

> [!abstract] Übersicht
> Das Project Model repräsentiert Scratch-Projekte mit Status, Versionierung, Assets und Veröffentlichungs-Informationen.

## Verwandte Dokumentation

- **Scratch Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Vollständige Integration-Details
- **Project Publishing:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Veröffentlichungs-Workflow
- **Project Review:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Lehrer-Review
- **Version Model:** [[03_Data_Models/Project_Version|Project Version Model]] - Versions-Historie

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE projects (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT, -- Wie spielt man das Projekt?
  credits TEXT, -- Danksagungen oder Inspirationen
  
  -- Status & Veröffentlichung
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'submitted_for_review', 'published', 'archived', 'rejected'
  visibility VARCHAR(50) NOT NULL DEFAULT 'private', -- 'public', 'class', 'private'
  
  -- Scratch-Daten
  scratch_data JSONB NOT NULL, -- Vollständige Scratch-Projekt-Daten
  version INTEGER NOT NULL DEFAULT 1, -- Aktuelle Version
  
  -- Autor & Zuordnung
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  school_id UUID REFERENCES schools(id),
  
  -- Veröffentlichung
  published_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id), -- Lehrer, der reviewed hat
  review_notes TEXT, -- Feedback vom Lehrer
  
  -- Thumbnail & Assets
  thumbnail_url TEXT, -- Vorschaubild URL
  thumbnail_asset_id VARCHAR(255), -- Asset ID für Thumbnail
  
  -- Tags & Kategorien
  tags TEXT[], -- Array von Tags
  
  -- Statistiken
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  
  -- Challenge-Zuordnung
  challenge_id UUID REFERENCES challenges(id), -- Optional: Zu welcher Challenge gehört das Projekt?
  challenge_submission_date TIMESTAMP, -- Wann wurde es für Challenge eingereicht?
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_saved_at TIMESTAMP, -- Letztes Auto-Save
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('draft', 'submitted_for_review', 'published', 'archived', 'rejected')),
  CONSTRAINT chk_visibility CHECK (visibility IN ('public', 'class', 'private')),
  CONSTRAINT chk_title_length CHECK (CHAR_LENGTH(title) <= 25),
  CONSTRAINT chk_description_length CHECK (CHAR_LENGTH(description) <= 400),
  
  -- Indizes
  INDEX idx_author_id (author_id),
  INDEX idx_class_id (class_id),
  INDEX idx_school_id (school_id),
  INDEX idx_status (status),
  INDEX idx_visibility (visibility),
  INDEX idx_challenge_id (challenge_id),
  INDEX idx_published_at (published_at),
  INDEX idx_created_at (created_at),
  INDEX idx_title_search (title gin_trgm_ops), -- Full-Text Search
  INDEX idx_tags (tags) -- GIN Index für Array-Suche
);
```

## TypeScript Interface

```typescript
// project.model.ts
export enum ProjectStatus {
  DRAFT = 'draft', // In Bearbeitung
  SUBMITTED_FOR_REVIEW = 'submitted_for_review', // Zur Veröffentlichung eingereicht
  PUBLISHED = 'published', // Veröffentlicht
  ARCHIVED = 'archived', // Archiviert
  REJECTED = 'rejected' // Abgelehnt
}

export enum ProjectVisibility {
  PUBLIC = 'public', // Öffentlich
  CLASS = 'class', // Nur Klasse
  PRIVATE = 'private' // Privat
}

export interface ScratchProjectData {
  targets: any[];
  monitors: any[];
  extensions: string[];
  meta: {
    semver: string;
    vm: string;
    agent: string;
  };
}

export interface Project {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  title: string; // Max. 25 Zeichen
  description?: string; // Max. 400 Zeichen
  instructions?: string;
  credits?: string;
  
  // Status & Veröffentlichung
  status: ProjectStatus;
  visibility: ProjectVisibility;
  
  // Scratch-Daten
  scratchData: ScratchProjectData;
  version: number; // Aktuelle Version
  
  // Autor & Zuordnung
  authorId: string;
  classId?: string;
  schoolId?: string;
  
  // Veröffentlichung
  publishedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Lehrer User ID
  reviewNotes?: string;
  
  // Thumbnail & Assets
  thumbnailUrl?: string;
  thumbnailAssetId?: string;
  
  // Tags & Kategorien
  tags?: string[];
  
  // Statistiken
  viewCount: number;
  likeCount: number;
  remixCount: number;
  
  // Challenge-Zuordnung
  challengeId?: string;
  challengeSubmissionDate?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt?: Date;
  
  // Relations (nicht in DB)
  author?: User;
  class?: Class;
  school?: School;
  challenge?: Challenge;
  versions?: ProjectVersion[];
  assets?: Asset[];
}
```

## Felder-Erklärung

### Basis-Informationen

#### `title`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Max. Länge:** 25 Zeichen
- **Beschreibung:** Projektname
- **Validierung:** Max. 25 Zeichen

#### `description`
- **Typ:** TEXT
- **Pflicht:** Ja (bei Veröffentlichung)
- **Max. Länge:** 400 Zeichen
- **Min. Länge:** 20 Zeichen (empfohlen)
- **Beschreibung:** Projekt-Beschreibung

#### `instructions`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Wie spielt man das Projekt?

#### `credits`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Danksagungen oder Inspirationen

### Status & Veröffentlichung

#### `status`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'draft'
- **Werte:**
  - 'draft' - In Bearbeitung
  - 'submitted_for_review' - Zur Veröffentlichung eingereicht
  - 'published' - Veröffentlicht
  - 'archived' - Archiviert
  - 'rejected' - Abgelehnt
- **Beschreibung:** Projekt-Status
- **Workflow:** draft → submitted_for_review → published/rejected

#### `visibility`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'private'
- **Werte:**
  - 'public' - Öffentlich (für alle sichtbar)
  - 'class' - Nur Klasse (nur für Klassenmitglieder)
  - 'private' - Privat (nur für Autor)
- **Beschreibung:** Sichtbarkeit des Projekts

### Scratch-Daten

#### `scratch_data`
- **Typ:** JSONB
- **Pflicht:** Ja
- **Beschreibung:** Vollständige Scratch-Projekt-Daten
- **Struktur:** Siehe Scratch-Format

#### `version`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 1
- **Beschreibung:** Aktuelle Version des Projekts
- **Auto-Increment:** Bei jedem Save

### Autor & Zuordnung

#### `author_id`
- **Typ:** UUID
- **Pflicht:** Ja
- **Foreign Key:** users(id)
- **Beschreibung:** Autor des Projekts (Schüler)
- **Cascade:** ON DELETE CASCADE

#### `class_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** classes(id)
- **Beschreibung:** Klasse des Autors

#### `school_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** schools(id)
- **Beschreibung:** Schule des Autors

### Veröffentlichung

#### `published_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Wann wurde Projekt veröffentlicht

#### `reviewed_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Wann wurde Projekt reviewed

#### `reviewed_by`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** users(id)
- **Beschreibung:** Lehrer, der Projekt reviewed hat

#### `review_notes`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Feedback vom Lehrer

### Thumbnail & Assets

#### `thumbnail_url`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** URL zum Thumbnail (S3/CDN)

#### `thumbnail_asset_id`
- **Typ:** VARCHAR(255)
- **Pflicht:** Nein
- **Beschreibung:** Asset ID für Thumbnail

### Tags & Kategorien

#### `tags`
- **Typ:** TEXT[]
- **Pflicht:** Nein
- **Beschreibung:** Array von Tags für bessere Auffindbarkeit
- **Index:** GIN Index für Array-Suche

### Statistiken

#### `view_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl Aufrufe

#### `like_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl Likes

#### `remix_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl Remixes

### Challenge-Zuordnung

#### `challenge_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** challenges(id)
- **Beschreibung:** Zu welcher Challenge gehört das Projekt?

#### `challenge_submission_date`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Wann wurde es für Challenge eingereicht?
- **Automatisch:** Bei Challenge-Einreichung

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

#### `last_saved_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Letztes Auto-Save
- **Verwendung:** Für Auto-Save-Funktionalität

## Beziehungen

### Zu anderen Modellen

- **User (Author):** `projects.author_id` → `users.id` (Many-to-One)
- **Class:** `projects.class_id` → `classes.id` (Many-to-One)
- **School:** `projects.school_id` → `schools.id` (Many-to-One)
- **Challenge:** `projects.challenge_id` → `challenges.id` (Many-to-One)
- **Project Versions:** `project_versions.project_id` → `projects.id` (One-to-Many)
- **Assets:** `assets.project_id` → `projects.id` (One-to-Many)

## Beispiel-Daten

```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440007",
  "title": "Mein erstes Spiel",
  "description": "Ein einfaches Scratch-Spiel mit Katze und Maus",
  "instructions": "Bewege die Katze mit den Pfeiltasten",
  "credits": "Inspiriert von Scratch-Beispielen",
  "status": "published",
  "visibility": "public",
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": ["pen"],
    "meta": {
      "semver": "3.0.0",
      "vm": "0.2.0",
      "agent": "Mozilla/5.0"
    }
  },
  "version": 5,
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "classId": "770e8400-e29b-41d4-a716-446655440002",
  "schoolId": "660e8400-e29b-41d4-a716-446655440001",
  "publishedAt": "2024-01-15T10:00:00Z",
  "reviewedAt": "2024-01-14T14:00:00Z",
  "reviewedBy": "880e8400-e29b-41d4-a716-446655440003",
  "thumbnailUrl": "https://cdn.example.com/thumbnails/aa0e8400.jpg",
  "thumbnailAssetId": "asset_123",
  "tags": ["spiel", "katze", "anfänger"],
  "viewCount": 150,
  "likeCount": 25,
  "remixCount": 3,
  "challengeId": null,
  "challengeSubmissionDate": null,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "lastSavedAt": "2024-01-15T09:45:00Z"
}
```

## Status-Workflow

### Workflow-Diagramm

```
draft
  ↓ (Schüler reicht ein)
submitted_for_review
  ↓ (Lehrer approviert)
published
  ↓ (Optional)
archived

submitted_for_review
  ↓ (Lehrer lehnt ab)
rejected
  ↓ (Schüler kann korrigieren)
draft
```

> [!tip] Implementation Hint
> - Verwende JSONB für `scratch_data` für bessere Performance
> - Implementiere Auto-Save mit `last_saved_at`
> - Cache Statistiken (view_count, like_count) für Performance
> - Implementiere Full-Text-Search mit GIN Index
> - Validierung: Titel max. 25 Zeichen, Beschreibung max. 400 Zeichen
> - Thumbnail sollte automatisch generiert werden (optional)
