---
title: Tech Stack Definition
description: Komplette Übersicht über Frameworks, Libraries und Technologien
enableToc: true
tags:
  - blueprint
  - tech-stack
---

# 🛠️ Tech Stack Definition

> [!important] Entscheidungsgrundlage
> Dieser Stack wurde basierend auf den Anforderungen einer Lernplattform mit Scratch-Integration und komplexen Rollensystemen (RBAC) ausgewählt.

---

## 📦 Stack-Übersicht

| Kategorie | Technologie | Begründung |
|-----------|------------|------------|
| **Sprache** | TypeScript | Konsistenz über den gesamten Stack |
| **Frontend** | Next.js + React | SSR/SSG, Frontend-Framework |
| **Styling** | TailwindCSS | Utility-first, schnelle Entwicklung |
| **Backend** | NestJS | Separater Backend-Service, Enterprise-Logik, RBAC |
| **ORM** | Prisma | Beste TypeScript-Integration für SQL |
| **Datenbank** | PostgreSQL | Relationale Daten, Hosting: Google Compute Engine |
| **Caching** | Redis | Performance-Optimierung, Session-Management |
| **API** | GraphQL (Apollo) | Effiziente Datenabfrage bei komplexen Beziehungen |
| **Auth** | Keycloak / NextAuth.js | Sicherer Umgang mit Rollen und DSGVO |
| **Hosting** | Google Cloud | Skalierbare Infrastructure |
| **Storage** | S3 (MinIO/AWS) | Für Scratch-Projekt-Assets |
| **Monorepo** | Turborepo | Monorepo-Management, Build-Performance |
| **Package Manager** | pnpm | Workspace-Management, Dependency-Hoisting |

---

## 🎨 Frontend

- **Next.js** (TypeScript) - SSR/SSG, Frontend-Framework
- **React** (TypeScript)
- **TailwindCSS** - Utility-first CSS Framework
- **Apollo Client** - GraphQL Client
- Optional: **TanStack Query** für Server-State Management

> [!tip] Implementation Hint
> Next.js dient primär als Frontend. Business-Logik läuft im separaten NestJS-Backend.

---

## ⚙️ Backend

- **NestJS** (TypeScript)
  - Module, Controller, Services
  - RBAC (Role Based Access Control)
  - Guards für Route-Absicherung
  - GraphQL-Integration via Apollo Server

> [!tip] Implementation Hint
> NestJS läuft als separater Service. Frontend kommuniziert über GraphQL/REST.

---

## 🗄️ Datenbanken

- **PostgreSQL** (Haupt-DB) - Relationale Daten, Hosting: Google Compute Engine
- **Redis** - Caching, Session-Management

---

## 🔌 ORM & API

- **Prisma** - TypeScript-Integration für PostgreSQL
- **GraphQL** (Apollo Server) - Primär für komplexe Queries
- **REST** - Sekundär für einfache Endpunkte, File-Uploads

> [!abstract] Warum GraphQL?
> Ein Dashboard braucht Daten aus mehreren Tabellen. Mit GraphQL holt sich das Frontend alles mit einem Request statt mehrerer REST-Calls.

---

## 🔐 Authentifizierung
  - Multi-Role Support (Teacher, Student, Admin)
  - Schülerpasswort-System (Passwort-only Authentication)
  - WordPress Passwort-Migration Support
  - DSGVO-konform
  - Session-Management
  - JWT-basiert
  - OAuth-ready (optional)
  - **Siehe:** [[00_Blueprint/Auth_System|Auth System]] für detaillierte Dokumentation

---

## ☁️ Hosting & Storage

- **Google Cloud Platform** - Compute Engine für Datenbank und Backend
- **S3-kompatibler Storage** (MinIO/AWS) - Für Scratch-Projekt-Assets

> [!warning] Vendor Lock-in Diskussion
> **tbd:** Firebase ja/nein? (Vendor Lock-in vs. Einfachheit)

---

## 📁 Monorepo-Struktur

### Tool: Turborepo

### Projektstruktur

```
/
├── apps/
│   ├── web/              # Next.js Frontend
│   ├── api/              # NestJS Backend (GraphQL/REST)
│   └── worker/           # NestJS Job Processor
│
├── packages/
│   ├── db/               # Prisma Schema & Client
│   ├── types/            # Shared TypeScript Types
│   └── eslint-config/    # Shared ESLint Config
│
├── package.json          # Root (Workspace)
├── turbo.json           # Turborepo Config
└── pnpm-workspace.yaml   # pnpm Workspace
```

### Apps
- **`/apps/web`** - Next.js Frontend (React, TailwindCSS, Apollo Client)
- **`/apps/api`** - NestJS Backend (GraphQL/REST, Guards, Services)
- **`/apps/worker`** - NestJS Background Jobs (Email, Reports, Cron)

### Packages
- **`/packages/db`** - Prisma Schema, Migrationen, Client Export
- **`/packages/types`** - Shared Types (DTOs, GraphQL Types, Domain Models)
- **`/packages/eslint-config`** - Geteilte Linting-Regeln

> [!tip] Vorteile
> - Geteilte Types zwischen Frontend/Backend (Type-Safety)
> - Parallele Builds mit Turborepo
> - Einheitliche Dependency-Versionen

---

## 🏗️ Architektur

```
┌─────────────┐         ┌─────────────┐
│   Next.js   │◄────────┤   NestJS    │
│  Frontend   │ GraphQL │   Backend   │
└─────────────┘  / REST └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐      ┌──────▼──────┐
              │PostgreSQL │      │   Redis    │
              │  (Haupt-DB)│      │  (Caching)  │
              └──────────┘      └─────────────┘
```

---

## 🎯 Kritische Punkte

### Scratch-Integration
> [!warning] Performance
> Viele kleine Schreibvorgänge (Autosave). Lösung: Debouncing/Throttling, JSON-Validierung, S3 für Assets.

### Skalierbarkeit
> [!tip] Implementation Hint
> NestJS + PostgreSQL wächst mit den Anforderungen mit.

---

## ✅ Technologie-Entscheidungen

### Hosting & Infrastructure
- **✅ Google Cloud Compute Engine** (nicht Firebase)
  - **Begründung:** Mehr Kontrolle, keine Vendor Lock-in, bessere Skalierbarkeit
  - **Alternative:** AWS EC2 oder Azure VM (ähnlich)

### Authentication
- **✅ Better Auth** (bereits entschieden)
  - **Begründung:** TypeScript-first, flexibel, moderne API
  - **Alternative:** NextAuth.js (verworfen - weniger flexibel für Schülerpasswort-System)

### State Management
- **✅ Apollo Client** (für GraphQL)
  - **Begründung:** Integriert mit GraphQL, Caching, Type-Safety
  - **TanStack Query:** Optional für REST-Endpunkte (nicht primär)

### Nächste Schritte
1. ✅ NestJS Backend + Next.js Frontend
2. ✅ Monorepo-Struktur mit Turborepo
3. Monorepo-Setup (Turborepo + pnpm Workspaces)
4. Datenbank-Infrastructure (PostgreSQL + Redis)
5. Prisma Schema (`/packages/db`)
6. Shared Types (`/packages/types`)
7. NestJS API-Setup (`/apps/api`)
8. Next.js Frontend-Setup (`/apps/web`)
9. NestJS Worker (`/apps/worker`)
10. Auth-System integrieren
