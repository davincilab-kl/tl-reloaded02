---
title: Admin Course Management - Kurs-Verwaltung
description: Kurs-Verwaltung durch Admin
enableToc: true
tags:
  - features
  - admin
  - course
---

# 📚 Admin Course Management - Kurs-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich Kurse anlegen, Lektionen verwalten, Quizzes erstellen und Lernmaterial hochladen.

## Verwandte Features

- **Teacher Course Management:** [[01_Features/Dashboard/Teacher/Course_Management|Teacher Course Management]] - Kurs-Verwaltung durch Lehrer
- **Student Course Overview:** [[01_Features/Dashboard/Student/Course_Overview|Course Overview]] - Was Schüler sehen
- **Student Course Workflow:** [[01_Features/Dashboard/Student/Course_Workflow|Course Workflow]] - Kurs-Durcharbeitung

## Data Models

- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell (modular aufgebaut)
- **Lesson Model:** [[03_Data_Models/Lesson|Lesson Model]] - Lektions-Datenmodell
- **Quiz Model:** [[03_Data_Models/Quiz|Quiz Model]] - Quiz-Datenmodell

## Übersicht

Die Kurs-Verwaltung ermöglicht es Admins, vollständige Kurse zu erstellen, Lektionen zu verwalten, Quizzes zu erstellen und Lernmaterial hochzuladen.

## Kurs anlegen

### Kurs-Erstellung

#### Basis-Informationen
- **Titel:** Kursname (z.B. "Grundkurs: Coding & Game Design mit Scratch")
- **Beschreibung:** Vollständige Kursbeschreibung
- **Thumbnail:** Kurs-Bild hochladen
  - Unterstützte Formate: JPG, PNG
  - Empfohlene Größe: 800x450px
  - Maximale Größe: 5 MB
- **Kategorie:** Kurs-Kategorie (z.B. "Coding", "Game Design")
- **Schwierigkeitsgrad:** Anfänger, Fortgeschritten, Experte
- **Geschätzte Dauer:** Geschätzte Gesamtdauer des Kurses

#### Kurs-Struktur
- **Module/Kapitel:** Kurs in Module/Kapitel unterteilen
- **Lektionen:** Lektionen zu Modulen hinzufügen
- **Reihenfolge:** Lektionen-Reihenfolge festlegen

### Kurs speichern
- **Entwurf speichern:** Kurs als Entwurf speichern (nicht sichtbar)
- **Kurs aktivieren:** Kurs sofort aktivieren (sichtbar für Lehrer)
- **Validierung:** Alle Pflichtfelder werden geprüft

## Lektionen verwalten

### Lektion anlegen

#### Lektion-Informationen
- **Titel:** Lektionsname
- **Beschreibung:** Lektionsbeschreibung
- **Modul/Kapitel:** Zu welchem Modul gehört die Lektion?
- **Reihenfolge:** Position der Lektion im Kurs

#### Lektion-Inhalt
- **Video:**
  - Video hochladen oder Link einfügen
  - Unterstützte Formate: MP4, WebM
  - Maximale Größe: 500 MB
  - **Optional:** Untertitel hochladen
- **Lernkarten:**
  - Lernkarten erstellen
  - Vorderseite: Frage/Begriff
  - Rückseite: Antwort/Erklärung
  - **Optional:** Bilder hinzufügen
- **Text-Inhalt:**
  - Rich Text Editor für zusätzlichen Inhalt
  - Formatierung: Fett, Kursiv, Listen, etc.
  - **Optional:** Bilder einfügen

### Lektion bearbeiten
- **Inhalt:** Alle Inhalte bearbeitbar
- **Reihenfolge:** Lektion-Reihenfolge ändern
- **Lektion löschen:** Lektion entfernen (mit Bestätigung)

## Quizzes verwalten

### Quiz anlegen

#### Quiz-Informationen
- **Titel:** Quiz-Name
- **Beschreibung:** Quiz-Beschreibung
- **Lektion:** Zu welcher Lektion gehört das Quiz?
- **Mindestpunktzahl:** Mindestpunktzahl zum Bestehen (z.B. 70%)
- **Zeitlimit:** Optionales Zeitlimit (in Minuten)

#### Quiz-Fragen
- **Fragen hinzufügen:**
  - **Fragen-Typen:**
    - Multiple Choice (eine richtige Antwort)
    - Multiple Choice (mehrere richtige Antworten)
    - Wahr/Falsch
    - Lückentext
    - Drag & Drop
  - **Frage:** Fragentext
  - **Antworten:** Antwort-Optionen
  - **Richtige Antwort(en):** Markieren
  - **Punkte:** Punktzahl pro Frage
  - **Erklärung:** Erklärung zur richtigen Antwort (optional)

