---
title: Project Display - Projekt-Galerie
description: Öffentliche Anzeige von veröffentlichten Projekten
enableToc: true
tags:
  - features
  - projects
  - public
---

# 🎮 Project Display - Projekt-Galerie

> [!abstract] User Story
> Als Besucher möchte ich veröffentlichte Projekte durchsuchen, ansehen und spielen können, um Inspiration zu finden und die Kreativität der Schüler zu entdecken.

## Übersicht

Die Projekt-Galerie ist eine öffentlich zugängliche Seite, die alle veröffentlichten Projekte der Plattform anzeigt. Besucher können Projekte durchsuchen, filtern, ansehen und spielen.

### Verwandte Features
- **Projekt-Entwicklung:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Wie Projekte erstellt werden
- **Scratch-Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Technische Details zur Scratch-Integration
- **Projekt-Veröffentlichung:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Veröffentlichungs-Workflow

## Data Models

- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Autor-Datenmodell

## Hauptnavigation

### Zugriff
- **Hauptnavigation:** "Projekte" Link
- **Landing Page:** "Zu den Projekten" Button
- **Direkter Link:** `/projekte`

## Projekt-Galerie Layout

### Hero Section
- **Headline:** "Zeig uns dein Meisterwerk" (Show us your masterpiece)
- **Beschreibung:** Einladung zur Erkundung veröffentlichter Projekte, Teilnahme an Wettbewerben und Start eigener Projekte
- **Call-to-Action Buttons:**
  - "Projekte anschauen" (View Projects) - primärer CTA
  - "Leaderboards" - sekundärer CTA

### Filter & Suche

#### Wettbewerbsauswahl
- **Dropdown:** "Wettbewerbsauswahl" (Competition selection)
- **Optionen:**
  - "Alle Wettbewerbe" (All competitions)
  - Spezifische Challenges (z.B. "YouthHackathon 2026", "TalentsLounge Winter Challenge 2025")
  - "Kein Wettbewerb" (No competition)

#### Bundesland-Filter
- **Dropdown:** "Bundesland auswählen" (Select federal state)
- **Optionen:**
  - "Alle Bundesländer" (All federal states)
  - Spezifische Bundesländer (Wien, Niederösterreich, Oberösterreich, etc.)

#### Suchfeld
- **Input:** "Suche Projekte oder..." (Search projects or...)
- **Funktionalität:**
  - Volltext-Suche über Projektnamen
  - Suche in Beschreibungen
  - Suche nach Tags/Kategorien
  - Suche nach Autor/Schule

#### Zufällig-Filter
- **Dropdown:** "Zufällig" (Random)
- **Optionen:**
  - "Zufällige Projekte anzeigen"
  - "Beliebteste Projekte"
  - "Neueste Projekte"
  - "Meistgespielte Projekte"

### Projekt-Grid

#### Layout
- **Grid-System:** Responsive 3-Spalten-Layout
- **Mobile:** 1 Spalte
- **Tablet:** 2 Spalten
- **Desktop:** 3 Spalten

#### Projekt-Karten

Jede Projekt-Karte enthält:

##### Projekt-Thumbnail
- **Bild:** Vorschaubild des Projekts
- **Overlay:** Play-Button Icon beim Hover
- **Fallback:** Standard-Thumbnail wenn kein Bild vorhanden

##### Projekt-Informationen
- **Autor-Badge:** Kreis-Icon mit Initialen (z.B. "Arti Powe", "Natu Prof")
- **Projekt-Titel:** Name des Projekts (z.B. "Freddie der lustige Fish", "Punkte spielen")
- **Kurzbeschreibung:** Erste Zeilen der Projektbeschreibung (gekürzt)
- **Challenge-Badge:** Optional - Badge wenn Projekt Teil einer Challenge ist

##### Interaktions-Buttons
- **"mehr" Button:** Öffnet Projekt-Detailseite
- **"Spielen" Button:** Startet Projekt direkt im Player
- **Herz-Icon:** Anzahl der Likes
- **Share-Icon:** Teilen-Funktion

##### Projekt-Metadaten
- **Likes:** Anzahl der Likes
- **Spiel-Anzahl:** Wie oft wurde das Projekt gespielt
- **Veröffentlichungsdatum:** Wann wurde das Projekt veröffentlicht

### Projekt-Detailseite

