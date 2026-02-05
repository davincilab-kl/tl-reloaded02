---
title: Certificate Model - Urkunden-Datenmodell
description: Vollständiges Datenmodell für Urkunden/Zertifikate
enableToc: true
tags:
  - data-models
  - certificate
  - achievement
---

# 🏆 Certificate Model - Urkunden-Datenmodell

> [!abstract] Übersicht
> Das Certificate Model repräsentiert Urkunden/Zertifikate, die automatisch oder manuell an Schüler vergeben werden.

## Verwandte Dokumentation

- **Admin Certificate Management:** [[01_Features/Dashboard/Admin/Certificate_Management|Certificate Management]] - Urkunden-Verwaltung
- **Student Certificates:** [[01_Features/Dashboard/Student/Certificates|Certificates]] - Urkunden-Anzeige
- **User Model:** [[03_Data_Models/User|User Model]] - Schüler mit Urkunden

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE certificates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL, -- z.B. "Kursabschluss-Urkunde: Scratch Grundlagen"
  description TEXT,
  certificate_type VARCHAR(50) NOT NULL, -- 'course_completion', 'challenge_winner', 'milestone', 'special', 'participation'
  
  -- Design
  template_id VARCHAR(100), -- Urkunden-Template
  design_config JSONB, -- Design-Konfiguration (Logo, Farben, Layout)
  
  -- Zuordnung
  course_id UUID REFERENCES courses(id), -- Optional: Zu welchem Kurs?
  challenge_id UUID REFERENCES challenges(id), -- Optional: Zu welcher Challenge?
  
  -- Vergabe-Logik (für automatische Urkunden)
  award_type VARCHAR(50) NOT NULL, -- 'automatic', 'manual'
  award_trigger VARCHAR(50), -- 'course_completion', 'challenge_win', 'milestone'
  award_conditions JSONB, -- Bedingungen für automatische Vergabe
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_certificate_type CHECK (certificate_type IN ('course_completion', 'challenge_winner', 'milestone', 'special', 'participation')),
  CONSTRAINT chk_award_type CHECK (award_type IN ('automatic', 'manual')),
  
  -- Indizes
  INDEX idx_certificate_type (certificate_type),
  INDEX idx_award_type (award_type),
  INDEX idx_course_id (course_id),
  INDEX idx_challenge_id (challenge_id),
  INDEX idx_is_active (is_active)
);

-- Vergebene Urkunden (Many-to-Many)
CREATE TABLE user_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vergabe-Informationen
  awarded_by UUID REFERENCES users(id), -- Wer hat Urkunde vergeben? (Admin/Lehrer)
  award_reason TEXT, -- Grund für manuelle Vergabe (optional)
  
  -- PDF
  pdf_url TEXT, -- URL zum generierten PDF
  pdf_generated_at TIMESTAMP, -- Wann wurde PDF generiert?
  
  -- Timestamps
  awarded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(certificate_id, user_id), -- Ein Schüler kann eine Urkunde nur einmal erhalten
  
  -- Indizes
  INDEX idx_certificate_id (certificate_id),
  INDEX idx_user_id (user_id),
  INDEX idx_awarded_at (awarded_at)
);
```

## TypeScript Interface

```typescript
// certificate.model.ts
export enum CertificateType {
  COURSE_COMPLETION = 'course_completion',
  CHALLENGE_WINNER = 'challenge_winner',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  PARTICIPATION = 'participation'
}

export enum AwardType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual'
}

export enum AwardTrigger {
  COURSE_COMPLETION = 'course_completion',
  CHALLENGE_WIN = 'challenge_win',
  MILESTONE = 'milestone'
}

export interface CertificateDesignConfig {
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  layout: 'portrait' | 'landscape';
  fields: {
    studentName: boolean;
    courseName?: boolean;
    challengeName?: boolean;
    date: boolean;
    signature?: boolean;
  };
}

