---
title: Course Overview - Kursübersicht
description: User Journey für die Anzeige und Navigation von Kursen
enableToc: true
tags:
  - features
  - student
---

# 📖 Course Overview - Kursübersicht

> [!abstract] User Story
> Als Schüler möchte ich eine Übersicht über alle verfügbaren Kurse sehen, meinen Fortschritt verfolgen und Kurse auswählen.

## Verwandte Features

- **Course Workflow:** [[01_Features/Dashboard/Student/Course_Workflow|Course Workflow]] - Kurs durcharbeiten nach Auswahl
- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Kursübersicht im Dashboard
- **Project Development:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Abschlussprojekte nach Kursabschluss

## Data Models

- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell
- **Lesson Model:** [[03_Data_Models/Lesson|Lesson Model]] - Lektions-Datenmodell

## User Flow: Kursübersicht anzeigen

### 1. Zugriff auf Kursübersicht
- **Navigation:**
  - Vom Dashboard: "Kurse" Tab oder Button
  - Direkter Link in Hauptnavigation
  - Nach Login: Automatische Weiterleitung (optional)
- **Ansicht:** Liste oder Grid-Ansicht aller Kurse

### 2. Kurs-Kategorien & Filter
- **Kategorien:**
  - Alle Kurse
  - Meine Kurse (angemeldete Kurse)
  - Verfügbare Kurse (noch nicht angemeldet)
  - Abgeschlossene Kurse
- **Filter:**
  - Nach Thema/Kategorie (z.B. Coding, Mathematik, Kreativität)
  - Nach Schwierigkeitsgrad (Anfänger, Fortgeschritten, Experte)
  - Nach Dauer (Kurz, Mittel, Lang)

### 3. Kurs-Karten anzeigen
- **Kurs-Karte enthält:**
  - **Thumbnail:** Kurs-Bild oder Icon
  - **Titel:** Kursname
  - **Beschreibung:** Kurze Beschreibung (1-2 Sätze)
  - **Fortschritt:** Fortschrittsbalken und Prozent (bei angemeldeten Kursen)
  - **Status-Badges:**
    - "Neu" für neue Kurse
    - "Beliebt" für beliebte Kurse
    - "Empfohlen" für empfohlene Kurse
    - "In Bearbeitung" für aktive Kurse
    - "Abgeschlossen" für fertige Kurse
  - **Metadaten:**
    - Anzahl der Lektionen
    - Geschätzte Dauer
    - Schwierigkeitsgrad
    - Anzahl der Teilnehmer

### 4. Kurs-Details anzeigen
- **Klick auf Kurs-Karte:**
  - Kurs-Detailseite wird geöffnet
  - Detaillierte Informationen werden angezeigt

## Kurs-Detailseite

### Übersicht
- **Kurs-Header:**
  - Großes Kurs-Thumbnail
  - Kursname
  - Kurze Beschreibung
  - Bewertung (Sterne) und Anzahl der Bewertungen
- **Quick Actions:**
  - "Kurs starten" / "Weiter lernen" Button
  - "Zu Favoriten hinzufügen" (Herz-Icon)
  - "Teilen" Button

### Detaillierte Informationen
- **Vollständige Beschreibung:**
  - Was lerne ich in diesem Kurs?
  - Welche Fähigkeiten werden vermittelt?
  - Für wen ist dieser Kurs geeignet?
- **Kurs-Inhalt:**
  - Liste aller Lektionen
  - Fortschritt pro Lektion (bei angemeldeten Kursen)
  - Geschätzte Zeit pro Lektion
- **Kurs-Struktur:**
  - Anzahl der Module/Kapitel
  - Anzahl der Lektionen
  - Anzahl der Quizzes
  - Anzahl der Projekte/Challenges

### Kurs-Statistiken
- **Teilnehmer:**
  - Anzahl der aktiven Teilnehmer
  - Anzahl der abgeschlossenen Kurse
  - Durchschnittliche Bewertung
- **Erfolgs-Metriken:**
  - Durchschnittliche Abschlussrate
  - Durchschnittliche Zeit zum Abschluss

### Anmeldung & Zugriff
- **Anmeldung:**
  - "Kurs starten" Button (bei verfügbaren Kursen)
  - Automatische Anmeldung oder Bestätigung erforderlich
- **Bereits angemeldet:**
  - "Weiter lernen" Button
  - Direkter Link zur aktuellen Lektion
  - Fortschrittsanzeige

## Meine Kurse

### Aktive Kurse
- **Übersicht:**
  - Alle Kurse, an denen der Schüler aktuell teilnimmt
  - Sortierung: Zuletzt aktiv, Fortschritt, Alphabetisch
