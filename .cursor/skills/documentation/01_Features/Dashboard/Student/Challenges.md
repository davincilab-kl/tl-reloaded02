---
title: Challenges - Wettbewerbe
description: User Journey für Challenges und Wettbewerbe
enableToc: true
tags:
  - features
  - student
---

# 🏆 Challenges - Wettbewerbe

> [!abstract] User Story
> Als Schüler möchte ich an spannenden Wettbewerben teilnehmen, neue Skills lernen und Preise für mich und meine Schule gewinnen.

## Verwandte Features

- **Projekt-Entwicklung:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Projekte für Challenges entwickeln
- **Projekt-Veröffentlichung:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Automatische Challenge-Einreichung nach Veröffentlichung
- **Public Challenges:** [[01_Features/Challenges/Public_Challenges|Public Challenges]] - Öffentliche Challenges-Übersicht
- **Leaderboards:** [[01_Features/Dashboard/Student/Leaderboards|Leaderboards]] - Challenge-Leaderboards
- **Projekt-Review:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Lehrer kann Opt-Out für Challenge-Einreichung setzen

## Data Models

- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell
- **Challenge Leaderboard Model:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] - Challenge-spezifische Leaderboards mit T!Score
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **T!Coins Transaction Model:** [[03_Data_Models/T_Coins_Transaction|T!Coins Transaction Model]] - T!Coins-Transaktionen

## Übersicht

### Challenge-Typen
- **Game Development:** Spiele-Entwicklung
- **KI-Kunst:** Künstliche Intelligenz und Kunst
- **Coding Challenges:** Programmier-Wettbewerbe
- **Hackathons:** Zeitlich begrenzte Entwicklungs-Wettbewerbe
- **Regionale Challenges:** Bundesland-spezifische Wettbewerbe
- **Förderer-Challenges:** Von Partnern/Förderern organisierte Wettbewerbe

### Challenge-Organisatoren
- **Förderer:** Externe Partner/Sponsoren (z.B. Mastercard, Amazon, Wiener Netze)
- **Bundesland:** Regionale Wettbewerbe (z.B. Niederösterreich, Wien)
- **Plattform:** Von der Plattform organisierte Challenges

## Challenge-Kriterien

### Automatische Kriterien-Prüfung

Jede Challenge hat spezifische Kriterien, die automatisch geprüft werden:

#### 1. Basis-Kriterien (immer erforderlich)
- ✅ Projekt ist **veröffentlicht** (Status: "Veröffentlicht")
- ✅ Projekt wurde von Lehrer **genehmigt** (Lehrer-Approval erfolgt)
- ✅ Projekt ist **funktionsfähig** (keine offensichtlichen Fehler)

#### 2. Organisator-basierte Kriterien
- **Förderer-Challenges:**
  - Projekt muss zum Förderer-Thema passen (z.B. "Game Development" für Gaming-Förderer)
  - Optional: Spezifische Förderer-Anforderungen (z.B. bestimmte Technologie)
- **Bundesland-Challenges:**
  - Schule des Schülers muss im richtigen Bundesland sein
  - Optional: Spezifische regionale Themen
- **Plattform-Challenges:**
  - Projekt muss zum Challenge-Thema passen
  - Optional: Spezifische technische Anforderungen

#### 3. Gebiets-basierte Kriterien
- **Ganz Österreich:** Alle Schulen teilnahmeberechtigt
- **Bundesland-spezifisch:** Nur Schulen aus bestimmten Bundesländern
- **Regionale Gebiete:** Spezifische Regionen (z.B. "Wien und Umgebung")

#### 4. Projekt-Typ-Kriterien
- **Game Development:** Projekt muss ein Spiel sein
- **KI-Kunst:** Projekt muss KI/ML-Komponenten enthalten
- **Coding Challenges:** Projekt muss bestimmte Programmier-Konzepte verwenden
- **Hackathons:** Projekt muss innerhalb des Hackathon-Zeitraums erstellt worden sein

#### 5. Zeit-basierte Kriterien
- Projekt muss vor Challenge-Deadline veröffentlicht worden sein
- Optional: Projekt muss nach Challenge-Start erstellt worden sein

### Kriterien-Konfiguration

- **Admin/Organisator** definiert Kriterien bei Challenge-Erstellung
- Kriterien können kombiniert werden (AND/OR-Logik)
- System prüft automatisch alle Projekte nach Veröffentlichung
- Projekte, die Kriterien erfüllen, werden automatisch eingereicht (außer Opt-Out)

## User Flow: Challenge-Teilnahme

### 1. Challenge entdecken
- **Zugriff:**
  - "Challenges" Tab in der Hauptnavigation
  - Challenge-Übersichtsseite
  - Empfehlungen im Dashboard
- **Challenge-Informationen:**
  - Titel und Beschreibung
  - Deadline
  - Standort/Region (z.B. "Ganz Österreich", "Wien", "Niederösterreich")
  - Förderer/Organisator
  - Challenge-ID/Tag (z.B. "YH2025", "AFEC 24/25")

