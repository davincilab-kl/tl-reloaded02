---
title: Scratch Integration - Komplette Neuentwicklung
description: Vollständige Neuentwicklung der Scratch-Integration (Frontend, Backend, API, Editor, Player)
enableToc: true
tags:
  - features
  - scratch
  - integration
  - technical
  - frontend
  - backend
---

# 🎨 Scratch Integration - Komplette Neuentwicklung

> [!abstract] User Story
> Als Entwickler möchte ich eine vollständig neu entwickelte Scratch-Integration haben, die alle Komponenten (Frontend-Editor, Backend-API, Player, Asset-Management) umfasst und modern, skalierbar und wartbar ist.

## Übersicht

Dieses Dokument beschreibt die **komplette Neuentwicklung** der Scratch-Integration für die Plattform. Es umfasst:
- **Frontend-Editor:** Integrierte Scratch-Editor-Umgebung
- **Backend-API:** RESTful API für Projekt-Verwaltung
- **Player:** Projekt-Player für veröffentlichte Projekte
- **Asset-Management:** Verwaltung von Sprites, Sounds, Backdrops
- **Speicherung & Versionierung:** Auto-Save und Versionshistorie
- **Migration:** Migration vom alten Code zur neuen Implementierung

> [!note] Migration
> Der alte Code kann als Referenz verwendet werden, aber die neue Implementierung wird von Grund auf neu entwickelt.

### Verwandte Features
- **Projekt-Entwicklung:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - User Journey für Projekt-Entwicklung
- **Projekt-Veröffentlichung:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Veröffentlichungs-Workflow
- **Projekt-Anzeige:** [[01_Features/Projects/Project_Display|Project Display]] - Öffentliche Projekt-Galerie
- **Projekt-Review:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Lehrer-Approval-Prozess

## Data Models

- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **Project Version Model:** [[03_Data_Models/Project_Version|Project Version Model]] - Versions-Historie
- **Asset Model:** [[03_Data_Models/Asset|Asset Model]] - Asset-Datenmodell

## Architektur-Übersicht

### System-Komponenten

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Editor     │  │    Player    │  │   Asset      │ │
│  │  Component   │  │  Component   │  │  Manager     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        │ HTTP/REST API
                        │
┌─────────────────────────────────────────────────────────┐
│                 Backend API (Node.js)                   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Project    │  │  Versioning  │  │    Asset     │ │
│  │   Service    │  │   Service    │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        │
┌─────────────────────────────────────────────────────────┐
│              Datenbank & Storage                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │   S3/CDN     │  │   Redis      │ │
│  │  (Projects)  │  │  (Assets)    │  │  (Cache)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Technologie-Stack

#### Frontend
- **Framework:** React 18+ mit TypeScript
- **Scratch-Editor:** Custom Fork von Scratch-GUI (angepasst)
- **State Management:** Zustand oder Redux Toolkit
- **UI Components:** Material-UI oder Tailwind CSS
- **Build Tool:** Vite oder Webpack

#### Backend
- **Runtime:** Node.js 18+ mit TypeScript
- **Framework:** Express.js oder Fastify
- **ORM:** Prisma oder TypeORM
- **Validation:** Zod oder Joi
- **Authentication:** JWT mit Passport.js

#### Datenbank
- **Primary DB:** PostgreSQL für Projekte, Metadaten
- **Cache:** Redis für Session-Management und Caching
- **Storage:** AWS S3 oder ähnlich für Assets (Bilder, Sounds)

#### Scratch-Integration
- **Scratch-VM:** Scratch Virtual Machine (für Player)
- **Scratch-GUI:** Angepasster Fork für Editor
- **Format:** Scratch 3.0 Format (.sb3 JSON)

## Frontend-Editor-Integration

### Editor-Komponente

#### Struktur
```typescript
// Editor.tsx
interface ScratchEditorProps {
  projectId?: string;
  mode: 'create' | 'edit' | 'view';
  onSave?: (scratchData: ScratchProject) => void;
  onPublish?: () => void;
}

const ScratchEditor: React.FC<ScratchEditorProps> = ({
  projectId,
  mode,
  onSave,
  onPublish
}) => {
  // Editor-Implementierung
};
```

