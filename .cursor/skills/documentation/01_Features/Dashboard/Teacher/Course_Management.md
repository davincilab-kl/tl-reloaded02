---
title: Course Management - Kurse verwalten
description: User Journey für Kurs-Verwaltung durch Lehrer
enableToc: true
tags:
  - features
  - teacher
---

# 📚 Course Management - Kurse verwalten

> [!abstract] User Story
> Als Lehrer möchte ich Kurse für meine Klassen verwalten und die Sichtbarkeit für Schüler steuern.

## Verwandte Features

- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Kurse für Klassen zuweisen
- **Student Course Overview:** [[01_Features/Dashboard/Student/Course_Overview|Course Overview]] - Was Schüler sehen
- **Admin Course Management:** [[01_Features/Dashboard/Admin/Course_Management|Admin Course Management]] - Kurs-Erstellung durch Admin

## Data Models

- **Course Model:** [[03_Data_Models/Course|Course Model]] - Kurs-Datenmodell
- **Course Package Model:** [[03_Data_Models/Course_Package|Course Package Model]] - Kurspaket-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell

## User Flow: Kurse verwalten

### 1. Kurse anzeigen
- **Zugriff:**
  - In Klassen-Detailansicht: "Kurse" Tab
  - Oder "Kurspaket(e)" in Hauptnavigation
- **Ansichts-Optionen:**
  - "Kacheln" (Tiles): Grid-Ansicht
  - "Liste" (List): Listen-Ansicht

### 2. Kurs-Details
- **Kurs-Informationen:**
  - Kurs-Thumbnail
  - Titel (z.B. "Grundkurs: Coding & Game Design mit Scratch")
  - Beschreibung
  - Enthaltene Lektionen
- **Kurs-Typen:**
  - Grundkurs: Coding & Game Design mit Scratch
  - Aufbaukurs: Coding & Game Design mit Scratch
  - ABC der Digitalen Grundbildung
  - Berufe entdecken und Traumjob finden

### 3. Kurs-Sichtbarkeit steuern
- **Sichtbarkeit pro Kurs:**
  - Toggle: "Kurs für alle Schüler:innen sichtbar"
  - Ein/Aus für jeden Kurs
  - Änderung wird sofort gespeichert
- **Sichtbarkeit im Schülerdashboard:**
  - "Sichtbar im Schülerdashboard" Indikator
  - Zeigt, welche Kurse Schüler sehen können
- **Pro Klasse:**
  - Sichtbarkeit kann pro Klasse unterschiedlich sein
  - Jede Klasse hat eigene Kurs-Sichtbarkeit

### 4. Kurspakete zuweisen
- **Zugriff:**
  - "Lizenzen" Tab in Klassen-Verwaltung
- **Kurspaket hinzufügen:**
  - "+ Kurspaket hinzufügen" Button
  - Verfügbare Kurspakete auswählen
  - Kurspaket wird Klasse zugewiesen
- **Zugewiesene Kurspakete:**
  - Liste aller zugewiesenen Kurspakete
  - Details pro Paket
  - Lizenzen-Status

### 5. Kurs-Statistiken
- **Klassen-Übersicht:**
  - Welche Kurse werden genutzt
- **Schüler-Fortschritt:**
  - Fortschritt pro Kurs
  - Durchschnittlicher Fortschritt der Klasse

## Kurs-Verfügbarkeit

### Verfügbare Kurse
- Kurse aus zugewiesenen Kurspaketen
- Alle Kurse, für die Lizenzen vorhanden sind

### Sichtbare Kurse
- Nur Kurse mit aktiviertem Sichtbarkeits-Toggle
- Erscheinen im Schülerdashboard
- Schüler können diese Kurse sehen und starten
