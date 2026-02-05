---
title: Challenge Leaderboard Model - Challenge-Leaderboard-Datenmodell
description: Vollständiges Datenmodell für Challenge-spezifische Leaderboards mit T!Score und Cut-off-Datum
enableToc: true
tags:
  - data-models
  - challenge
  - leaderboard
  - t-score
---

# 🏆 Challenge Leaderboard Model - Challenge-Leaderboard-Datenmodell

> [!abstract] Übersicht
> Das Challenge Leaderboard Model repräsentiert Challenge-spezifische Leaderboards mit T!Score-Berechnung basierend auf Challenge-Kriterien und Cut-off-Datum.

## Verwandte Dokumentation

- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell
- **Student Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-Teilnahme
- **Public Challenges:** [[01_Features/Challenges/Public_Challenges|Public Challenges]] - Öffentliche Challenges

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE challenge_leaderboards (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zuordnung
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Cut-off-Datum
  cutoff_date TIMESTAMP NOT NULL, -- Datum, bis zu dem T!Coins/Projekte gezählt werden
  snapshot_date TIMESTAMP NOT NULL DEFAULT NOW(), -- Wann wurde Leaderboard erstellt?
  
  -- Leaderboard-Typ
  leaderboard_type VARCHAR(50) NOT NULL, -- 'student', 'class', 'school', 'state'
  
  -- Ranking-Ebene
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'class', 'school', 'state'
  entity_id UUID, -- user_id, class_id, school_id, oder NULL für state
  
  -- T!Score-Berechnung
  t_score DECIMAL(10, 2) NOT NULL, -- Challenge-spezifischer T!Score
  t_coins_count INTEGER NOT NULL DEFAULT 0, -- Anzahl T!Coins (für Challenge-Kriterien)
  projects_count INTEGER NOT NULL DEFAULT 0, -- Anzahl Projekte (für Challenge-Kriterien)
  
  -- Ranking
  rank INTEGER NOT NULL, -- Platzierung (1, 2, 3, ...)
  previous_rank INTEGER, -- Vorherige Platzierung (für Änderungs-Anzeige)
  
  -- Challenge-spezifische Metriken
  challenge_metrics JSONB, -- Zusätzliche Challenge-spezifische Metriken
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_leaderboard_type CHECK (leaderboard_type IN ('student', 'class', 'school', 'state')),
  CONSTRAINT chk_entity_type CHECK (entity_type IN ('user', 'class', 'school', 'state')),
  CONSTRAINT chk_cutoff_date CHECK (cutoff_date <= NOW()),
  CONSTRAINT chk_rank CHECK (rank > 0),
  
  -- Indizes
  INDEX idx_challenge_id (challenge_id),
  INDEX idx_cutoff_date (cutoff_date),
  INDEX idx_leaderboard_type (leaderboard_type),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_rank (rank),
  INDEX idx_t_score (t_score DESC),
  INDEX idx_snapshot_date (snapshot_date)
);

-- Challenge Leaderboard Snapshots (für Historie)
CREATE TABLE challenge_leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  cutoff_date TIMESTAMP NOT NULL,
  snapshot_date TIMESTAMP NOT NULL DEFAULT NOW(),
  leaderboard_data JSONB NOT NULL, -- Vollständige Leaderboard-Daten als JSON
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_challenge_id (challenge_id),
  INDEX idx_cutoff_date (cutoff_date),
  INDEX idx_snapshot_date (snapshot_date)
);
```

## TypeScript Interface

```typescript
// challenge-leaderboard.model.ts
export enum LeaderboardType {
  STUDENT = 'student',
  CLASS = 'class',
  SCHOOL = 'school',
  STATE = 'state'
}

export enum EntityType {
  USER = 'user',
  CLASS = 'class',
  SCHOOL = 'school',
  STATE = 'state'
}

export interface ChallengeLeaderboard {
  // Primary Key
  id: string;
  
  // Zuordnung
  challengeId: string;
  
  // Cut-off-Datum
  cutoffDate: Date; // Datum, bis zu dem T!Coins/Projekte gezählt werden
  snapshotDate: Date; // Wann wurde Leaderboard erstellt?
  
  // Leaderboard-Typ
  leaderboardType: LeaderboardType;
  
  // Ranking-Ebene
  entityType: EntityType;
  entityId?: string; // user_id, class_id, school_id, oder NULL für state
  
  // T!Score-Berechnung
  tScore: number; // Challenge-spezifischer T!Score
  tCoinsCount: number; // Anzahl T!Coins (für Challenge-Kriterien)
  projectsCount: number; // Anzahl Projekte (für Challenge-Kriterien)
  
  // Ranking
  rank: number; // Platzierung (1, 2, 3, ...)
  previousRank?: number; // Vorherige Platzierung
  
  // Challenge-spezifische Metriken
  challengeMetrics?: Record<string, any>; // Zusätzliche Metriken
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  challenge?: Challenge;
  user?: User;
  class?: Class;
  school?: School;
}

export interface ChallengeLeaderboardSnapshot {
  id: string;
  challengeId: string;
  cutoffDate: Date;
  snapshotDate: Date;
  leaderboardData: Record<string, any>; // Vollständige Leaderboard-Daten
  createdAt: Date;
  