#### Features
- **Vollständiger Scratch-Editor:** Alle Standard-Scratch-Funktionen
- **Plattform-Integration:** Speichern, Veröffentlichen direkt aus Editor
- **Auto-Save:** Automatisches Speichern alle 30 Sekunden
- **Versionshistorie:** Zugriff auf frühere Versionen
- **Asset-Upload:** Sprites, Sounds, Backdrops hochladen
- **Vollbild-Modus:** Vollbild-Editor für besseres Arbeiten
- **Responsive Design:** Funktioniert auf Desktop, Tablet, Mobile

#### UI-Elemente

##### Editor-Toolbar
- **Speichern Button:** Manuelles Speichern (Strg+S)
- **Auto-Save Status:** Anzeige des Auto-Save-Status
- **Veröffentlichen Button:** Projekt veröffentlichen
- **Vollbild Toggle:** Vollbild-Modus ein/aus
- **Versionshistorie Button:** Zugriff auf Versionen
- **Zurück Button:** Zurück zur Projekt-Übersicht

##### Editor-Bereiche
- **Block-Palette:** Scratch-Blöcke zum Ziehen
- **Code-Bereich:** Bereich zum Zusammenfügen von Blöcken
- **Stage:** Vorschau der Bühne
- **Sprite-Liste:** Verwaltung von Sprites
- **Asset-Manager:** Upload und Verwaltung von Assets

#### State Management

##### Editor State
```typescript
interface EditorState {
  project: ScratchProject | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  currentVersion: number;
  error: string | null;
}
```

##### Actions
- `loadProject(projectId)`: Projekt laden
- `saveProject(scratchData)`: Projekt speichern
- `autoSave(scratchData)`: Auto-Save auslösen
- `publishProject()`: Projekt veröffentlichen
- `loadVersion(version)`: Spezifische Version laden
- `uploadAsset(file)`: Asset hochladen

#### Veröffentlichung aus dem Editor

##### Veröffentlichungs-Dialog
Der Editor enthält einen "Veröffentlichen" Button in der Toolbar, der einen Veröffentlichungs-Dialog öffnet.

**Dialog-Struktur:**
```typescript
interface PublishDialogProps {
  projectId: string;
  projectTitle: string;
  onPublish: (data: PublishData) => void;
  onCancel: () => void;
}

interface PublishData {
  title: string;
  description: string;
  tags?: string[];
  instructions?: string;
  credits?: string;
  thumbnail?: string; // base64 oder URL
  visibility: 'public' | 'class';
}
```

**Dialog-Felder:**
- **Projektname:** Bearbeitbares Feld (vorausgefüllt mit aktuellem Namen)
- **Beschreibung:** Pflichtfeld (min. 20 Zeichen empfohlen)
- **Tags/Kategorien:** Optional - Für bessere Auffindbarkeit
- **Anleitung:** Optional - Wie spielt man das Projekt?
- **Credits:** Optional - Danksagungen oder Inspirationen
- **Thumbnail:** Optional - Vorschaubild (automatisch generiert oder hochgeladen)
- **Sichtbarkeit:**
  - "Öffentlich" - Für alle sichtbar
  - "Nur Klasse" - Nur für Klassenmitglieder sichtbar

**Validierung:**
- Projektname: Max. 25 Zeichen
- Beschreibung: Min. 20 Zeichen empfohlen, max. 400 Zeichen
- Projekt muss funktionsfähig sein (automatische Prüfung)

**Workflow:**
1. Schüler klickt "Veröffentlichen" Button im Editor
2. Veröffentlichungs-Dialog öffnet sich
3. Schüler füllt Pflichtfelder aus (Name, Beschreibung)
4. Optional: Tags, Anleitung, Credits, Thumbnail
5. Sichtbarkeit wählen (Öffentlich oder Nur Klasse)
6. "Zur Veröffentlichung einreichen" Button klicken
7. Bestätigungsdialog
8. Projekt wird als "Zur Veröffentlichung eingereicht" markiert
9. Status: "Wartet auf Lehrer-Approval"
10. Schüler wird benachrichtigt, wenn Lehrer das Projekt approviert

