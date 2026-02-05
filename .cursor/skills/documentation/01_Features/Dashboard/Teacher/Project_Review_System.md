---
title: Project Review System - Projektprüfungs-System
description: Detailliertes Interface für Projektprüfung durch Lehrer
enableToc: true
tags:
  - features
  - teacher
  - project-review
---

# 🔍 Project Review System - Projektprüfungs-System

> [!abstract] User Story
> Als Lehrer möchte ich Projekte meiner Schüler strukturiert prüfen und schnell Feedback mit Vorlagen geben können.

## Verwandte Features

- **Project Management:** [[01_Features/Dashboard/Teacher/Project_Management|Project Management]] - Projektverwaltung und Zugriff
- **Student Project Publishing:** [[01_Features/Dashboard/Student/Project_Publishing|Project Publishing]] - Veröffentlichungs-Workflow der Schüler
- **Challenges:** [[01_Features/Dashboard/Student/Challenges|Challenges]] - Opt-Out für automatische Challenge-Einreichung
- **Messaging:** [[01_Features/Dashboard/Messaging_System|Messaging System]] - Feedback an Schüler senden

## Data Models

- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell mit Review-Status
- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell für Opt-Out

## Projektprüfungs-Interface

### Layout

Das Projektprüfungs-Interface ist in zwei Hauptspalten aufgeteilt:

#### Linke Spalte: Projekt-Details

##### Header
- **Titel:** "Projektprüfung"
- Projekt-Informationen werden angezeigt

##### Projektbild-Sektion
- **Projekt-Vorschau:**
  - Großes Vorschau-Bild des Projekts
  - Play-Button Overlay zum Testen
  - Projekt-Thumbnail wird angezeigt
- **Toggle:** "Projektbild akzeptiert"
  - Ein/Aus-Schalter
  - Grün = Akzeptiert
  - Rot = Nicht akzeptiert

##### Projekttitel-Sektion
- **Label:** "Projekttitel oder dein Spielname"
- **Hinweis:** "(25 Zeichen Beschränkung)"
- **Eingabefeld:** Projekttitel wird angezeigt (z.B. "Corona Game")
- **Toggle:** "Projekttitel akzeptiert"
  - Ein/Aus-Schalter
  - Grün = Akzeptiert

##### Kurzbeschreibung-Sektion
- **Label:** "Kurzbeschreibung"
- **Hinweis:** "(400 Zeichen Beschränkung)"
- **Textarea:** Mehrzeiliges Textfeld mit Beschreibung
- **Zeichenzähler:** "258 / 400 Zeichen" (dynamisch)
- **Toggle:** "Kurzbeschreibung akzeptiert"
  - Ein/Aus-Schalter
  - Grün = Akzeptiert

##### Link-Sektion
- **Button:** "Link prüfen" (mit Kettensymbol)
  - Öffnet Projekt-Link in neuem Tab
  - Validiert Link-Funktionalität
- **Toggle:** "Projektlink akzeptiert"
  - Ein/Aus-Schalter
  - Grün = Akzeptiert

#### Rechte Spalte: Feedback & Wettbewerbsauswahl

##### Header
- **Titel:** "Feedback & Wettbewerbsauswahl"
- **Schließen-Button:** "X" Icon zum Schließen

##### Wettbewerbsauswahl
- **Checkbox:** "Projekt soll nicht zu allen verfügbaren Wettbewerben eingereicht werden"
  - Opt-Out für automatische Challenge-Einreichung
  - Wenn aktiviert: Projekt wird nicht automatisch eingereicht

##### Feedback-Sektion

###### Feedback-Vorlagen-Blöcke
- **Info-Icon:** Blaues Info-Icon mit Erklärung
- **Text:** "Wähle eine Vorlage aus, um schnell ein Feedback zu erstellen."
- **Zweck:** Schnelle Feedback-Erstellung durch vorgefertigte Blöcke

###### Positive Rückmeldungen
- **Sektion-Titel:** "Positive Rückmeldungen"
- **Vorlagen-Buttons (grüner Rahmen):**
  - "Tolles Projektbild!" 🖼️
  - "Guter Titel!" ✨
  - "Kreative Story!" 📖
  - "Spielmechanik überzeugt!" 🎮
  - "Tolle Charaktere!" 👥
  - "Tolle Soundeffekte!" 🔊
  - "Spannung steigt!" ⚡
  - "Richtig cool!" 🔥
- **Funktion:** Klick auf Button fügt Text zum Feedback hinzu

###### Verbesserungsvorschläge
- **Sektion-Titel:** "Verbesserungsvorschläge"
- **Vorlagen-Buttons (roter Rahmen):**
  - "Schwierigkeitsgrad anpassen" 📊
  - "Highscore-System" 🏆
  - "Größe anpassen" 📏
  - "Welcome Screen" 🎬
  - "Game Over Screen" 💀
  - "Highscore Feedback" 📈
- **Funktion:** Klick auf Button fügt Verbesserungsvorschlag hinzu

