---
title: Admin Statistics & Exports - Statistiken & Exports
description: Gesamt-Statistiken und Exports für Admin
enableToc: true
tags:
  - features
  - admin
  - statistics
---

# 📊 Admin Statistics & Exports - Statistiken & Exports

> [!abstract] User Story
> Als Admin möchte ich Gesamt-Statistiken einsehen und Daten exportieren.

## Verwandte Features

- **Teacher Stats:** [[01_Features/Dashboard/Teacher/Stats|Teacher Stats]] - Lehrer-Statistiken
- **Student Stats:** [[01_Features/Dashboard/Student/Stats|Student Stats]] - Schüler-Statistiken
- **Dashboard:** [[01_Features/Dashboard/Admin/Overview|Admin Dashboard]] - Übersicht

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **T!Coins Transaction Model:** [[03_Data_Models/T_Coins_Transaction|T!Coins Transaction Model]] - T!Coins-Transaktionen

## Übersicht

Die Statistiken und Exports ermöglichen es Admins, einen Überblick über die gesamte Plattform zu erhalten und Daten zu exportieren.

## Gesamt-Statistiken

### Plattform-Übersicht
- **Gesamtanzahl Schulen:** Anzahl aller registrierten Schulen
- **Gesamtanzahl Lehrkräfte:** Anzahl aller registrierten Lehrkräfte
- **Gesamtanzahl Klassen:** Anzahl aller Klassen
- **Gesamtanzahl Schüler:** Anzahl aller Schüler
- **Gesamtanzahl Projekte:** Anzahl aller Projekte
- **Gesamtanzahl Challenges:** Anzahl aller Challenges

### Aktivitäts-Statistiken
- **Aktive Schulen:** Anzahl aktiver Schulen (letzte 30 Tage)
- **Aktive Lehrkräfte:** Anzahl aktiver Lehrkräfte (letzte 30 Tage)
- **Aktive Schüler:** Anzahl aktiver Schüler (letzte 30 Tage)
- **Neue Registrierungen:** Anzahl neuer Registrierungen (letzte 30 Tage)

### Engagement-Statistiken
- **Durchschnittlicher T!Score:** Plattform-weiter Durchschnitt
- **Gesamt T!Coins:** Summe aller verdienten T!Coins
- **Projekte pro Schüler:** Durchschnittliche Anzahl Projekte
- **Urkunden pro Schüler:** Durchschnittliche Anzahl Urkunden

### Zeitbasierte Statistiken
- **Schuljahr-Filter:** Statistiken nach Schuljahr filtern
- **Zeitraum-Filter:** Statistiken nach Zeitraum filtern (Woche, Monat, Jahr)
- **Trend-Analyse:** Entwicklung über Zeit

## Exports

### Schulen exportieren
- **Format:** XLSX oder CSV
- **Inhalt:**
  - Schulname, Schulart, SKZ
  - Adresse
  - Anzahl Lehrkräfte, Klassen, Schüler
  - Status
  - Förderer
  - Registrierungsdatum
- **Filter:** Nach Bundesland, Schulform, Status, Förderer

### Lehrkräfte exportieren
- **Format:** XLSX oder CSV
- **Inhalt:**
  - Name, E-Mail, Telefon
  - Schule
  - Anzahl Klassen, Schüler
  - Aktivitäts-Status
  - Registrierungsdatum
- **Filter:** Nach Schule, Status, Aktivität

### Klassen exportieren
- **Format:** XLSX oder CSV
- **Inhalt:**
  - Klassenname
  - Schule
  - Lehrkraft
  - Anzahl Schüler
  - T!Score
  - Schuljahr
- **Filter:** Nach Schule, Lehrkraft, Schuljahr

### Schüler exportieren
- **Format:** XLSX oder CSV
- **Inhalt:**
  - Name, Username
  - Klasse, Schule
  - T!Coins, Projekte, Urkunden
  - Aktivitäts-Status
- **Filter:** Nach Klasse, Schule, Aktivität

### Projekte exportieren
- **Format:** XLSX oder CSV
- **Inhalt:**
  - Projekttitel
  - Schüler, Klasse, Schule
  - Status
  - Likes, Kommentare
  - Veröffentlichungsdatum
- **Filter:** Nach Status, Schule, Klasse, Zeitraum

### Challenges exportieren
- **Format:** XLSX oder CSV
- **Inhalt:**
  - Challenge-Name, ID
  - Förderer, Bundesland
  - Anzahl Teilnehmer, Einreichungen
  - Startdatum, Deadline
- **Filter:** Nach Förderer, Bundesland, Schuljahr, Status

## Export-Funktionen

### Export-Optionen
- **Format:** XLSX, CSV, PDF
- **Filter:** Nach verschiedenen Kriterien
- **Sortierung:** Nach verschiedenen Spalten
- **Spalten auswählen:** Welche Spalten sollen exportiert werden?

### Export-Historie
- **Export-Liste:** Alle durchgeführten Exports
- **Details:** Format, Filter, Datum, Größe
- **Download:** Export erneut herunterladen
- **Löschen:** Export löschen

### Automatische Exports
- **Scheduled Exports:** Regelmäßige Exports einrichten
- **Beispiele:**
  - Wöchentlicher Export aller Schulen
  - Monatlicher Export aller Lehrkräfte
- **E-Mail-Versendung:** Exports können per E-Mail versendet werden

## Datenschutz

### DSGVO-Konformität
- **Anonymisierung:** Persönliche Daten können anonymisiert exportiert werden
- **Verschlüsselung:** Exports können verschlüsselt werden
- **Zugriff:** Nur Admins können Exports durchführen
- **Audit-Log:** Alle Exports werden geloggt

> [!tip] Implementation Hint
> - Implementiere Caching für Statistiken (bessere Performance)
> - Exports sollten im Hintergrund generiert werden (Queue-System)
> - Große Exports sollten in Chunks aufgeteilt werden
> - Audit-Log für alle Exports