**Integration mit Backend:**
```typescript
// Publish API Call
const publishProject = async (projectId: string, publishData: PublishData) => {
  const response = await fetch(`/api/v1/projects/${projectId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visibility: publishData.visibility,
      description: publishData.description,
      tags: publishData.tags,
      thumbnail: publishData.thumbnail
    })
  });
  
  const result = await response.json();
  // Status ändert sich zu "submitted_for_review"
  return result;
};
```

**Nach Veröffentlichung:**
- Projekt wird aus Editor geschlossen (optional)
- Schüler wird zu Projekt-Übersicht weitergeleitet
- Status wird angezeigt: "Wartet auf Lehrer-Approval"
- Schüler kann Projekt weiter bearbeiten, aber nicht erneut einreichen bis Approval

**Siehe auch:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] für vollständigen Veröffentlichungs-Workflow

#### Integration mit Backend

##### API-Calls
```typescript
// api/projects.ts
export const projectAPI = {
  create: async (data: CreateProjectRequest) => {
    return fetch('/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  
  save: async (projectId: string, scratchData: ScratchProject) => {
    return fetch(`/api/v1/projects/${projectId}/scratch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scratchData, autoSave: true })
    });
  },
  
  load: async (projectId: string) => {
    return fetch(`/api/v1/projects/${projectId}/scratch`);
  }
};
```

#### Event-Handling

##### Scratch-Editor Events
- **onProjectChanged:** Wird ausgelöst bei Änderungen
- **onSave:** Wird ausgelöst beim Speichern
- **onPublish:** Wird ausgelöst beim Veröffentlichen
- **onAssetUpload:** Wird ausgelöst beim Asset-Upload

##### Auto-Save Mechanismus
```typescript
useEffect(() => {
  if (!autoSaveEnabled || !isDirty) return;
  
  const timer = setTimeout(() => {
    handleAutoSave();
  }, 30000); // 30 Sekunden
  
  return () => clearTimeout(timer);
}, [isDirty, autoSaveEnabled]);
```

## Backend-API-Architektur

### Grundprinzipien
- **RESTful API:** REST-konforme Endpunkte
- **JSON:** Alle Requests und Responses in JSON
- **Authentifizierung:** JWT-basierte Authentifizierung
- **Versionierung:** API-Versionierung über URL-Pfad (`/api/v1/`)
- **Fehlerbehandlung:** Konsistente Fehler-Responses
- **TypeScript:** Vollständige Type-Safety

## Authentifizierung

### JWT-Token
- **Header:** `Authorization: Bearer <token>`
- **Token-Erstellung:** Bei Login/Registrierung
- **Token-Refresh:** Refresh-Token für längere Sessions
- **Token-Validierung:** Bei jedem Request

### Rollen & Berechtigungen
- **Schüler:** Kann eigene Projekte erstellen, bearbeiten, löschen
- **Lehrer:** Kann Projekte seiner Schüler ansehen, kommentieren
- **Admin:** Vollzugriff auf alle Projekte

## Endpunkte

### Projekt-Verwaltung

#### Projekte auflisten
```
GET /api/v1/projects
```

**Query-Parameter:**
- `userId` (optional): Filter nach Benutzer-ID
- `status` (optional): Filter nach Status (draft, published, archived)
- `limit` (optional): Anzahl der Ergebnisse (Standard: 20)
- `offset` (optional): Pagination-Offset

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "Mein Projekt",
      "description": "Beschreibung",
      "status": "draft",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T11:00:00Z",
      "thumbnailUrl": "https://...",
      "author": {
        "id": "uuid",
        "name": "Max Mustermann"
      }
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### Projekt erstellen
```
POST /api/v1/projects
```

**Request Body:**
```json
{
  "title": "Neues Projekt",
  "description": "Beschreibung des Projekts",
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {...}
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Neues Projekt",
  "status": "draft",
  "createdAt": "2025-01-15T10:00:00Z",
  "scratchProjectId": "scratch-uuid"
}
```

#### Projekt abrufen
```
GET /api/v1/projects/{projectId}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Mein Projekt",
  "description": "Beschreibung",
  "status": "published",
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {...}
  },
  "author": {
    "id": "uuid",
    "name": "Max Mustermann"
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T11:00:00Z",
  "versions": [
    {
      "version": 1,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Projekt aktualisieren
```
PUT /api/v1/projects/{projectId}
```

**Request Body:**
```json
{
  "title": "Aktualisierter Titel",
  "description": "Aktualisierte Beschreibung",
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {...}
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Aktualisierter Titel",
  "updatedAt": "2025-01-15T12:00:00Z",
  "version": 2
}
```

#### Projekt löschen
```
DELETE /api/v1/projects/{projectId}
```

**Response:**
```json
{
  "success": true,
  "message": "Projekt wurde gelöscht"
}
```

### Scratch-Daten-Verwaltung

#### Scratch-Projekt speichern
```
POST /api/v1/projects/{projectId}/scratch
```

**Request Body:**
```json
{
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {
      "semver": "3.0.0",
      "vm": "0.2.0",
      "agent": "Mozilla/5.0..."
    }
  },
  "autoSave": true
}
```

**Response:**
```json
{
  "success": true,
  "savedAt": "2025-01-15T10:30:00Z",
  "version": 3
}
```

#### Scratch-Projekt laden
```
GET /api/v1/projects/{projectId}/scratch
```

**Response:**
```json
{
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {...}
  },
  "version": 3,
  "lastSaved": "2025-01-15T10:30:00Z"
}
```

### Versionierung

#### Versionen auflisten
```
GET /api/v1/projects/{projectId}/versions
```

**Response:**
```json
{
  "versions": [
    {
      "version": 3,
      "createdAt": "2025-01-15T10:30:00Z",
      "author": {
        "id": "uuid",
        "name": "Max Mustermann"
      },
      "changes": "Auto-save"
    },
    {
      "version": 2,
      "createdAt": "2025-01-15T10:15:00Z",
      "author": {
        "id": "uuid",
        "name": "Max Mustermann"
      },
      "changes": "Projekt aktualisiert"
    }
  ],
  "currentVersion": 3
}
```

#### Spezifische Version abrufen
```
GET /api/v1/projects/{projectId}/versions/{version}
```

**Response:**
```json
{
  "version": 2,
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {...}
  },
  "createdAt": "2025-01-15T10:15:00Z"
}
```

#### Version wiederherstellen
```
POST /api/v1/projects/{projectId}/versions/{version}/restore
```

**Response:**
```json
{
  "success": true,
  "restoredVersion": 2,
  "newVersion": 4,
  "message": "Version 2 wurde wiederhergestellt"
}
```

### Auto-Save

#### Auto-Save aktivieren
```
POST /api/v1/projects/{projectId}/autosave
```

**Request Body:**
```json
{
  "enabled": true,
  "interval": 30
}
```

**Response:**
```json
{
  "success": true,
  "autosaveEnabled": true,
  "interval": 30
}
```

#### Auto-Save Status
```
GET /api/v1/projects/{projectId}/autosave
```

**Response:**
```json
{
  "enabled": true,
  "interval": 30,
  "lastSaved": "2025-01-15T10:30:00Z",
  "nextSave": "2025-01-15T11:00:00Z"
}
```

### Projekt-Veröffentlichung

#### Projekt veröffentlichen
```
POST /api/v1/projects/{projectId}/publish
```

**Request Body:**
```json
{
  "visibility": "public",
  "description": "Vollständige Beschreibung",
  "tags": ["game", "scratch"],
  "thumbnail": "base64-encoded-image"
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "uuid",
  "status": "published",
  "publishedAt": "2025-01-15T11:00:00Z",
  "publicUrl": "https://platform.com/projects/uuid"
}
```

#### Veröffentlichung zurückziehen
```
POST /api/v1/projects/{projectId}/unpublish
```

**Response:**
```json
{
  "success": true,
  "status": "draft",
  "message": "Projekt wurde zurückgezogen"
}
```

### Projekt-Player

#### Projekt abspielen
```
GET /api/v1/projects/{projectId}/play
```

**Response:**
```json
{
  "projectId": "uuid",
  "scratchData": {
    "targets": [...],
    "monitors": [...],
    "extensions": [...],
    "meta": {...}
  },
  "playerUrl": "https://platform.com/player/uuid",
  "embedCode": "<iframe src='...'></iframe>"
}
```

### Assets-Verwaltung

#### Asset hochladen
```
POST /api/v1/projects/{projectId}/assets
```

**Request:** Multipart form-data
- `file`: Asset-Datei (Bild, Sound, etc.)
- `type`: Asset-Typ (sprite, sound, backdrop)

**Response:**
```json
{
  "assetId": "uuid",
  "url": "https://cdn.platform.com/assets/uuid",
  "type": "sprite",
  "name": "sprite1.png",
  "size": 1024
}
```

#### Assets auflisten
```
GET /api/v1/projects/{projectId}/assets
```

**Response:**
```json
{
  "assets": [
    {
      "assetId": "uuid",
      "url": "https://cdn.platform.com/assets/uuid",
      "type": "sprite",
      "name": "sprite1.png",
      "size": 1024
    }
  ]
}
```

#### Asset löschen
```
DELETE /api/v1/projects/{projectId}/assets/{assetId}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset wurde gelöscht"
}
```

## Fehlerbehandlung

### Fehler-Response Format
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Projekt wurde nicht gefunden",
    "details": {
      "projectId": "uuid"
    }
  }
}
```

### HTTP-Status-Codes
- `200 OK`: Erfolgreiche Request
- `201 Created`: Ressource wurde erstellt
- `400 Bad Request`: Ungültige Request-Daten
- `401 Unauthorized`: Nicht authentifiziert
- `403 Forbidden`: Keine Berechtigung
- `404 Not Found`: Ressource nicht gefunden
- `409 Conflict`: Konflikt (z.B. gleichzeitige Bearbeitung)
- `500 Internal Server Error`: Server-Fehler

### Fehler-Codes
- `PROJECT_NOT_FOUND`: Projekt existiert nicht
- `UNAUTHORIZED`: Nicht authentifiziert
- `FORBIDDEN`: Keine Berechtigung
- `INVALID_SCRATCH_DATA`: Ungültige Scratch-Daten
- `VERSION_CONFLICT`: Versions-Konflikt
- `ASSET_TOO_LARGE`: Asset zu groß
- `RATE_LIMIT_EXCEEDED`: Rate-Limit überschritten

## Rate Limiting

### Limits
- **Standard:** 100 Requests pro Minute pro Benutzer
- **Auto-Save:** 10 Requests pro Minute pro Projekt
- **Asset-Upload:** 5 Requests pro Minute pro Projekt

### Headers
- `X-RateLimit-Limit`: Maximal erlaubte Requests
- `X-RateLimit-Remaining`: Verbleibende Requests
- `X-RateLimit-Reset`: Zeitpunkt des Resets

## Webhooks (Optional)

### Webhook-Events
- `project.created`: Projekt wurde erstellt
- `project.updated`: Projekt wurde aktualisiert
- `project.published`: Projekt wurde veröffentlicht
- `project.deleted`: Projekt wurde gelöscht
- `version.created`: Neue Version wurde erstellt

### Webhook-Configuration
```
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["project.created", "project.published"],
  "secret": "webhook-secret"
}
```

## Datenmodell

### Projekt-Schema
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "draft|published|archived",
  "scratchData": {
    "targets": "array",
    "monitors": "array",
    "extensions": "array",
    "meta": "object"
  },
  "authorId": "uuid",
  "classId": "uuid",
  "schoolId": "uuid",
  "version": "number",
  "thumbnailUrl": "string",
  "visibility": "public|class|private",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "publishedAt": "datetime"
}
```

### Version-Schema
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "version": "number",
  "scratchData": "object",
  "changes": "string",
  "authorId": "uuid",
  "createdAt": "datetime"
}
```

