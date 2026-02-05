---
title: Challenge Management - Wettbewerbe verwalten
description: User Journey für Wettbewerbs-Verwaltung durch Lehrer
enableToc: true
tags:
  - features
  - teacher
---

# 🏆 Challenge Management - Wettbewerbe verwalten

> [!abstract] User Story
> Als Lehrer möchte ich Wettbewerbe verwalten, Projekte einreichen und Opt-Out für Projekte setzen.

## Verwandte Features

- **Student Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-Teilnahme der Schüler
- **Project Review System:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Opt-Out für automatische Einreichung
- **Project Management:** [[01_Features/Dashboard/Teacher/Project_Management|Project Management]] - Projekte für Challenges einreichen
- **Admin Challenge Management:** [[01_Features/Dashboard/Admin/Challenge_Management|Admin Challenge Management]] - Challenge-Erstellung durch Admin
- **Public Challenges:** [[01_Features/Challenges/Public_Challenges|Public Challenges]] - Öffentliche Challenges-Übersicht

## Data Models

- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell
- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell

## User Flow: Wettbewerbe verwalten

### 1. Wettbewerbe anzeigen
- **Zugriff:**
  - In Klassen-Detailansicht: "Wettbewerbe" Tab
  - Übersicht aller aktiven Wettbewerbe
- **Wettbewerbs-Liste:**
  - Wettbewerbsname
  - Beschreibung
  - Projekteinreichfrist (Deadline)
  - Tag/ID (z.B. "RLBOCE 25/26", "YH2026")
  - Status

### 2. Wettbewerbs-Details
- **Expandierbare Sektion:**
  - Wettbewerbs-Details anzeigen
  - Eingereichte Projekte der Klasse
  - "Noch keine Projekte eingereicht" wenn leer
- **Projekt hinzufügen:**
  - "+ Projekt hinzufügen" Button
  - Liste verfügbarer Projekte
  - Projekt auswählen und einreichen

### 3. Automatische Einreichung verwalten
- **Standard-Verhalten:**
  - Projekte werden automatisch eingereicht, wenn Kriterien erfüllt
  - System prüft automatisch alle Projekte
- **Opt-Out pro Projekt:**
  - Lehrer kann pro Projekt Opt-Out aktivieren
  - In Projekt-Verwaltung: Opt-Out für spezifisches Projekt setzen
  - Wenn Opt-Out aktiv: Projekt wird nicht automatisch eingereicht
  - Andere Projekte werden weiterhin automatisch eingereicht

### 4. Projekte manuell einreichen
- **Manuelle Einreichung:**
  - "+ Projekt hinzufügen" im Wettbewerb
  - Liste aller Projekte der Klasse
  - Projekt auswählen
  - Für Wettbewerb einreichen
- **Einreichungs-Status:**
  - Projekt erscheint in Wettbewerbs-Einreichungen
  - Schüler wird benachrichtigt
  - Status wird auf "Eingereicht" gesetzt

### 5. Eingereichte Projekte verwalten
- **Übersicht:**
  - Alle eingereichten Projekte pro Wettbewerb
  - Status der Einreichung
  - Deadline-Informationen
- **Aktionen:**
  - Projekt zurückziehen
  - Projekt aktualisieren
  - Details anzeigen

## Wettbewerbs-Status

### Aktive Wettbewerbe
- Laufende Wettbewerbe
- Projekte können noch eingereicht werden
- Deadline noch nicht erreicht

### Beendete Wettbewerbe
- Deadline erreicht
- Keine weiteren Einreichungen möglich
- Ergebnisse werden angezeigt

## Projekt-Kriterien

### Automatische Prüfung
- Projekt-Typ passt zur Challenge
- Deadline wurde eingehalten
- Projekt ist veröffentlicht
- Challenge-spezifische Kriterien erfüllt

### Kriterien-Erfüllung
- System markiert Projekte, die Kriterien erfüllen
- Lehrer sieht markierte Projekte im Dashboard
- Automatische Einreichung erfolgt (außer Opt-Out)
