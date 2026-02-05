---
title: Certificate Management - Urkunden-Verwaltung
description: Urkunden-Erstellung und -Verwaltung durch Admin
enableToc: true
tags:
  - features
  - admin
  - certificates
---

# 🏆 Certificate Management - Urkunden-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich Urkunden erstellen, verwalten und automatisch oder manuell an Schüler vergeben können.

## Übersicht

Das Urkunden-System ermöglicht es Admins, Zertifikate und Urkunden zu erstellen, zu verwalten und an Schüler zu vergeben. Urkunden können automatisch (bei Kursabschluss, Challenge-Gewinn) oder manuell vergeben werden.

## Verwandte Features

- **Student Certificates:** [[01_Features/Dashboard/Student/Certificates|Certificates]] - Urkunden-Anzeige für Schüler
- **Course Management:** [[01_Features/Dashboard/Admin/Course_Management|Course Management]] - Kursabschluss-Urkunden
- **Challenge Management:** [[01_Features/Dashboard/Admin/Challenge_Management|Challenge Management]] - Challenge-Gewinner-Urkunden
- **Teacher Certificate Management:** [[01_Features/Dashboard/Teacher/Certificate_Management|Teacher Certificate Management]] - Urkunden-Verwaltung durch Lehrer

## Data Models

- **Certificate Model:** [[03_Data_Models/Certificate|Certificate Model]] - Urkunden-Datenmodell
- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell
- **Challenge Model:** [[03_Data_Models/Challenge|Challenge Model]] - Challenge-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell

## Urkunden-Typen

### Automatische Urkunden
- **Kursabschluss-Urkunden:** Automatisch bei Kursabschluss
- **Challenge-Gewinner-Urkunden:** Automatisch bei Challenge-Gewinn
- **Meilenstein-Urkunden:** Automatisch bei bestimmten Meilensteinen (z.B. 10 Projekte)

### Manuelle Urkunden
- **Besondere Leistungen:** Manuell durch Admin oder Lehrer
- **Sonderpreise:** Für außergewöhnliche Leistungen
- **Teilnahme-Urkunden:** Für Teilnahme an Events

## Urkunde erstellen

### Basis-Informationen
- **Titel:** Urkunden-Name (z.B. "Kursabschluss-Urkunde: Scratch Grundlagen")
- **Beschreibung:** Urkunden-Beschreibung
- **Typ:** Automatisch oder Manuell
- **Kurs:** Zu welchem Kurs gehört die Urkunde? (optional)
- **Challenge:** Zu welcher Challenge gehört die Urkunde? (optional)

### Urkunden-Design
- **Template:** Urkunden-Template auswählen
- **Anpassung:** Logo, Farben, Layout anpassen
- **Felder:** Welche Informationen werden angezeigt?
  - Schülername
  - Kursname
  - Datum
  - Unterschrift (optional)
- **Vorschau:** Urkunden-Vorschau anzeigen

### Vergabe-Logik (für automatische Urkunden)
- **Trigger:** Wann wird Urkunde vergeben?
  - Kursabschluss
  - Challenge-Gewinn
  - Meilenstein erreicht
- **Bedingungen:** Welche Bedingungen müssen erfüllt sein?
  - Mindest-Score
  - Alle Lektionen abgeschlossen
  - Projekt veröffentlicht

## Urkunden-Verwaltung

### Urkunden-Liste
- **Alle Urkunden:** Übersicht aller erstellten Urkunden
- **Filter:** Nach Typ, Kurs, Challenge
- **Sortierung:** Nach Datum, Titel, Anzahl Vergeben

### Urkunde bearbeiten
- **Design:** Urkunden-Design anpassen
- **Vergabe-Logik:** Automatische Vergabe-Logik ändern
- **Urkunde löschen:** Urkunde entfernen (mit Bestätigung)

