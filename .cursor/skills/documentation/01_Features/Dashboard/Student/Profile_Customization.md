---
title: Profile Customization - Profil-Customization
description: Steam-ähnliches Profil-System mit T!Coins-Shop
enableToc: true
tags:
  - features
  - student
  - profile
  - gamification
---

# 🎨 Profile Customization - Profil-Customization

> [!abstract] User Story
> Als Schüler möchte ich mein Profil individuell gestalten und mit T!Coins coole Items kaufen können, ähnlich wie bei Steam.

## Verwandte Features

- **Stats:** [[01_Features/Dashboard/Student/Stats|Stats]] - T!Coins-Statistiken
- **Settings:** [[01_Features/Settings/Profile|Profile]] - Profil-Einstellungen
- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Profil-Übersicht

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell
- **T!Coins Transaction Model:** [[03_Data_Models/T_Coins_Transaction|T!Coins Transaction Model]] - T!Coins-Transaktionen und Shop

## Übersicht

Das Profil-Customization-System ermöglicht es Schülern, ihre Profile zu personalisieren und mit T!Coins verschiedene visuelle Items zu kaufen.

## Profil-Struktur

### Öffentliches Profil
- **Sichtbarkeit:** Profile sind standardmäßig öffentlich
- **Zugriff:** Andere Schüler können Profile ansehen
- **Anpassung:** Schüler können Sichtbarkeit ändern (optional)

### Profil-Komponenten

#### 1. Profil-Header
- **Hintergrund:** Customizable Hintergrundbild
- **Avatar:** Aus Avatar-Bibliothek erstellt (siehe [[01_Features/Settings/Profile|Profile Management]])
- **Banner:** Optionaler Banner über Profil
- **Rahmen:** Rahmen um Avatar (im Shop erhältlich)

#### 2. Profil-Informationen
- **Name:** Schülername
- **Klasse:** Zugewiesene Klasse
- **Schule:** Name der Schule
- **Level:** Aktuelles Level (basierend auf T!Coins)
- **T!Coins:** Aktuelle T!Coins-Anzahl

#### 3. Projekt-Showcase
- **Featured Projects:** Schüler können Projekte auf Profil zeigen
- **Anzahl:** 3-5 Projekte können featured werden
- **Layout:** Grid oder Carousel
- **Auswahl:** Schüler wählt Projekte aus seinen veröffentlichten Projekten

#### 4. Statistiken
- **T!Coins gesamt:** Alle verdienten T!Coins
- **Projekte:** Anzahl der Projekte
- **Urkunden:** Anzahl der Urkunden
- **Achievements:** Erreichte Achievements
- **Streaks:** Aktuelle Login-Streaks

#### 5. Aktivitäts-Feed
- **Letzte Aktivitäten:** Neueste Projekte, Achievements, etc.
- **Timeline:** Chronologische Übersicht

## T!Coins-Shop

### Shop-Kategorien

#### Hintergründe
- **Standard-Hintergründe:** Verschiedene Farben/Themen
- **Premium-Hintergründe:** Spezielle Designs
- **Animierte Hintergründe:** Bewegte Hintergründe (höhere Kosten)
- **Beispiele:**
  - "Ab 10 T!Coins: Blauer Himmel Hintergrund"
  - "Ab 25 T!Coins: Coding-Thema Hintergrund"
  - "Ab 50 T!Coins: Animierter Space-Hintergrund"

#### Avatare & Rahmen
- **Avatar-Rahmen:** Verschiedene Rahmen um Avatar
- **Avatar-Backgrounds:** Hintergründe für Avatar
- **Spezielle Avatare:** Premium-Avatare
- **Beispiele:**
  - "Ab 15 T!Coins: Goldener Rahmen"
  - "Ab 30 T!Coins: Neon-Rahmen"
  - "Ab 100 T!Coins: Legendärer Rahmen"

#### Banner
- **Standard-Banner:** Verschiedene Banner-Designs
- **Premium-Banner:** Spezielle Banner
- **Custom-Banner:** Eigene Banner erstellen (höhere Kosten)
- **Beispiele:**
  - "Ab 20 T!Coins: Coding-Banner"
  - "Ab 40 T!Coins: Game-Design-Banner"

#### Badges & Icons
- **Profil-Badges:** Verschiedene Badges für Profil
- **Status-Icons:** Icons für verschiedene Status
- **Achievement-Badges:** Spezielle Badges für Achievements
- **Beispiele:**
  - "Ab 5 T!Coins: Coding-Badge"
  - "Ab 10 T!Coins: Game-Design-Badge"

#### Projekt-Showcase-Items
- **Showcase-Rahmen:** Rahmen für Featured Projects
- **Showcase-Hintergründe:** Hintergründe für Showcase
- **Showcase-Animationen:** Animationen für Showcase
- **Beispiele:**
  - "Ab 25 T!Coins: Goldener Showcase-Rahmen"
  - "Ab 50 T!Coins: Animierter Showcase"

#### Spezielle Items
- **Exklusive Items:** Nur für bestimmte Achievements verfügbar
- **Limited Edition:** Zeitlich begrenzte Items
- **Event-Items:** Items für spezielle Events
- **Beispiele:**
  - "Challenge-Gewinner: Exklusiver Hintergrund"
  - "100 Projekte: Legendärer Avatar"

### Shop-Funktionen

#### Filter & Suche
- **Kategorien:** Nach Kategorie filtern
- **Preis:** Nach Preis filtern (z.B. "Unter 20 T!Coins")
- **Verfügbarkeit:** Verfügbar vs. Bereits gekauft
- **Suche:** Nach Item-Name suchen