## Sicherheit

### Datenvalidierung
- **Input-Validation:** Alle Eingaben werden validiert
- **Scratch-Data-Validation:** Scratch-Daten werden auf Validität geprüft
- **Sanitization:** XSS-Schutz für alle Text-Eingaben

### Zugriffskontrolle
- **Projekt-Zugriff:** Nur Autor, Lehrer und Admin können Projekte ansehen/bearbeiten
- **Veröffentlichte Projekte:** Öffentlich sichtbar, aber nur Autor kann bearbeiten
- **Asset-Zugriff:** Assets sind nur für Projekt-Besitzer zugänglich

### Datenverschlüsselung
- **HTTPS:** Alle Requests über HTTPS
- **Sensitive Data:** Sensitive Daten werden verschlüsselt gespeichert
- **Token-Security:** JWT-Tokens haben Ablaufzeit

## Performance

### Caching
- **Projekt-Daten:** Cache für häufig abgerufene Projekte
- **Asset-URLs:** CDN für Asset-Delivery
- **Version-Historie:** Cache für Version-Listen

### Optimierungen
- **Pagination:** Alle Listen-Endpunkte unterstützen Pagination
- **Lazy Loading:** Assets werden bei Bedarf geladen
- **Compression:** Gzip-Kompression für Responses