### Urkunden-Statistiken
- **Anzahl vergeben:** Wie oft wurde Urkunde vergeben?
- **Anzahl Schüler:** Wie viele Schüler haben Urkunde erhalten?
- **Durchschnitt:** Durchschnittliche Anzahl Urkunden pro Schüler

## Automatische Vergabe

### Kursabschluss-Urkunden
- **Trigger:** Schüler schließt Kurs ab
- **Bedingungen:** Alle Lektionen abgeschlossen, Quiz bestanden
- **Automatisch:** Urkunde wird automatisch vergeben

### Challenge-Gewinner-Urkunden
- **Trigger:** Schüler gewinnt Challenge
- **Bedingungen:** Top 3 oder spezifische Platzierung
- **Automatisch:** Urkunde wird automatisch vergeben

### Meilenstein-Urkunden
- **Trigger:** Schüler erreicht Meilenstein
- **Beispiele:**
  - 10 Projekte veröffentlicht
  - 1000 T!Coins erreicht
  - 5 Challenges gewonnen
- **Automatisch:** Urkunde wird automatisch vergeben

## Manuelle Vergabe

### Durch Admin
- **Schüler auswählen:** Schüler aus Liste auswählen
- **Urkunde auswählen:** Urkunde aus Liste auswählen
- **Vergeben:** Urkunde manuell vergeben
- **Grund:** Optional: Grund für manuelle Vergabe

### Durch Lehrer
- **Eingeschränkt:** Lehrer können nur bestimmte Urkunden vergeben
- **Genehmigung:** Manche Urkunden benötigen Admin-Genehmigung
- **Siehe:** [[01_Features/Dashboard/Teacher/Certificate_Management|Teacher Certificate Management]]

## PDF-Generierung

### Automatische Generierung
- **Bei Vergabe:** PDF wird automatisch generiert
- **Format:** PDF mit hoher Qualität
- **Speicherung:** PDF wird gespeichert (optional)

### PDF-Download
- **Für Schüler:** Schüler können PDF herunterladen
- **Für Lehrer:** Lehrer können PDF für Schüler herunterladen
- **Für Admin:** Admin kann alle PDFs herunterladen

## Urkunden-Anzeige

### Für Schüler
- **Meine Urkunden:** Übersicht aller erhaltenen Urkunden
- **PDF-Download:** PDF herunterladen
- **Teilen:** Urkunde teilen (optional)
- **Siehe:** [[01_Features/Dashboard/Student/Certificates|Certificates]]

### Für Lehrer
- **Schüler-Urkunden:** Urkunden der Schüler anzeigen
- **PDF-Download:** PDF für Schüler herunterladen
- **Statistiken:** Urkunden-Statistiken pro Klasse

## Urkunden-Templates

### Standard-Templates
- **Kursabschluss:** Standard-Template für Kursabschluss
- **Challenge-Gewinner:** Standard-Template für Challenge-Gewinner
- **Meilenstein:** Standard-Template für Meilensteine

### Custom Templates
- **Erstellen:** Admin kann eigene Templates erstellen
- **Anpassung:** Logo, Farben, Layout
- **Wiederverwendung:** Templates können für mehrere Urkunden verwendet werden

## Integration

### Mit Kursen
- **Kursabschluss:** Automatische Urkunde bei Kursabschluss
- **Kurs-Statistiken:** Urkunden in Kurs-Statistiken

### Mit Challenges
- **Challenge-Gewinner:** Automatische Urkunde für Gewinner
- **Challenge-Statistiken:** Urkunden in Challenge-Statistiken

### Mit Gamification
- **T!Coins:** Optional: T!Coins-Belohnung bei Urkunden-Erhalt
- **Achievements:** Urkunden als Achievements

> [!tip] Implementation Hint
> - Urkunden sollten als PDF generiert werden
> - Verwende Template-Engine für Urkunden-Design
> - Implementiere automatische Vergabe-Logik
> - Speichere PDFs für spätere Downloads
