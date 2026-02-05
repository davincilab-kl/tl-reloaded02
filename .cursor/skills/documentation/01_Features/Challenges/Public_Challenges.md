---
title: Public Challenges - Öffentliche Wettbewerbe
description: Öffentliche Anzeige von Challenges und Wettbewerben
enableToc: true
tags:
  - features
  - challenges
  - public
---

# 🏆 Public Challenges - Öffentliche Wettbewerbe

> [!abstract] User Story
> Als Besucher möchte ich aktive Challenges und Wettbewerbe entdecken, Details ansehen und verstehen, wie ich teilnehmen kann.

## Übersicht

Die öffentliche Challenges-Seite zeigt alle verfügbaren Challenges und Wettbewerbe der Plattform. Besucher können Challenges durchsuchen, Details ansehen und verstehen, wie die Teilnahme funktioniert.

### Verwandte Features
- **Student Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-Teilnahme für eingeloggte Schüler
- **Projekt-Veröffentlichung:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Automatische Challenge-Einreichung
- **Projekt-Entwicklung:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Projekte für Challenges entwickeln

## Data Models

- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell
- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards mit T!Score und Cut-off-Datum

## Hauptnavigation

### Zugriff
- **Hauptnavigation:** "Challenges" Link
- **Landing Page:** "Zu den Challenges" Button
- **Direkter Link:** `/challenges`

## Hero Section

### Design
- **Headline:** "Wettbewerbe und Projekte" (Competitions and Projects)
- **Sub-Headline:** "Wähle deine Projekte aus" (Choose your projects)
- **Beschreibung:** Einladung zur Teilnahme an spannenden Wettbewerben

## Challenges-Übersicht

### Überschrift
- **Titel:** "Wettbewerbe und Projekte für Schuljahr 2025/2026" (Competitions and Projects for School Year 2025/2026)
- **Schuljahr:** Hervorgehoben in blauer Farbe

### Filter-Tabs
- **"Schuljahr 2025/2026"** - Standard-Auswahl
- **"Schuljahr 2024/2025"**
- **"Sommercamp 2025"**
- **"Alle anzeigen"** (Show all) - Link rechts

### Challenge-Karten

#### Layout
- **Grid-Layout:** Horizontale Anzeige von Challenge-Karten
- **Responsive:** 1-3 Karten pro Zeile (abhängig von Bildschirmgröße)
- **Scrollbar:** Horizontales Scrollen bei vielen Challenges

#### Challenge-Karte Inhalt

##### Challenge-Bild
- **Thumbnail:** Vorschaubild der Challenge
- **Fallback:** Standard-Bild wenn kein Bild vorhanden

##### Challenge-Informationen
- **Titel:** Name der Challenge (z.B. "YouthHackathon 2026", "TalentsLounge Winter Challenge 2025")
- **Standort:** "Ganz Österreich" (All of Austria) oder spezifisches Bundesland
- **Challenge-ID/Tag:** z.B. "TLH2026", "TLWC25", "RLB2526"
- **Projekt-Anzahl:** "Projekte (54)" - Anzahl der eingereichten Projekte

##### Status-Badges
- **"Vorgestellt"** (Featured) - Hervorgehobene Challenge
- **"Aktiv"** (Active) - Laufende Challenge
- **"Beendet"** (Ended) - Abgeschlossene Challenge
- **"Anstehend"** (Upcoming) - Zukünftige Challenge

##### Call-to-Action
- **"Details" Button:** Öffnet Challenge-Detailseite

### Challenge-Detailseite

#### Header
- **Challenge-Titel:** Große Überschrift
- **Status-Badge:** Aktueller Status der Challenge
- **Challenge-ID:** Tag/ID der Challenge

#### Challenge-Informationen
- **Beschreibung:** Vollständige Beschreibung der Challenge
- **Organisator:** Förderer oder Organisator (z.B. "Mastercard", "Raiffeisenlandesbank Oberösterreich")
- **Standort/Region:** "Ganz Österreich" oder spezifisches Bundesland
- **Schuljahr:** Zugeordnetes Schuljahr

#### Zeitplan
- **Start-Datum:** Wann startet die Challenge
- **Deadline:** Wann endet die Challenge
- **Ergebnisse:** Wann werden Ergebnisse bekannt gegeben
- **Countdown:** Live-Countdown zur Deadline (falls aktiv)

#### Teilnahmebedingungen
- **Kriterien:** Welche Kriterien müssen erfüllt sein
- **Eligibility:** Wer kann teilnehmen (Schulen, Klassen, Bundesländer)
- **Projekt-Anforderungen:** Spezifische Anforderungen an Projekte

#### Preise & Belohnungen
- **Preise für Schüler:** Beschreibung der Preise
- **Preise für Schulen:** Beschreibung der Schul-Preise
- **T!Coins:** Belohnungen in T!Coins
- **Urkunden:** Zertifikate und Urkunden