## Player-Integration

### Player-Komponente

#### Struktur
```typescript
// Player.tsx
interface ScratchPlayerProps {
  projectId: string;
  mode?: 'play' | 'embed' | 'fullscreen';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const ScratchPlayer: React.FC<ScratchPlayerProps> = ({
  projectId,
  mode = 'play',
  onLoad,
  onError
}) => {
  // Player-Implementierung
};
```

#### Features
- **Scratch-VM Integration:** Nutzung der Scratch Virtual Machine
- **Projekt-Laden:** Automatisches Laden von Projekt-Daten
- **Vollbild-Modus:** Vollbild-Player für besseres Spielerlebnis
- **Embed-Modus:** Einbettbar in andere Seiten (iframe)
- **Responsive Design:** Funktioniert auf allen Geräten
- **Touch-Support:** Touch-Steuerung für mobile Geräte

#### Player-UI
- **Play/Pause Button:** Projekt starten/pausieren
- **Reset Button:** Projekt zurücksetzen
- **Fullscreen Toggle:** Vollbild-Modus
- **Loading Indicator:** Ladeanzeige während Projekt geladen wird
- **Error Handling:** Fehleranzeige bei Problemen

#### Integration
```typescript
// Player-Logik
useEffect(() => {
  const loadProject = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/play`);
      const data = await response.json();
      
      // Scratch-VM initialisieren
      const vm = new VirtualMachine();
      vm.loadProject(data.scratchData);
      
      // Player rendern
      renderPlayer(vm);
      
      onLoad?.();
    } catch (error) {
      onError?.(error);
    }
  };
  
  loadProject();
}, [projectId]);
```

## Asset-Management

### Asset-Service

#### Asset-Typen
- **Sprites:** Bilder für Sprites (PNG, SVG)
- **Sounds:** Audio-Dateien (WAV, MP3)
- **Backdrops:** Hintergrundbilder (PNG, SVG)

#### Asset-Upload
```typescript
// Asset-Upload-Komponente
interface AssetUploadProps {
  projectId: string;
  type: 'sprite' | 'sound' | 'backdrop';
  onUploadComplete: (asset: Asset) => void;
}

