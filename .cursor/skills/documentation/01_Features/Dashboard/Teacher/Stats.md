---
title: Teacher Dashboard Statistics
description: Statistiken und Analytics für Lehrer
enableToc: true
tags:
  - features
  - teacher
---

# 📈 Teacher Dashboard Statistics

> [!abstract] User Story
> Als Lehrer möchte ich Statistiken über meine Klassen, Schüler-Fortschritte und Aktivitäten sehen.

## Verwandte Features

- **Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Statistiken im Dashboard
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Klassen-Statistiken
- **Admin Statistics Exports:** [[01_Features/Dashboard/Admin/Statistics_Exports|Statistics Exports]] - Export-Funktionen

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell
- **T!Coins Transaction Model:** [[03_Data_Models/T_Coins_Transaction|T!Coins Transaction Model]] - T!Coins-Transaktionen
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **Certificate Model:** [[03_Data_Models/Certificate|Certificate Model]] - Urkunden-Datenmodell

## Klassen-Statistiken

### Pro Klasse
- **Schüleranzahl:** Anzahl der Schüler (aktuelles Schuljahr)
- **T!Coins:** Gesamte T!Coins der Klasse (aktuelles Schuljahr)
- **T!Score:** Durchschnittlicher Score der Klasse (z.B. "1.000 T!Score")
  - Berechnung: Summe T!Coins ÷ Anzahl Schüler (aktuelles Schuljahr)
- **Projekte:** Anzahl der Projekte
- **Urkunden:** Anzahl der Urkunden
- **Lizenzen:** Anzahl der zugewiesenen Lizenzen

### Klassen-Vergleich
- Vergleich zwischen verschiedenen Klassen
- Durchschnittswerte
- Top-Performer Klassen

## Schüler-Statistiken

### Pro Schüler
- **T!Coins:** Persönliche T!Coins
- **Projekte:** Anzahl der Projekte
- **Urkunden:** Anzahl der Urkunden
- **Letzte Aktivität:** Wann zuletzt aktiv
- **Kurs-Fortschritt:** Fortschritt in verschiedenen Kursen

### Schüler-Übersicht
- Liste aller Schüler mit Statistiken
- Sortierung nach verschiedenen Kriterien
- Filter nach Aktivität, Fortschritt, etc.

## Projekt-Statistiken

### Klassen-Projekte
- Gesamtzahl der Projekte
- Projekte nach Status (In Bearbeitung, Veröffentlicht, Eingereicht)
- Durchschnittliche T!Coins pro Projekt
- Top-Projekte (nach Likes/T!Coins)

### Projekt-Qualität
- Durchschnittliche Bewertung
- Code-Qualität-Statistiken
- Kreativitäts-Bewertungen

## Wettbewerbs-Statistiken

### Challenge-Teilnahme
- Anzahl der Teilnahmen
- Eingereichte Projekte
- Gewonnene Challenges
- Platzierungen

## Erfolge nach Schuljahr

### Schuljahr-Filter
- Aktuelles Schuljahr (z.B. "2025/2026")
- Vorheriges Schuljahr
- Weitere Schuljahre

### Erfolgs-Übersicht
- **Meine Erfolge:** Persönliche Erfolge des Lehrers
- **Schule:** Schulweite Erfolge
- **Metriken:**
  - T!Coins
  - Projekte
  - Urkunden

## Lizenz-Statistiken

### Kurspakete
- Zugewiesene Kurspakete
- Benutzte/Verfügbare Lizenzen
- Kostenlose Lizenzen
- Bestellungsverlauf

