---
title: Project Publishing - Projekt veröffentlichen
description: User Journey für das Veröffentlichen von Scratch-Projekten
enableToc: true
tags:
  - features
  - student
---

# 🚀 Project Publishing - Projekt veröffentlichen

> [!abstract] User Story
> Als Schüler möchte ich meine entwickelten Projekte veröffentlichen, damit andere sie sehen, spielen und bewerten können.

## Verwandte Features

- **Projekt-Entwicklung:** [[01_Features/Dashboard/Student/Project_Development|Project Development]] - Projekte entwickeln vor Veröffentlichung
- **Scratch-Integration:** [[01_Features/Scratch/Integration|Scratch Integration]] - Veröffentlichung direkt aus dem Editor
- **Projekt-Review:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Lehrer-Approval-Prozess
- **Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Automatische Challenge-Einreichung nach Veröffentlichung
- **Projekt-Anzeige:** [[01_Features/Projects/Project_Display|Project Display]] - Wo veröffentlichte Projekte angezeigt werden

## Data Models

- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell mit Status und Veröffentlichung
- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell für automatische Einreichung

## User Flow: Projekt veröffentlichen

### Zwei Wege zur Veröffentlichung

#### Weg 1: Direkt aus dem Editor
```
Editor → "Veröffentlichen" Button → Veröffentlichungs-Dialog → Veröffentlichung eingereicht
```

#### Weg 2: Vom Dashboard
```
Dashboard → "Meine Projekte" → Projekt auswählen → "Veröffentlichen" Button → Veröffentlichungs-Dialog → Veröffentlichung eingereicht
```

### 1. Veröffentlichungs-Dialog öffnen
- **Zugriff:**
  - Direkt aus dem Editor: "Veröffentlichen" Button
  - Vom Dashboard: Projekt auswählen → "Veröffentlichen" Button
- **Voraussetzung:**
  - Projekt muss als "In Bearbeitung" existieren
  - Projekt sollte funktionsfähig sein (empfohlen)

### 2. Projekt-Informationen vervollständigen
- **Pflichtfelder:**
  - Projektname (kann bearbeitet werden)
  - Beschreibung: Was macht das Projekt? (min. 20 Zeichen empfohlen)
- **Optionale Felder:**
  - Tags/Kategorien: Für bessere Auffindbarkeit
  - Anleitung: Wie spielt man das Projekt?
  - Credits: Danksagungen oder Inspirationen
  - Thumbnail: Vorschaubild (automatisch generiert oder hochgeladen)

### 3. Sichtbarkeits-Einstellungen
- **Öffentlich:**
  - Projekt ist für alle sichtbar
  - Erscheint in Projekt-Galerie
  - Kann von anderen gespielt, kommentiert und bewertet werden
- **Nur Klasse:**
  - Projekt ist nur für Klassenmitglieder sichtbar
  - Lehrer kann es sehen

### 4. Veröffentlichungs-Checkliste
- **Automatische Prüfung:**
  - Projekt ist funktionsfähig
  - Keine offensichtlichen Fehler
  - Projektname ist angemessen
- **Manuelle Bestätigung:**
  - Schüler bestätigt, dass Projekt fertig ist
  - Akzeptiert Nutzungsbedingungen

### 5. Veröffentlichung einreichen
- **Veröffentlichungs-Button:**
  - "Zur Veröffentlichung einreichen" klicken
  - Bestätigungsdialog
- **Status-Änderung:**
  - Projekt wird als **"Zur Veröffentlichung eingereicht"** markiert
  - Status: "Wartet auf Lehrer-Approval"
  - Schüler kann Projekt weiter bearbeiten, aber **nicht erneut einreichen**, bis Approval erfolgt
  - **Hinweis:** Siehe [[01_Features/GLOSSARY|Glossar]] für Status-Definitionen

### 6. Lehrer-Approval-Prozess
- **Lehrer prüft Projekt:**
  - Lehrer sieht eingereichtes Projekt in seinem Dashboard (Status: "Zur Veröffentlichung eingereicht")
  - Lehrer kann Projekt ansehen, testen und bewerten
  - Lehrer kann Feedback geben (siehe [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]])
