---
title: Admin School Year Management - Schuljahr-Verwaltung
description: Schuljahr-Verwaltung durch Admin
enableToc: true
tags:
  - features
  - admin
  - school-year
---

# 📅 Admin School Year Management - Schuljahr-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich Schuljahre anlegen, verwalten und das aktuelle Schuljahr setzen.

## Verwandte Features

- **Challenge Management:** [[01_Features/Dashboard/Admin/Challenge_Management|Challenge Management]] - Schuljahre für Challenges
- **Student Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Schuljahr-Filterung in Statistiken
- **Teacher Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Schuljahr-Filterung in Statistiken

## Data Models

- **School Year Model:** [[03_Data_Models/School_Year|School Year Model]] - Schuljahr-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell mit Schuljahr-Zuordnung

## Übersicht

Die Schuljahr-Verwaltung ermöglicht es Admins, Schuljahre anzulegen, zu verwalten und das aktuelle Schuljahr zu setzen.

## Schuljahr anlegen

### Schuljahr-Erstellung

#### Basis-Informationen
- **Titel:** Schuljahr-Titel (z.B. "2025/2026")
- **Startdatum:** Startdatum des Schuljahres (z.B. 01.09.2025)
- **Enddatum:** Enddatum des Schuljahres (z.B. 30.06.2026)
- **Beschreibung:** Optionale Beschreibung
- **Semester/Halbjahre (Subseasons):**
  - **1. Semester/Halbjahr:**
    - Startdatum (z.B. 01.09.2025)
    - Enddatum (z.B. 31.01.2026)
  - **2. Semester/Halbjahr:**
    - Startdatum (z.B. 01.02.2026)
    - Enddatum (z.B. 30.06.2026)
  - Semester werden automatisch aus Schuljahr-Daten generiert (können manuell angepasst werden)

#### Schuljahr speichern
- **Validierung:**
  - Startdatum muss vor Enddatum liegen
  - Keine Überlappung mit bestehenden Schuljahren
  - Format-Prüfung für Datum
- **Erstellung:** Schuljahr wird in Datenbank gespeichert

## Schuljahr verwalten

### Schuljahr-Liste
- **Alle Schuljahre:** Liste aller angelegten Schuljahre
- **Anzeige:**
  - Titel
  - Startdatum - Enddatum
  - Semester/Halbjahre (1. Semester, 2. Semester)
  - Status (Aktiv, Inaktiv)
  - Anzahl Klassen
  - Anzahl Schüler
- **Sortierung:**
  - Nach Startdatum
  - Nach Titel

### Schuljahr bearbeiten
- **Titel:** Bearbeitbar
- **Startdatum:** Bearbeitbar (wenn Schuljahr noch nicht aktiv)
- **Enddatum:** Bearbeitbar (wenn Schuljahr noch nicht aktiv)
- **Beschreibung:** Bearbeitbar
- **Semester/Halbjahre:** Bearbeitbar (wenn Schuljahr noch nicht aktiv)
  - Semester-Daten können manuell angepasst werden
  - Standard: Automatische Aufteilung in 2 Semester

### Aktuelles Schuljahr setzen
- **Zugriff:** In Schuljahr-Details → "Als aktuelles Schuljahr setzen"
- **Prozess:**
  1. Admin wählt Schuljahr aus
  2. Admin klickt "Als aktuelles Schuljahr setzen"
  3. Vorheriges aktuelles Schuljahr wird deaktiviert
  4. Neues Schuljahr wird aktiviert
  5. Alle Statistiken und T!Scores werden für neues Schuljahr berechnet
- **Wichtig:** Nur ein Schuljahr kann gleichzeitig aktiv sein

### Schuljahr löschen
- **Löschung:** Schuljahr kann gelöscht werden
- **Bestätigung:** Mehrstufiger Bestätigungsprozess
- **Warnung:** 
  - Alle zugehörigen Daten bleiben erhalten
  - Schuljahr wird nur als "inaktiv" markiert
- **Frist:** 30 Tage Wartezeit (kann wiederhergestellt werden)

## Schuljahr-Statistiken

### Schuljahr-Übersicht
- **Anzahl Klassen:** Anzahl der Klassen im Schuljahr
- **Anzahl Schüler:** Anzahl der Schüler im Schuljahr
- **Anzahl Lehrkräfte:** Anzahl der aktiven Lehrkräfte
- **Gesamt T!Coins:** Summe aller T!Coins im Schuljahr
- **Durchschnittlicher T!Score:** Plattform-weiter Durchschnitt

### Schuljahr-Vergleich
- **Vergleich:** Statistiken zwischen verschiedenen Schuljahren
- **Metriken:**
  - Anzahl Schulen, Lehrkräfte, Klassen, Schüler
  - T!Coins, T!Score
  - Projekte, Urkunden
- **Trend-Analyse:** Entwicklung über mehrere Schuljahre

## Semester/Halbjahre (Subseasons)

### Semester-Verwaltung
- **Automatische Generierung:** Semester werden standardmäßig automatisch aus Schuljahr-Daten generiert
  - 1. Semester: Erste Hälfte des Schuljahres
  - 2. Semester: Zweite Hälfte des Schuljahres
- **Manuelle Anpassung:** Semester-Daten können bei Bedarf manuell angepasst werden
- **Verwendung:**
  - Semester können für Statistiken und Berichte verwendet werden
  - Lizenzen gelten für das gesamte Schuljahr (inkl. aller Semester)
  - Semester können für interne Planung und Organisation genutzt werden

### Semester-Statistiken
- **Semester-Übersicht:** Statistiken können pro Semester angezeigt werden
- **Vergleich:** Vergleich zwischen 1. und 2. Semester möglich
- **Metriken:**
  - Anzahl Klassen, Schüler, Lehrkräfte pro Semester
  - T!Coins, T!Score pro Semester
  - Projekte, Urkunden pro Semester

## Integration

### Lizenz-Verwaltung
- **Lizenzen sind pro Schuljahr gültig:** Alle Lizenzen werden dem Schuljahr zugeordnet
- **Bei Schuljahr-Wechsel:** Neue Lizenzen müssen für das neue Schuljahr bestellt werden
- **Semester:** Lizenzen gelten für das gesamte Schuljahr (alle Semester)
- Siehe [[01_Features/Dashboard/Teacher/School_Management|School Management]] für Details

### T!Score-Berechnung
- **Schuljahrspezifisch:** T!Score wird pro Schuljahr berechnet
- **Automatische Berechnung:** Bei Schuljahr-Wechsel werden neue T!Scores berechnet
- **Semester-Statistiken:** T!Score kann auch pro Semester angezeigt werden
- Siehe [[00_Blueprint/Gamification_System|Gamification System]] für Details

### Klassen-Übertragung
- **Automatische Übertragung:** Klassen können ins neue Schuljahr übertragen werden
- **T!Coins:** Historische T!Coins bleiben im alten Schuljahr, neue starten bei 0
- Siehe [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] für Details

> [!tip] Implementation Hint
> - Schuljahr-Wechsel sollte automatisch T!Scores neu berechnen
> - Historische Daten sollten erhalten bleiben
> - Schuljahr-Überlappungen sollten verhindert werden
> - Automatische Benachrichtigung bei Schuljahr-Wechsel
