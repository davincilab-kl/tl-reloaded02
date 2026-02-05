---
title: Student Dashboard Statistics
description: Statistiken und Analytics für Schüler
enableToc: true
tags:
  - features
  - student
---

# 📈 Student Dashboard Statistics

> [!abstract] User Story
> Als Schüler möchte ich meine persönlichen Fortschritts-Statistiken und Leistungen sehen.

## Verwandte Features

- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Statistiken im Dashboard
- **Leaderboards:** [[01_Features/Dashboard/Student/Leaderboards|Leaderboards]] - Rankings und Vergleiche
- **Profile Customization:** [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] - T!Coins-Shop für Profil-Items

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell mit T!Coins
- **T!Coins Transaction Model:** [[03_Data_Models/T_Coins_Transaction|T!Coins Transaction Model]] - T!Coins-Transaktionen
- **Certificate Model:** [[03_Data_Models/Certificate|Certificate Model]] - Urkunden-Datenmodell

## Persönliche Statistiken

### T!Coins
- **Gesamt:** Alle verdienten T!Coins seit Account-Erstellung
- **Aktuelles Schuljahr:** T!Coins im laufenden Schuljahr
- **Diese Woche:** Wöchentliche T!Coins
- **Verdienstquellen:** Übersicht, wie T!Coins verdient wurden
  - Lektionen abschließen
  - Quiz bestehen
  - Projekte veröffentlichen
  - Challenges gewinnen

### Projekte
- **Gesamt:** Anzahl aller erstellten Projekte
- **Veröffentlicht:** Anzahl der veröffentlichten Projekte
- **In Bearbeitung:** Aktuell in Entwicklung befindliche Projekte
- **Beliebteste Projekte:** Projekte mit meisten Views/Likes
- **Projekt-Fortschritt:** Durchschnittlicher Fortschritt über alle Projekte

### Urkunden & Zertifikate
- **Gesamt:** Anzahl aller erhaltenen Urkunden
- **Aktuelles Schuljahr:** Urkunden im laufenden Schuljahr
- **Kategorien:**
  - Kursabschluss-Urkunden
  - Challenge-Gewinner-Urkunden
  - Meilenstein-Urkunden
  - Spezial-Achievements
- **Siehe:** [[01_Features/Dashboard/Student/Certificates|Certificates]] - Detaillierte Urkunden-Verwaltung

### Kurs-Fortschritt

#### Pro Kurs
- **Abgeschlossene Lektionen:** Anzahl und Prozent
- **Durchschnittliche Quiz-Punkte:** Pro Kurs
- **Verbrachte Zeit:** Gesamtzeit pro Kurs
- **Letzte Aktivität:** Wann zuletzt am Kurs gearbeitet wurde

#### Gesamtübersicht
- **Aktive Kurse:** Anzahl der aktuell belegten Kurse
- **Abgeschlossene Kurse:** Anzahl der vollständig abgeschlossenen Kurse
- **Gesamtfortschritt:** Durchschnittlicher Fortschritt über alle Kurse

### Quiz & Challenge-Statistiken

#### Quiz-Performance
- **Durchschnittliche Punktzahl:** Über alle Quizzes
- **Beste Punktzahl:** Höchste erreichte Punktzahl
- **Abgeschlossene Quizzes:** Anzahl
- **Richtige Antworten:** Prozentuale Erfolgsquote

#### Challenge-Statistiken
- **Teilgenommene Challenges:** Anzahl
- **Gewonnene Challenges:** Anzahl und Gewinnrate
- **Beste Platzierung:** Höchste erreichte Position
- **Challenge-Punkte:** Gesamtpunkte aus Challenges

## Vergleichsstatistiken

### Klassen-Vergleich

#### T!Score (Klassen-Score)
- **Aktueller T!Score:** Durchschnittlicher Score der Klasse (z.B. "1,000 T!Score")
  - **Berechnung:** Summe aller T!Coins der Klasse ÷ Anzahl Schüler (aktuelles Schuljahr)
  - **Schuljahrspezifisch:** Nur T!Coins und Schüler des aktuellen Schuljahres werden berücksichtigt
  - **Wichtig:** T!Score basiert auf **gesammelten T!Coins**, nicht auf verfügbaren T!Coins (Shop-Ausgaben beeinflussen T!Score nicht)
