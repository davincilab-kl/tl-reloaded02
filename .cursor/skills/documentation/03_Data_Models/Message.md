---
title: Message Model - Nachrichten-Datenmodell
description: Vollständiges Datenmodell für Nachrichten und Chat
enableToc: true
tags:
  - data-models
  - message
  - chat
  - communication
---

# 💬 Message Model - Nachrichten-Datenmodell

> [!abstract] Übersicht
> Das Message Model repräsentiert Nachrichten und Chat-Kommunikation zwischen Benutzern.

## Verwandte Dokumentation

- **Messaging System:** [[01_Features/Dashboard/Messaging_System|Messaging System]] - Chat-Funktionalität
- **User Model:** [[03_Data_Models/User|User Model]] - Sender und Empfänger

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE conversations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Teilnehmer
  participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL für Gruppen-Konversationen
  class_id UUID REFERENCES classes(id), -- Optional: Klassen-Konversation
  
  -- Konversations-Typ
  conversation_type VARCHAR(50) NOT NULL, -- 'direct', 'class', 'group'
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_message_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_conversation_type CHECK (conversation_type IN ('direct', 'class', 'group')),
  CONSTRAINT chk_participants CHECK (
    (conversation_type = 'direct' AND participant_2_id IS NOT NULL) OR
    (conversation_type IN ('class', 'group'))
  ),
  
  -- Indizes
  INDEX idx_participant_1_id (participant_1_id),
  INDEX idx_participant_2_id (participant_2_id),
  INDEX idx_class_id (class_id),
  INDEX idx_last_message_at (last_message_at)
);

-- Nachrichten
CREATE TABLE messages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zuordnung
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Inhalt
  content TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'file', 'system'
  
  -- Datei-Anhang (optional)
  file_url TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_message_type CHECK (message_type IN ('text', 'file', 'system')),
  
  -- Indizes
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- Nachrichten-Empfänger (für Gruppen-Konversationen)
CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, recipient_id),
  INDEX idx_message_id (message_id),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_is_read (is_read)
);
```

## TypeScript Interface

```typescript
// message.model.ts
export enum ConversationType {
  DIRECT = 'direct',
  CLASS = 'class',
  GROUP = 'group'
}

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface Conversation {
  // Primary Key
  id: string;
  
  // Teilnehmer
  participant1Id: string;
  participant2Id?: string; // NULL für Gruppen-Konversationen
  classId?: string; // Klassen-Konversation
  
  // Konversations-Typ
  conversationType: ConversationType;
  
  // Status
  isActive: boolean;
  lastMessageAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  participant1?: User;
  participant2?: User;
  class?: Class;
  messages?: Message[];
}

export interface Message {
  // Primary Key
  id: string;
  
  // Zuordnung
  conversationId: string;
  senderId: string;
  
  // Inhalt
  content: string;
  messageType: MessageType;
  
  // Datei-Anhang
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Timestamps
  createdAt: Date;
  
  // Relations (nicht in DB)
  conversation?: Conversation;
  sender?: User;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  id: string;
  messageId: string;
  recipientId: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  
  // Relations
  message?: Message;
  recipient?: User;
}
```

## Felder-Erklärung

### Konversation

#### `conversation_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'direct' - Direkt-Chat (zwei Teilnehmer)
  - 'class' - Klassen-Chat
  - 'group' - Gruppen-Chat
- **Beschreibung:** Konversations-Typ

### Nachricht

#### `message_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Default:** 'text'
- **Werte:**
  - 'text' - Text-Nachricht
  - 'file' - Datei-Anhang
  - 'system' - System-Nachricht
- **Beschreibung:** Nachrichten-Typ

## Beziehungen

### Zu anderen Modellen

- **Users:** `messages.sender_id` → `users.id` (Many-to-One)
- **Conversations:** `messages.conversation_id` → `conversations.id` (One-to-Many)
- **Classes:** `conversations.class_id` → `classes.id` (Many-to-One)

## Beispiel-Daten

```json
{
  "id": "440e8400-e29b-41d4-a716-446655440016",
  "conversationId": "550e8400-e29b-41d4-a716-446655440017",
  "senderId": "880e8400-e29b-41d4-a716-446655440003",
  "content": "Gut gemacht! Dein Projekt ist sehr kreativ.",
  "messageType": "text",
  "isRead": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - Implementiere Read-Receipts für Nachrichten
> - Cache Konversationen für Performance
> - Optional: WebSocket für Echtzeit-Nachrichten
> - Validierung: Prüfe Berechtigungen für Konversationen