### 2. Challenge-Details ansehen
- **Detailseite:**
  - Vollständige Beschreibung
  - Teilnahmebedingungen
  - Kriterien für Einreichung
  - Bewertungskriterien
  - Zeitplan
- **Status:**
  - "Aktiv" - Challenge läuft, Einreichungen möglich
  - "Beendet" - Challenge abgeschlossen, keine weiteren Einreichungen
  - "Anstehend" - Challenge startet in Zukunft

### 3. Projekt für Challenge entwickeln
- **Projekt-Erstellung:**
  - Schüler entwickelt Projekt im Scratch-Editor
  - Projekt kann speziell für Challenge erstellt werden
  - Oder bestehendes Projekt wird angepasst
- **Kriterien beachten:**
  - Challenge-spezifische Anforderungen
  - Deadline einhalten
  - Projekt muss veröffentlicht sein

### 4. Projekt veröffentlichen
- **Veröffentlichung:**
  - Projekt wird auf der Plattform veröffentlicht
  - Sichtbarkeit: Öffentlich oder nur Klasse
  - Projekt muss Challenge-Kriterien erfüllen

### 5. Automatische Einreichung nach Veröffentlichung
- **Workflow:**
  1. Schüler reicht Projekt zur Veröffentlichung ein (Status: "Zur Veröffentlichung eingereicht")
  2. Lehrer prüft und approviert Projekt (siehe [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]])
  3. Projekt wird **veröffentlicht** (Status: "Veröffentlicht") - siehe [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]]
  4. **Automatisch:** System prüft, ob Projekt Challenge-Kriterien erfüllt
  5. **Wenn Kriterien erfüllt UND kein Opt-Out aktiv:**
     - Projekt wird automatisch für passende Challenges eingereicht
     - Schüler wird benachrichtigt
     - Projekt erscheint in Challenge-Einreichungen (Status: "Eingereicht")
- **Opt-Out für Lehrer:**
  - Lehrer kann in Projektprüfungs-Interface Opt-Out setzen
  - Checkbox: "Projekt soll nicht zu allen verfügbaren Wettbewerben eingereicht werden"
  - Ausgeschlossene Projekte werden nicht automatisch eingereicht
  - Lehrer kann manuell Projekte einreichen, wenn gewünscht
- **Kriterien-Prüfung:**
  - Projekt ist veröffentlicht und von Lehrer genehmigt
  - Projekt-Typ passt zur Challenge
  - Challenge-spezifische Kriterien erfüllt (siehe "Challenge-Kriterien" unten)

### 6. Challenge-Teilnahme bestätigen
- **Bestätigung:**
  - Schüler sieht Einreichung in "Meine Challenges"
  - Status: "Eingereicht"
  - Challenge-Details bleiben sichtbar
- **Während Challenge (vor Deadline):**
  - **Wichtig:** Projekt kann **nicht bearbeitet** werden, solange es für Challenge eingereicht ist
  - Wenn Bearbeitung nötig: Projekt muss zuerst aus Challenge zurückgezogen werden
  - **Hinweis:** Zurückziehen bedeutet, dass alle Challenge-bezogenen Daten (Einreichung, Position im Leaderboard) verloren gehen
- **Nach Deadline:**
  - **Wichtig:** Keine Updates mehr möglich
  - Projekt ist "eingefroren" für die Challenge
  - Wenn Schüler Projekt ändern möchte:
    - Projekt muss zurückgezogen werden (aus Challenge entfernt)
    - **Achtung:** Alle Likes, Kommentare und Statistiken des Projekts gehen verloren
    - Alle T!Coins, die durch Likes/Kommentare verdient wurden, werden abgezogen
    - Projekt kann dann bearbeitet und erneut veröffentlicht werden
    - Erneute Veröffentlichung erfordert erneutes Lehrer-Approval
    - Projekt kann dann als Kopie erneut für Challenge eingereicht werden (wenn noch Zeit)

### 7. Challenge-Abschluss
- **Nach Deadline:**
  - Status ändert sich zu "Beendet"
  - Bewertung durch Juroren
  - Ergebnisse werden bekannt gegeben
- **Ergebnisse:**
  - Gewinner werden angezeigt
  - Leaderboard wird aktualisiert
  - Preise werden vergeben
  - Urkunden werden ausgestellt

## Challenge-Filterung

### Schuljahr-Filter
- **Filter-Optionen:**
  - "Schuljahr 2024/2025"
  - "Schuljahr 2025/2026"
  - "Sommercamp 2025"
- **Anzeige:**
  - Nur Challenges des ausgewählten Schuljahres werden angezeigt

### Status-Filter
- **Aktive Challenges:** Laufende Wettbewerbe
- **Beendete Challenges:** Abgeschlossene Wettbewerbe
- **Anstehende Challenges:** Zukünftige Wettbewerbe

### Region/Organisator-Filter
- **Nach Bundesland:** z.B. Wien, Niederösterreich
- **Nach Förderer:** z.B. Mastercard, Amazon, Wiener Netze
- **Alle:** Alle Challenges

## Challenge-Übersicht