- **Klassen-Ranking:** Position der Klasse im Schulvergleich
- **Mein Beitrag:** Persönlicher Beitrag zum Klassen-Score (meine T!Coins)
- **Siehe:** [[01_Features/GLOSSARY|Glossar]] für T!Score-Definition
- **Klassen-Mitglieder:** Anzahl der aktiven Schüler in der Klasse (aktuelles Schuljahr)

#### Detaillierte Klassen-Statistiken (Dropdown)
- Durchschnittliche T!Coins pro Schüler
- Gesamtzahl der Projekte der Klasse
- Gesamtzahl der Urkunden der Klasse
- Aktivitäts-Level der Klasse

### Schul-Vergleich

#### T!Score (Schul-Score)
- **Aktueller T!Score:** Durchschnittlicher Score der Schule (z.B. "1,154 T!Score")
  - **Berechnung:** Summe aller T!Coins der Schule ÷ Anzahl Schüler (aktuelles Schuljahr)
  - **Schuljahrspezifisch:** Nur T!Coins und Schüler des aktuellen Schuljahres werden berücksichtigt
  - **Wichtig:** T!Score basiert auf **gesammelten T!Coins**, nicht auf verfügbaren T!Coins (Shop-Ausgaben beeinflussen T!Score nicht)
- **Siehe:** [[01_Features/GLOSSARY|GlOSSARY|Glossar]] für T!Score-Definition
- **Schul-Ranking:** Position der Schule im regionalen/nationalen Vergleich
- **Trend:** Aufwärts- oder Abwärtstrend (Pfeil-Indikator)
- **Schul-Mitglieder:** Anzahl der aktiven Schüler in der Schule (aktuelles Schuljahr)

#### Detaillierte Schul-Statistiken
- Durchschnittliche Leistungen aller Klassen
- Top-Performer der Schule
- Schulweite Achievements

## Zeitbasierte Statistiken

### Schuljahr-Filter
- **Aktuelles Schuljahr:** z.B. "2025/2026" (01.09.25 bis 30.06.26)
- Automatische Filterung aller Statistiken nach Schuljahr
- Vergleich mit vorherigen Schuljahren (optional)

### Zeitliche Entwicklung
- **Wöchentlicher Fortschritt:** Graphische Darstellung
- **Monatlicher Fortschritt:** Übersicht über mehrere Monate
- **Trend-Analyse:** Verbesserung oder Verschlechterung

## Aktivitäts-Statistiken

### Engagement-Metriken
- **Login-Häufigkeit:** Wie oft pro Woche/Monat
- **Aktive Tage:** Anzahl der Tage mit Aktivität
- **Durchschnittliche Sitzungsdauer:** Wie lange pro Session
- **Peak-Aktivitätszeiten:** Wann am aktivsten

### Lern-Verhalten
- **Videos angeschaut:** Anzahl und Gesamtdauer
- **Lernkarten durchgearbeitet:** Anzahl
- **Quiz-Versuche:** Anzahl der Quiz-Teilnahmen
- **Projekt-Entwicklungszeit:** Durchschnittliche Zeit pro Projekt

## Achievements & Badges

### Erreichte Achievements
- Liste aller erhaltenen Badges
- Kategorien: Kurs, Projekt, Challenge, Engagement
- Seltene Achievements (Special Badges)

### Nächste Achievements
- Vorschau auf erreichbare Achievements
- Fortschritt zu nächstem Achievement
- Motivation durch klare Ziele

## Export & Sharing

### Statistik-Export
- PDF-Export der persönlichen Statistiken
- Teilen mit Eltern/Lehrern
- Druckbare Zusammenfassung

### Social Sharing
- Erfolge in sozialen Medien teilen (optional)
- Urkunden teilen
- Projekt-Highlights teilen
