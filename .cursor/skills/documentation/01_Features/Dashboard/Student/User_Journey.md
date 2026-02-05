---
title: Student User Journey - Übersicht
description: Übersicht über alle User Journeys eines Schülers auf der Plattform
enableToc: true
tags:
  - features
  - student
---

# 🎓 Student User Journey - Übersicht

> [!abstract] User Story
> Als Schüler möchte ich durch Kurse navigieren, Lektionen abschließen und eigene Coding-Projekte entwickeln und veröffentlichen.

## Verwandte Features

- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Zentrale Übersicht
- Alle einzelnen User Journey Features sind unten verlinkt

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell
- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell

## Übersicht: Alle Schüler-User-Journeys

Die Schüler-User-Journeys sind in spezifische Funktionsbereiche aufgeteilt:

### 📖 [[01_Features/Dashboard/Student/Course_Overview|Kursübersicht]]
- Kurse anzeigen und durchsuchen
- Kurs-Details ansehen
- Kurse starten und verwalten
- Fortschritt verfolgen

### 📚 [[01_Features/Dashboard/Student/Course_Workflow|Kurs durcharbeiten]]
- Lektionen auswählen
- Videos anschauen
- Lernkarten durcharbeiten
- Challenges absolvieren
- Quizzes machen
- Kurs abschließen

### 💻 [[01_Features/Dashboard/Student/Project_Development|Projekt entwickeln]]
- Neues Scratch-Projekt starten
- Projekt im Editor entwickeln
- Projekt speichern und verwalten
- Projekt testen

### 🚀 [[01_Features/Dashboard/Student/Project_Publishing|Projekt veröffentlichen]]
- Projekt-Informationen vervollständigen
- Sichtbarkeits-Einstellungen wählen
- Projekt veröffentlichen
- Projekt teilen und verwalten

### 🏆 [[01_Features/Dashboard/Student/Challenges|Challenges & Wettbewerbe]]
- Challenges entdecken und ansehen
- Projekt für Challenge entwickeln
- Automatische Einreichung durch Lehrer (bei erfüllten Kriterien)
- Ergebnisse ansehen

### 🏅 [[01_Features/Dashboard/Student/Leaderboards|Leaderboards]]
- Klassen-Ranking (Top 3 Klassen der Schule)
- Schüler-Ranking (Top 3 Schüler der Klasse)
- Motivations-Meldungen bei Top 3
- Challenge-Leaderboards

## Kompletter User Flow (High-Level)

```
🔐 Einloggen (mit Schülerpasswort)
  ↓
📊 Dashboard anzeigen
  ↓
┌─────────────────────────────────────┐
│  Haupt-Workflows (parallel möglich) │
└─────────────────────────────────────┘
  │
  ├─→ 📖 Kursübersicht
  │     ↓
  │   📚 Kurs durcharbeiten
  │     ↓
  │   [LOOP: Lektionen → Video → Lernkarten → Quiz]
  │
  └─→ 💻 Projekt entwickeln
        ↓
      🚀 Projekt veröffentlichen
        ↓
      🏆 Challenge-Teilnahme (optional)
        ↓
      [Lehrer reicht automatisch ein, wenn Kriterien erfüllt]
```

## Dashboard als Zentrale

Das [[01_Features/Dashboard/Student/Overview|Student Dashboard]] dient als zentrale Anlaufstelle:
- Übersicht über persönliche Daten (Name, Klasse, T!Coins, Projekte, Urkunden)
- Schnellzugriff auf aktive Kurse
- Übersicht über eigene Projekte
- [[01_Features/Dashboard/Student/Stats|Statistiken und Erfolgsübersicht]]
- Vergleich mit Klasse und Schule (T!Score)

## Gamification & Belohnungen

Alle User Journeys sind mit Gamification-Elementen verbunden:
- **T!Coins:** Persönliche Belohnungen für Aktivitäten (siehe [[00_Blueprint/Gamification_System|Gamification System]])
- **T!Score:** Gruppen-Score für Klassen- und Schul-Vergleiche (siehe [[00_Blueprint/Gamification_System|Gamification System]])
- **Urkunden:** Für Meilensteine und besondere Leistungen
- **Achievements:** Badges für verschiedene Erfolge

## Navigation zwischen Journeys

Schüler können jederzeit zwischen verschiedenen Workflows wechseln:
- Vom Dashboard zu Kursen, Projekten, Challenges oder Leaderboards
- Von Kursen zu Projekten (Anwendung des Gelernten)
- Von Projekten zurück zu Kursen (neue Konzepte lernen)
- Von Challenges zu Leaderboards (Ergebnisse ansehen)
- Alle Aktivitäten werden im Dashboard zusammengefasst

> [!tip] Implementation Hint
> - Implementiere nahtlose Navigation zwischen allen Bereichen
> - Speichere Fortschritt in Echtzeit
> - Synchronisiere Daten zwischen verschiedenen Workflows
> - Dashboard sollte immer aktuellen Status zeigen
