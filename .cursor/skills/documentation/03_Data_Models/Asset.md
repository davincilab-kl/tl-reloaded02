---
title: Asset Model - Asset-Datenmodell
description: Vollständiges Datenmodell für Assets (Scratch-Projekt-Assets)
enableToc: true
tags:
  - data-models
  - asset
  - storage
  - scratch
---

# 📎 Asset Model - Asset-Datenmodell

> [!abstract] Übersicht
> Das Asset Model repräsentiert Assets (Bilder, Sounds, etc.) für Scratch-Projekte, die in S3 gespeichert werden.

## Verwandte Dokumentation

- **Scratch Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Asset-Management
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekte mit Assets

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE assets (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zuordnung
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Asset-Informationen
  asset_id VARCHAR(255) NOT NULL, -- Scratch Asset ID
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'image', 'sound', 'costume', 'sprite'
  format VARCHAR(20), -- 'png', 'jpg', 'svg', 'wav', 'mp3', etc.
  
  -- Storage
  url TEXT NOT NULL, -- S3/CDN URL
  s3_key TEXT NOT NULL, -- S3 Key
  bucket VARCHAR(100) NOT NULL DEFAULT 'scratch-assets',
  
  -- Metadaten
  size INTEGER NOT NULL, -- Größe in Bytes
  width INTEGER, -- Breite (für Bilder)
  height INTEGER, -- Höhe (für Bilder)
  duration INTEGER, -- Dauer in Sekunden (für Sounds)
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_type CHECK (type IN ('image', 'sound', 'costume', 'sprite')),
  CONSTRAINT chk_size CHECK (size > 0),
  
  -- Indizes
  INDEX idx_project_id (project_id),
  INDEX idx_asset_id (asset_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

## TypeScript Interface

```typescript
// asset.model.ts
export enum AssetType {
  IMAGE = 'image',
  SOUND = 'sound',
  COSTUME = 'costume',
  SPRITE = 'sprite'
}

export interface Asset {
  // Primary Key
  id: string;
  
  // Zuordnung
  projectId: string;
  
  // Asset-Informationen
  assetId: string; // Scratch Asset ID
  name: string;
  type: AssetType;
  format?: string; // 'png', 'jpg', 'svg', 'wav', 'mp3', etc.
  
  // Storage
  url: string; // S3/CDN URL
  s3Key: string; // S3 Key
  bucket: string; // S3 Bucket
  
  // Metadaten
  size: number; // Bytes
  width?: number; // Für Bilder
  height?: number; // Für Bilder
  duration?: number; // Sekunden (für Sounds)
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  
  // Relations (nicht in DB)
  project?: Project;
}
```

## Felder-Erklärung

### Asset-Informationen

#### `asset_id`
- **Typ:** VARCHAR(255)
- **Pflicht:** Ja
- **Beschreibung:** Scratch Asset ID (eindeutig innerhalb Scratch)

#### `type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'image' - Bild
  - 'sound' - Sound
  - 'costume' - Kostüm
  - 'sprite' - Sprite
- **Beschreibung:** Asset-Typ

#### `format`
- **Typ:** VARCHAR(20)
- **Pflicht:** Nein
- **Beschreibung:** Dateiformat (z.B. 'png', 'jpg', 'wav', 'mp3')

### Storage

#### `url`
- **Typ:** TEXT
- **Pflicht:** Ja
- **Beschreibung:** Öffentliche URL (S3/CDN)

#### `s3_key`
- **Typ:** TEXT
- **Pflicht:** Ja
- **Beschreibung:** S3 Key (Pfad in S3)

#### `bucket`
- **Typ:** VARCHAR(100)
- **Pflicht:** Ja
- **Default:** 'scratch-assets'
- **Beschreibung:** S3 Bucket-Name

### Metadaten

#### `size`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Beschreibung:** Dateigröße in Bytes
- **Constraint:** Muss > 0 sein

#### `width` / `height`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Bild-Dimensionen (nur für Bilder)

#### `duration`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Dauer in Sekunden (nur für Sounds)

## Beziehungen

### Zu anderen Modellen

- **Projects:** `assets.project_id` → `projects.id` (One-to-Many)

## Beispiel-Daten

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440019",
  "projectId": "aa0e8400-e29b-41d4-a716-446655440007",
  "assetId": "a1b2c3d4e5f6",
  "name": "cat.png",
  "type": "image",
  "format": "png",
  "url": "https://cdn.example.com/assets/a1b2c3d4e5f6.png",
  "s3Key": "projects/aa0e8400/assets/a1b2c3d4e5f6.png",
  "bucket": "scratch-assets",
  "size": 245678,
  "width": 480,
  "height": 360,
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Assets werden in S3 gespeichert
> - CDN für schnelle Auslieferung
> - Validierung: Prüfe Dateigröße und Format
> - Cleanup: Lösche Assets, wenn Projekt gelöscht wird
> - Cache Asset-URLs für Performance
