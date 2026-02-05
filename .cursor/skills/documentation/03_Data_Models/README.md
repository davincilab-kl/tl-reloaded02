---
title: Data Models - Übersicht
description: Vollständige Übersicht aller Datenmodelle
enableToc: true
tags:
  - data-models
  - overview
  - database
---

# 📊 Data Models - Übersicht

> [!abstract] Übersicht
> Vollständige Übersicht aller Datenmodelle der Plattform mit Beziehungen und Verwendungszweck.

## Verwandte Dokumentation

- **Tech Stack:** [[00_Blueprint/Tech_Stack|Tech Stack]] - Datenbank-Technologie
- **Features:** [[01_Features|Features]] - Feature-Dokumentation

## Modell-Kategorien

### 👤 Benutzer & Organisation

#### [User Model](User.md)
- **Zweck:** Benutzer (Student, Teacher, Admin) mit Authentifizierung
- **Besonderheiten:** Schülerpasswort-System, WordPress-Migration, Gamification
- **Beziehungen:** School, Class, Projects, Certificates

#### [School Model](School.md)
- **Zweck:** Schulen mit Status, Adresse, Förderern
- **Besonderheiten:** Schulcode, Gratis-Lizenzen, Status-Verwaltung
- **Beziehungen:** Users (Teachers), Classes, Licenses

#### [Class Model](Class.md)
- **Zweck:** Klassen mit Schülern, Lehrern, Kurspaketen
- **Besonderheiten:** Co-Lehrer, Schuljahr-Zuordnung, Klassen-Übertragung
- **Beziehungen:** School, School Year, Users, Course Packages

#### [School Year Model](School_Year.md)
- **Zweck:** Schuljahre (Saisons) für Lizenz-Verwaltung
- **Besonderheiten:** Nur ein aktuelles Schuljahr, T!Coins-Tracking
- **Beziehungen:** Classes, Licenses, T!Coins Transactions

### 🎮 Projekte & Scratch

#### [Project Model](Project.md)
- **Zweck:** Scratch-Projekte mit Status, Veröffentlichung, Statistiken
- **Besonderheiten:** Scratch-Daten (JSONB), Auto-Save, Challenge-Zuordnung
- **Beziehungen:** User (Author), Class, School, Challenge, Versions, Assets

#### [Project Version Model](Project_Version.md)
- **Zweck:** Versions-Historie für Auto-Save und Wiederherstellung
- **Besonderheiten:** Änderungs-Tracking, Versions-Limit
- **Beziehungen:** Project, User (Author)

#### [Asset Model](Asset.md)
- **Zweck:** Assets (Bilder, Sounds) für Scratch-Projekte
- **Besonderheiten:** S3-Speicherung, CDN-URLs, Metadaten
- **Beziehungen:** Project

### 📚 Kurse & Lernen

#### [Course Model](Course.md)
- **Zweck:** Kurse (modular aufgebaut aus Lektionen)
- **Besonderheiten:** Modular, wiederverwendbare Lektionen, Module/Kapitel
- **Beziehungen:** Lessons, Course Packages

#### [Lesson Model](Lesson.md)
- **Zweck:** Lektionen (modular, wiederverwendbar)
- **Besonderheiten:** Videos, Lernkarten, Text-Inhalt, Lernmaterial
- **Beziehungen:** Courses, Quizzes, Flashcards, Materials

#### [Quiz Model](Quiz.md)
- **Zweck:** Quizzes zu Lektionen mit verschiedenen Fragetypen
- **Besonderheiten:** Multiple Choice, True/False, Fill Blank, Drag & Drop
- **Beziehungen:** Lesson, Quiz Submissions

#### [Course Package Model](Course_Package.md)
- **Zweck:** Kurspakete mit mehreren Kursen
- **Besonderheiten:** Lizenzen, Preise, Verfügbarkeit
- **Beziehungen:** Courses, Classes

### 🏆 Challenges & Wettbewerbe

