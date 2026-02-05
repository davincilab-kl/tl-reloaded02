---
title: Teacher User Journey - Übersicht
description: Übersicht über alle User Journeys eines Lehrers auf der Plattform
enableToc: true
tags:
  - features
  - teacher
---

# 👨‍🏫 Teacher User Journey - Übersicht

> [!abstract] User Story
> Als Lehrer möchte ich meine Klassen verwalten, Schüler unterstützen, Projekte prüfen und für Wettbewerbe einreichen.

## Verwandte Features

- **Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Zentrale Übersicht
- Alle einzelnen User Journey Features sind unten verlinkt

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell

## Übersicht: Alle Lehrer-User-Journeys

Die Lehrer-User-Journeys sind in spezifische Funktionsbereiche aufgeteilt:

### 🏫 [[01_Features/Dashboard/Teacher/School_Management|Meine Schule]]
- Schul-Informationen verwalten
- Schulcode anzeigen
- Lehrkräfte einladen und verwalten
- Lizenzen & Kurspakete bestellen
- Erfolge nach Schuljahr ansehen

### 👥 [[01_Features/Dashboard/Teacher/Class_Management|Klassenmanagement]]
- Klassen anlegen
- Schüler hinzufügen und verwalten
- Co-Lehrkräfte verwalten
- Klassen-Statistiken ansehen

### 📁 [[01_Features/Dashboard/Teacher/Project_Management|Projektverwaltung]]
- Projekte der Schüler anzeigen
- Projekte prüfen und bewerten
- Projekt-Status verwalten
- Opt-Out pro Projekt für automatische Challenge-Einreichung

### 🏆 [[01_Features/Dashboard/Teacher/Challenge_Management|Wettbewerbe verwalten]]
- Wettbewerbe anzeigen
- Projekte für Wettbewerbe einreichen
- Automatische Einreichung verwalten
- Opt-Out pro Projekt setzen

### 📚 [[01_Features/Dashboard/Teacher/Course_Management|Kurse verwalten]]
- Kurse anzeigen
- Kurs-Sichtbarkeit für Schüler steuern
- Kurspakete zuweisen

## Kompletter User Flow (High-Level)

```
🔐 Einloggen (mit E-Mail/Passwort)
  ↓
📊 Teacher Dashboard
  ↓
┌─────────────────────────────────────┐
│  Haupt-Workflows (parallel möglich) │
└─────────────────────────────────────┘
  │
  ├─→ 🏫 Meine Schule
  │     ↓
  │   Schul-Info, Lehrkräfte, Lizenzen
  │
  ├─→ 👥 Klassenmanagement
  │     ↓
  │   Klassen anlegen, Schüler verwalten
  │
  ├─→ 📁 Projektverwaltung
  │     ↓
  │   Projekte prüfen, Status verwalten
  │     ↓
  │   [Automatische Einreichung oder Opt-Out]
  │
  └─→ 🏆 Wettbewerbe
        ↓
      Projekte einreichen, verwalten
```

## Dashboard als Zentrale

Das [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] dient als zentrale Anlaufstelle:
- Übersicht über alle Klassen
- Schnellzugriff auf Projekte und Wettbewerbe
- Statistiken und Fortschritte
- [[01_Features/Dashboard/Teacher/Stats|Statistiken und Analytics]]

## Wichtige Funktionen

### Schülerpasswörter zurücksetzen
- Im Schüler-Verwaltung
- Passwort-Reset im Teacher Dashboard
- Schüler erhält neues Passwort

### Automatische Challenge-Einreichung
- Standard: Projekte werden automatisch eingereicht (wenn Kriterien erfüllt)
- Opt-Out pro Projekt möglich
- Lehrer kann manuell einreichen

### Projekt-Prüfung
- Projekte prüfen und bewerten
- Kriterien: Code-Qualität, Funktionalität, Kreativität
- Feedback an Schüler

> [!tip] Implementation Hint
> - Implementiere nahtlose Navigation zwischen allen Bereichen
> - Opt-Out sollte pro Projekt gespeichert werden
> - Automatische Einreichung sollte im Hintergrund laufen
> - Projekt-Prüfung sollte einfach und schnell sein
