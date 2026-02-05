---
title: API & Architecture
description: Wie kommunizieren Frontend & Backend
enableToc: true
tags:
  - blueprint
  - api
---

# 🔌 API & Architecture Standards

> [!important] Kommunikations-Prinzipien
> Frontend (Next.js) und Backend (NestJS) kommunizieren über GraphQL (primär) und REST (sekundär).

---

## 🌐 API-Architektur

### GraphQL (Primär)
- **Endpoint:** `/graphql`
- **Apollo Server** im NestJS Backend
- **Apollo Client** im Next.js Frontend
- Type-safe Queries und Mutations

### REST (Sekundär)
- Für einfache Endpunkte, File-Uploads, Webhooks
- **Base URL:** `/api/v1`

### Entscheidungskriterien: GraphQL vs. REST

#### GraphQL verwenden für:
- **Komplexe Queries:** Mehrere Ressourcen in einem Request
- **Dashboard-Daten:** Verschiedene Datenquellen kombinieren
- **Flexible Datenabfrage:** Frontend bestimmt benötigte Felder
- **Type-Safety:** Vollständige Type-Safety über Stack

**Beispiele:**
- Dashboard-Übersicht (User + Projects + T!Coins)
- Projekt-Details mit Author + Class + Challenge
- Challenge-Übersicht mit Submissions + Leaderboard

#### REST verwenden für:
- **Einfache CRUD-Operationen:** Create, Read, Update, Delete
- **File-Uploads:** Multipart form-data
- **Webhooks:** Externe Integrationen
- **Status-Updates:** Einfache Status-Änderungen

**Beispiele:**
- Projekt erstellen/bearbeiten/löschen
- Asset-Upload (Bilder, Sounds)
- Auto-Save (Queue-Integration)
- Password-Reset

---

## 📡 Request/Response Standards

### GraphQL Queries
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    name
    role
  }
}
```

### GraphQL Mutations
```graphql
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    email
    name
  }
}
```

### REST Endpoints
- **GET** `/api/v1/users/:id` - Einzelne Ressource
- **POST** `/api/v1/users` - Neue Ressource erstellen
- **PUT** `/api/v1/users/:id` - Vollständiges Update
- **PATCH** `/api/v1/users/:id` - Partielles Update
- **DELETE** `/api/v1/users/:id` - Ressource löschen

---

## 🔐 Authentication

### JWT Tokens
- **Header:** `Authorization: Bearer <token>`
- **Refresh Token:** Automatisch via Apollo Client
- **Session:** Cookie-basiert für Web

### Guards (NestJS)
- `@UseGuards(JwtAuthGuard)` - Authentifizierung erforderlich
- `@UseGuards(RolesGuard)` - Rollen-basierte Autorisierung

---

## 📦 Error Handling

### GraphQL Errors
```json
{
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "NOT_FOUND",
        "statusCode": 404
      }
    }
  ]
}
```

### REST Errors
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "statusCode": 404
  }
}
```

---

## 🔄 Data Transfer Objects (DTOs)

### Shared Types
- Alle DTOs in `/packages/types`
- Geteilt zwischen Frontend und Backend
- Type-safe über den gesamten Stack

### Beispiel DTO
```typescript
export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}
```

---

## 📊 Pagination

### GraphQL
```graphql
query GetUsers($page: Int!, $limit: Int!) {
  users(page: $page, limit: $limit) {
    data {
      id
      email
    }
    pagination {
      page
      limit
      total
      totalPages
    }
  }
}
```

### REST
- **Query Params:** `?page=1&limit=20`
- **Response:** Enthält `data` und `pagination` Objekt

---

## 🚀 Performance

### Caching
- **Redis** für Session-Management
- **Apollo Client Cache** für GraphQL Responses
- **Next.js ISR** für statische Inhalte

### Rate Limiting
- **NestJS Throttler** für API-Endpunkte
- Standard: 100 Requests pro Minute pro IP

---

> [!tip] Implementation Hint
> - Immer Type-Safety zwischen Frontend und Backend über Shared Types
> - GraphQL für komplexe Queries, REST für einfache CRUD
> - Konsistente Error-Handling-Struktur
