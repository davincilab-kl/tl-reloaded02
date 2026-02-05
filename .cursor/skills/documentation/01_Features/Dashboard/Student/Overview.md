---
title: Student Dashboard Overview
description: Schüler-Dashboard Übersicht
enableToc: true
tags:
  - features
  - student
---

# 📊 Student Dashboard Overview

> [!abstract] User Story
> Als Schüler möchte ich nach dem Login eine Übersicht über meine Kurse, Projekte und Fortschritte sehen.

## Verwandte Features

- **Course Overview:** [[01_Features/Dashboard/Student/Course_Overview|Course Overview]] - Zugriff auf Kurse
- **Project Development:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Zugriff auf Projekte
- **Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-Übersicht
- **Leaderboards:** [[01_Features/Dashboard/Student/Leaderboards|Leaderboards]] - Rankings
- **Stats:** [[01_Features/Dashboard/Student/Stats|Stats]] - Detaillierte Statistiken
- **Profile Customization:** [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] - Profil anpassen

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell
- **T!Coins Transaction Model:** [[03_Data_Models/T_Coins_Transaction|T!Coins Transaction Model]] - T!Coins-Transaktionen

## Dashboard-Layout

### Persönliche Daten Sektion ("Deine persönlichen Daten")

#### Benutzerprofil
- **Avatar:** Graues Avatar-Icon (kann personalisiert werden)
- **Name:** Anzeige des Schülernamens (z.B. "Algebra Narrator 380")
- **Klasse:** Anzeige der zugewiesenen Klasse (z.B. "Klasse: Sfgfg")

#### Schnellübersicht (3 Boxen)
- **T!Coins gesamt:** Gesamte Anzahl der verdienten T!Coins
- **Projekte:** Anzahl der erstellten/veröffentlichten Projekte
- **Urkunden:** Anzahl der erhaltenen Zertifikate/Urkunden
  - **Link:** Direkter Zugriff auf [[01_Features/Dashboard/Student/Certificates|Meine Urkunden]]

### Kursübersicht

#### Verfügbare Kurse
- Liste aller Kurse, an denen der Schüler teilnimmt
- Fortschrittsanzeige pro Kurs (z.B. "3 von 10 Lektionen abgeschlossen")
- Direkter Zugriff auf Kurse durch Klick

#### Aktuelle Aktivitäten
- **Nächste Lektion:** Vorschau auf die nächste zu bearbeitende Lektion
- **Wartende Approvals:** Projekte, die auf Lehrer-Approval warten
- **Neues Feedback:** Benachrichtigungen über Lehrer-Feedback

### Projekte & Challenges

#### Meine Projekte
- Übersicht aller eigenen Scratch-Projekte
- **Status:** In Bearbeitung, Zur Veröffentlichung eingereicht, Veröffentlicht
- **Sichtbarkeit:** Öffentlich oder Nur Klasse (bei veröffentlichten Projekten)
- Direkter Zugriff auf Projekt-Editor

#### Challenges & Wettbewerbe
- Aktive Challenges, an denen der Schüler teilnimmt
- Fortschritt und verbleibende Zeit bis Deadline
- Status: Eingereicht, In Bearbeitung, Abgeschlossen
- Link zu Challenge-Details und Leaderboards

### Leaderboards & Rankings

#### Persönliche Position
- Ranking in der eigenen Klasse
- Ranking in der Schule
- Globale Rankings (optional)

#### Top-Performer
- Beste Schüler der Klasse
- Beste Schüler der Schule

### Erfolgsübersicht nach Schuljahr

#### Aktuelles Schuljahr
- **Schuljahr:** z.B. "2025/2026"
- **Zeitraum:** z.B. "01.09.25 bis 30.06.26"
- Automatische Filterung der Statistiken nach Schuljahr

#### Vergleichsboxen (3 Boxen)

**1. Meine Erfolge**
- T!Coins im aktuellen Schuljahr
- Projekte im aktuellen Schuljahr
- Urkunden im aktuellen Schuljahr

**2. Erfolge meiner Klasse**
- Klassenname (z.B. "Sfgfg")
- **T!Score:** Durchschnittlicher Score der Klasse (z.B. "1,000 T!Score")
  - **Berechnung:** Summe aller T!Coins der Klasse ÷ Anzahl Schüler (aktuelles Schuljahr)
  - **Wichtig:** Nur T!Coins und Schüler des aktuellen Schuljahres werden berücksichtigt
- Dropdown-Pfeil für detaillierte Ansicht
- Vergleich mit anderen Klassen

**3. Erfolge meiner Schule**
- Schulname (z.B. "MS Demoschule")
- **T!Score:** Durchschnittlicher Score der Schule (z.B. "1,154 T!Score")
  - **Berechnung:** Summe aller T!Coins der Schule ÷ Anzahl Schüler (aktuelles Schuljahr)
  - **Wichtig:** Nur T!Coins und Schüler des aktuellen Schuljahres werden berücksichtigt
- Aufwärtspfeil für positive Entwicklung
- Vergleich mit anderen Schulen
- **Siehe:** [[01_Features/GLOSSARY|Glossar]] für T!Score-Definition

### Navigation & Quick Actions

#### Hauptnavigation
- Dashboard (aktuell)
- Kurse
- Projekte
- Challenges
- Profil
- **Leaderboards** 
  - Klassen-Ranking (Top 3 Klassen der Schule)
  - Schüler-Ranking (Top 3 Schüler der Klasse)

#### Quick Actions
- Neues Projekt starten
- Zu nächster Lektion

## Design-Elemente

### Visuelle Elemente
- Motivationsbilder: Fotos von erfolgreichen Schülern mit Urkunden und Trophäen
- Farbcodierung für verschiedene Bereiche
- Fortschrittsbalken und Icons
- Responsive Design für verschiedene Bildschirmgrößen

### Gamification
- T!Coins als Währung für Engagement
- Urkunden als Belohnungen für Meilensteine
- T!Score für Klassen- und Schulvergleiche
- Achievements und Badges