###### Freies Text-Feedback
- **Label:** "Ihr Feedback an Schüler:in"
- **Hinweis:** "(400 Zeichen Beschränkung)"
- **Textarea:** Mehrzeiliges Textfeld für freies Feedback
- **Zeichenzähler:** "6 / 400 Zeichen" (dynamisch)
- **Funktion:** Kombiniert Vorlagen-Buttons mit freiem Text

##### Aktions-Buttons (unten, über beide Spalten)

- **"Akzeptieren" Button (blau, prominent):**
  - Projekt wird akzeptiert und **veröffentlicht**
  - **Hard-Requirement:** Alle Toggles müssen grün sein
  - Wenn nicht alle Toggles grün: Button ist **deaktiviert/gesperrt**
  - Lehrer kann nur ablehnen/zurückziehen oder Feedback schicken, aber **nicht akzeptieren**
  - Feedback wird an Schüler gesendet
- **"Zurückziehen" Button (weiß):**
  - Projekt wird zurückgezogen
  - Status ändert sich zu **"In Bearbeitung"**
  - Schüler kann Projekt überarbeiten
  - Lehrer kann Feedback schicken, auch wenn nicht alle Toggles grün sind
  - **Hinweis:** Siehe [[01_Features/GLOSSARY|Glossar]] für Status-Definitionen

## Workflow

### 1. Projektprüfung starten
- Lehrer klickt auf "Prüfen" bei einem Projekt
- Projektprüfungs-Interface öffnet sich
- Alle Projekt-Details werden geladen

### 2. Projekt-Komponenten prüfen
- **Projektbild:** Vorschau ansehen, Toggle setzen
- **Projekttitel:** Titel prüfen, Toggle setzen
- **Kurzbeschreibung:** Beschreibung lesen, Toggle setzen
- **Link:** Link testen, Toggle setzen

### 3. Feedback erstellen
- **Option A: Vorlagen verwenden**
  - Positive Rückmeldungen auswählen
  - Verbesserungsvorschläge auswählen
  - Buttons klicken → Text wird hinzugefügt
- **Option B: Freies Feedback**
  - Direkt in Textarea schreiben
- **Option C: Kombiniert**
  - Vorlagen + freies Feedback kombinieren

### 4. Challenge-Einreichung (Opt-Out)
- **Checkbox:** "Projekt soll nicht zu allen verfügbaren Wettbewerben eingereicht werden"
- **Standard-Verhalten:** Projekt wird automatisch für passende Challenges eingereicht (wenn Kriterien erfüllt)
- **Opt-Out aktivieren:** Wenn Checkbox gesetzt ist, wird Projekt **nicht automatisch** eingereicht
- **Manuelle Einreichung:** Lehrer kann Projekt weiterhin manuell für Challenges einreichen
- **Siehe:** [[01_Features/Dashboard/Student/Challenges|Challenges]] für Details zur automatischen Einreichung

### 5. Projekt akzeptieren/zurückziehen
- **Akzeptieren:**
  - **Hard-Requirement:** Alle Toggles müssen grün sein
  - Wenn nicht alle Toggles grün: "Akzeptieren" Button ist deaktiviert/gesperrt
  - Lehrer kann nur ablehnen/zurückziehen oder Feedback schicken
  - Wenn alle Toggles grün: Feedback wird gespeichert, Projekt wird veröffentlicht, Schüler wird benachrichtigt
- **Zurückziehen:**
  - Immer möglich, auch wenn nicht alle Toggles grün sind
  - Projekt wird zurückgegeben
  - Feedback bleibt erhalten
  - Schüler kann Projekt überarbeiten

## Feedback-Vorlagen-System

### Kategorien

#### Positive Rückmeldungen
- Projektbild
- Titel
- Story/Kreativität
- Spielmechanik
- Charaktere
- Soundeffekte
- Spannung/Engagement
- Allgemeine Anerkennung

#### Verbesserungsvorschläge
- Schwierigkeitsgrad
- Highscore-System
- Größe/Design
- Welcome Screen
- Game Over Screen
- Feedback-Systeme
- Weitere technische Verbesserungen

### Erweiterte Features

#### Vorlagen anpassen
- Lehrer kann eigene Vorlagen erstellen
- Vorlagen können pro Klasse/Kurs gespeichert werden
- Häufig verwendete Vorlagen werden vorgeschlagen

#### Feedback-Historie
- Alle Feedback-Versionen werden gespeichert
- Schüler sieht Feedback-Verlauf
- Vergleich zwischen verschiedenen Feedback-Runden

## Integration

### Benachrichtigungen
- Schüler wird benachrichtigt, wenn Feedback verfügbar ist
- Benachrichtigung in Benachrichtigungszentrale
- E-Mail-Benachrichtigung (optional)

### Statistiken
- Feedback-Statistiken für Lehrer
- Durchschnittliche Feedback-Zeit
- Häufigste Verbesserungsvorschläge
- Positive vs. negative Feedback-Ratio

### Export
- Feedback kann als PDF exportiert werden
- Feedback-Report für Schüler
- Feedback-Übersicht für Klasse

> [!tip] Implementation Hint
> - Implementiere Drag & Drop für Feedback-Vorlagen
> - Speichere Feedback-Vorlagen in Datenbank
> - Verwende Rich Text Editor für Formatierung
> - Implementiere Auto-Save für Feedback-Text
