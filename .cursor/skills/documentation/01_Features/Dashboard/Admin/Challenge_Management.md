---
title: Admin Challenge Management - Challenge-Verwaltung
description: Challenge-Verwaltung durch Admin
enableToc: true
tags:
  - features
  - admin
  - challenge
---

# 🏆 Admin Challenge Management - Challenge-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich Challenges anlegen, Förderer zuweisen und Challenges verwalten.

## Verwandte Features

- **Teacher Challenge Management:** [[01_Features/Dashboard/Teacher/Challenge_Management|Teacher Challenge Management]] - Challenge-Verwaltung durch Lehrer
- **Student Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Challenge-Teilnahme der Schüler
- **Public Challenges:** [[01_Features/Challenges/Public_Challenges|Public Challenges]] - Öffentliche Challenges-Übersicht
- **School Year Management:** [[01_Features/Dashboard/Admin/School_Year_Management|School Year Management]] - Schuljahre für Challenges

## Data Models

- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell
- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards
- **School Year Model:** [[03_Data_Models/School_Year|School Year Model]] - Schuljahr-Datenmodell

## Übersicht

Die Challenge-Verwaltung ermöglicht es Admins, neue Challenges anzulegen, Förderer zuzuweisen und bestehende Challenges zu verwalten.

## Challenge anlegen

### Challenge-Erstellung

#### Basis-Informationen
- **Titel:** Challenge-Name (z.B. "Game Development Challenge 2025")
- **Beschreibung:** Vollständige Beschreibung der Challenge
- **Cover-Bild:** Hochladen eines Cover-Bildes
  - Unterstützte Formate: JPG, PNG
  - Empfohlene Größe: 1200x600px
  - Maximale Größe: 5 MB

#### Organisator & Förderer
- **Förderer auswählen:**
  - Dropdown mit verfügbaren Förderern
  - **Beispiele:** Mastercard, Amazon, Wiener Netze, etc.
  - **Optional:** Neuen Förderer anlegen
- **Bundesland:**
  - Dropdown mit österreichischen Bundesländern
  - **Optionen:** 
    - "Ganz Österreich" (alle Bundesländer)
    - Spezifisches Bundesland (z.B. "Wien", "Niederösterreich")
- **Gebiet:**
  - **Optionen:**
    - "Ganz Österreich"
    - "Bundesland-spezifisch"
    - "Regionale Gebiete" (z.B. "Wien und Umgebung")

#### Challenge-Typ
- **Typ auswählen:**
  - Game Development
  - KI-Kunst
  - Coding Challenges
  - Hackathons
  - Regionale Challenges
  - Förderer-Challenges

#### Zeitplan
- **Startdatum:** Wann startet die Challenge?
- **Deadline:** Wann endet die Challenge?
- **Ergebnisse bekannt geben:** Wann werden Ergebnisse bekannt gegeben?

#### Schuljahr
- **Schuljahr zuweisen:**
  - Dropdown mit verfügbaren Schuljahren
  - **Beispiel:** "2025/2026"
  - **Wichtig:** Challenge ist nur für dieses Schuljahr gültig

#### Kriterien
- **Basis-Kriterien:**
  - Projekt muss veröffentlicht sein
  - Projekt muss von Lehrer genehmigt sein
- **Challenge-spezifische Kriterien:**
  - Projekt-Typ (z.B. "muss ein Spiel sein")
  - Technische Anforderungen
  - Weitere spezifische Kriterien

#### Challenge-ID/Tag
- **ID generieren:**
  - Automatische Generierung (z.B. "YH2025", "AFEC 24/25")
  - Oder manuell eingeben
  - **Format:** Alphanumerisch, eindeutig

### Challenge speichern
- **Entwurf speichern:** Challenge als Entwurf speichern (nicht aktiv)
- **Challenge aktivieren:** Challenge sofort aktivieren
- **Validierung:** Alle Pflichtfelder werden geprüft

## Challenge verwalten

### Challenge-Übersicht
- **Alle Challenges:** Liste aller Challenges
- **Filter:**
  - Nach Förderer
  - Nach Bundesland
  - Nach Schuljahr
  - Nach Status (Aktiv, Beendet, Anstehend)
- **Sortierung:**
  - Nach Startdatum
  - Nach Deadline
  - Nach Anzahl Teilnehmer

### Challenge bearbeiten
- **Basis-Informationen:** Bearbeitbar
- **Zeitplan:** Bearbeitbar (wenn Challenge noch nicht gestartet)
- **Kriterien:** Bearbeitbar
- **Status:** Aktiv/Inaktiv setzen

### Challenge löschen
- **Löschung:** Challenge kann gelöscht werden
- **Bestätigung:** Mehrstufiger Bestätigungsprozess
- **Warnung:** Alle Einreichungen werden gelöscht
- **Frist:** 30 Tage Wartezeit (kann wiederhergestellt werden)

## Challenge-Statistiken

### Teilnahme-Statistiken
- **Anzahl Teilnehmer:** Gesamtanzahl der teilnehmenden Schüler
- **Anzahl Einreichungen:** Gesamtanzahl der eingereichten Projekte
- **Nach Bundesland:** Aufschlüsselung nach Bundesland
- **Nach Schule:** Aufschlüsselung nach Schule

### Challenge-Ergebnisse
- **Gewinner:** Top 3 Projekte
- **Bewertungen:** Durchschnittliche Bewertungen
- **Preise:** Vergebene Preise

## Förderer-Verwaltung

### Förderer anlegen
- **Förderer-Informationen:**
  - Name (z.B. "Mastercard")
  - Beschreibung
  - Logo hochladen
  - Kontakt-Informationen
- **Förderer speichern:** Förderer wird zu Liste hinzugefügt

### Förderer verwalten
- **Förderer-Liste:** Alle verfügbaren Förderer
- **Förderer bearbeiten:** Informationen aktualisieren
- **Förderer löschen:** Förderer entfernen (wenn keine aktiven Challenges)

## Integration

### Automatische Einreichung
- **Kriterien-Prüfung:** System prüft automatisch, ob Projekte Kriterien erfüllen
- **Einreichung:** Projekte werden automatisch eingereicht (außer Opt-Out)
- Siehe [[01_Features/Dashboard/Student/Challenges|Challenges]] für Details

### Status-Email-Integration
- **Automatische E-Mails:** Werden bei Challenge-Änderungen versendet
- **Beispiele:**
  - "Neue Challenge verfügbar" → An alle betroffenen Schulen
  - "Challenge-Deadline naht" → Erinnerung
- Siehe [[01_Features/Dashboard/Admin/Status_Emails|Status-Emails]] für Details

> [!tip] Implementation Hint
> - Implementiere Duplikat-Prüfung für Challenge-IDs
> - Cover-Bilder sollten optimiert werden (CDN)
> - Kriterien sollten flexibel konfigurierbar sein
> - Automatische Einreichung sollte im Hintergrund laufen
