---
title: Public Leaderboard - Öffentliches Ranking
description: Öffentliche Leaderboard-Seite für Klassen, Schulen und Bundesländer
enableToc: true
tags:
  - features
  - leaderboards
  - public
---

# 🏅 Public Leaderboard - Öffentliches Ranking

> [!abstract] User Story
> Als Besucher möchte ich die Fortschritte der teilnehmenden Klassen, Schulen und Bundesländer in Echtzeit verfolgen können.

## Übersicht

Die öffentliche Leaderboard-Seite zeigt Rankings auf verschiedenen Ebenen (Klassen, Schulen, Bundesländer) und ermöglicht es Besuchern, die Leistungen der Teilnehmer zu verfolgen.

### Verwandte Features
- **Student Leaderboards:** [[01_Features/Dashboard/Student/Leaderboards|Leaderboards]] - Persönliche Rankings für Schüler
- **Challenges:** [[01_Features/Challenges/Public_Challenges|Public Challenges]] - Challenge-spezifische Leaderboards

## Data Models

- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards mit T!Score
- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell mit T!Coins
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell

## Hauptnavigation

### Zugriff
- **Hauptnavigation:** "Leaderboards" Link
- **Landing Page:** "Zum Leaderboard" Button
- **Direkter Link:** `/leaderboards`

## Hero Section

### Design
- **Headline:** "Entdecke die besten Talente" (Discover the best talents)
- **Sub-Headline:** "Verfolge die Fortschritte der teilnehmenden Klassen, Schulen und Bundesländer in Echtzeit." (Track the progress of participating classes, schools, and federal states in real-time.)
- **Tag:** "TalentsLounge Leaderboard"
- **Call-to-Action Buttons:**
  - "Zu den Projekten" (To the projects) - primärer CTA
  - "Zum Leaderboard" (To the leaderboard) - sekundärer CTA

### Illustration
- **Hintergrund:** Dynamische Illustration mit jungen Menschen an Laptops
- **Leaderboard-Visualisierung:** Große Anzeige eines Leaderboards mit Platzierungen
- **Motivational:** Zeigt Erfolg und Engagement

## Leaderboard-Bereiche

### Überschrift
- **Titel:** "Leaderboards 2024/25 & 2025/26"
- **Jahre:** Hervorgehoben in blauer Farbe

### Tabs/Navigation
- **"Top Klassen"** (Top Classes) - Standard-Auswahl
- **"Top Schulen"** (Top Schools)
- **Weitere Tabs:** Optional - "Top Bundesländer", "Top Challenges"

## Filter-Optionen

### Schuljahr-Filter
- **Dropdown:** "Alle Schuljahre" (All School Years)
- **Optionen:**
  - "Schuljahr 2024/2025"
  - "Schuljahr 2025/2026"
  - "Sommercamp 2025"
  - "Alle Schuljahre"

### Bundesland-Filter
- **Dropdown:** "Alle Bundesländer" (All Federal States)
- **Optionen:**
  - "Alle Bundesländer"
  - Spezifische Bundesländer (Wien, Niederösterreich, Oberösterreich, etc.)

### Challenge-Filter (Optional)
- **Dropdown:** "Alle Challenges" (All Challenges)
- **Optionen:**
  - "Alle Challenges"
  - Spezifische Challenges (z.B. "YouthHackathon 2026")

## Klassen-Leaderboard

### Anzeige
- **Top Klassen:** Liste der besten Klassen
- **Sortierung:** Nach T!Score (Durchschnittlicher Score: T!Coins ÷ Anzahl Schüler)
- **Anzeige:**
  - Platzierung (1, 2, 3, ...)
  - Klassenname
  - Schule
  - Bundesland
  - T!Score
  - Anzahl Schüler
  - Anzahl Projekte

### Layout
- **Tabelle:** Übersichtliche Tabelle mit Rankings
- **Hervorhebung:** Top 3 werden besonders hervorgehoben
- **Badges:** Medaillen für Top 3 (Gold, Silber, Bronze)

### Details
- **Klick auf Klasse:** Öffnet Detailseite mit:
  - Klassen-Statistiken
  - Top-Schüler der Klasse
  - Veröffentlichte Projekte der Klasse
  - Fortschritts-Graph

## Schulen-Leaderboard

### Anzeige
- **Top Schulen:** Liste der besten Schulen
- **Sortierung:** Nach T!Score (Durchschnittlicher Score aller Klassen)
- **Anzeige:**
  - Platzierung
  - Schulname
  - Bundesland
  - T!Score
  - Anzahl Klassen
  - Anzahl Schüler
  - Anzahl Projekte