const AssetUpload: React.FC<AssetUploadProps> = ({
  projectId,
  type,
  onUploadComplete
}) => {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(
      `/api/v1/projects/${projectId}/assets`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    const asset = await response.json();
    onUploadComplete(asset);
  };
};
```

#### Asset-Validierung
- **Dateigröße:** Max. 10MB pro Asset
- **Dateiformate:** Nur erlaubte Formate (PNG, SVG, WAV, MP3)
- **Dimensionen:** Sprites max. 480x360px
- **Komprimierung:** Automatische Komprimierung bei Upload

#### Asset-Storage
- **CDN:** Assets werden auf CDN gespeichert
- **Optimierung:** Automatische Bildoptimierung
- **Caching:** Browser-Caching für bessere Performance
- **Versionierung:** Asset-Versionierung bei Updates

## Speicherung & Versionierung

### Auto-Save Mechanismus

> [!important] Queue-System
> Auto-Save verwendet ein **Queue-System (BullMQ)** für bessere Performance und Skalierbarkeit. Siehe [[00_Blueprint/Performance_Guidelines|Performance Guidelines]] für Details.

#### Frontend-Implementierung
```typescript
// Auto-Save Hook mit Queue
import { debounce } from 'lodash';

const useAutoSave = (projectId: string, scratchData: ScratchProject) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const debouncedSave = useMemo(
    () => debounce(async (data: ScratchProject) => {
      setIsSaving(true);
      try {
        // Job in Queue einreihen (nicht direkt speichern)
        await fetch('/api/v1/projects/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            scratchData: data,
            priority: 'low' // Auto-Save hat niedrige Priorität
          })
        });
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 30000), // 30 Sekunden Debounce
    [projectId]
  );
  
  useEffect(() => {
    if (!projectId || !scratchData) return;
    
    debouncedSave(scratchData);
    
    return () => {
      debouncedSave.cancel();
    };
  }, [projectId, scratchData, debouncedSave]);
  
  return { isSaving, lastSaved };
};
```

#### Backend-Queue-Implementierung
```typescript
// Auto-Save Queue (BullMQ)
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// Auto-Save Queue
export const autoSaveQueue = new Queue('autosave', { connection });

