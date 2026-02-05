---
title: Admin School Management - Schul-Verwaltung
description: Schul-Verwaltung durch Admin
enableToc: true
tags:
  - features
  - admin
  - school
---

# 🏫 Admin School Management - Schul-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich Schulen verwalten, freischalten und Förderer zuweisen.

## Verwandte Features

- **Teacher School Management:** [[01_Features/Dashboard/Teacher/School_Management|Teacher School Management]] - Schul-Verwaltung durch Lehrer
- **Teacher Management:** [[01_Features/Dashboard/Admin/Teacher_Management|Teacher Management]] - Lehrkräfte der Schule verwalten
- **Challenge Management:** [[01_Features/Dashboard/Admin/Challenge_Management|Challenge Management]] - Förderer zuweisen

## Data Models

- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell

## Übersicht

Die Schul-Verwaltung ermöglicht es Admins, alle Schulen der Plattform zu verwalten, freizuschalten und Förderer zuzuweisen.

## Schul-Übersicht

### Schul-Liste
- **Alle Schulen:** Liste aller registrierten Schulen
- **Filter:**
  - Nach Bundesland
  - Nach Schulform
  - Nach Status (Aktiv, Wartet auf Freigabe, Auf Warteliste)
  - Nach Förderer
- **Sortierung:**
  - Nach Name
  - Nach Registrierungsdatum
  - Nach Anzahl Lehrkräfte
  - Nach Anzahl Schüler

### Schul-Details
- **Schul-Informationen:**
  - Schulname
  - Schulart
  - SKZ (Schulkennzahl)
  - Adresse (Straße, PLZ, Ort, Bundesland)
  - Privatschule (Ja/Nein)
- **Demografische Daten:**
  - Anteil Kinder mit Deutsch nicht als Muttersprache (%)
- **Umfang:**
  - Anzahl teilnehmender Klassen
  - Anzahl teilnehmender Lehrkräfte
- **Status:**
  - Aktiv
  - Wartet auf Admin-Freigabe
  - Auf Warteliste

## Schule freischalten

### Freischaltungs-Prozess

#### Schule freischalten
- **Zugriff:** In Schul-Details → "Schule freischalten" Button
- **Prozess:**
  1. Admin prüft Schul-Informationen
  2. Admin kann Förderer zuweisen (optional)
  3. Admin klickt "Schule freischalten"
  4. Schule wird aktiviert
  5. Alle wartenden Lehrkräfte werden benachrichtigt
  6. Status-Email wird automatisch versendet

#### Förderer zuweisen
- **Saisonaler Förderer:**
  - Admin kann bei Freischaltung einen Förderer zuweisen
  - **Zweck:** Für Gratis-Lizenzen und Förderungen
  - **Beispiele:** Mastercard, Amazon, Wiener Netze, etc.
  - **Zeitraum:** Förderer ist saisonal (z.B. für Schuljahr 2025/2026)
- **Förderer-Optionen:**
  - Kein Förderer
  - Förderer aus Liste auswählen
  - Neuen Förderer anlegen (falls nötig)

### Schul-Status

#### Status-Typen
- **Wartet auf Admin-Freigabe:**
  - Neue Schule wurde angelegt
  - Admin muss freischalten
- **Aktiv:**
  - Schule wurde freigeschaltet
  - Lehrkräfte können Plattform nutzen
- **Auf Warteliste:**
  - Lehrkräfte warten auf Freigabe durch Schul-Admin

## Schul-spezifische Informationen

### Schul-Statistiken
- **Anzahl Lehrkräfte:** Gesamtanzahl der Lehrkräfte
- **Anzahl Klassen:** Gesamtanzahl der Klassen
- **Anzahl Schüler:** Gesamtanzahl der Schüler
- **T!Score:** Durchschnittlicher Schul-Score
- **Aktivität:** Letzte Aktivität der Schule

### Zugehörige Lehrkräfte
- **Lehrkräfte-Liste:** Alle Lehrkräfte der Schule
- **Details pro Lehrkraft:**
  - Name, E-Mail
  - Anzahl Klassen
  - Anzahl Schüler
  - Aktivitäts-Status
- **Aktionen:**
  - Lehrkraft-Details anzeigen
  - Direkt in Lehrkraft-Account einloggen

### Schul-spezifischer Einladungslink
- **Einladungslink generieren:**
  - Admin kann schul-spezifischen Einladungslink generieren
  - Link kann an Lehrkräfte weitergegeben werden
  - Link führt direkt zur Schulverbindung (ohne Warteliste)
- **Link-Format:** `https://platform.com/invite/school/[SCHOOL_ID]`
- **Verwaltung:**
  - Link anzeigen
  - Link kopieren
  - Link deaktivieren/aktivieren

## Schul-Aktionen

### Schule bearbeiten
- **Schul-Informationen:** Bearbeitbar durch Admin
- **Demografische Daten:** Bearbeitbar
- **Umfang:** Bearbeitbar

### Schule löschen
- **Löschung:** Schule kann gelöscht werden
- **Bestätigung:** Mehrstufiger Bestätigungsprozess
- **Warnung:** Alle zugehörigen Daten werden gelöscht
- **Frist:** 30 Tage Wartezeit (kann wiederhergestellt werden)

### Schule deaktivieren
- **Deaktivierung:** Schule kann temporär deaktiviert werden
- **Effekt:** Schule kann nicht mehr genutzt werden
- **Wiederherstellung:** Kann jederzeit wieder aktiviert werden

## Integration

### Status-Email-Integration
- **Automatische E-Mails:** Werden bei Statusänderungen versendet
- **Beispiele:**
  - "Schule wurde freigeschaltet" → An alle wartenden Lehrkräfte
  - "Förderer wurde zugewiesen" → An Schul-Admin
- Siehe [[01_Features/Dashboard/Admin/Status_Emails|Status-Emails]] für Details

### Micromessaging-Integration
- **Nachrichten:** Automatische Nachrichten basierend auf Status
- **Beispiele:**
  - "Schule wurde freigeschaltet" → Willkommensnachricht
  - "Förderer zugewiesen" → Informationsnachricht

> [!tip] Implementation Hint
> - Implementiere Audit-Log für alle Schul-Änderungen
> - Förderer-Zuweisung sollte mit Zeitraum (Schuljahr) verknüpft sein
> - Einladungslink sollte eindeutig und sicher sein
> - Status-Änderungen sollten automatisch E-Mails triggern
