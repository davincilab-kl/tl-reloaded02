---
title: Class Management - Klassenmanagement
description: User Journey für Klassenverwaltung
enableToc: true
tags:
  - features
  - teacher
---

# 👥 Class Management - Klassenmanagement

> [!abstract] User Story
> Als Lehrer möchte ich Klassen anlegen, Schüler verwalten und Co-Lehrkräfte einladen.

## Verwandte Features

- **Project Management:** [[01_Features/Dashboard/Teacher/Project_Management|Project Management]] - Projekte der Klasse verwalten
- **Course Management:** [[01_Features/Dashboard/Teacher/Course_Management|Course Management]] - Kurse für Klasse zuweisen
- **Challenge Management:** [[01_Features/Dashboard/Teacher/Challenge_Management|Challenge Management]] - Challenges für Klasse verwalten
- **Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Übersicht

## Data Models

- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **Course Package Model:** [[03_Data_Models/Course_Package|Course Package Model]] - Kurspaket-Datenmodell

## User Flow: Klassenmanagement

### 1. Klasse anlegen
- **Zugriff:**
  - "Meine Klasse(n)" in Hauptnavigation
  - "+ Klasse anlegen" Button
- **Klasse erstellen:**
  - Klassenname eingeben (z.B. "5A")
    - Stufe auswählen (Dropdown)
    - Klassenbezeichnung eingeben (z.B. "a", "b", "c" oder "AB")
  - Schüleranzahl festlegen (Slider oder Eingabefeld)
  - **Kurspakete auswählen:**
    - Verfügbare Kurspakete für das aktuelle Schuljahr anzeigen
    - Kurspakete auswählen
    - Beispiel: "Digital Grundbildung & Coding Sek. I"
    - **Hinweis:** Lizenzen sind pro Schuljahr gültig
  - **Zahlungsmethode wählen:**
    - "Aus aktuellen Lizenzen Klasse erstellen" (0,00 € - sofort verfügbar)
    - Verwendet Lizenzen des aktuellen Schuljahres
    - "Gefördert durch TalentsLounge Angels" (0,00 € - kostenlos, solange Kontingent besteht)
    - "Zahlung per Rechnung" (z.B. über den Elternverein)
    - "Unterrichtsmittel eigener Wahl (UeW)" (Rechnung mit Schulstempel/Unterschrift hochladen)
  - Optional: Co-Lehrkräfte hinzufügen
- **Bestätigung:**
  - "Klassen anlegen" Button
  - Bei erfolgreicher Erstellung:
    - Klasse wird erstellt
    - Schüler werden automatisch generiert (mit zufälligen Usernamen und Passwörtern)
    - **Klassenliste herunterladen:**
      - Download-Button erscheint
      - Format: XLSX oder PDF
      - Enthält: Username, Passwort, Name (optional manuell ausfüllbar)
    - Erscheint in Klassenliste

### 2. Vorjahresklasse übertragen
- **Zugriff:**
  - "+ Vorjahresklasse übertragen" Button (in Klassenliste)
  - Oder: "→ Klasse ins aktuelle Schuljahr übertragen" Button (wenn Klasse nicht im aktuellen Schuljahr ist)
  - Dropdown mit verfügbaren Vorjahresklassen
- **Übertragung:**
  - Vorjahresklasse auswählen (oder aktuelle Klasse)
  - Neues Schuljahr zuweisen (aktuelles Schuljahr)
  - Schüler werden übertragen
  - Projekte und Fortschritte bleiben erhalten
  - **T!Coins:**
    - Historische T!Coins bleiben im alten Schuljahr gespeichert
    - Im neuen Schuljahr starten T!Coins bei 0
    - Schüler können neue T!Coins im neuen Schuljahr sammeln

### 3. Schüler hinzufügen
- **Zugriff:**
  - In Klassen-Detailansicht: "+ Schüler:in hinzufügen" Button
- **Schüler erstellen:**
  - 
  - Schülername wird zusammengewürfelt & zufälliges Schülerpasswort generiert
  - Einzigartiges Schülerpasswort wird generiert
  - Schüler wird automatisch der Klasse zugewiesen

### 4. Schüler verwalten
- **Schüler-Liste:**
  - Alle Schüler der Klasse anzeigen
  - Statistiken pro Schüler (aktuelles Schuljahr):
    - **T!Coins:** T!Coins des aktuellen Schuljahrs
      - T!Coins werden pro Schuljahr gesammelt
      - Historische T!Coins aus vorherigen Schuljahren bleiben gespeichert
    - **Projekte:** Anzahl der Projekte (gesamt oder nach Status: In Bearbeitung, Veröffentlicht, Eingereicht)
    - **Urkunden:** Anzahl der Urkunden
    - **Letzte Aktivität:** Zeitstempel der letzten Aktivität (z.B. "aktiv vor 7.7 Monaten")