- **Kurs-Karte (erweitert):**
  - Fortschrittsbalken mit Prozent
  - "X von Y Lektionen abgeschlossen"
  - "Nächste Lektion" Vorschau
  - "Letzte Aktivität" Zeitstempel
  - "Geschätzte verbleibende Zeit"

### Abgeschlossene Kurse
- **Übersicht:**
  - Alle vollständig abgeschlossenen Kurse
  - Abschlussdatum
  - Erreichte Punktzahl/Bewertung
  - Erhaltene Urkunde (Link)
- **Wiederholung:**
  - Möglichkeit, Kurs erneut zu durchlaufen
  - Fortschritt wird zurückgesetzt oder als "Wiederholung" markiert

### Empfohlene Kurse
- **Personalisiert:**
  - Kurse basierend auf abgeschlossenen Kursen
  - Kurse basierend auf Interessen
  - Kurse, die andere Schüler aus der Klasse belegen
- **Trending:**
  - Beliebte Kurse der Woche
  - Neue Kurse
  - Kurse mit hoher Bewertung

## Kurs-Fortschritt

### Fortschrittsanzeige pro Kurs
- **Visuelle Darstellung:**
  - Fortschrittsbalken
  - Prozentuale Anzeige
  - Anzahl abgeschlossener vs. Gesamt-Lektionen
- **Detaillierte Ansicht:**
  - Fortschritt pro Lektion
  - Abgeschlossene Quizzes
  - Erreichte Punkte
  - Verbrachte Zeit

### Kurs-Statistiken
- **Persönliche Statistiken:**
  - Durchschnittliche Quiz-Punkte
  - Beste Quiz-Punkte
  - Verbrachte Gesamtzeit
  - Anzahl der Versuche
- **Vergleich:**
  - Eigener Fortschritt vs. Klassen-Durchschnitt
  - Eigener Fortschritt vs. Schul-Durchschnitt

## Kurs-Navigation

### Navigation-Struktur
- **Hierarchie:**
  - Dashboard > Kurse > [Kursname] > [Lektion] > [Inhalt]
- **Breadcrumbs:**
  - Immer sichtbar für Orientierung
  - Klickbar für schnelle Navigation

### Kursübersicht
- **Layout:**
  - Grid- oder Listen-Ansicht aller Kurse
  - Filter und Sortierung oben
  - Suchfeld prominent platziert
- **Kurs-Karte:**
  - Klick auf Karte öffnet Kurs-Detailseite
  - Quick-Action: "Weiter lernen" Button (bei aktiven Kursen)

### Kurs-Detailseite
- **Lektionen-Übersicht:**
  - Liste aller Lektionen mit Fortschrittsanzeige
  - Klick auf Lektion öffnet Lektions-Ansicht
  - Seitenleiste mit Lektionen-Navigation (während Lektion sichtbar)
- **Quick Actions:**
  - "Kurs starten" / "Weiter lernen"
  - Direkter Link zur aktuellen/letzten Lektion

### Lektions-Ansicht
- **Seitenleiste:**
  - Alle Lektionen des Kurses
  - Fortschritts-Indikatoren
  - Schnelle Navigation zwischen Lektionen
- **Hauptbereich:**
  - Video-Player
  - Lernkarten
  - Quiz
  - Challenge (optional)
- **Navigation:**
  - "Vorherige Lektion" / "Nächste Lektion" Buttons
  - Breadcrumbs für Orientierung
  - "Zur Kursübersicht" Button

### Suchfunktion
- **Kurs-Suche:**
  - Suchfeld in Kursübersicht
  - Suche nach Titel, Beschreibung, Tags
  - Autocomplete-Vorschläge
  - Filter-Ergebnisse

## Kurs-Empfehlungen

### Personalisierte Empfehlungen
- **Basierend auf:**
  - Abgeschlossene Kurse
  - Aktuelle Kurse
  - Interessen und Präferenzen
  - Klassen-Kollegen
- **Anzeige:**
  - "Für dich empfohlen" Sektion
  - Begründung für Empfehlung (optional)

### Beliebte Kurse
- **Trending:**
  - Meist belegte Kurse
  - Höchst bewertete Kurse
  - Schnellst wachsende Kurse
- **Anzeige:**
  - "Beliebt" Badge
  - Anzahl der Teilnehmer
  - Durchschnittliche Bewertung

> [!tip] Implementation Hint
> - Implementiere Caching für Kurs-Listen für bessere Performance
> - Verwende Lazy Loading für Kurs-Karten
> - Speichere Kurs-Präferenzen für personalisierte Empfehlungen
> - Implementiere Analytics für Kurs-Interaktionen
