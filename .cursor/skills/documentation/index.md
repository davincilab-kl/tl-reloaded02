---
title: Talentslounge Rewrite
description: The Single Source of Truth for the platform rewrite.
enableToc: true
tags:
  - homepage
  - documentation
---

# 🏗️ Platform Rewrite: Source of Truth

Willkommen in der zentralen Dokumentation für den **Complete Rewrite** unserer Plattform.
Dieses Repository ist die **einzige Wahrheit** für Logik, Design und Datenstrukturen.

> [!important] Zielsetzung
> Wir portieren eine Legacy-PHP-Plattform auf einen modernen Stack.
> **Oberste Regel:** Wir kopieren **keinen** alten PHP-Code. Wir extrahieren die *Business Logic* und schreiben sie sauber neu.

---

## 🧭 Navigation & Struktur

### 1. 📐 The Blueprint (Global Rules)
Bevor du Features baust, verstehe die Grundlagen.
* [[00_Blueprint/Tech_Stack|🛠️ Tech Stack Definition]] - (Frameworks, Libraries)
* [[00_Blueprint/Design_System|🎨 Design System]] - (UI Components, Colors, Typography)
* [[00_Blueprint/API_Standards|🔌 API & Architecture]] - (Wie kommunizieren Frontend & Backend)
* [[00_Blueprint/Auth_System|🔐 Auth System]] - (Better Auth, Schülerpasswort, WordPress-Migration)
* [[00_Blueprint/Calendly_Integration|📅 Calendly Integration]] - (Info-Webinar Synchronisation)
* [[00_Blueprint/Gamification_System|🎮 Gamification System]] - (T!Coins und T!Score Erklärung)
* [[00_Blueprint/Performance_Guidelines|⚡ Performance Guidelines]] - (Caching, Queue-System, Optimierung)
* [[00_Blueprint/Security_Guidelines|🔒 Security Guidelines]] - (Sicherheitsmaßnahmen, CAPTCHA)
* [[00_Blueprint/Testing_Strategy|🧪 Testing Strategy]] - (Unit, Integration, E2E Tests)
* [[00_Blueprint/Monitoring_Logging|📊 Monitoring & Logging]] - (Observability, Metriken, Alerting)

### 2. 🧩 Feature Specs 
Die funktionale Logik, gruppiert nach Domänen.
* **Authentication** -> [[01_Features/Auth/Login|Login]], [[01_Features/Auth/Register|Register]], [[01_Features/Auth/Password_Reset|Password Reset]]
* **Dashboard** -> 
  * Teacher: 
    * [[01_Features/Dashboard/Teacher/Overview|Overview]], [[01_Features/Dashboard/Teacher/Stats|Statistics]]
    * User Journeys: [[01_Features/Dashboard/Teacher/User_Journey|Übersicht]], [[01_Features/Dashboard/Teacher/School_Management|Meine Schule]], [[01_Features/Dashboard/Teacher/Class_Management|Klassenmanagement]], [[01_Features/Dashboard/Teacher/Project_Management|Projektverwaltung]], [[01_Features/Dashboard/Teacher/Challenge_Management|Wettbewerbe]], [[01_Features/Dashboard/Teacher/Course_Management|Kurse]], [[01_Features/Dashboard/Teacher/Order_Management|Bestellverwaltung]]
  * Student: 
    * [[01_Features/Dashboard/Student/Overview|Overview]], [[01_Features/Dashboard/Student/Stats|Statistics]]
    * User Journeys: [[01_Features/Dashboard/Student/User_Journey|Übersicht]], [[01_Features/Dashboard/Student/Course_Overview|Kursübersicht]], [[01_Features/Dashboard/Student/Course_Workflow|Kurs durcharbeiten]], [[01_Features/Dashboard/Student/Project_Development|Projekt entwickeln]], [[01_Features/Dashboard/Student/Project_Publishing|Projekt veröffentlichen]], [[01_Features/Dashboard/Student/Challenges|Challenges]], [[01_Features/Dashboard/Student/Leaderboards|Leaderboards]]
  * Admin:
    * [[01_Features/Dashboard/Admin/Overview|Overview]], [[01_Features/Dashboard/Admin/Teacher_Management|Lehrkraft-Verwaltung]], [[01_Features/Dashboard/Admin/Teacher_Pipeline|Teacher Pipeline]], [[01_Features/Dashboard/Admin/Info_Webinar_Management|Info-Webinar Management]], [[01_Features/Dashboard/Admin/Admin_Lists|Admin Lists]], [[01_Features/Dashboard/Admin/Impersonation|Impersonation]], [[01_Features/Dashboard/Admin/Email_Templates|Email Templates]]
* **User Settings** -> [[01_Features/Settings/Profile|Profile Management]]

### 3. 📄 Static Content
Seiten ohne komplexe Business-Logik.
* [[02_Static_Pages/Landing_Page|Landing Page]]
* [[02_Static_Pages/Impressum|Impressum]] & [[02_Static_Pages/Datenschutz|Datenschutz]]

### 4. 🗄️ Data Models
Die neue Datenbank-Struktur. Referenziere diese in den Features!
* [[03_Data_Models/User|User Model]]
* [[03_Data_Models/Course|Course Model]]
* [[03_Data_Models/Class|Class Model]]
* [[03_Data_Models/Project|Project Model]]
* [[03_Data_Models/Challenge|Challenge Model]]
* [[03_Data_Models/School|School Model]]
* [[03_Data_Models/Calendly_Event|Calendly Event Model]]
* [[03_Data_Models/Calendly_Event_Attendee|Calendly Event Attendee Model]]
* [[03_Data_Models/Teacher_Status|Teacher Status Model]]
* [[03_Data_Models/Teacher_Status_History|Teacher Status History Model]]
* [[03_Data_Models/Email_Template|Email Template Model]]
* [[03_Data_Models/Class_Order|Class Order Model]]
* [[03_Data_Models/Admin_Teacher_List|Admin Teacher List Model]]
* [[03_Data_Models/Admin_Teacher_List_Cache|Admin Teacher List Cache Model]]

---

## 🤖 Instructions for AI Agents
*(If you are an LLM/Cursor/Windsurf executing code generation based on this doc, read this)*

1.  **Context is Key:** Always check the linked **Data Models** (`[[Model]]`) before writing SQL or API schemas.
2.  **Ignore Legacy Implementation:** If a file contains a "Legacy Trap" callout, explicitly avoid that pattern. It is an anti-pattern.
3.  **Pseudocode over PHP:** The logic in these docs is described in pseudocode. Translate it idiomatic to the target language (e.g., TypeScript/Node.js).
4.  **UI Components:** Use the components defined in [[00_Blueprint/Design_System]]. Do not invent new UI styles unless necessary.

---

## 🚦 Project Status

> [!summary] Current Focus: **Core Infrastructure**
> - [x] Define Tech Stack
> - [ ] Set up Database Schema (Models)
> - [ ] Auth System (Login/Register)
> - [ ] Dashboard Skeleton

---

## 🛑 Legend for Callouts

Wir nutzen farbige Boxen für schnelle Orientierung:

> [!abstract] User Story
> Was der Nutzer erreichen will.

> [!warning] Legacy Trap
> Warnung vor Fehlern aus dem alten System (PHP Altlasten). **Nicht nachbauen!**

> [!tip] Implementation Hint
> Technische Hinweise für den Rewrite (z.B. Libraries, Hooks).