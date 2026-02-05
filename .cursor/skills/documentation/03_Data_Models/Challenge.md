---
title: Challenge Model - Challenge-Datenmodell
description: Vollständiges Datenmodell für Challenges/Wettbewerbe
enableToc: true
tags:
  - data-models
  - challenge
  - competition
---

# 🏆 Challenge Model - Challenge-Datenmodell

> [!abstract] Übersicht
> Das Challenge Model repräsentiert Challenges/Wettbewerbe mit automatischer Projekt-Einreichung und Kriterien-Prüfung.

## Verwandte Dokumentation

- **Student Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-Teilnahme
- **Public Challenges:** [[01_Features/Challenges/Public_Challenges|Public Challenges]] - Öffentliche Challenges
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekte für Challenges
- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE challenges (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  challenge_id VARCHAR(50) UNIQUE, -- z.B. "YH2025", "AFEC 24/25"
  thumbnail_url TEXT,
  
  -- Organisator
  organizer_type VARCHAR(50) NOT NULL, -- 'sponsor', 'state', 'platform'
  organizer_id UUID, -- sponsor_id, state_id, oder NULL für platform
  sponsor_id UUID REFERENCES sponsors(id), -- Optional: Förderer
  state VARCHAR(50), -- Optional: Bundesland
  
  -- Zeitplan
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL, -- Deadline
  results_date TIMESTAMP, -- Wann werden Ergebnisse bekannt gegeben?
  
  -- Gebiet
  region_type VARCHAR(50) NOT NULL DEFAULT 'all', -- 'all', 'state', 'regional'
  region_states VARCHAR(50)[], -- Array von Bundesländern (wenn region_type = 'state')
  region_description TEXT, -- z.B. "Wien und Umgebung"
  
  -- Kriterien (JSONB für flexible Kriterien)
  criteria JSONB NOT NULL, -- Automatische Kriterien-Prüfung
  project_type VARCHAR(50), -- 'game', 'art', 'coding', etc.
  
  -- Bewertung
  evaluation_criteria TEXT, -- Bewertungskriterien
  jury_count INTEGER, -- Anzahl Juroren
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'active', 'ended', 'results_published'
  is_public BOOLEAN NOT NULL DEFAULT true,
  
  -- Preise
  prizes JSONB, -- Preis-Struktur (z.B. {"first": "1000€", "second": "500€"})
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_organizer_type CHECK (organizer_type IN ('sponsor', 'state', 'platform')),
  CONSTRAINT chk_region_type CHECK (region_type IN ('all', 'state', 'regional')),
  CONSTRAINT chk_status CHECK (status IN ('upcoming', 'active', 'ended', 'results_published')),
  CONSTRAINT chk_dates CHECK (end_date > start_date),
  
  -- Indizes
  INDEX idx_organizer_type (organizer_type),
  INDEX idx_sponsor_id (sponsor_id),
  INDEX idx_state (state),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_challenge_id (challenge_id)
);

-- Challenge-Einreichungen (Projekte)
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewed', 'winner', 'finalist'
  rank INTEGER, -- Platzierung (1, 2, 3, etc.)
  
  -- Bewertung
  score DECIMAL(10, 2), -- Gesamt-Score
  jury_scores JSONB, -- Scores pro Juror
  
  -- Timestamps
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_status CHECK (status IN ('submitted', 'reviewed', 'winner', 'finalist')),
  UNIQUE(challenge_id, project_id), -- Ein Projekt kann nur einmal pro Challenge eingereicht werden
  
  -- Indizes
  INDEX idx_challenge_id (challenge_id),
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_rank (rank),
  INDEX idx_submitted_at (submitted_at)
);
```

## TypeScript Interface

```typescript
// challenge.model.ts
export enum OrganizerType {
  SPONSOR = 'sponsor',
  STATE = 'state',
  PLATFORM = 'platform'
}

export enum RegionType {
  ALL = 'all', // Ganz Österreich
  STATE = 'state', // Bundesland-spezifisch
  REGIONAL = 'regional' // Regionale Gebiete
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming', // Anstehend
  ACTIVE = 'active', // Aktiv
  ENDED = 'ended', // Beendet
  RESULTS_PUBLISHED = 'results_published' // Ergebnisse veröffentlicht
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  WINNER = 'winner',
  FINALIST = 'finalist'
}

export interface ChallengeCriteria {
  // Basis-Kriterien
  projectPublished: boolean; // Projekt muss veröffentlicht sein
  teacherApproved: boolean; // Projekt muss von Lehrer genehmigt sein
  projectFunctional: boolean; // Projekt muss funktionsfähig sein
  
  // Organisator-basierte Kriterien
  projectType?: string; // 'game', 'art', 'coding', etc.
  sponsorTheme?: string; // Förderer-Thema
  
  // Gebiets-basierte Kriterien
  states?: string[]; // Bundesländer
  regions?: string[]; // Regionale Gebiete
  
  // Zeit-basierte Kriterien
  mustBeCreatedAfter?: Date; // Projekt muss nach diesem Datum erstellt sein
  mustBePublishedBefore?: Date; // Projekt muss vor diesem Datum veröffentlicht sein
  