- **Aktionen pro Schüler (Dropdown-Menü):**
  - **Details:** Schüler-Details anzeigen (rote Textfarbe)
  - **Urkunde(n):** Urkunden des Schülers anzeigen und verwalten
  - **Siehe:** [[01_Features/Dashboard/Teacher/Certificate_Management|Certificate Management]] für Urkunden-Verwaltung
  - **Passwort zurücksetzen:** Schülerpasswort zurücksetzen (neues Passwort generieren)
  - **Löschen:** Schüler aus Klasse entfernen (rote Textfarbe, mit Bestätigung)

### 5. Co-Lehrkräfte verwalten
- **Co-Lehrkräfte hinzufügen:**
  - "Co-Lehrkräfte verwalten" Button
  - Anderer Lehrkraft diese Klasse zuweisen
- **Co-Lehrkräfte in Statistiken:**
  - Co-Lehrkräfte werden in den Klassen-Statistiken angezeigt
  - Namen und Avatare der Co-Lehrkräfte sind sichtbar
  - Lehrer kann sehen, welche Co-Lehrkräfte mit der Klasse arbeiten
- **Berechtigungen:**
  - Co-Lehrkräfte sehen alle Schüler der Klasse
  - Können Projekte prüfen
  - Können Schüler verwalten
- **Co-Lehrkräfte Klassen anzeigen:**
  - Checkbox: "Co-Lehrkräfte Klassen anzeigen"
  - Zeigt auch Klassen, in denen Lehrer Co-Lehrkraft ist

## Klassen-Übersicht

### Klassen-Statistiken
- **Schüleranzahl:** Anzahl der Schüler in der Klasse (aktuelles Schuljahr)
- **T!Coins:** Gesamte T!Coins der Klasse (aktuelles Schuljahr)
  - **Wichtig:** T!Coins werden pro Schuljahr gesammelt
  - Jedes Schuljahr startet mit 0 T!Coins
  - Historische T!Coins bleiben im jeweiligen Schuljahr gespeichert
- **T!Score:** Durchschnittlicher Score der Klasse
  - Berechnung: Summe T!Coins ÷ Anzahl Schüler (aktuelles Schuljahr)
- **Projekte:** Anzahl der Projekte
- **Urkunden:** Anzahl der Urkunden
- **Lizenzen:** Anzahl der zugewiesenen Lizenzen (für aktuelles Schuljahr)
- **Co-Lehrkräfte:** 
  - Liste aller Co-Lehrkräfte der Klasse anzeigen
  - Namen der Co-Lehrkräfte sichtbar
  - Avatar/Icon für jede Co-Lehrkraft
  - "Co-Lehrkräfte verwalten" Button zum Hinzufügen/Entfernen
- **Weitere Metriken**

### Schuljahr-Status
- **Aktuelles Schuljahr:**
  - Klasse ist im aktuellen Schuljahr
  - Alle Funktionen verfügbar
- **Vorheriges Schuljahr:**
  - Klasse ist nicht im aktuellen Schuljahr
  - **"→ Klasse ins aktuelle Schuljahr übertragen" Button wird angezeigt**
  - Button prominent platziert (z.B. oben rechts in der Klassen-Detailansicht)
  - Bei Klick: Übertragungs-Dialog öffnet sich
  - Schüler, Projekte und Fortschritte werden ins aktuelle Schuljahr übertragen
  - T!Coins starten im neuen Schuljahr bei 0 (historische T!Coins bleiben im alten Schuljahr)

### Klassen-Tabs
- **Schüler:innen:** Schüler-Liste und Verwaltung
- **Projekte:** Alle Projekte der Klasse
- **Wettbewerbe:** Challenges, an denen Klasse teilnimmt
- **Lizenzen:** Zugewiesene Kurspakete (für aktuelles Schuljahr)
- **Kurse:** Verfügbare Kurse für die Klasse

## Klassen-Aktionen

### Klasse bearbeiten
- Klassenname ändern
- Schuljahr ändern
- Klasse löschen (mit Bestätigung)

### Klasse exportieren
- **Schülerliste exportieren:**
  - **XLSX-Format:** Excel-Datei mit allen Schülerdaten
    - Spalten: #, Username, Passwort, Name, T!Coins, Projekte, Urkunden, etc.
  - **PDF-Format (zwei Varianten):**
    - **PDF mit Kärtchen:** Zum Ausschneiden
      - Jeder Schüler auf eigenem Kärtchen
      - Enthält: Username, Passwort, Name (optional)
      - Format: "Klassenliste Zugangsdaten - Klasse: [Klassenname]"
    - **PDF Listen-Ansicht:** Einfache Tabellen-Ansicht
      - Alle Schüler in einer Tabelle
      - Spalten: #, Username und Passwort, Name
- **Statistiken exportieren:**
  - Klassen-Statistiken als PDF/XLSX
- **Projekte-Übersicht exportieren:**
  - Alle Projekte der Klasse als PDF/XLSX
