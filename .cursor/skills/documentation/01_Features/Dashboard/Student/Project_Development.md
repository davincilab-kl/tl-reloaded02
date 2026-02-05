---
title: Project Development - Scratch-Projekt entwickeln
description: User Journey für die Entwicklung eigener Scratch-Projekte
enableToc: true
tags:
  - features
  - student
---

# 💻 Project Development - Scratch-Projekt entwickeln

> [!abstract] User Story
> Als Schüler möchte ich eigene Scratch-Projekte entwickeln, um das Gelernte praktisch anzuwenden und kreativ zu sein.

## Verwandte Features

- **Scratch Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Vollständige Integration
- **Project Publishing:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Projekt-Veröffentlichung

## Data Models

- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **Project Version Model:** [[03_Data_Models/Project_Version|Project Version Model]] - Versions-Historie und Auto-Save

## User Flow: Projekt entwickeln

### 1. Projekt starten
- **Zugriff:**
  - Vom Dashboard: "Neues Projekt starten" Button
  - Von der Projektübersicht: "Neues Projekt" Button
  - Nach Kursabschluss: Vorschlag für Abschlussprojekt
- **Projekt-Typen:**
  - Leeres Projekt (von Grund auf)

### 2. Projekt benennen
- **Projektname:** Schüler gibt einen Namen für das Projekt ein
- **Beschreibung:** Optional: Kurze Beschreibung des Projekts

### 3. Scratch-Umgebung öffnen
- **Editor-Integration:** Integrierte Scratch-Umgebung wird in der Plattform geladen
- **Vorhandene Scratch-Umgebung:** Die Plattform nutzt eine bereits vorhandene Scratch-Umgebung
- **Funktionen:**
  - Standard Scratch-Funktionen (Blöcke, Sprites, Bühne)
  - Speichern-Funktion (automatisch oder manuell)
  - Vorschau-Modus
  - Vollbild-Editor
  - Veröffentlichen direkt aus der Scratch-Umgebung

### 4. Projekt entwickeln
- **Entwicklungsprozess:**
  - Blöcke zusammenfügen
  - Sprites erstellen/bearbeiten
  - Bühne gestalten
  - Code testen und debuggen
- **Hilfe & Ressourcen:**
  - Tutorials innerhalb des Editors
  - Referenz zu Scratch-Blöcken
  - Beispiele aus Kursen
  - Community-Projekte als Inspiration

### 5. Projekt speichern
- **Automatisches Speichern:**
  - Periodisches Auto-Save (z.B. alle 30 Sekunden)
  - Speicherung bei Änderungen
- **Manuelles Speichern:**
  - "Speichern" Button
  - Tastenkürzel (Strg+S)
- **Versionshistorie:**
  - Ältere Versionen werden gespeichert
  - Möglichkeit zur Wiederherstellung früherer Versionen

### 6. Projekt testen
- **Vorschau-Modus:**
  - Projekt im Vorschau-Fenster ausführen
  - Interaktives Testen der Funktionalität
  - Debugging-Tools
- **Iteration:**
  - Zurück zum Editor für Anpassungen
  - Erneutes Testen
  - Wiederholung bis zufriedenstellend

### 7. Projekt speichern
- **Status:**
  - Projekt wird automatisch als **"In Bearbeitung"** gespeichert
  - Nicht öffentlich sichtbar
  - Kann später weiterbearbeitet werden
- **Zugriff:**
  - Projekt erscheint in "Meine Projekte" mit Status **"In Bearbeitung"**
  - Kann jederzeit wieder geöffnet werden
  - **Siehe:** [[01_Features/GLOSSARY|Glossar]] für Status-Definitionen

## Projekt-Verwaltung

### Projekt-Übersicht
- **Meine Projekte:**
  - Liste aller eigenen Projekte
  - **Status:** In Bearbeitung, Zur Veröffentlichung eingereicht, Veröffentlicht
  - **Sichtbarkeit:** Öffentlich oder Nur Klasse (bei veröffentlichten Projekten)
  - Letzte Änderung
  - Fortschrittsanzeige
  - Lehrer-Feedback (falls vorhanden)

### Projekt bearbeiten
- **Wiederaufnahme:**
  - Projekt aus Liste auswählen
  - Editor mit gespeichertem Stand öffnen
  - Weiterentwicklung
- **Duplizieren:**
  - Projekt kopieren als Ausgangspunkt für neues Projekt
  - Kopie wird als neues Projekt mit Status "In Bearbeitung" erstellt
  - Nützlich für Varianten oder Iterationen
  - Alle Likes, Kommentare und Statistiken bleiben beim Original

### Projekt löschen
- **Lösch-Funktion:**
  - Projekt kann gelöscht werden
  - Bestätigungsdialog zur Sicherheit
  - Optional: Wiederherstellung innerhalb von X Tagen

## Integration mit Kursen

### Kurs-bezogene Projekte
- **Abschlussprojekte:**
  - Bewertung durch Lehrer möglich
- **Übungsprojekte:**
  - Projekte basierend auf Kursinhalten
  - Anwendung des Gelernten

## Belohnungen & Gamification

### T!Coins
- **Projekt-Erstellung:** T!Coins für jedes neue Projekt
- **Entwicklungszeit:** Bonus-T!Coins für Engagement
- **Komplexität:** Zusätzliche T!Coins für anspruchsvolle Projekte
- **Siehe:** [[00_Blueprint/Gamification_System|Gamification System]] für vollständige T!Coins-Tabelle

### Achievements
- **Erstes Projekt:** Badge für erstes erstelltes Projekt
- **Projekt-Serie:** Badge für mehrere Projekte
- **Kreativität:** Badge für besonders kreative Projekte

## Technische Details

### Scratch-Integration
- **Editor:** Nutzung eines stark angepassten Custom Forks der Scratch-Umgebung
- **Anpassungen:** Die Scratch-Umgebung wurde speziell für die Plattform angepasst und erweitert
- **Speicherung:** Projekte werden in Plattform-Datenbank gespeichert
- **Format:** Scratch 3.0 Format (.sb3 JSON) kompatibel
- **Online-Only:** Alle Funktionen erfordern Internetverbindung (keine Offline-Funktionalität)
- **Siehe:** [[01_Features/Scratch/Integration|Scratch Integration]] für technische Details

## Verwandte Features

- **Scratch-Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Technische Details zur Scratch-Editor-Integration
- **Projekt-Veröffentlichung:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Veröffentlichungs-Workflow nach Projekt-Entwicklung
- **Projekt-Anzeige:** [[01_Features/Projects/Project_Display|Project Display]] - Öffentliche Projekt-Galerie
- **Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Projekte für Challenges entwickeln
- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Übersicht und Zugriff auf Projekte