#### Item-Details
- **Vorschau:** Item-Vorschau im Shop
- **Preis:** T!Coins-Kosten
- **Beschreibung:** Was macht das Item?
- **Anforderungen:** Gibt es Anforderungen? (z.B. Level, Achievement)
- **Kompatibilität:** Mit welchen anderen Items kompatibel?

#### Kauf-Prozess
1. Schüler wählt Item aus
2. Item-Details werden angezeigt
3. Schüler klickt "Kaufen"
4. Bestätigungsdialog: "Möchtest du [Item] für [X] T!Coins kaufen?"
5. Bei Bestätigung: T!Coins werden abgezogen, Item wird zu Inventar hinzugefügt
6. Item kann sofort verwendet werden

## Profil-Anpassung

### Anpassungs-Interface

#### Layout
- **Drag & Drop:** Items können per Drag & Drop platziert werden
- **Live-Vorschau:** Änderungen werden sofort in Vorschau angezeigt
- **Speichern:** Änderungen müssen gespeichert werden

#### Anpassungs-Optionen
- **Hintergrund auswählen:** Aus gekauften Hintergründen wählen
- **Avatar anpassen:** Avatar und Rahmen auswählen
- **Banner auswählen:** Banner aus Shop wählen
- **Projekte featured:** Projekte für Showcase auswählen
- **Layout anpassen:** Reihenfolge der Sektionen ändern

### Inventar
- **Gekaufte Items:** Übersicht aller gekauften Items
- **Kategorien:** Items nach Kategorie gruppiert
- **Verwendung:** Welche Items sind aktuell aktiv?
- **Vorschau:** Item-Vorschau im Inventar

## Social Features

### Likes & Interaktionen
- **Profil-Likes:** Schüler können Profile liken
- **Projekt-Likes:** Schüler können Projekte auf Profilen liken
- **T!Coins für Likes:**
  - Projekt veröffentlichen: **5 T!Coins**
  - Jeder Like auf Projekt: **1 T!Coin** für Projekt-Ersteller
  - Jeder Kommentar auf Projekt: **2 T!Coins** für Projekt-Ersteller
  - Projekt remixt: **3 T!Coins** für Projekt-Ersteller
- **Like-Anzeige:** Anzahl der Likes wird angezeigt
- Siehe [[00_Blueprint/Gamification_System|Gamification System]] für vollständige T!Coins-Tabelle

### Profil-Besuche
- **Besucher-Statistik:** Wie viele Besucher hat das Profil?
- **Beliebteste Profile:** Top-Profile nach Likes/Besuchen
- **Entdecken:** Andere Profile entdecken

### Kommentare
- **Profil-Kommentare:** Schüler können Profile kommentieren
- **Projekt-Kommentare:** Kommentare auf Featured Projects
- **Moderation:** Kommentare können gemeldet werden

## Gamification

### Level-System
- **Level basierend auf T!Coins:** Höhere T!Coins = Höheres Level
- **Level-Boni:** Höhere Level = Zugang zu exklusiven Items
- **Level-Anzeige:** Level wird auf Profil angezeigt

### Achievements & Badges
- **Achievement-Badges:** Badges für erreichte Achievements
- **Badge-Anzeige:** Badges werden auf Profil angezeigt
- **Seltene Badges:** Spezielle Badges für besondere Leistungen

### Streaks
- **Login-Streaks:** Tägliche Login-Streaks
- **Streak-Anzeige:** Aktuelle Streak wird angezeigt
- **Streak-Boni:** Längere Streaks = Bonus-T!Coins

## Integration

### Projekt-Integration
- **Projekte auf Profil:** Schüler können Projekte auf Profil zeigen
- **Projekt-Links:** Direkte Links zu Projekten
- **Projekt-Statistiken:** Views, Likes, etc. werden angezeigt

### Leaderboard-Integration
- **Profil-Link:** Link zu Profil in Leaderboards
- **Ranking-Anzeige:** Ranking wird auf Profil angezeigt (optional)

### Challenge-Integration
- **Challenge-Badges:** Badges für Challenge-Teilnahmen
- **Gewinner-Badges:** Spezielle Badges für Challenge-Gewinner

## Datenschutz & Sicherheit

### Sichtbarkeits-Einstellungen
- **Öffentlich:** Profil ist für alle sichtbar
- **Nur Klasse:** Profil ist nur für Klassenmitglieder sichtbar
- **Privat:** Profil ist nur für Freunde sichtbar (optional)

### Moderation
- **Inhalte-Moderation:** Profile werden moderiert
- **Meldung:** Schüler können Profile melden
- **Sperrung:** Profile können gesperrt werden

## Statistiken & Analytics

### Profil-Statistiken
- **Besucher:** Anzahl der Profil-Besuche
- **Likes:** Anzahl der Profil-Likes
- **Kommentare:** Anzahl der Kommentare
- **Featured Projects Views:** Views der Featured Projects

### Shop-Statistiken
- **Beliebteste Items:** Meist gekaufte Items
- **Ausgaben:** Wie viele T!Coins wurden ausgegeben?
- **Inventar-Wert:** Gesamtwert aller gekauften Items

> [!tip] Implementation Hint
> - Implementiere Caching für Profil-Daten
> - Verwende CDN für Item-Bilder
> - Implementiere Inventar-System für gekaufte Items
> - Verwende Template-System für Profil-Layout
> - Implementiere Moderation-Tools für Profile