### Challenge-Karten
- **Anzeige:**
  - Challenge-Bild/Thumbnail
  - Titel
  - Deadline (z.B. "Deadline: 30.05.2025")
  - Standort/Region
  - Challenge-ID/Tag
  - Status-Badge ("Aktiv", "Beendet", "Anstehend")
  - "Details" Button
- **Layout:**
  - Grid-Layout
  - Responsive Design

### Meine Challenges
- **Übersicht:**
  - Alle Challenges, an denen Schüler teilnimmt
  - **Status:**
    - "Eingereicht" - Projekt wurde für Challenge eingereicht
    - "In Bearbeitung" - Projekt wird für Challenge entwickelt
    - "Abgeschlossen" - Challenge-Teilnahme abgeschlossen
  - Fortschritt
  - Ergebnisse

## Belohnungen & Preise

### Preise für Schüler
- **Gewinne:**
  - Sachpreise
  - Zertifikate/Urkunden
  - T!Coins
  - Spezielle Achievements/Badges
- **Anerkennung:**
  - Erwähnung in Leaderboards
  - Feature in News/Highlights

### Preise für Schulen
- **Schul-Preise:**
  - Preise für die Schule des Gewinners
  - Anerkennung für Engagement
  - T!Score-Boost für Schule (durch zusätzliche T!Coins der Gewinner)

## Leaderboards

### Challenge-spezifische Leaderboards

**Wichtig:** Leaderboards sind **challenge-spezifisch** und basieren auf **T!Score** mit **Cut-off-Datum**.

#### T!Score-Berechnung
- **Basis:** T!Score wird basierend auf Challenge-Kriterien berechnet
- **Cut-off-Datum:** Nur T!Coins/Projekte bis zum Cut-off-Datum werden gezählt
- **Challenge-relevant:** Nur Aktivitäten, die Challenge-Kriterien erfüllen

#### Leaderboard-Ebenen
- **Schüler-Leaderboard:** Top-Performer der Challenge (nach T!Score)
- **Klassen-Leaderboard:** Top-Klassen der Challenge (nach T!Score)
- **Schul-Leaderboard:** Top-Schulen der Challenge (nach T!Score)
- **Bundesland-Leaderboard:** Top-Bundesländer der Challenge (nach T!Score)

#### Anzeige
- **Top-Performer:** Top 3 werden besonders hervorgehoben
- **Ranking:** Nach T!Score sortiert (absteigend)
- **Cut-off-Datum:** Wird angezeigt (z.B. "Stand: 31.03.2025")
- **Filter:**
  - Nach Klasse
  - Nach Schule
  - Nach Bundesland
  - Gesamt

#### Cut-off-Datum
- **Zweck:** Faire Rankings durch festen Stichtag
- **Berechnung:** Nur T!Coins/Projekte bis Cut-off-Datum werden gezählt
- **Anzeige:** Cut-off-Datum wird im Leaderboard angezeigt
- **Aktualisierung:** Leaderboard wird nach Cut-off-Datum eingefroren

**Siehe:** [[03_Data_Models/Challenge_Leaderboard|Challenge Leaderboard Model]] für technische Details

### Persönliche Position
- **Schüler-Ranking:**
  - Eigene Position in Challenge
  - Vergleich mit anderen Teilnehmern
  - Fortschritt

## Technische Details

### Automatische Einreichung
- **Lehrer-Dashboard:**
  - Lehrer sieht alle Projekte seiner Schüler
  - System markiert Projekte, die Challenge-Kriterien erfüllen
  - **Opt-Out-Mechanismus:**
    - Standard: Automatische Einreichung ist aktiviert für alle Projekte
    - Lehrer kann pro Projekt Opt-Out aktivieren (Checkbox: "Von Challenge-Einreichung ausschließen")
    - Einfache, klare Opt-Out-Funktion
    - Lehrer kann weiterhin manuell Projekte einreichen
- **Kriterien-Prüfung:**
  - Automatische Validierung
  - Challenge-spezifische Regeln
  - Projekt muss veröffentlicht und von Lehrer genehmigt sein
- **Einreichungs-Status:**
  - Projekte mit erfüllten Kriterien werden automatisch eingereicht (außer Opt-Out wurde aktiviert)
  - Lehrer wird über automatische Einreichungen benachrichtigt
  - Schüler wird über Einreichung informiert
- **Deadline-Verhalten:**
  - Nach Deadline: Keine Updates mehr möglich
  - Projekt muss zurückgezogen werden, um Änderungen vorzunehmen
  - Kopie des Projekts kann erstellt werden für neue Einreichung (wenn noch Zeit)

### Challenge-Verwaltung
- **Admin/Organisator:**
  - Erstellung neuer Challenges
  - Festlegung von Kriterien
  - Verwaltung von Einreichungen
  - Bewertung und Auswahl der Gewinner

> [!tip] Implementation Hint
> - Implementiere automatische Kriterien-Prüfung für Projekte
> - Lehrer-Dashboard sollte Projekte mit erfüllten Kriterien hervorheben
> - Einreichungen sollten mit Challenge verknüpft werden
> - Leaderboards müssen in Echtzeit aktualisiert werden