  // Relations
  challenge?: Challenge;
}
```

## Felder-Erklärung

### Cut-off-Datum

#### `cutoff_date`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Beschreibung:** Datum, bis zu dem T!Coins/Projekte für Challenge gezählt werden
- **Wichtig:** Nur T!Coins/Projekte vor diesem Datum werden berücksichtigt
- **Constraint:** Muss <= NOW() sein

#### `snapshot_date`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Default:** NOW()
- **Beschreibung:** Wann wurde Leaderboard erstellt/aktualisiert?

### Leaderboard-Typ

#### `leaderboard_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'student' - Schüler-Leaderboard
  - 'class' - Klassen-Leaderboard
  - 'school' - Schul-Leaderboard
  - 'state' - Bundesland-Leaderboard
- **Beschreibung:** Typ des Leaderboards

### Ranking-Ebene

#### `entity_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'user' - Schüler
  - 'class' - Klasse
  - 'school' - Schule
  - 'state' - Bundesland
- **Beschreibung:** Ebene des Rankings

#### `entity_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Beschreibung:** ID der Entität (user_id, class_id, school_id, oder NULL für state)

### T!Score-Berechnung

#### `t_score`
- **Typ:** DECIMAL(10, 2)
- **Pflicht:** Ja
- **Beschreibung:** Challenge-spezifischer T!Score
- **Berechnung:** Basierend auf Challenge-Kriterien und Cut-off-Datum
- **Beispiele:**
  - Für Schüler: T!Coins aus Challenge-relevanten Aktivitäten
  - Für Klassen: Summe T!Coins ÷ Anzahl Schüler (nur Challenge-relevante)
  - Für Schulen: Summe T!Coins aller Klassen ÷ Anzahl Schüler

#### `t_coins_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl T!Coins (für Challenge-Kriterien, bis Cut-off-Datum)

#### `projects_count`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Anzahl Projekte (für Challenge-Kriterien, bis Cut-off-Datum)

### Ranking

#### `rank`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Min:** 1
- **Beschreibung:** Platzierung (1, 2, 3, ...)
- **Sortierung:** Nach T!Score (absteigend)

#### `previous_rank`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Vorherige Platzierung (für Änderungs-Anzeige)

### Challenge-spezifische Metriken

#### `challenge_metrics`
- **Typ:** JSONB
- **Pflicht:** Nein
- **Beschreibung:** Zusätzliche Challenge-spezifische Metriken
- **Beispiele:**
  - Anzahl Challenge-Projekte
  - Durchschnittliche Projekt-Bewertung
  - Challenge-spezifische Achievements

## T!Score-Berechnung für Challenges

### Schüler-Leaderboard
```
T!Score = Summe aller T!Coins aus Challenge-relevanten Aktivitäten
         (bis Cut-off-Datum)
```

### Klassen-Leaderboard
```
T!Score = Summe aller T!Coins der Klasse (Challenge-relevant)
         ÷ Anzahl Schüler in Klasse
         (nur T!Coins/Projekte bis Cut-off-Datum)
```

### Schul-Leaderboard
```
T!Score = Summe aller T!Coins aller Klassen (Challenge-relevant)
         ÷ Anzahl Schüler in Schule
         (nur T!Coins/Projekte bis Cut-off-Datum)
```

### Bundesland-Leaderboard
```
T!Score = Summe aller T!Coins aller Schulen (Challenge-relevant)
         ÷ Anzahl Schüler im Bundesland
         (nur T!Coins/Projekte bis Cut-off-Datum)
```

## Challenge-Kriterien für T!Score

### Relevante Aktivitäten
- **Projekte:** Nur Projekte, die Challenge-Kriterien erfüllen
- **T!Coins:** Nur T!Coins aus Challenge-relevanten Aktivitäten
- **Zeitraum:** Nur Aktivitäten bis Cut-off-Datum

### Filterung
- **Projekt-Typ:** Nur Projekte, die zum Challenge-Thema passen
- **Zeitraum:** Nur Projekte/T!Coins bis Cut-off-Datum
- **Status:** Nur veröffentlichte und genehmigte Projekte

## Beziehungen

### Zu anderen Modellen

- **Challenges:** `challenge_leaderboards.challenge_id` → `challenges.id` (Many-to-One)
- **Users:** `challenge_leaderboards.entity_id` → `users.id` (Many-to-One, wenn entity_type = 'user')
- **Classes:** `challenge_leaderboards.entity_id` → `classes.id` (Many-to-One, wenn entity_type = 'class')
- **Schools:** `challenge_leaderboards.entity_id` → `schools.id` (Many-to-One, wenn entity_type = 'school')

## Beispiel-Daten

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440020",
  "challengeId": "110e8400-e29b-41d4-a716-446655440013",
  "cutoffDate": "2025-03-31T23:59:59Z",
  "snapshotDate": "2025-04-01T00:00:00Z",
  "leaderboardType": "student",
  "entityType": "user",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "tScore": 1250.50,
  "tCoinsCount": 1250,
  "projectsCount": 3,
  "rank": 1,
  "previousRank": 2,
  "challengeMetrics": {
    "challengeProjects": 3,
    "averageProjectScore": 85.5,
    "challengeAchievements": 2
  },
  "createdAt": "2025-04-01T00:00:00Z",
  "updatedAt": "2025-04-01T00:00:00Z"
}
```

## Snapshots

### Leaderboard-Snapshots
- **Zweck:** Historie der Leaderboards für verschiedene Cut-off-Daten
- **Verwendung:** Vergleich von Rankings über Zeit
- **Speicherung:** Vollständige Leaderboard-Daten als JSON

> [!tip] Implementation Hint
> - Berechne T!Score basierend auf Challenge-Kriterien
> - Verwende Cut-off-Datum für faire Rankings
> - Cache Leaderboard-Daten für Performance
> - Erstelle Snapshots für Historie
> - Validierung: Prüfe, ob Cut-off-Datum <= Challenge-End-Datum ist
