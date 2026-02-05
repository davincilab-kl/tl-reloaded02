---
title: Project Version Model - Versions-Datenmodell
description: Vollständiges Datenmodell für Projekt-Versionen
enableToc: true
tags:
  - data-models
  - project
  - version
  - scratch
---

# 📝 Project Version Model - Versions-Datenmodell

> [!abstract] Übersicht
> Das Project Version Model speichert die Versions-Historie von Scratch-Projekten für Auto-Save, Versions-Wiederherstellung und Änderungs-Tracking.

## Verwandte Dokumentation

- **Scratch Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Versions-System
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Haupt-Projekt-Modell

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE project_versions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zuordnung
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL, -- Versions-Nummer (1, 2, 3, ...)
  
  -- Scratch-Daten
  scratch_data JSONB NOT NULL, -- Vollständige Scratch-Projekt-Daten dieser Version
  
  -- Änderungen
  changes TEXT, -- Beschreibung der Änderungen (optional)
  change_summary JSONB, -- Automatische Änderungs-Zusammenfassung
  
  -- Autor
  author_id UUID NOT NULL REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(project_id, version), -- Jede Version ist eindeutig pro Projekt
  CONSTRAINT chk_version_positive CHECK (version > 0),
  
  -- Indizes
  INDEX idx_project_id (project_id),
  INDEX idx_version (version),
  INDEX idx_created_at (created_at)
);
```

## TypeScript Interface

```typescript
// project-version.model.ts
export interface ProjectVersion {
  // Primary Key
  id: string;
  
  // Zuordnung
  projectId: string;
  version: number; // Versions-Nummer (1, 2, 3, ...)
  
  // Scratch-Daten
  scratchData: ScratchProjectData; // Vollständige Scratch-Daten
  
  // Änderungen
  changes?: string; // Beschreibung der Änderungen
  changeSummary?: ChangeSummary; // Automatische Zusammenfassung
  
  // Autor
  authorId: string;
  
  // Timestamps
  createdAt: Date;
  
  // Relations (nicht in DB)
  project?: Project;
  author?: User;
}

export interface ChangeSummary {
  blocksAdded: number;
  blocksRemoved: number;
  spritesAdded: number;
  spritesRemoved: number;
  soundsAdded: number;
  soundsRemoved: number;
  costumesAdded: number;
  costumesRemoved: number;
}
```

## Felder-Erklärung

### Zuordnung

#### `project_id`
- **Typ:** UUID
- **Pflicht:** Ja
- **Foreign Key:** projects(id)
- **Beschreibung:** Zu welchem Projekt gehört diese Version?
- **Cascade:** ON DELETE CASCADE

#### `version`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Min:** 1
- **Beschreibung:** Versions-Nummer (1, 2, 3, ...)
- **Unique:** Zusammen mit project_id (UNIQUE(project_id, version))

### Scratch-Daten

#### `scratch_data`
- **Typ:** JSONB
- **Pflicht:** Ja
- **Beschreibung:** Vollständige Scratch-Projekt-Daten dieser Version
- **Struktur:** Identisch zu `projects.scratch_data`

### Änderungen

#### `changes`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Manuelle Beschreibung der Änderungen (optional)

#### `change_summary`
- **Typ:** JSONB
- **Pflicht:** Nein
- **Beschreibung:** Automatische Zusammenfassung der Änderungen
- **Struktur:**
  ```json
  {
    "blocksAdded": 5,
    "blocksRemoved": 2,
    "spritesAdded": 1,
    "spritesRemoved": 0,
    "soundsAdded": 0,
    "soundsRemoved": 0,
    "costumesAdded": 0,
    "costumesRemoved": 0
  }
  ```

### Autor

#### `author_id`
- **Typ:** UUID
- **Pflicht:** Ja
- **Foreign Key:** users(id)
- **Beschreibung:** Wer hat diese Version erstellt?

### Timestamps

#### `created_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Default:** NOW()
- **Beschreibung:** Wann wurde diese Version erstellt?

## Beziehungen

### Zu anderen Modellen

- **Project:** `project_versions.project_id` → `projects.id` (Many-to-One)
- **User (Author):** `project_versions.author_id` → `users.id` (Many-to-One)

## Versions-Management

### Auto-Save

- **Trigger:** Alle 30 Sekunden (wenn Änderungen vorhanden)
- **Prozess:** Neue Version wird erstellt
- **Version-Nummer:** Auto-Increment basierend auf aktueller Version

### Manuelles Speichern

- **Trigger:** Benutzer klickt "Speichern"
- **Prozess:** Neue Version wird erstellt
- **Version-Nummer:** Auto-Increment

### Versions-Wiederherstellung

- **Prozess:** Benutzer wählt Version aus
- **Aktion:** Neue Version wird aus ausgewählter Version erstellt
- **Version-Nummer:** Auto-Increment

### Versions-Historie

- **Anzeige:** Alle Versionen eines Projekts
- **Sortierung:** Nach `created_at` (neueste zuerst)
- **Limit:** Optional: Nur letzte N Versionen behalten

## Beispiel-Daten

```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440008",
  "projectId": "aa0e8400-e29b-41d4-a716-446655440007",
  "version": 5,
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
  "changes": "Neue Sprite hinzugefügt, Bewegungs-Blöcke aktualisiert",
  "changeSummary": {
    "blocksAdded": 5,
    "blocksRemoved": 2,
    "spritesAdded": 1,
    "spritesRemoved": 0,
    "soundsAdded": 0,
    "soundsRemoved": 0,
    "costumesAdded": 0,
    "costumesRemoved": 0
  },
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T09:45:00Z"
}
```

## Performance-Überlegungen

### Versions-Limit

- **Empfehlung:** Max. 100 Versionen pro Projekt
- **Cleanup:** Alte Versionen können archiviert werden
- **Storage:** JSONB-Daten können groß sein

### Indizierung

- **Primary Index:** (project_id, version) für schnelle Lookups
- **Time Index:** created_at für Historie-Anzeige

> [!tip] Implementation Hint
> - Implementiere Versions-Limit (z.B. max. 100 Versionen)
> - Automatische Änderungs-Erkennung für `change_summary`
> - Versions-Cleanup für alte Projekte
> - Komprimierung für JSONB-Daten (optional)
> - Cache letzte N Versionen für schnellen Zugriff