- **Mögliche Entscheidungen:**
  - **Genehmigt:** Projekt wird **veröffentlicht** (Status: "Veröffentlicht")
  - **Abgelehnt mit Feedback:** Projekt wird **nicht veröffentlicht**, Status bleibt "In Bearbeitung", Schüler erhält Feedback
  - **Änderungen erforderlich:** Projekt wird **zurückgegeben** (Status: "In Bearbeitung"), Schüler kann nach Änderungen erneut einreichen

### 7. Veröffentlichungs-Bestätigung
- **Bei Genehmigung:**
  - Projekt wird auf Server hochgeladen
  - Thumbnail wird generiert
  - Projekt wird in Datenbank als **"Veröffentlicht"** markiert (Status: "Veröffentlicht")
  - Indexierung für Suche
  - Schüler wird benachrichtigt
  - **Automatische Challenge-Prüfung:**
    - System prüft automatisch, ob Projekt Challenge-Kriterien erfüllt
    - Wenn Kriterien erfüllt UND kein Opt-Out aktiv: Projekt wird automatisch für passende Challenges eingereicht
    - Schüler wird über automatische Einreichung benachrichtigt
    - **Siehe:** [[01_Features/Dashboard/Student/Challenges|Challenges]] für Details zur automatischen Einreichung
- **Erfolgs-Meldung:**
  - "Projekt erfolgreich veröffentlicht!"
  - Link zum veröffentlichten Projekt
  - Lehrer-Feedback wird angezeigt (falls vorhanden)
  - Optionen: Teilen, Bearbeiten, Zurück zum Dashboard
- **Belohnungen:**
  - **5 T!Coins** für Projekt-Veröffentlichung (siehe [[00_Blueprint/Gamification_System|Gamification System]] für vollständige T!Coins-Tabelle)
  - Achievement-Badge (z.B. "Erstes Projekt veröffentlicht")
  - Optional: Urkunde für besondere Projekte

### 8. Feedback-System
- **Lehrer-Feedback:**
  - Lehrer kann bei Approval/Abgelehnung Feedback geben
  - Feedback ist für Schüler sichtbar
- **Feedback anzeigen:**
  - In Projekt-Detailansicht: "Lehrer-Feedback" Sektion
  - In Dashboard: Benachrichtigung über neues Feedback
  - Feedback bleibt dauerhaft sichtbar für Schüler
- **Feedback-Inhalt:**
  - Konstruktive Kritik
  - Verbesserungsvorschläge
  - Positive Aspekte
  - Bewertung (optional)

## Veröffentlichtes Projekt

### Projekt-Seite
- **Anzeige:**
  - Projekt-Thumbnail
  - Projektname und Beschreibung
  - Autor-Informationen (Schülername, Klasse)
  - Veröffentlichungsdatum
- **Interaktion:**
  - "Spielen" Button: Projekt im Player öffnen
  - "Code ansehen" Button: Scratch-Code einsehen (wenn erlaubt)
  - "Remix" Button: Projekt als Vorlage verwenden
  - "Teilen" Button: Link kopieren oder in sozialen Medien teilen

### Projekt-Galerie
- **Anzeige:**
  - Öffentliche Projekte werden auf der Plattform gesammelt und in der Galerie angezeigt
  - Filter: Nach Kategorie, Klasse, Schule, Datum
  - Sortierung: Neueste, Beliebteste, Meiste Likes
- **Entdeckung:**
  - Featured Projects (hervorgehobene Projekte)
  - Projekte der Woche
  - Top-Projekte der Schule/Klasse

## Projekt-Interaktionen

### Bewertungen & Feedback
- **Likes/Herzen:**
  - Andere Schüler können Projekt liken
  - Anzahl der Likes wird angezeigt
- **Kommentare:**
  - Kommentare können hinterlassen werden
  - Moderation durch Lehrer (optional)
  - Antworten auf Kommentare möglich
- **Bewertungen:**
  - Sterne-Bewertung (1-5 Sterne)
  - Durchschnittsbewertung wird angezeigt

### Projekt teilen
- **Teilen-Optionen:**
  - Link kopieren
  - QR-Code generieren
  - Teilen in sozialen Medien (wenn erlaubt)
  - Einbetten in andere Websites (optional)

## Projekt-Verwaltung nach Veröffentlichung