### Layout
- **Tabelle:** Übersichtliche Tabelle mit Rankings
- **Hervorhebung:** Top 3 werden besonders hervorgehoben
- **Badges:** Medaillen für Top 3

### Details
- **Klick auf Schule:** Öffnet Detailseite mit:
  - Schul-Statistiken
  - Top-Klassen der Schule
  - Veröffentlichte Projekte der Schule
  - Fortschritts-Graph

## Bundesländer-Leaderboard (Optional)

### Anzeige
- **Top Bundesländer:** Liste der besten Bundesländer
- **Sortierung:** Nach T!Score (Durchschnittlicher Score aller Schulen)
- **Anzeige:**
  - Platzierung
  - Bundesland-Name
  - T!Score
  - Anzahl Schulen
  - Anzahl Klassen
  - Anzahl Schüler
  - Anzahl Projekte

## Challenge-spezifische Leaderboards

### Anzeige
- **Challenge-Leaderboards:** Rankings für spezifische Challenges
- **Filter:** Nach Challenge filtern
- **Anzeige:**
  - Top-Projekte der Challenge
  - Top-Klassen der Challenge
  - Top-Schulen der Challenge

## Lade-Zustand

### Loading-Spinner
- **Anzeige:** Roter kreisförmiger Lade-Spinner
- **Position:** Zentriert im Content-Bereich
- **Nachricht:** "Lädt, gleich geht's los! (bis zu 10 Sek.) 🚀" (Loading, it's starting soon! (up to 10 Sec.) 🚀)

### Performance
- **Ladezeit:** Optimiert für schnelle Anzeige (< 10 Sekunden)
- **Caching:** Gecachte Leaderboard-Daten
- **Inkrementelle Updates:** Nur Änderungen werden nachgeladen

## Echtzeit-Updates

### Aktualisierung
- **Echtzeit:** Leaderboards werden in Echtzeit aktualisiert
- **Polling:** Regelmäßige Abfrage für Updates (z.B. alle 30 Sekunden)
- **WebSocket:** Optional - Echtzeit-Updates über WebSocket

### Anzeige von Updates
- **Badge:** "Neu" Badge bei neuen Rankings
- **Animation:** Sanfte Animation bei Änderungen
- **Toast-Notification:** Optional - Benachrichtigung bei größeren Änderungen

## Design-Prinzipien

### Motivation
- **Positiver Fokus:** Hervorhebung von Erfolgen
- **Top 3:** Besondere Hervorhebung der Top 3
- **Visuelle Elemente:** Medaillen, Badges, Icons für Motivation

### Transparenz
- **Klare Rankings:** Übersichtliche Darstellung der Platzierungen
- **Nachvollziehbarkeit:** Erklärung der Scoring-Methode (T!Score)
- **Fairness:** Transparente Berechnung der Rankings

## Responsive Design

### Mobile Ansicht
- **Vereinfachte Tabelle:** Scrollbare Tabelle
- **Kompakte Ansicht:** Wichtige Informationen priorisiert
- **Touch-optimiert:** Größere Touch-Targets

### Tablet Ansicht
- **2-Spalten-Layout:** Optimiert für Tablet-Bildschirm
- **Filter-Sidebar:** Ein-/ausklappbar

### Desktop Ansicht
- **Vollständige Tabelle:** Alle Spalten sichtbar
- **Filter-Sidebar:** Permanente Sidebar

## Integration

### Navigation
- **Hauptnavigation:** "Leaderboards" Link
- **Breadcrumbs:** Navigation-Pfad (Home > Leaderboards)

### Verknüpfungen
- **Projekte:** Link zu Projekten der Top-Performer
- **Challenges:** Link zu Challenge-Leaderboards
- **Detailseiten:** Klick auf Klasse/Schule öffnet Detailseite

## Datenschutz

### Öffentliche Daten
- **Aggregierte Daten:** Nur aggregierte Statistiken werden angezeigt
- **Keine persönlichen Daten:** Keine Namen von Schülern in öffentlichen Leaderboards
- **Klassen/Schulen:** Nur öffentliche Informationen

### Datenschutz-Einstellungen
- **Opt-Out:** Schulen können Opt-Out für öffentliche Leaderboards wählen
- **Anonymisierung:** Optionale Anonymisierung von Klassen/Schulen

> [!tip] Implementation Hint
> - Implementiere Caching für Leaderboard-Daten
> - Verwende optimistische Updates für bessere UX
> - Implementiere Echtzeit-Updates (Polling oder WebSocket)
> - Optimiere für schnelle Ladezeiten (< 10 Sekunden)
> - Responsive Design ist kritisch für mobile Nutzer