#### Header
- **Projekt-Titel:** Große Überschrift
- **Autor-Information:** Name, Klasse, Schule
- **Challenge-Badge:** Falls Teil einer Challenge

#### Projekt-Player
- **Scratch-Player:** Integrierter Player zum Abspielen des Projekts
- **Vollbild-Modus:** Option für Vollbild-Anzeige
- **Steuerung:** Play/Pause, Reset-Buttons

#### Projekt-Details
- **Beschreibung:** Vollständige Projektbeschreibung
- **Anleitung:** Wie spielt man das Projekt?
- **Tags/Kategorien:** Projekt-Kategorien
- **Credits:** Danksagungen und Inspirationen

#### Interaktionen
- **Like-Button:** Projekt liken (nur für eingeloggte Benutzer)
- **Share-Button:** Projekt teilen (Social Media, Link kopieren)
- **Kommentare:** Kommentar-Sektion (nur für eingeloggte Benutzer)
- **Report-Button:** Projekt melden (bei unangemessenem Inhalt)

#### Statistiken
- **Likes:** Anzahl der Likes
- **Spiel-Anzahl:** Wie oft wurde gespielt
- **Kommentare:** Anzahl der Kommentare
- **Veröffentlichungsdatum:** Wann veröffentlicht

#### Ähnliche Projekte
- **Empfehlungen:** Ähnliche Projekte basierend auf Tags, Kategorie oder Autor
- **Weitere Projekte vom Autor:** Andere Projekte des gleichen Autors

## Filterung & Sortierung

### Sortierung
- **Neueste zuerst:** Standard-Sortierung
- **Beliebteste:** Nach Likes sortiert
- **Meistgespielte:** Nach Spiel-Anzahl sortiert
- **Alphabetisch:** Nach Projektname sortiert

### Filter-Kombinationen
- **Mehrfach-Filter:** Filter können kombiniert werden
- **Aktive Filter:** Anzeige aktiver Filter mit Möglichkeit zum Entfernen
- **Filter-Reset:** "Filter zurücksetzen" Button

## Responsive Design

### Mobile Ansicht
- **1-Spalten-Grid:** Projekt-Karten in einer Spalte
- **Vereinfachte Filter:** Dropdown-Menüs statt Sidebar
- **Touch-optimiert:** Größere Buttons und Touch-Targets

### Tablet Ansicht
- **2-Spalten-Grid:** Projekt-Karten in zwei Spalten
- **Filter-Sidebar:** Optional ein-/ausklappbar

### Desktop Ansicht
- **3-Spalten-Grid:** Projekt-Karten in drei Spalten
- **Filter-Sidebar:** Permanente Sidebar mit allen Filtern

## Performance

### Lazy Loading
- **Infinite Scroll:** Automatisches Nachladen beim Scrollen
- **Pagination:** Alternative: Seiten-Nummerierung
- **Thumbnail-Optimierung:** Optimierte Bilder für schnelles Laden

### Caching
- **Projekt-Liste:** Gecachte Projekt-Liste für schnelle Anzeige
- **Thumbnails:** CDN für schnelle Bild-Ladung
- **API-Responses:** Caching von API-Antworten

## Integration

### Navigation
- **Hauptnavigation:** "Projekte" Link
- **Breadcrumbs:** Navigation-Pfad (Home > Projekte > Projekt-Detail)

### Verknüpfungen
- **Challenges:** Link zu Challenges, die Projekte enthalten
- **Leaderboards:** Link zu Leaderboards
- **Autor-Profile:** Link zu Autor-Profilen (wenn öffentlich)

## Datenschutz

### Öffentliche Projekte
- **Sichtbarkeit:** Nur Projekte mit "Öffentlich"-Einstellung werden angezeigt
- **Klassen-Projekte:** Projekte mit "Nur Klasse"-Einstellung sind nicht sichtbar

### Persönliche Daten
- **Autor-Informationen:** Nur öffentliche Informationen werden angezeigt
- **Schule/Klasse:** Optional anzeigbar (abhängig von Datenschutz-Einstellungen)

> [!tip] Implementation Hint
> - Implementiere Lazy Loading für bessere Performance
> - Verwende CDN für Thumbnail-Bilder
> - Implementiere Volltext-Suche mit Indexierung
> - Cache Projekt-Listen für schnelle Anzeige
> - Responsive Design ist kritisch für mobile Nutzer