#### Eingereichte Projekte
- **Projekt-Grid:** Anzeige aller eingereichten Projekte
- **Filter:** Nach Klasse, Schule, Bundesland filtern
- **Sortierung:** Nach Likes, Datum, Alphabetisch
- **Projekt-Karten:** Gleiche Karten wie in Projekt-Galerie

#### Leaderboard
- **Challenge-Leaderboard:** Ranking der Challenge-Teilnehmer
- **Top-Projekte:** Beste Projekte der Challenge
- **Top-Klassen:** Beste Klassen der Challenge
- **Top-Schulen:** Beste Schulen der Challenge

#### Teilnahme-Informationen
- **Wie teilnehmen:** Schritt-für-Schritt-Anleitung
- **Automatische Einreichung:** Erklärung des automatischen Einreichungs-Prozesses
- **Opt-Out:** Information über Opt-Out-Möglichkeit für Lehrer

## Filter & Suche

### Suchfeld
- **Input:** "Suche Challenges..." (Search challenges...)
- **Funktionalität:**
  - Volltext-Suche über Challenge-Namen
  - Suche in Beschreibungen
  - Suche nach Organisator/Förderer

### Status-Filter
- **Dropdown:** "Status auswählen" (Select status)
- **Optionen:**
  - "Alle" (All)
  - "Aktiv" (Active)
  - "Beendet" (Ended)
  - "Anstehend" (Upcoming)

### Organisator-Filter
- **Dropdown:** "Organisator auswählen" (Select organizer)
- **Optionen:**
  - "Alle" (All)
  - Spezifische Förderer/Organisatoren
  - "Plattform" (Platform-organized)

### Bundesland-Filter
- **Dropdown:** "Bundesland auswählen" (Select federal state)
- **Optionen:**
  - "Alle Bundesländer" (All federal states)
  - Spezifische Bundesländer

## Challenge-Typen

### Game Development Challenges
- **Fokus:** Spiele-Entwicklung
- **Anforderungen:** Projekt muss ein Spiel sein
- **Beispiele:** "YouthHackathon 2026"

### Winter/Seasonal Challenges
- **Fokus:** Saisonale Themen
- **Anforderungen:** Thematisch passende Projekte
- **Beispiele:** "TalentsLounge Winter Challenge 2025"

### Förderer-Challenges
- **Fokus:** Spezifische Förderer-Themen
- **Anforderungen:** Förderer-spezifische Kriterien
- **Beispiele:** "Raiffeisenlandesbank Oberösterreich Challenge 25/26"

### Hackathons
- **Fokus:** Zeitlich begrenzte Entwicklungs-Wettbewerbe
- **Anforderungen:** Projekt muss innerhalb des Zeitraums erstellt werden
- **Beispiele:** "YouthHackathon 2026"

## Responsive Design

### Mobile Ansicht
- **1-Spalten-Grid:** Challenge-Karten in einer Spalte
- **Vereinfachte Filter:** Dropdown-Menüs
- **Touch-optimiert:** Größere Buttons

### Tablet Ansicht
- **2-Spalten-Grid:** Challenge-Karten in zwei Spalten
- **Filter-Sidebar:** Optional ein-/ausklappbar

### Desktop Ansicht
- **3-Spalten-Grid:** Challenge-Karten in drei Spalten
- **Filter-Sidebar:** Permanente Sidebar

## Integration

### Navigation
- **Hauptnavigation:** "Challenges" Link
- **Breadcrumbs:** Navigation-Pfad (Home > Challenges > Challenge-Detail)

### Verknüpfungen
- **Projekte:** Link zu eingereichten Projekten
- **Leaderboards:** Link zu Challenge-Leaderboards
- **Anmeldung:** CTA zur Registrierung für Teilnahme

## Call-to-Actions

### Für Besucher
- **"Jetzt registrieren"** Button - Wenn nicht eingeloggt
- **"Mehr erfahren"** Link - Zu Details

### Für Teilnehmer
- **"Projekt einreichen"** Button - Wenn eingeloggt
- **"Meine Einreichung"** Link - Zu eigenem Projekt

## Performance

### Lazy Loading
- **Infinite Scroll:** Automatisches Nachladen beim Scrollen
- **Pagination:** Alternative: Seiten-Nummerierung

### Caching
- **Challenge-Liste:** Gecachte Challenge-Liste
- **Detailseiten:** Caching von Challenge-Details
- **Projekt-Listen:** Caching von eingereichten Projekten

> [!tip] Implementation Hint
> - Implementiere Lazy Loading für bessere Performance
> - Cache Challenge-Daten für schnelle Anzeige
> - Implementiere Countdown-Timer für aktive Challenges
> - Responsive Design ist kritisch für mobile Nutzer
> - Verknüpfe Challenges mit Projekt-Galerie und Leaderboards
