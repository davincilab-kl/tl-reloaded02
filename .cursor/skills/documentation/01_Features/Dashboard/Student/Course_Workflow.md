---
title: Course Workflow - Kurs durcharbeiten
description: User Journey für das Durcharbeiten eines Kurses
enableToc: true
tags:
  - features
  - student
---

# 📚 Course Workflow - Kurs durcharbeiten

> [!abstract] User Story
> Als Schüler möchte ich einen Kurs durcharbeiten, Lektionen abschließen und mein Verständnis durch Quizzes testen.

## Verwandte Features

- **Course Overview:** [[01_Features/Dashboard/Student/Course_Overview|Course Overview]] - Kurs auswählen vor Durcharbeitung
- **Project Development:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Abschlussprojekte nach Kursabschluss
- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Fortschrittsanzeige im Dashboard

## Data Models

- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell (modular aufgebaut)
- **Lesson Model:** [[03_Data_Models/Lesson|Lesson Model]] - Lektions-Datenmodell
- **Quiz Model:** [[03_Data_Models/Quiz|Quiz Model]] - Quiz-Datenmodell

## User Flow: Kurs durcharbeiten

### 1. Kurs auswählen
- Schüler wählt einen Kurs aus der Kursübersicht im Dashboard
- Kurs-Detailseite wird geöffnet
- Übersicht über alle Lektionen des Kurses

### 2. Lektion auswählen
- Schüler wählt eine Lektion aus der Kursübersicht
- Lektionen können sequenziell (empfohlen) oder frei gewählt werden
- Fortschrittsanzeige zeigt bereits abgeschlossene Lektionen

### 3. Video anschauen
- **Video-Player:** Lektionsvideo wird abgespielt
- **Funktionen:**
  - Play/Pause
  - Geschwindigkeitskontrolle (0.5x, 1x, 1.5x, 2x)
  - Untertitel (falls verfügbar)
  - Vollbild-Modus
- **Fortschritt:** Video-Fortschritt wird gespeichert
- **Abschluss:** Nach Video-Ende wird nächster Schritt freigeschaltet

### 4. Lernkarten anschauen
- **Lernkarten-Modus:** Interaktive Karteikarten zum Lektionsinhalt
- **Navigation:**
  - Vorwärts/Rückwärts durch Karten
  - Markierung von schwierigen Karten
  - Wiederholung markierter Karten
- **Inhalt:** 
  - Vorderseite: Frage/Begriff
  - Rückseite: Antwort/Erklärung
- **Optional:** Challenge-Modus aktivieren

### 5. Challenge (optional)
- **Challenge-Typen:**
  - Praktische Übung
  - Coding-Aufgabe
  - Problemlösungsaufgabe
- **Bewertung:** Automatische oder manuelle Bewertung
- **Belohnung:** Zusätzliche T!Coins bei erfolgreichem Abschluss

### 6. Quiz machen
- **Quiz-Start:** Quiz beginnt nach Lernkarten/Challenge
- **Fragen-Typen:**
  - Multiple Choice
  - Wahr/Falsch
  - Lückentext
  - Drag & Drop
- **Zeitlimit:** Optionales Zeitlimit pro Frage oder Gesamt-Quiz
- **Sofortiges Feedback:** Nach jeder Frage (optional) oder am Ende
- **Ergebnis:**
  - Punktzahl wird angezeigt
  - Bestanden/Nicht bestanden (abhängig von Mindestpunktzahl)
  - Detailliertes Feedback zu falschen Antworten

### 7. Lektion abschließen
- **Abschluss-Kriterien:**
  - Video angeschaut (100% oder Mindestprozentsatz)
  - Quiz bestanden (Mindestpunktzahl erreicht)
  - Optional: Challenge abgeschlossen
- **Belohnungen:**
  - T!Coins werden gutgeschrieben
  - Fortschrittsanzeige wird aktualisiert
  - Badge/Achievement (bei bestimmten Meilensteinen)

### 8. Navigation zwischen Lektionen
- **Breadcrumbs:**
  - Dashboard > Kurse > [Kursname] > [Lektion]
  - Immer sichtbar für Orientierung
- **Navigation während Lektion:**
  - **Seitenleiste:** Liste aller Lektionen des Kurses
    - Abgeschlossene Lektionen: Grün markiert ✓
    - Aktuelle Lektion: Hervorgehoben
    - Offene Lektionen: Grau
    - Gesperrte Lektionen: Ausgegraut (wenn sequenziell)
  - **Vorherige/Nächste Buttons:** Direkte Navigation zwischen Lektionen
  - **Zurück-Button:** Führt zur Kursübersicht
- **Nach Lektions-Abschluss:**
  - Automatische Vorschau auf nächste Lektion
  - Erfolgs-Meldung mit Optionen:
    - "Nächste Lektion starten"
    - "Zur Kursübersicht"
    - "Lektion wiederholen"
- **Loop-Mechanismus:** Schritte 2-7 können für alle Lektionen wiederholt werden

## Kurs-Fortschritt

### Fortschrittsanzeige
- **Pro Lektion:**
  - Nicht gestartet
  - In Bearbeitung
  - Abgeschlossen
- **Gesamtkurs:**
  - Prozentuale Anzeige (z.B. "3 von 10 Lektionen = 30%")
  - Fortschrittsbalken
  - Geschätzte verbleibende Zeit

### Kurs-Abschluss
- **Bedingungen:**
  - Alle Lektionen abgeschlossen
  - Alle Pflicht-Quizzes bestanden
  - Optional: Mindestpunktzahl erreicht
- **Belohnungen:**
  - Kursabschluss-Urkunde
  - Bonus-T!Coins
  - Achievement-Badge
  - Freischaltung weiterer Kurse

## Technische Details

### Speicherung des Fortschritts
- Video-Position wird gespeichert (Resume-Funktion)
- Quiz-Ergebnisse werden persistent gespeichert
- Lernkarten-Status (markierte Karten) wird gespeichert
- Fortschritt wird in Echtzeit synchronisiert
