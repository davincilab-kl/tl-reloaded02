---
title: Leaderboards - Rankings
description: Leaderboards und Rankings für Schüler
enableToc: true
tags:
  - features
  - student
---

# 🏅 Leaderboards - Rankings

> [!abstract] User Story
> Als Schüler möchte ich sehen, wie ich im Vergleich zu meiner Klasse und Schule abschneide, um motiviert zu bleiben.

## Verwandte Features

- **Public Leaderboard:** [[01_Features/Leaderboards/Public_Leaderboard|Public Leaderboard]] - Öffentliche Leaderboard-Seite
- **Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-spezifische Leaderboards
- **Stats:** [[01_Features/Dashboard/Student/Stats|Stats]] - Persönliche Statistiken und Rankings
- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Leaderboard-Übersicht im Dashboard

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell mit T!Coins
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards

## Übersicht

Leaderboards sind in der Hauptnavigation verfügbar und zeigen Rankings auf verschiedenen Ebenen.

## Leaderboard-Ebenen

### 1. Klassen-Ranking (Top 3 Klassen der Schule)
- **Anzeige:**
  - Top 3 Klassen der eigenen Schule
  - Sortiert nach T!Score
  - Klassenname und T!Score werden angezeigt
- **Motivation:**
  - Wenn eigene Klasse in Top 3: Motivations-Meldung (ohne genauen Platz)
  - Beispiel: "Deine Klasse ist unter den Top 3! 🎉"
  - **Wichtig:** Kein genauer Platz wird angezeigt, um Demotivation zu vermeiden

### 2. Schüler-Ranking (Top 3 Schüler der Klasse)
- **Anzeige:**
  - Top 3 Schüler der eigenen Klasse
  - Sortiert nach T!Coins oder Gesamtleistung
  - Schülername und T!Coins/Score werden angezeigt
- **Motivation:**
  - Wenn Schüler in Top 3: Motivations-Meldung (ohne genauen Platz)
  - Beispiel: "Du bist unter den Top 3 deiner Klasse! 🎉"
  - **Wichtig:** Kein genauer Platz wird angezeigt, um Demotivation zu vermeiden
- **Persönliche Position:**
  - Wenn nicht in Top 3: Keine Position angezeigt
  - Fokus auf Motivation durch Top 3, nicht auf niedrige Plätze

## Design-Prinzipien

### Motivation statt Demotivation
- **Top 3 Fokus:**
  - Nur Top 3 werden angezeigt
  - Keine vollständigen Rankings mit niedrigen Plätzen
  - Positive Verstärkung für Top-Performer
- **Keine genauen Plätze:**
  - Wenn in Top 3: Nur Bestätigung, kein "Platz 1, 2 oder 3"
  - Vermeidet Konkurrenzdruck und Demotivation
  - Fokus auf Erfolg, nicht auf Vergleich

### Anzeige-Logik
- **In Top 3:**
  - Motivations-Meldung wird angezeigt
  - "Du bist unter den Top 3!" mit Emoji
  - Keine genaue Platzierung
- **Nicht in Top 3:**
  - Keine Position wird angezeigt
  - Fokus auf persönliche Fortschritte
  - Motivation durch T!Coins und Achievements

## Leaderboard-Bereiche

### Klassen-Ranking
- **Schule:** Alle Klassen der eigenen Schule
- **Sortierung:** Nach T!Score (Durchschnittlicher Score: Summe T!Coins ÷ Anzahl Schüler)
- **Schuljahrspezifisch:** Nur T!Coins und Schüler des aktuellen Schuljahres
- **Anzeige:** Top 3 Klassen
- **Aktualisierung:** In Echtzeit oder täglich
- **Siehe:** [[01_Features/GLOSSARY|Glossar]] für T!Score-Definition

### Schüler-Ranking
- **Klasse:** Alle Schüler der eigenen Klasse
- **Sortierung:** Nach T!Coins oder Gesamtleistung
- **Anzeige:** Top 3 Schüler
- **Aktualisierung:** In Echtzeit oder täglich

## Integration

### Navigation
- **Hauptnavigation:**
  - Leaderboards als Submenu
  - Untermenü: "Klassen-Ranking" und "Schüler-Ranking"
- **Dashboard:**
  - Quick-Link zu Leaderboards
  - Motivations-Banner, wenn in Top 3

### Benachrichtigungen
- **Top 3 erreicht:**
  - Benachrichtigung: "Gratulation! Du bist jetzt unter den Top 3!"
  - Keine genaue Platzierung
- **Top 3 verlassen:**
  - Keine Benachrichtigung (vermeidet Demotivation)

## Challenge-Leaderboards

### Challenge-spezifische Rankings
- **Anzeige:**
  - Top 3 Teilnehmer einer Challenge
  - Nur bei aktiven oder abgeschlossenen Challenges
- **Motivation:**
  - Gleiche Logik: Wenn in Top 3, Motivations-Meldung ohne genauen Platz
- **Filter:**
  - Nach Klasse
  - Nach Schule
  - Gesamt (alle Teilnehmer)

## Technische Details

### Aktualisierung
- **Echtzeit:** Bei wichtigen Aktionen (T!Coins verdient, Projekt veröffentlicht)
- **Täglich:** Vollständige Neuberechnung der Rankings
- **Performance:** Caching für schnelle Anzeige

### Datenschutz
- **Anonymisierung:** Nur Top 3 werden angezeigt
- **Persönliche Daten:** Nur eigene Daten werden vollständig angezeigt
- **Vergleich:** Fokus auf Motivation, nicht auf detaillierte Vergleiche

> [!tip] Implementation Hint
> - Implementiere Caching für Leaderboard-Daten
> - Verwende optimistische Updates für bessere UX
> - Fokus auf Motivation, nicht auf Konkurrenz
> - Vermeide genaue Platzierungen außerhalb Top 3
