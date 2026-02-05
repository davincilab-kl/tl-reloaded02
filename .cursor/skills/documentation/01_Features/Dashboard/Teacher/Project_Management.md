---
title: Project Management - Projektverwaltung
description: User Journey für Projektverwaltung durch Lehrer
enableToc: true
tags:
  - features
  - teacher
---

# 📁 Project Management - Projektverwaltung

> [!abstract] User Story
> Als Lehrer möchte ich Projekte meiner Schüler verwalten, prüfen und für Wettbewerbe einreichen.

## Verwandte Features

- **Project Review System:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Detaillierte Projektprüfung
- **Student Project Publishing:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Veröffentlichungs-Workflow der Schüler
- **Challenges:** [[01_Features/Dashboard/Teacher/Challenge_Management|Challenge Management]] - Projekte für Challenges einreichen
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Zugriff über Klassen-Verwaltung

## Data Models

- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell

## User Flow: Projektverwaltung

### 1. Projekte anzeigen
- **Zugriff:**
  - In Klassen-Detailansicht: "Projekte" Tab
  - Übersicht aller Projekte der Klasse
- **Projekt-Liste:**
  - Tabelle mit Spalten:
    - Schüler:in
    - Projekttitel
    - T!Coins
    - Likes
    - Link
    - Status
    - Letzte Änderung
    - Aktionen

### 2. Projekt-Status verwalten
- **Status-Typen:**
  - **In Bearbeitung:** Projekt wird noch entwickelt
  - **Veröffentlicht:** Projekt ist öffentlich sichtbar
  - **Eingereicht:** Projekt wurde für Wettbewerb eingereicht
  - **Nicht angefragt:** Projekt wurde noch nicht geprüft
- **Status ändern:**
  - Über Aktionen-Menü pro Projekt
  - Status wird aktualisiert
  - Schüler wird benachrichtigt

### 3. Projekt prüfen
- **Zugriff:**
  - "Prüfen" im Aktionen-Menü
  - Projektprüfungs-Interface öffnet sich (siehe [[01_Features/Dashboard/Teacher/Project_Review_System|Projektprüfungs-System]])
- **Projektprüfungs-Interface:**
  - **Linke Spalte:** Projekt-Details
    - Projektbild mit Toggle "Projektbild akzeptiert"
    - Projekttitel mit Toggle "Projekttitel akzeptiert"
    - Kurzbeschreibung mit Zeichenzähler und Toggle
    - Link-Prüfung mit Toggle "Projektlink akzeptiert"
  - **Rechte Spalte:** Feedback & Wettbewerbsauswahl
    - Opt-Out Checkbox für automatische Challenge-Einreichung
    - **Feedback-Vorlagen:**
      - Positive Rückmeldungen (grüne Buttons)
      - Verbesserungsvorschläge (rote Buttons)
    - Freies Text-Feedback mit Zeichenzähler
  - **Aktionen:**
    - "Akzeptieren" Button (blau)
    - "Zurückziehen" Button (weiß)
- **Detaillierte Beschreibung:** Siehe [[01_Features/Dashboard/Teacher/Project_Review_System|Projektprüfungs-System]]

### 4. Projekt für Wettbewerb einreichen
- **Automatische Einreichung (Standard):**
  - System prüft automatisch, ob Projekt Challenge-Kriterien erfüllt
  - Wenn erfüllt: Projekt wird automatisch eingereicht
  - Schüler wird benachrichtigt
- **Opt-Out pro Projekt:**
  - Lehrer kann pro Projekt Opt-Out aktivieren
  - Wenn Opt-Out aktiv: Projekt wird nicht automatisch eingereicht
  - Lehrer kann manuell einreichen, wenn gewünscht
- **Manuelle Einreichung:**
  - Lehrer wählt Projekt aus
  - Wählt Wettbewerb aus
  - Reicht Projekt manuell ein

### 5. Projekt-Aktionen
- **Weiter bearbeiten:**
  - Projekt im Editor öffnen
  - Gemeinsam mit Schüler bearbeiten
- **Zurückziehen:**
  - Projekt aus Wettbewerb zurückziehen
  - Status ändern
- **Details anzeigen:**
  - Vollständige Projekt-Informationen
  - Projekt-Vorschau
  - Statistiken (Views, Likes, etc.)

## Projekt-Filterung

### Status-Filter
- Alle Projekte
- In Bearbeitung
- Veröffentlicht
- Eingereicht
- Nicht angefragt

### Schüler-Filter
- Projekte nach Schüler filtern
- Suche nach Projekttitel

## Projekt-Statistiken

### Klassen-Übersicht
- Gesamtzahl der Projekte
- Projekte nach Status
- Durchschnittliche T!Coins pro Projekt
- Top-Projekte (nach Likes/T!Coins)

### Schüler-Statistiken
- Projekte pro Schüler
- Durchschnittliche Projekt-Qualität
- Aktivste Schüler