// Worker für Auto-Save
export const autoSaveWorker = new Worker(
  'autosave',
  async (job) => {
    const { projectId, scratchData, userId } = job.data;
    
    // Validierung
    validateScratchData(scratchData);
    
    // Version erstellen
    const version = await createVersion(
      projectId,
      scratchData,
      userId,
      'Auto-save'
    );
    
    // Projekt aktualisieren
    await updateProject(projectId, {
      scratchData,
      version: version.version,
      lastSavedAt: new Date()
    });
  },
  {
    connection,
    concurrency: 10, // Max. 10 gleichzeitige Jobs
    limiter: {
      max: 100, // Max. 100 Jobs pro Minute
      duration: 60000
    }
  }
);

// Auto-Save Endpoint
@Post('/projects/autosave')
async autoSave(@Body() dto: AutoSaveDto) {
  // Job in Queue einreihen
  await autoSaveQueue.add(
    `autosave:${dto.projectId}`,
    {
      projectId: dto.projectId,
      scratchData: dto.scratchData,
      userId: dto.userId
    },
    {
      jobId: `autosave:${dto.projectId}`, // Deduplication
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  );
  
  return { success: true, queued: true };
}
```

#### Vorteile des Queue-Systems
- **Skalierbarkeit:** Kann viele gleichzeitige Auto-Saves verarbeiten
- **Performance:** Nicht-blockierend für API
- **Reliability:** Retry-Mechanismus bei Fehlern
- **Deduplication:** Verhindert doppelte Saves
- **Priorisierung:** Manuelle Saves haben höhere Priorität

### Versionshistorie

#### Version-Management
- **Automatische Versionen:** Bei jedem Auto-Save
- **Manuelle Versionen:** Bei explizitem Speichern
- **Version-Labels:** Optional: Beschreibung der Änderungen
- **Version-Vergleich:** Diff zwischen Versionen

#### Version-Wiederherstellung
```typescript
// Version wiederherstellen
const restoreVersion = async (
  projectId: string,
  version: number
) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/versions/${version}/restore`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  // Neue Version wurde erstellt
  return data.newVersion;
};
```

## Datenbank-Schema

### PostgreSQL Schema

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  school_id UUID REFERENCES schools(id),
  version INTEGER NOT NULL DEFAULT 1,
  thumbnail_url TEXT,
  visibility VARCHAR(50) NOT NULL DEFAULT 'private',
  scratch_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP,
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

#### Versions Table
```sql
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  scratch_data JSONB NOT NULL,
  changes TEXT,
  author_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, version),
  INDEX idx_project_id (project_id)
);
```

#### Assets Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_project_id (project_id),
  INDEX idx_asset_id (asset_id)
);
```

## Migration vom alten Code

### Migrations-Strategie

#### Phase 1: Analyse
- **Alter Code analysieren:** Bestehende Implementierung verstehen
- **Daten-Migration planen:** Wie werden alte Daten migriert?
- **API-Kompatibilität:** Temporäre Kompatibilität mit altem Code

#### Phase 2: Parallel-Betrieb
- **Neue Implementierung:** Neue Komponenten parallel entwickeln
- **Feature Flags:** Neue Features schrittweise aktivieren
- **A/B Testing:** Neue vs. alte Implementierung testen

#### Phase 3: Migration
- **Daten-Migration:** Alte Projekte in neues Format migrieren
- **User-Migration:** Benutzer schrittweise auf neue UI umstellen
- **Deprecation:** Alte Endpunkte als deprecated markieren

#### Phase 4: Cleanup
- **Alter Code entfernen:** Nach erfolgreicher Migration
- **Dokumentation aktualisieren:** Neue Dokumentation
- **Monitoring:** Performance und Fehler überwachen

### Daten-Migration

#### Migrations-Script
```typescript
// migrate-projects.ts
async function migrateProjects() {
  const oldProjects = await getOldProjects();
  
  for (const oldProject of oldProjects) {
    // Altes Format in neues Format konvertieren
    const newProject = convertProjectFormat(oldProject);
    
    // In neue Datenbank speichern
    await saveNewProject(newProject);
    
    // Assets migrieren
    await migrateAssets(oldProject.id, newProject.id);
  }
}
```

#### Format-Konvertierung
```typescript
function convertProjectFormat(oldProject: OldProject): NewProject {
  return {
    id: oldProject.id,
    title: oldProject.name,
    description: oldProject.description,
    status: mapStatus(oldProject.status),
    scratchData: convertScratchData(oldProject.data),
    // ... weitere Felder
  };
}
```

## Testing-Strategie

### Unit Tests
- **API-Endpunkte:** Alle Endpunkte testen
- **Services:** Business-Logik testen
- **Utilities:** Helper-Funktionen testen

### Integration Tests
- **API-Integration:** Frontend-Backend-Integration
- **Datenbank-Integration:** Datenbank-Operationen testen
- **Asset-Upload:** Asset-Upload-Flow testen

### E2E Tests
- **Editor-Flow:** Kompletter Editor-Workflow
- **Player-Flow:** Projekt laden und abspielen
- **Publishing-Flow:** Projekt veröffentlichen

### Test-Tools
- **Jest:** Unit und Integration Tests
- **React Testing Library:** React-Komponenten testen
- **Playwright:** E2E Tests
- **Supertest:** API Tests

## Deployment

### Build-Prozess
- **Frontend Build:** React-App bauen
- **Backend Build:** TypeScript kompilieren
- **Asset-Optimierung:** Assets optimieren
- **Docker Images:** Container erstellen

### Deployment-Pipeline
1. **Code-Commit:** Git-Repository
2. **CI/CD:** Automatische Tests
3. **Build:** Production-Build erstellen
4. **Deploy:** Deployment auf Server
5. **Monitoring:** Health-Checks und Monitoring

### Environment-Variablen
```env
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
S3_BUCKET=assets-bucket
JWT_SECRET=...