export interface AwardConditions {
  minimumScore?: number; // Mindest-Score
  allLessonsCompleted?: boolean; // Alle Lektionen abgeschlossen
  projectPublished?: boolean; // Projekt veröffentlicht
  milestoneType?: string; // z.B. "10_projects"
  milestoneValue?: number; // z.B. 10
  challengeRank?: number; // Top 3, etc.
}

export interface Certificate {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  title: string;
  description?: string;
  certificateType: CertificateType;
  
  // Design
  templateId?: string;
  designConfig?: CertificateDesignConfig;
  
  // Zuordnung
  courseId?: string;
  challengeId?: string;
  
  // Vergabe-Logik
  awardType: AwardType;
  awardTrigger?: AwardTrigger;
  awardConditions?: AwardConditions;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  course?: Course;
  challenge?: Challenge;
  userCertificates?: UserCertificate[];
}

export interface UserCertificate {
  id: string;
  certificateId: string;
  userId: string;
  
  // Vergabe-Informationen
  awardedBy?: string; // Admin/Lehrer User ID
  awardReason?: string;
  
  // PDF
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  
  // Timestamps
  awardedAt: Date;
  createdAt: Date;
  
  // Relations
  certificate?: Certificate;
  user?: User;
  awardedByUser?: User;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `certificate_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'course_completion' - Kursabschluss-Urkunde
  - 'challenge_winner' - Challenge-Gewinner-Urkunde
  - 'milestone' - Meilenstein-Urkunde
  - 'special' - Besondere Leistung
  - 'participation' - Teilnahme-Urkunde
- **Beschreibung:** Urkunden-Typ

### Design

#### `template_id`
- **Typ:** VARCHAR(100)
- **Pflicht:** Nein
- **Beschreibung:** Urkunden-Template ID

#### `design_config`
- **Typ:** JSONB
- **Pflicht:** Nein
- **Beschreibung:** Design-Konfiguration (Logo, Farben, Layout)
- **Struktur:** Siehe `CertificateDesignConfig` Interface

### Vergabe-Logik

#### `award_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'automatic' - Automatisch
  - 'manual' - Manuell
- **Beschreibung:** Vergabe-Typ

#### `award_trigger`
- **Typ:** VARCHAR(50)
- **Pflicht:** Nein
- **Werte:**
  - 'course_completion' - Kursabschluss
  - 'challenge_win' - Challenge-Gewinn
  - 'milestone' - Meilenstein
- **Beschreibung:** Trigger für automatische Vergabe

#### `award_conditions`
- **Typ:** JSONB
- **Pflicht:** Nein
- **Beschreibung:** Bedingungen für automatische Vergabe
- **Struktur:** Siehe `AwardConditions` Interface

## Beziehungen

### Zu anderen Modellen

- **Users:** `user_certificates.user_id` → `users.id` (Many-to-Many)
- **Courses:** `certificates.course_id` → `courses.id` (Many-to-One)
- **Challenges:** `certificates.challenge_id` → `challenges.id` (Many-to-One)

## Beispiel-Daten

```json
{
  "id": "220e8400-e29b-41d4-a716-446655440014",
  "title": "Kursabschluss-Urkunde: Scratch Grundlagen",
  "description": "Urkunde für erfolgreichen Kursabschluss",
  "certificateType": "course_completion",
  "templateId": "template_001",
  "designConfig": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "colors": {
      "primary": "#0066CC",
      "secondary": "#FFD700",
      "text": "#000000"
    },
    "layout": "portrait",
    "fields": {
      "studentName": true,
      "courseName": true,
      "date": true,
      "signature": true
    }
  },
  "courseId": "cc0e8400-e29b-41d4-a716-446655440009",
  "awardType": "automatic",
  "awardTrigger": "course_completion",
  "awardConditions": {
    "allLessonsCompleted": true,
    "minimumScore": 70
  },
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Automatische Vergabe bei Kursabschluss, Challenge-Gewinn, Meilensteinen
> - PDF-Generierung bei Vergabe
> - Cache Urkunden-Statistiken für Performance
> - Validierung: Prüfe Bedingungen vor automatischer Vergabe
