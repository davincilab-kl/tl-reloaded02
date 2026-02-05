---
title: Glossar - Begriffe und Definitionen
description: Standardisierte Begriffe und Definitionen für die Plattform
enableToc: true
tags:
  - glossary
  - definitions
  - standards
---

# 📖 Glossar - Begriffe und Definitionen

> [!abstract] Zweck
> Dieses Glossar definiert alle wichtigen Begriffe und Terminologie für die Plattform, um Konsistenz in der Dokumentation sicherzustellen.

## Projekt-Status

### Standardisierte Projekt-Status (Frontend/UI)
Die folgenden Status werden in der Benutzeroberfläche verwendet:

1. **"In Bearbeitung"**
   - Projekt wird aktuell entwickelt
   - Nicht öffentlich sichtbar
   - Kann jederzeit bearbeitet werden
   - **Backend-Status:** `draft`

2. **"Zur Veröffentlichung eingereicht"**
   - Projekt wurde zur Veröffentlichung eingereicht
   - Wartet auf Lehrer-Approval
   - Kann weiter bearbeitet werden, aber nicht erneut eingereicht bis Approval
   - **Backend-Status:** `submitted_for_review`

3. **"Veröffentlicht"**
   - Projekt wurde von Lehrer genehmigt und ist öffentlich sichtbar
   - Erscheint in Projekt-Galerie (wenn Sichtbarkeit "Öffentlich")
   - Kann nicht direkt bearbeitet werden (nur nach Zurückziehen)
   - **Backend-Status:** `published`

4. **"Archiviert"** (optional)
   - Projekt wurde archiviert
   - Nicht mehr öffentlich sichtbar
   - **Backend-Status:** `archived`

### Challenge-Einreichungs-Status
- **"Eingereicht"** - Projekt wurde für Challenge eingereicht (automatisch oder manuell)
- **"In Bearbeitung"** - Projekt wird für Challenge entwickelt
- **"Abgeschlossen"** - Challenge-Teilnahme abgeschlossen

## Terminologie

### Challenges vs. Wettbewerbe
- **Primärer Begriff:** "Challenge" (Englisch)
- **Alternativer Begriff:** "Wettbewerb" (Deutsch) - kann verwendet werden, aber "Challenge" ist bevorzugt
- **Konsistenz:** In technischer Dokumentation: "Challenge", in User-facing Texten: "Challenge" oder "Wettbewerb" (konsistent pro Kontext)

### Lehrer vs. Lehrkraft
- **Primärer Begriff:** "Lehrer" (inkl. "Lehrerin")
- **Alternativer Begriff:** "Lehrkraft" - kann verwendet werden, aber "Lehrer" ist bevorzugt
- **Konsistenz:** In User Stories und UI-Texten: "Lehrer", in technischer Dokumentation: "Lehrer" oder "Teacher"

### Projekt vs. Scratch-Projekt
- **Primärer Begriff:** "Projekt"
- **Spezifisch:** "Scratch-Projekt" nur wenn es wichtig ist zu betonen, dass es ein Scratch-Projekt ist
- **Konsistenz:** Meist einfach "Projekt" verwenden

## Gamification-Begriffe

### T!Coins
- **Definition:** Virtuelle Währung für Engagement und Aktivitäten
- **Schreibweise:** Immer "T!Coins" (großes T, Ausrufezeichen, großes C)
- **Zweck:** 
  - Belohnung für Aktivitäten (Lektionen, Projekte, Challenges)
  - Verwendung im T!Coins-Shop für Profil-Items
- **Berechnung:** 
  - **Gesammelte T!Coins:** Alle verdienten T!Coins (für T!Score-Berechnung)
  - **Verfügbare T!Coins:** Gesammelte T!Coins - Shop-Ausgaben

### T!Score
- **Definition:** Durchschnittlicher Score für Klassen oder Schulen
- **Schreibweise:** Immer "T!Score" (großes T, Ausrufezeichen, großes S)
- **Berechnung:** 
  - **Klassen-T!Score:** Summe aller T!Coins der Klasse ÷ Anzahl Schüler (aktuelles Schuljahr)
  - **Schul-T!Score:** Summe aller T!Coins der Schule ÷ Anzahl Schüler (aktuelles Schuljahr)
- **Wichtig:** T!Score basiert auf **gesammelten T!Coins**, nicht auf verfügbaren T!Coins (Shop-Ausgaben beeinflussen T!Score nicht)

## Rollen

### Schüler/Schülerin (Student)
- **Definition:** Benutzer mit eingeschränkten Rechten
- **Anmeldung:** Mit persönlichem Schülerpasswort
- **Verwaltung:** Werden von Lehrern erstellt und verwaltet

### Lehrer/Lehrerin (Teacher)
- **Definition:** Benutzer mit erweiterten Rechten für Klassen- und Projektverwaltung
- **Anmeldung:** Mit E-Mail/Username und Passwort
- **Berechtigungen:** Kann Schüler verwalten, Projekte prüfen, Challenges verwalten

### Admin (Administrator)
- **Definition:** Benutzer mit vollständigen administrativen Rechten
- **Anmeldung:** Verwendet normales Teacher-Login-Formular
- **Berechtigungen:** Vollzugriff auf Plattform-Verwaltung

## Sichtbarkeits-Einstellungen

### Öffentlich
- Projekt ist für alle sichtbar
- Erscheint in Projekt-Galerie
- Kann von anderen gespielt, kommentiert und bewertet werden

### Nur Klasse
- Projekt ist nur für Klassenmitglieder sichtbar
- Lehrer kann es sehen
- Nicht in öffentlicher Galerie

### Privat (optional)
- Projekt ist nur für den Ersteller sichtbar
- Nicht in Galerie

## Challenge-Organisatoren

### Förderer
- Externe Partner/Sponsoren (z.B. Mastercard, Amazon, Wiener Netze)
- Organisieren Challenges mit spezifischen Themen

### Bundesland
- Regionale Wettbewerbe (z.B. Niederösterreich, Wien)
- Nur für Schulen aus bestimmten Bundesländern

### Plattform
- Von der Plattform organisierte Challenges
- Für alle Schulen verfügbar

## Technische Begriffe

### Scratch-Integration
- **Editor:** Angepasster Scratch-GUI Fork für Projekt-Entwicklung
- **Player:** Scratch-VM für Projekt-Wiedergabe
- **Format:** Scratch 3.0 Format (.sb3 JSON)

### Auto-Save
- Automatisches Speichern von Projekten
- Standard-Intervall: 30 Sekunden
- Kann manuell deaktiviert werden

### Versionshistorie
- Automatische Speicherung von Projekt-Versionen
- Zugriff auf frühere Versionen
- Möglichkeit zur Wiederherstellung

## Abkürzungen

- **T!Coins:** Talents Coins (virtuelle Währung)
- **T!Score:** Talents Score (Durchschnitts-Score)
- **API:** Application Programming Interface
- **UI:** User Interface
- **UX:** User Experience
- **CDN:** Content Delivery Network
- **JWT:** JSON Web Token

> [!tip] Verwendung
> Dieses Glossar sollte als Referenz für alle Dokumentation verwendet werden. Bei Unklarheiten sollte dieses Glossar konsultiert werden.