# Frontend
API_URL=https://api.platform.com
CDN_URL=https://cdn.platform.com
```

## Monitoring & Logging

### Logging
- **Structured Logging:** JSON-Formatierte Logs
- **Log-Levels:** Debug, Info, Warn, Error
- **Request-Logging:** Alle API-Requests loggen
- **Error-Logging:** Fehler mit Stack-Traces

### Monitoring
- **Performance-Metriken:** Response-Zeiten, Throughput
- **Error-Rates:** Fehlerrate überwachen
- **Asset-Upload-Metriken:** Upload-Zeiten, Erfolgsrate
- **Auto-Save-Metriken:** Auto-Save-Performance

### Alerting
- **Error-Alerts:** Bei hoher Fehlerrate
- **Performance-Alerts:** Bei langsamen Response-Zeiten
- **Storage-Alerts:** Bei Speicherplatz-Problemen

> [!tip] Implementation Hint
> - Implementiere umfassende Fehlerbehandlung
> - Verwende Rate Limiting für API-Schutz
> - Implementiere Caching für bessere Performance
> - Dokumentiere alle Endpunkte (z.B. mit OpenAPI/Swagger)
> - Implementiere umfassende Tests (Unit, Integration, E2E)
> - Plane Migration sorgfältig mit Rollback-Strategie
> - Implementiere Monitoring und Logging von Anfang an
> - Verwende Feature Flags für schrittweise Einführung
