---
title: Teacher Dashboard Overview
description: Lehrer-Dashboard Übersicht
enableToc: true
tags:
  - features
  - teacher
---

# 📊 Teacher Dashboard Overview

> [!abstract] User Story
> Als Lehrer möchte ich nach dem Login eine Übersicht über meine Klassen, Schüler, Projekte und Aktivitäten sehen.

## Verwandte Features

- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Klassen verwalten
- **Project Management:** [[01_Features/Dashboard/Teacher/Project_Management|Project Management]] - Projekte verwalten
- **Project Review System:** [[01_Features/Dashboard/Teacher/Project_Review_System|Project Review System]] - Projekte prüfen
- **Course Management:** [[01_Features/Dashboard/Teacher/Course_Management|Course Management]] - Kurse verwalten
- **Challenge Management:** [[01_Features/Dashboard/Teacher/Challenge_Management|Challenge Management]] - Challenges verwalten
- **School Management:** [[01_Features/Dashboard/Teacher/School_Management|School Management]] - Schule verwalten
- **Stats:** [[01_Features/Dashboard/Teacher/Stats|Stats]] - Statistiken

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell
- **Project Model:** [[03_Data_Models/Project|Project Model]] - Projekt-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell

## Dashboard-Navigation

### Hauptnavigation
- **Nachrichten** (Messages)
- **Meine Schule** (My School)
- **Meine Klasse(n)** (My Class(es))
- **Kurspaket(e)** (Course Package(s))

### Meine Schule - Unterbereiche
- **Übersicht:** Schul-Informationen und Übersicht
- **Lehrkräfte:** Lehrkräfte-Verwaltung und Einladungen
- **Lizenzen:** Lizenzverwaltung und Kurspaketbestellung
- **Bestellungsverlauf:** Historie der Bestellungen
- **Erfolge:** Achievements nach Schuljahr

## Hauptfunktionen

### Meine Schule verwalten
- Schulinformationen anzeigen und bearbeiten
- Schulcode anzeigen (für Lehrkraft-Registrierung)
- Gratis-Lizenzen Status
- Lehrkräfte einladen und verwalten
- Warteliste für Lehrkräfte

### Klassenmanagement
- Klassen anlegen
- Vorjahresklassen übertragen
- Schüler hinzufügen und verwalten
- Co-Lehrkräfte verwalten
- Klassen-Statistiken (Schüler, T!Coins, Projekte, Urkunden)

### Projektverwaltung
- Alle Projekte der Schüler sehen
- Projekt-Status verwalten (In Bearbeitung, Veröffentlicht, Eingereicht)
- Projekte prüfen und bewerten
- Projekte für Wettbewerbe einreichen
- Opt-Out pro Projekt für automatische Challenge-Einreichung

### Wettbewerbe verwalten
- Challenges/Wettbewerbe anzeigen
- Projekte für Wettbewerbe einreichen
- Projekt-Einreichungen verwalten
- Challenge-Status überwachen

### Lizenzen & Kurspakete
- Zugewiesene Kurspakete anzeigen
- Neue Kurspakete bestellen
- Schülerlizenzen verwalten
- Kostenlose Lizenzen anzeigen
- Bestellungsverlauf einsehen

### Kurse verwalten
- Kurse anzeigen (Kacheln oder Liste)
- Kurse für Schüler sichtbar/unsichtbar machen
- Kurs-Sichtbarkeit pro Klasse steuern

### Schülerverwaltung
- Schüler-Liste mit Statistiken (T!Coins, Projekte, Urkunden)
- Schülerpasswörter zurücksetzen
- Schüler hinzufügen
- Schüler-Aktivität überwachen
- Pro-Schüler-Aktionen: Details, Urkunde(n), Passwort zurücksetzen, Löschen

### Dashboard-Simulation
- **Schüler-Dashboard-Ansicht:**
  - Teacher kann zum Schüler-Dashboard wechseln
  - Simuliert die Ansicht, die eine Klasse sieht
  - Zeigt alle Kurse, die für die Klasse sichtbar sind
  - Anzeige: "Klasse [Klassenname]" im Dashboard
  - Teacher kann alle Schüler-Funktionen testen und ausprobieren
  - Nützlich zum Verstehen der Schüler-Erfahrung

### Demo-Klasse
- **Immer verfügbar:**
  - Jeder Teacher hat automatisch eine Demo-Klasse
  - Enthält 3 Demo-Schüler
  - **Zweck:**
    - Testen der TalentsLounge-Funktionen
    - Keine Lizenzen erforderlich
    - Alle Features können ausprobiert werden
  - **Eigenschaften:**
    - Kann nicht gelöscht werden
    - Wird automatisch erstellt bei Account-Erstellung
    - Alle Kurse sind verfügbar (ohne Lizenz-Beschränkungen)
    - Ideal zum Testen neuer Features und Workflows


