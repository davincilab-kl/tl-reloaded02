---
title: Quiz Model - Quiz-Datenmodell
description: Vollständiges Datenmodell für Quizzes
enableToc: true
tags:
  - data-models
  - quiz
  - lesson
---

# ❓ Quiz Model - Quiz-Datenmodell

> [!abstract] Übersicht
> Das Quiz Model repräsentiert Quizzes zu Lektionen mit verschiedenen Fragetypen.

## Verwandte Dokumentation

- **Admin Course Management:** [[01_Features/Dashboard/Admin/Course_Management|Admin Course Management]] - Quiz-Erstellung
- **Student Course Workflow:** [[01_Features/Dashboard/Student/Course_Workflow|Course Workflow]] - Quiz-Durchführung
- **Lesson Model:** [[03_Data_Models/Lesson|Lesson Model]] - Lektionen mit Quizzes

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE quizzes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zuordnung
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Basis-Informationen
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Einstellungen
  minimum_score DECIMAL(5, 2) NOT NULL DEFAULT 70.00, -- Mindestpunktzahl in %
  time_limit INTEGER, -- Zeitlimit in Minuten (optional)
  show_feedback_immediately BOOLEAN NOT NULL DEFAULT false, -- Sofortiges Feedback nach jeder Frage
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indizes
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_is_active (is_active)
);

-- Quiz-Fragen
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice_single', 'multiple_choice_multiple', 'true_false', 'fill_blank', 'drag_drop'
  question_text TEXT NOT NULL,
  points DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  explanation TEXT, -- Erklärung zur richtigen Antwort
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_quiz_id (quiz_id),
  INDEX idx_order_index (order_index)
);

-- Quiz-Antworten (für Multiple Choice, True/False)
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_question_id (question_id),
  INDEX idx_order_index (order_index)
);

-- Quiz-Abgaben (Schüler-Antworten)
CREATE TABLE quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL, -- Erreichte Punktzahl in %
  total_points DECIMAL(5, 2) NOT NULL, -- Gesamtpunktzahl
  earned_points DECIMAL(5, 2) NOT NULL, -- Erreichte Punkte
  passed BOOLEAN NOT NULL, -- Bestanden (score >= minimum_score)
  time_taken INTEGER, -- Benötigte Zeit in Sekunden
  started_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_quiz_id (quiz_id),
  INDEX idx_user_id (user_id),
  INDEX idx_submitted_at (submitted_at)
);

-- Quiz-Antworten (Schüler-Antworten zu Fragen)
CREATE TABLE quiz_submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_ids UUID[], -- Array von answer_ids (für Multiple Choice Multiple)
  answer_text TEXT, -- Für Fill Blank, Drag & Drop
  is_correct BOOLEAN NOT NULL,
  points_earned DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_submission_id (submission_id),
  INDEX idx_question_id (question_id)
);
```

## TypeScript Interface

```typescript
// quiz.model.ts
export enum QuestionType {
  MULTIPLE_CHOICE_SINGLE = 'multiple_choice_single',
  MULTIPLE_CHOICE_MULTIPLE = 'multiple_choice_multiple',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  DRAG_DROP = 'drag_drop'
}

export interface Quiz {
  // Primary Key
  id: string;
  
  // Zuordnung
  lessonId: string;
  
  // Basis-Informationen
  title: string;
  description?: string;
  
  // Einstellungen
  minimumScore: number; // Mindestpunktzahl in %
  timeLimit?: number; // Minuten
  showFeedbackImmediately: boolean;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  lesson?: Lesson;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: QuestionType;
  questionText: string;
  points: number;
  explanation?: string;
  orderIndex: number;
  createdAt: Date;
  
  // Relations
  quiz?: Quiz;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: Date;
  
  // Relations
  question?: QuizQuestion;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  score: number; // Erreichte Punktzahl in %
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  timeTaken?: number; // Sekunden
  startedAt: Date;
  submittedAt: Date;
  createdAt: Date;
  
  // Relations
  quiz?: Quiz;
  user?: User;
  answers?: QuizSubmissionAnswer[];
}

export interface QuizSubmissionAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answerIds?: string[]; // Für Multiple Choice Multiple
  answerText?: string; // Für Fill Blank, Drag & Drop
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: Date;
  
  // Relations
  submission?: QuizSubmission;
  question?: QuizQuestion;
}
```

## Felder-Erklärung

### Quiz-Einstellungen

#### `minimum_score`
- **Typ:** DECIMAL(5, 2)
- **Pflicht:** Ja
- **Default:** 70.00
- **Beschreibung:** Mindestpunktzahl zum Bestehen in %

#### `time_limit`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Zeitlimit in Minuten (optional)

#### `show_feedback_immediately`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Sofortiges Feedback nach jeder Frage oder erst am Ende

### Fragetypen

#### `question_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'multiple_choice_single' - Multiple Choice (eine richtige Antwort)
  - 'multiple_choice_multiple' - Multiple Choice (mehrere richtige Antworten)
  - 'true_false' - Wahr/Falsch
  - 'fill_blank' - Lückentext
  - 'drag_drop' - Drag & Drop
- **Beschreibung:** Fragetyp

## Beziehungen

### Zu anderen Modellen

- **Lesson:** `quizzes.lesson_id` → `lessons.id` (Many-to-One)
- **User:** `quiz_submissions.user_id` → `users.id` (Many-to-One)
- **Questions:** `quiz_questions.quiz_id` → `quizzes.id` (One-to-Many)
- **Answers:** `quiz_answers.question_id` → `quiz_questions.id` (One-to-Many)

## Beispiel-Daten

```json
{
  "id": "ee0e8400-e29b-41d4-a716-446655440011",
  "lessonId": "dd0e8400-e29b-41d4-a716-446655440010",
  "title": "Scratch Grundlagen Quiz",
  "description": "Teste dein Wissen über Scratch",
  "minimumScore": 70.0,
  "timeLimit": 10,
  "showFeedbackImmediately": false,
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Implementiere verschiedene Fragetypen mit flexibler Antwort-Struktur
> - Cache Quiz-Ergebnisse für Performance
> - Validierung: Prüfe, ob mindestens eine Frage vorhanden ist
> - Zeitlimit-Tracking für Quiz-Abgaben