#### [Challenge Model](Challenge.md)
- **Zweck:** Challenges/Wettbewerbe mit automatischer Projekt-Einreichung
- **Besonderheiten:** Kriterien-Prüfung, Organisatoren, Gebiets-Filterung
- **Beziehungen:** Sponsors, Projects (Submissions), Users

### 🏅 Gamification & Achievements

#### [Certificate Model](Certificate.md)
- **Zweck:** Urkunden/Zertifikate (automatisch oder manuell)
- **Besonderheiten:** PDF-Generierung, Automatische Vergabe, Templates
- **Beziehungen:** Users, Courses, Challenges

#### [T!Coins Transaction Model](T_Coins_Transaction.md)
- **Zweck:** T!Coins-Transaktionen (Verdienste und Ausgaben)
- **Besonderheiten:** Pro Schuljahr getrackt, Shop-Integration, T!Score-Berechnung
- **Beziehungen:** Users, School Years, Shop Items

### 💬 Kommunikation

#### [Message Model](Message.md)
- **Zweck:** Nachrichten und Chat-Kommunikation
- **Besonderheiten:** Direkt-Chat, Klassen-Chat, Datei-Anhänge
- **Beziehungen:** Users, Conversations, Classes

#### [Notification Model](Notification.md)
- **Zweck:** Benachrichtigungen (In-App, E-Mail, Push)
- **Besonderheiten:** Verschiedene Typen, Kanäle, Read-Status
- **Beziehungen:** Users

## Datenmodell-Diagramm

```
Users (Student, Teacher, Admin)
  ├── Schools
  │   └── Classes
  │       └── Users (Students)
  │
  ├── Projects
  │   ├── Project Versions
  │   ├── Assets
  │   └── Challenge Submissions
  │
  ├── Courses
  │   ├── Lessons
  │   │   ├── Quizzes
  │   │   ├── Flashcards
  │   │   └── Materials
  │   └── Course Packages
  │
  ├── Challenges
  │   └── Challenge Submissions
  │
  ├── Certificates
  │
  ├── T!Coins Transactions
  │   └── Shop Items
  │
  ├── Messages
  │   └── Conversations
  │
  └── Notifications
```

## Wichtige Beziehungen

### One-to-Many
- School → Users (Teachers)
- School → Classes
- Class → Users (Students)
- User → Projects
- Project → Project Versions
- Project → Assets
- Course → Lessons
- Lesson → Quizzes
- User → T!Coins Transactions
- User → Certificates
- User → Messages
- User → Notifications

### Many-to-Many
- Users ↔ Classes (via class_teachers)
- Courses ↔ Lessons (via course_lessons)
- Courses ↔ Course Packages (via course_package_courses)
- Classes ↔ Course Packages (via class_course_packages)
- Users ↔ Certificates (via user_certificates)
- Users ↔ Shop Items (via user_shop_items)
- Challenges ↔ Projects (via challenge_submissions)

## Technische Details

### Datenbank
- **DBMS:** PostgreSQL
- **ORM:** Prisma oder TypeORM
- **Storage:** AWS S3 für Assets

### Besonderheiten
- **Modulare Kurse:** Lektionen können in verschiedenen Kursen wiederverwendet werden
- **Schuljahr-basiert:** T!Coins und Lizenzen sind pro Schuljahr
- **Auto-Save:** Projekt-Versionen werden automatisch gespeichert
- **Automatische Vergabe:** Urkunden und Challenge-Einreichungen werden automatisch verarbeitet

## Nächste Schritte

1. **API-Dokumentation:** REST/GraphQL Endpunkte definieren
2. **Migration Scripts:** Datenbank-Migrationen erstellen
3. **Seed Data:** Test-Daten generieren
4. **Performance:** Indizes optimieren
5. **Backup:** Backup-Strategie implementieren

> [!tip] Implementation Hint
> - Verwende Prisma oder TypeORM für ORM
> - Implementiere Soft Delete wo nötig
> - Cache häufig abgerufene Daten
> - Validierung auf Datenbank-Ebene und Anwendungs-Ebene
> - Audit-Log für wichtige Änderungen