### Quiz bearbeiten
- **Fragen:** Fragen hinzufügen, bearbeiten, löschen
- **Einstellungen:** Mindestpunktzahl, Zeitlimit ändern
- **Quiz löschen:** Quiz entfernen (mit Bestätigung)

## Lernmaterial verwalten

### Lernmaterial hochladen

#### Datei-Upload
- **PDFs:**
  - PDF-Dateien hochladen
  - Maximale Größe: 10 MB
  - **Zweck:** Zusätzliche Lernmaterialien, Arbeitsblätter
- **Bilder:**
  - Bilder hochladen (JPG, PNG)
  - Maximale Größe: 5 MB
  - **Zweck:** Illustrationen, Diagramme
- **Dokumente:**
  - Word, Excel, etc. (optional)
  - Maximale Größe: 10 MB

#### Lernmaterial zuweisen
- **Lektion zuweisen:** Lernmaterial zu spezifischer Lektion zuweisen
- **Kurs zuweisen:** Lernmaterial zu gesamten Kurs zuweisen
- **Beschreibung:** Beschreibung des Lernmaterials

### Lernmaterial verwalten
- **Lernmaterial anzeigen:** Alle hochgeladenen Dateien
- **Lernmaterial bearbeiten:** Beschreibung ändern, neu zuweisen
- **Lernmaterial löschen:** Datei entfernen (mit Bestätigung)

## Urkunden verwalten

**Siehe:** [[01_Features/Dashboard/Admin/Certificate_Management|Certificate Management]] für vollständige Urkunden-Verwaltung

### Urkunde anlegen

#### Urkunden-Informationen
- **Titel:** Urkunden-Name (z.B. "Kursabschluss-Urkunde")
- **Beschreibung:** Urkunden-Beschreibung
- **Kurs:** Zu welchem Kurs gehört die Urkunde?
- **Voraussetzungen:**
  - Kurs vollständig abschließen
  - Mindestpunktzahl in Quizzes erreichen
  - Optional: Weitere Voraussetzungen

#### Urkunden-Design
- **Template:** Urkunden-Template auswählen
- **Anpassung:**
  - Logo hinzufügen
  - Farben anpassen
  - Text anpassen
- **Vorschau:** Urkunden-Vorschau anzeigen

### Urkunde bearbeiten
- **Design:** Urkunden-Design anpassen
- **Voraussetzungen:** Voraussetzungen ändern
- **Urkunde löschen:** Urkunde entfernen (mit Bestätigung)

## Kurs verwalten

### Kurs-Übersicht
- **Alle Kurse:** Liste aller Kurse
- **Filter:**
  - Nach Kategorie
  - Nach Schwierigkeitsgrad
  - Nach Status (Aktiv, Entwurf)
- **Sortierung:**
  - Nach Titel
  - Nach Erstellungsdatum
  - Nach Anzahl Lektionen

### Kurs bearbeiten
- **Basis-Informationen:** Bearbeitbar
- **Struktur:** Module und Lektionen bearbeitbar
- **Status:** Aktiv/Inaktiv setzen

### Kurs löschen
- **Löschung:** Kurs kann gelöscht werden
- **Bestätigung:** Mehrstufiger Bestätigungsprozess
- **Warnung:** Alle zugehörigen Daten werden gelöscht
- **Frist:** 30 Tage Wartezeit (kann wiederhergestellt werden)

## Integration

### Lehrer-Dashboard-Integration
- **Kurs-Sichtbarkeit:** Lehrer können Kurse für ihre Klassen sichtbar machen
- **Kurs-Zuweisung:** Kurse werden Lehrern über Kurspakete zugewiesen
- Siehe [[01_Features/Dashboard/Teacher/Course_Management|Course Management]] für Details

### Schüler-Dashboard-Integration
- **Kurs-Anzeige:** Kurse erscheinen im Schüler-Dashboard
- **Fortschritt:** Schüler-Fortschritt wird getrackt
- Siehe [[01_Features/Dashboard/Student/Course_Overview|Course Overview]] für Details

> [!tip] Implementation Hint
> - Videos sollten auf CDN gehostet werden (bessere Performance)
> - Lernmaterial sollte kategorisiert werden (bessere Organisation)
> - Urkunden sollten als PDF generiert werden
> - Kurs-Struktur sollte flexibel sein (Module, Lektionen, etc.)
