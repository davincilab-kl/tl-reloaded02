---
title: Notification Model - Benachrichtigungs-Datenmodell
description: Vollständiges Datenmodell für Benachrichtigungen
enableToc: true
tags:
  - data-models
  - notification
  - alert
---

# 🔔 Notification Model - Benachrichtigungs-Datenmodell

> [!abstract] Übersicht
> Das Notification Model repräsentiert Benachrichtigungen für Benutzer (In-App, E-Mail, Push).

## Verwandte Dokumentation

- **Micromessaging System:** [[01_Features/Dashboard/Micromessaging_System|Micromessaging System]] - Automatisierte Nachrichten
- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer mit Benachrichtigungen

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Empfänger
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Inhalt
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error', 'project', 'challenge', 'course', 'message'
  
  -- Zuordnung
  related_type VARCHAR(50), -- 'project', 'challenge', 'course', 'message', 'certificate'
  related_id UUID, -- ID der zugehörigen Ressource
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  
  -- Kanäle
  sent_in_app BOOLEAN NOT NULL DEFAULT true,
  sent_email BOOLEAN NOT NULL DEFAULT false,
  sent_push BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMP,
  push_sent_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_notification_type CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'project', 'challenge', 'course', 'message')),
  CONSTRAINT chk_related_type CHECK (related_type IN ('project', 'challenge', 'course', 'message', 'certificate') OR related_type IS NULL),
  
  -- Indizes
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_notification_type (notification_type),
  INDEX idx_created_at (created_at)
);
```

## TypeScript Interface

```typescript
// notification.model.ts
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  PROJECT = 'project',
  CHALLENGE = 'challenge',
  COURSE = 'course',
  MESSAGE = 'message'
}

export enum RelatedType {
  PROJECT = 'project',
  CHALLENGE = 'challenge',
  COURSE = 'course',
  MESSAGE = 'message',
  CERTIFICATE = 'certificate'
}

export interface Notification {
  // Primary Key
  id: string;
  
  // Empfänger
  userId: string;
  
  // Inhalt
  title: string;
  message: string;
  notificationType: NotificationType;
  
  // Zuordnung
  relatedType?: RelatedType;
  relatedId?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Kanäle
  sentInApp: boolean;
  sentEmail: boolean;
  sentPush: boolean;
  emailSentAt?: Date;
  pushSentAt?: Date;
  
  // Timestamps
  createdAt: Date;
  
  // Relations (nicht in DB)
  user?: User;
}
```

## Felder-Erklärung

### Inhalt

#### `notification_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'info' - Information
  - 'success' - Erfolg
  - 'warning' - Warnung
  - 'error' - Fehler
  - 'project' - Projekt-bezogen
  - 'challenge' - Challenge-bezogen
  - 'course' - Kurs-bezogen
  - 'message' - Nachricht
- **Beschreibung:** Benachrichtigungs-Typ

### Kanäle

#### `sent_in_app`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** true
- **Beschreibung:** In-App-Benachrichtigung gesendet

#### `sent_email`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** E-Mail-Benachrichtigung gesendet

#### `sent_push`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Push-Benachrichtigung gesendet

## Beziehungen

### Zu anderen Modellen

- **Users:** `notifications.user_id` → `users.id` (One-to-Many)

## Beispiel-Daten

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440018",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Projekt genehmigt",
  "message": "Dein Projekt 'Mein erstes Spiel' wurde von deinem Lehrer genehmigt.",
  "notificationType": "success",
  "relatedType": "project",
  "relatedId": "aa0e8400-e29b-41d4-a716-446655440007",
  "isRead": false,
  "sentInApp": true,
  "sentEmail": false,
  "sentPush": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Implementiere Benachrichtigungs-Zentrale (UI)
> - E-Mail-Templates für verschiedene Typen
> - Optional: Push-Benachrichtigungen (Web Push API)
> - Cache ungelesene Benachrichtigungen für Performance
