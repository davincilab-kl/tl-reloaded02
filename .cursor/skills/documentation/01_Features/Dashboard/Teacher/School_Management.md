---
title: School Management - Meine Schule
description: User Journey für Schul-Verwaltung
enableToc: true
tags:
  - features
  - teacher
---

# 🏫 School Management - Meine Schule

> [!abstract] User Story
> Als Lehrer möchte ich Schul-Informationen verwalten, Lehrkräfte einladen und Lizenzen bestellen.

## Verwandte Features

- **Admin School Management:** [[01_Features/Dashboard/Admin/School_Management|Admin School Management]] - Schul-Freischaltung durch Admin
- **Teacher Management:** [[01_Features/Dashboard/Admin/Teacher_Management|Teacher Management]] - Lehrkraft-Verwaltung durch Admin
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Klassen der Schule verwalten

## Data Models

- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell
- **Course Package Model:** [[03_Data_Models/Course_Package|Course Package Model]] - Kurspaket-Datenmodell

## User Flow: Meine Schule

### 1. Schul-Informationen anzeigen
- **Zugriff:**
  - "Meine Schule" in Hauptnavigation
  - "Übersicht" Tab
- **Schul-Details:**
  - Schulname (z.B. "MS Demoschule")
  - Schultyp (z.B. "Allgemeinbildende höhere Schule (AHS)")
  - SKZ (Schulkennzahl, z.B. "4301")
  - Adresse (z.B. "Tusstraße 4321, Wien")
- **Bearbeiten:**
  - "Bearbeiten" Button
  - Schul-Informationen aktualisieren

### 2. Schulcode verwalten
- **Schulcode anzeigen:**
  - "Schulcode: [Code]" (z.B. "tribc7")
  - Erklärung: "Lehrkräfte können diesen Code nutzen, um sich im Zuge der Registrierung mit dieser Schule in TalentsLounge zu verbinden (ohne Warteliste)"
- **Verwendung:**
  - Lehrkräfte verwenden Code bei Registrierung
  - Direkte Verbindung zur Schule
  - Keine Warteliste nötig

### 3. Gratis-Lizenzen Status
- **Status anzeigen:**
  - "Für den Empfang von Gratis-Lizenzen freigeschaltet"
  - Grünes Häkchen bei Aktivierung
- **Verwaltung:**
  - Status kann aktiviert/deaktiviert werden
  - Verfügbare Gratis-Lizenzen anzeigen

### 4. Lehrkräfte verwalten
- **Zugriff:**
  - "Lehrkräfte" Tab
- **Lehrkräfte-Übersicht:**
  - Gesamtanzahl der Lehrkräfte
  - Warteliste (Anzahl der wartenden Lehrkräfte)
  - Info-Webinar Teilnahme
- **Lehrkraft einladen:**
  - "Lehrkraft einladen" Button
  - E-Mail-Einladung senden
  - Oder Schulcode teilen
- **Warteliste:**
  - Lehrkräfte auf Warteliste anzeigen
  - Einladungen verwalten

### 5. Lizenzen & Kurspakete
- **Zugriff:**
  - "Lizenzen" Tab
- **Lizenz-Gültigkeit:**
  - **Lizenzen sind pro Schuljahr (Saison) gültig**
  - Jedes Schuljahr benötigt neue Lizenzen
  - Lizenzen gelten für das gesamte Schuljahr (inkl. aller Semester/Halbjahre)
  - Bei Schuljahr-Wechsel müssen neue Lizenzen bestellt werden
- **Zugewiesene Kurspakete:**
  - Liste aller zugewiesenen Kurspakete für das aktuelle Schuljahr
  - Details pro Paket:
    - Titel und Beschreibung
    - Gültigkeitszeitraum (Schuljahr)
    - Benutzte/Verfügbare/Gesamt Schülerlizenzen
    - Kostenlose Schülerlizenzen
    - Enthaltene Kurse
- **Kurspaket bestellen:**
  - "+ Kurspaket hinzufügen" Button
  - Bestellkonfiguration:
    - Schuljahr auswählen (Standard: Aktuelles Schuljahr)
    - Anzahl Schüler
    - Zahlungsmethode (Schule zahlt, UeW, Förderung)
    - Preisübersicht
  - Bestellung abschicken

### 6. Bestellungsverlauf
- **Zugriff:**
  - "Bestellungsverlauf" Tab
- **Historie:**
  - Alle vergangenen Bestellungen
  - Nach Schuljahr gefiltert
  - Details pro Bestellung:
    - Bestelldatum
    - Schuljahr
    - Anzahl Lizenzen
    - Zahlungsmethode
    - Status der Bestellungen

### 7. Erfolge/Achievements
- **Zugriff:**
  - "Erfolge" Tab
- **Schuljahr-Filter:**
  - Aktuelles Schuljahr
  - Vorheriges Schuljahr
  - Weitere Schuljahre
- **Erfolgs-Übersicht:**
  - "Meine Erfolge" vs. "Schule" Toggle
  - T!Coins
  - Projekte
  - Urkunden
  - Nach Schuljahr gefiltert

## Zahlungsmethoden

### Schule zahlt per Rechnung
- Standard-Zahlungsmethode
- Rechnung an Schule
- Optional: Elternverein

### UeW (Unterrichtsmittel eigener Wahl)
- Alternative Zahlungsmethode
- Schulinterne Abwicklung

### Förderung
- Kostenlose Lizenzen
- Durch Förderer/Sponsoren
- Keine Kosten für Schule
