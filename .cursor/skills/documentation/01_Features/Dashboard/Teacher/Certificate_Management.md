---
title: Teacher Certificate Management - Urkunden-Verwaltung
description: Urkunden-Verwaltung durch Lehrer
enableToc: true
tags:
  - features
  - teacher
  - certificates
---

# 🏆 Teacher Certificate Management - Urkunden-Verwaltung

> [!abstract] User Story
> Als Lehrer möchte ich Urkunden meiner Schüler ansehen, PDFs herunterladen und manuell Urkunden vergeben können.

## Verwandte Features

- **Admin Certificate Management:** [[01_Features/Dashboard/Admin/Certificate_Management|Admin Certificate Management]] - Urkunden-Erstellung
- **Student Certificates:** [[01_Features/Dashboard/Student/Certificates|Certificates]] - Was Schüler sehen
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Zugriff über Klassen-Verwaltung

## Data Models

- **Certificate Model:** [[03_Data_Models/Certificate|Certificate Model]] - Urkunden-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell
- **Class Model:** [[03_Data_Models/Class|Class Model]] - Klassen-Datenmodell

## Übersicht

Lehrer können Urkunden ihrer Schüler ansehen, PDFs herunterladen und in einigen Fällen manuell Urkunden vergeben. Die meisten Urkunden werden automatisch vergeben.

## Schüler-Urkunden ansehen

### Pro Schüler
- **Zugriff:** In Schüler-Details → "Urkunde(n)" Button
- **Urkunden-Liste:** Alle Urkunden des Schülers
- **Filter:** Nach Typ, Kurs, Challenge
- **PDF-Download:** PDF für Schüler herunterladen

### Pro Klasse
- **Zugriff:** In Klassen-Detailansicht → "Urkunden" Tab
- **Übersicht:** Alle Urkunden der Klasse
- **Statistiken:**
  - Anzahl Urkunden pro Schüler
  - Urkunden nach Typ
  - Urkunden nach Kurs

## Manuelle Vergabe

### Verfügbare Urkunden
- **Eingeschränkt:** Lehrer können nur bestimmte Urkunden vergeben
- **Typen:**
  - Teilnahme-Urkunden
  - Besondere Leistungen (mit Admin-Genehmigung)
- **Nicht verfügbar:**
  - Kursabschluss-Urkunden (automatisch)
  - Challenge-Gewinner-Urkunden (automatisch)

### Vergabe-Prozess
1. **Schüler auswählen:** Schüler aus Klasse auswählen
2. **Urkunde auswählen:** Verfügbare Urkunde auswählen
3. **Grund eingeben:** Optional: Grund für manuelle Vergabe
4. **Vergeben:** Urkunde vergeben
5. **Benachrichtigung:** Schüler wird benachrichtigt

## PDF-Verwaltung

### PDF herunterladen
- **Einzelne Urkunde:** PDF für eine Urkunde herunterladen
- **Pro Schüler:** Alle Urkunden eines Schülers als ZIP
- **Pro Klasse:** Alle Urkunden einer Klasse als ZIP

### PDF-Versand
- **An Schüler:** PDF per E-Mail an Schüler senden (optional)
- **An Eltern:** PDF per E-Mail an Eltern senden (optional)

## Urkunden-Statistiken

### Klassen-Statistiken
- **Gesamt:** Anzahl Urkunden der Klasse
- **Nach Typ:** Urkunden nach Typ aufgeteilt
- **Nach Kurs:** Urkunden nach Kurs aufgeteilt
- **Top-Performer:** Schüler mit meisten Urkunden

### Vergleich
- **Mit anderen Klassen:** Vergleich mit anderen Klassen der Schule
- **Schuljahrspezifisch:** Nur Urkunden des aktuellen Schuljahres

## Integration

### Class Management
- **Zugriff:** Urkunden über Klassen-Verwaltung
- **Schüler-Details:** Urkunden in Schüler-Details

### Stats
- **Statistiken:** Urkunden in Klassen-Statistiken
- **Vergleich:** Urkunden-Vergleich mit anderen Klassen

> [!tip] Implementation Hint
> - Implementiere PDF-Batch-Download für Klassen
> - Verwende Template-Engine für PDF-Generierung
> - Implementiere E-Mail-Versand für PDFs
> - Cache PDFs für bessere Performance