### Projekt bearbeiten
- **Wichtig:** Veröffentlichte Projekte können **nicht direkt bearbeitet** werden
- **Bearbeitung nur nach Zurückziehen:**
  - Projekt muss zuerst zurückgezogen werden (siehe "Projekt zurückziehen")
  - Nach Zurückziehen: Projekt wird auf **"In Bearbeitung"** gesetzt
  - Änderungen können vorgenommen werden
  - **Achtung:** Alle Likes, Kommentare und Statistiken gehen beim Zurückziehen **verloren**
  - Alle T!Coins, die durch Likes/Kommentare verdient wurden, werden **abgezogen**
- **Erneut veröffentlichen:**
  - Nach Änderungen muss Projekt erneut zur Veröffentlichung eingereicht werden
  - Lehrer muss erneut approven
  - **Achtung:** Alle vorherigen Likes, Kommentare und Statistiken sind **dauerhaft verloren**

### Projekt kopieren
- **Duplizieren:**
  - Veröffentlichtes Projekt kann kopiert werden
  - Kopie wird als neues Projekt mit Status "In Bearbeitung" erstellt
  - Kopie hat keine Likes, Kommentare oder Statistiken
  - Nützlich für Varianten oder als Ausgangspunkt für neue Projekte

### Projekt zurückziehen
- **Zurückziehen:**
  - Veröffentlichtes Projekt kann zurückgezogen werden
  - Projekt wird auf **"In Bearbeitung"** gesetzt
  - Wird aus Galerie entfernt
  - **Achtung - Folgen des Zurückziehens:** 
    - Alle Likes, Kommentare und Statistiken gehen **dauerhaft verloren**
    - Alle T!Coins, die durch Likes/Kommentare verdient wurden, werden **abgezogen**
    - Bestehende Links funktionieren **nicht mehr**
    - Wenn Projekt für Challenge eingereicht war: **Einreichung wird zurückgezogen**
    - **Diese Aktion kann nicht rückgängig gemacht werden**
- **Erneut veröffentlichen nach Zurückziehen:**
  - Projekt kann bearbeitet werden
  - Nach Änderungen muss Projekt erneut zur Veröffentlichung eingereicht werden
  - Lehrer muss erneut approven
  - **Hinweis:** Alle vorherigen Likes, Kommentare und Statistiken sind weg

### Projekt löschen
- **Löschen:**
  - Projekt kann komplett gelöscht werden
  - Bestätigungsdialog erforderlich
  - Warnung: Aktion kann nicht rückgängig gemacht werden
  - Alle Daten (Likes, Kommentare, Statistiken) werden gelöscht

## Statistiken & Analytics

### Projekt-Statistiken
- **Views:** Wie oft wurde Projekt angesehen
- **Spiele:** Wie oft wurde Projekt gespielt
- **Likes:** Anzahl der Likes
- **Kommentare:** Anzahl der Kommentare
- **Bewertungen:** Durchschnittsbewertung und Anzahl
- **Remixes:** Wie oft wurde Projekt remixt

### Persönliche Projekt-Statistik
- **Gesamt:** Anzahl veröffentlichter Projekte
- **Beliebtestes Projekt:** Projekt mit meisten Views/Likes
- **Gesamt-Views:** Summe aller Projekt-Views
- **Gesamt-Likes:** Summe aller Likes

## Belohnungen & Gamification

### T!Coins
- **Veröffentlichung:** **5 T!Coins** für jedes veröffentlichte Projekt
- **Interaktionen:** 
  - **1 T!Coin** pro Like auf Projekt (für Projekt-Ersteller)
  - **2 T!Coins** pro Kommentar auf Projekt (für Projekt-Ersteller)
  - **3 T!Coins** wenn Projekt remixt wird
- Siehe [[00_Blueprint/Gamification_System|Gamification System]] für vollständige T!Coins-Tabelle

### Achievements
- **Erstes Projekt:** Badge für erstes veröffentlichtes Projekt
- **Beliebtes Projekt:** Badge für Projekt mit X Likes
- **Viral:** Badge für Projekt mit vielen Views
- **Kreativ:** Badge für besonders kreative Projekte

### Urkunden
- **Besondere Projekte:** Urkunde für herausragende Projekte
- **Projekt-Serie:** Urkunde für mehrere erfolgreiche Projekte

> [!tip] Implementation Hint
> - Implementiere Content-Moderation für veröffentlichte Projekte
> - Verwende CDN für schnelle Projekt-Ladung
> - Implementiere Analytics-Tracking für Projekt-Statistiken
> - Speichere Projekt-Metadaten separat für schnelle Suche