  // Technische Kriterien
  requiredExtensions?: string[]; // Erforderliche Scratch-Extensions
  minBlocks?: number; // Mindestanzahl Blöcke
  maxBlocks?: number; // Maximalanzahl Blöcke
}

export interface Challenge {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  title: string;
  description: string;
  challengeId?: string; // z.B. "YH2025"
  thumbnailUrl?: string;
  
  // Organisator
  organizerType: OrganizerType;
  organizerId?: string;
  sponsorId?: string;
  state?: string; // Bundesland
  
  // Zeitplan
  startDate: Date;
  endDate: Date; // Deadline
  resultsDate?: Date;
  
  // Gebiet
  regionType: RegionType;
  regionStates?: string[];
  regionDescription?: string;
  
  // Kriterien
  criteria: ChallengeCriteria;
  projectType?: string;
  
  // Bewertung
  evaluationCriteria?: string;
  juryCount?: number;
  
  // Status
  status: ChallengeStatus;
  isPublic: boolean;
  
  // Preise
  prizes?: Record<string, string>; // z.B. {"first": "1000€", "second": "500€"}
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  sponsor?: Sponsor;
  submissions?: ChallengeSubmission[];
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  projectId: string;
  userId: string;
  schoolId?: string;
  classId?: string;
  
  // Status
  status: SubmissionStatus;
  rank?: number;
  
  // Bewertung
  score?: number;
  juryScores?: Record<string, number>; // Scores pro Juror
  
  // Timestamps
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  
  // Relations
  challenge?: Challenge;
  project?: Project;
  user?: User;
  school?: School;
  class?: Class;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `challenge_id`
- **Typ:** VARCHAR(50)
- **Pflicht:** Nein
- **Unique:** Ja
- **Beschreibung:** Challenge-ID/Tag (z.B. "YH2025", "AFEC 24/25")

### Organisator

#### `organizer_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'sponsor' - Förderer/Sponsor
  - 'state' - Bundesland
  - 'platform' - Plattform
- **Beschreibung:** Organisator-Typ

#### `sponsor_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Foreign Key:** sponsors(id)
- **Beschreibung:** Förderer (wenn organizer_type = 'sponsor')

#### `state`
- **Typ:** VARCHAR(50)
- **Pflicht:** Nein
- **Beschreibung:** Bundesland (wenn organizer_type = 'state')

### Zeitplan

#### `start_date`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Beschreibung:** Challenge-Start

#### `end_date`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Beschreibung:** Deadline (keine weiteren Einreichungen)

#### `results_date`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Wann werden Ergebnisse bekannt gegeben?

### Gebiet

#### `region_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'all'
- **Werte:**
  - 'all' - Ganz Österreich
  - 'state' - Bundesland-spezifisch
  - 'regional' - Regionale Gebiete
- **Beschreibung:** Gebiets-Typ

#### `region_states`
- **Typ:** VARCHAR(50)[]
- **Pflicht:** Nein
- **Beschreibung:** Array von Bundesländern (wenn region_type = 'state')

### Kriterien

#### `criteria`
- **Typ:** JSONB
- **Pflicht:** Ja
- **Beschreibung:** Automatische Kriterien-Prüfung
- **Struktur:** Siehe `ChallengeCriteria` Interface

### Status

#### `status`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'upcoming'
- **Werte:**
  - 'upcoming' - Anstehend
  - 'active' - Aktiv
  - 'ended' - Beendet
  - 'results_published' - Ergebnisse veröffentlicht
- **Beschreibung:** Challenge-Status

## Beziehungen

### Zu anderen Modellen

- **Sponsors:** `challenges.sponsor_id` → `sponsors.id` (Many-to-One)
- **Projects:** `challenge_submissions.project_id` → `projects.id` (Many-to-Many)
- **Users:** `challenge_submissions.user_id` → `users.id` (Many-to-One)
- **Schools:** `challenge_submissions.school_id` → `schools.id` (Many-to-One)

## Beispiel-Daten

```json
{
  "id": "110e8400-e29b-41d4-a716-446655440013",
  "title": "Young Hackers 2025",
  "description": "Ein Wettbewerb für junge Programmierer...",
  "challengeId": "YH2025",
  "thumbnailUrl": "https://cdn.example.com/challenges/yh2025.jpg",
  "organizerType": "sponsor",
  "sponsorId": "770e8400-e29b-41d4-a716-446655440005",
  "startDate": "2024-09-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z",
  "resultsDate": "2025-04-15T00:00:00Z",
  "regionType": "all",
  "criteria": {
    "projectPublished": true,
    "teacherApproved": true,
    "projectFunctional": true,
    "projectType": "game",
    "mustBePublishedBefore": "2025-03-31T23:59:59Z"
  },
  "projectType": "game",
  "evaluationCriteria": "Kreativität, Technik, Design",
  "juryCount": 5,
  "status": "active",
  "isPublic": true,
  "prizes": {
    "first": "1000€",
    "second": "500€",
    "third": "250€"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Automatische Kriterien-Prüfung bei Projekt-Veröffentlichung
> - Projekte werden automatisch eingereicht (außer Opt-Out)
> - Projekte sind während Challenge "eingefroren"
> - Cache Challenge-Statistiken für Performance
> - Validierung: Prüfe, ob Kriterien erfüllt sind
