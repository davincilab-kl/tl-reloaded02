---
title: Admin Teacher Management - Lehrkraft-Verwaltung
description: Lehrkraft-Verwaltung durch Admin
enableToc: true
tags:
  - features
  - admin
  - teacher
---

# 👨‍🏫 Admin Teacher Management - Lehrkraft-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich Lehrkräfte verwalten, Account-Daten zurücksetzen und direkt in Lehrkraft-Accounts einloggen.

## Verwandte Features

- **Teacher Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Was Lehrer sehen
- **School Management:** [[01_Features/Dashboard/Admin/School_Management|School Management]] - Schulen der Lehrkräfte
- **Teacher Onboarding:** [[01_Features/Auth/Teacher_Onboarding|Teacher Onboarding]] - Registrierungs-Prozess

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell

## Übersicht

Die Lehrkraft-Verwaltung ermöglicht es Admins, alle Lehrkräfte der Plattform zu verwalten, Account-Daten zu verwalten und Statistiken einzusehen.

## Lehrkraft-Übersicht

### Lehrkraft-Liste
- **Alle Lehrkräfte:** Liste aller registrierten Lehrkräfte
- **Filter:**
  - Nach Schule
  - Nach Status (Aktiv, Auf Warteliste, Inaktiv)
  - Nach Aktivität
- **Sortierung:**
  - Nach Name
  - Nach Registrierungsdatum
  - Nach Anzahl Klassen
  - Nach Anzahl Schüler
  - Nach Aktivität

### Lehrkraft-Details
- **Persönliche Daten:**
  - Name, E-Mail, Telefon
  - Bevorzugte Anrede
  - Avatar
- **Schul-Informationen:**
  - Zugehörige Schule(n)
  - Status (Aktiv, Auf Warteliste)
- **Aktivitäts-Status:**
  - Letzte Anmeldung
  - Aktivitäts-Level
  - Fortschritt (Onboarding-Steps)

## Account-Verwaltung

### Account-Daten neu vergeben (Reset)

#### Passwort zurücksetzen
- **Zugriff:** In Lehrkraft-Details → "Passwort zurücksetzen"
- **Prozess:**
  1. Admin klickt "Passwort zurücksetzen"
  2. Neues Passwort wird generiert
  3. Passwort wird per E-Mail an Lehrkraft gesendet
  4. Lehrkraft muss Passwort bei nächster Anmeldung ändern

#### E-Mail ändern
- **Zugriff:** In Lehrkraft-Details → "E-Mail ändern"
- **Prozess:**
  1. Admin gibt neue E-Mail ein
  2. Bestätigungs-E-Mail wird an neue Adresse gesendet
  3. Lehrkraft muss E-Mail bestätigen
  4. Alte E-Mail wird deaktiviert

#### Account-Daten exportieren
- **Export:** Alle Account-Daten als JSON/PDF
- **Inhalt:**
  - Persönliche Daten
  - Schul-Informationen
  - Klassen und Schüler
  - Statistiken

### Account löschen
- **Löschung:** Lehrkraft-Account kann gelöscht werden
- **Bestätigung:** Mehrstufiger Bestätigungsprozess
- **Warnung:** 
  - Alle zugehörigen Daten werden gelöscht
  - Klassen werden nicht gelöscht (werden anderen Lehrkräften zugewiesen)
- **Frist:** 30 Tage Wartezeit (kann wiederhergestellt werden)

## Lehrkraft-Statistiken

### Übersicht
- **Anzahl Klassen:** Gesamtanzahl der verwalteten Klassen
- **Anzahl Schüler:** Gesamtanzahl der verwalteten Schüler
- **T!Score:** Durchschnittlicher Score aller Klassen
- **Aktivität:** Letzte Aktivität

### Detaillierte Statistiken
- **Klassen-Statistiken:**
  - Pro Klasse: Anzahl Schüler, T!Coins, Projekte, Urkunden
  - Klassen-Vergleich
- **Schüler-Statistiken:**
  - Durchschnittliche Leistungen
  - Top-Performer
- **Projekt-Statistiken:**
  - Anzahl Projekte
  - Durchschnittliche Projekt-Qualität
- **Challenge-Statistiken:**
  - Teilnahmen
  - Gewinne

## Lehrkraft-Stati (Aktivitäts-Level)

### Aktivitäts-Indikatoren
- **Sehr aktiv:** Täglich aktiv, viele Klassen, hohe Schüler-Engagement
- **Aktiv:** Regelmäßig aktiv, mehrere Klassen
- **Wenig aktiv:** Selten aktiv, wenige Klassen
- **Inaktiv:** Keine Aktivität seit X Tagen

### Fortschritt (Onboarding-Steps)
- **Onboarding-Status:** Welche Schritte wurden abgeschlossen?
  - ✅ Registrierung
  - ✅ E-Mail bestätigt
  - ✅ Schule verbunden
  - ✅ Erste Klasse angelegt
  - ✅ Erste Schüler hinzugefügt
  - ✅ Erste Projekte geprüft
- **Fortschrittsanzeige:** Prozentuale Anzeige des Onboarding-Fortschritts

## Direktes Einloggen in Lehrkraft-Account

### Impersonation (Als Lehrkraft einloggen)
- **Zugriff:** In Lehrkraft-Details → "Als Lehrkraft einloggen"
- **Prozess:**
  1. Admin klickt "Als Lehrkraft einloggen"
  2. Admin wird als Lehrkraft eingeloggt
  3. Admin sieht vollständiges Teacher-Dashboard
  4. Admin kann alle Funktionen nutzen
  5. **Wichtig:** Admin-Banner wird angezeigt ("Du bist als [Lehrkraft-Name] eingeloggt")
- **Zweck:**
  - Support bei Problemen
  - Testing und Debugging
  - Schulung und Demonstration
- **Sicherheit:**
  - Alle Aktionen werden geloggt
  - Admin kann jederzeit zurück zu Admin-Dashboard
  - Lehrkraft wird benachrichtigt (optional)

## Lehrkraft-spezifische Funktionen

### Info-Webinar eintragen
- **Zugriff:** In Lehrkraft-Details → "Info-Webinar eintragen"
- **Funktion:**
  - Admin kann Lehrkraft für Info-Webinar eintragen
  - Lehrkraft wird benachrichtigt
  - Webinar-Details werden angezeigt

### Lehrer-spezifische Notizen
- **Notizen hinzufügen:**
  - Admin kann Notizen zu Lehrkraft hinzufügen
  - **Zweck:** Support-Notizen, Besonderheiten, etc.
  - **Sichtbarkeit:** Nur für Admin sichtbar
- **Notizen verwalten:**
  - Notizen anzeigen
  - Notizen bearbeiten
  - Notizen löschen

## Integration

### Status-Email-Integration
- **Automatische E-Mails:** Werden bei Account-Änderungen versendet
- **Beispiele:**
  - "Passwort wurde zurückgesetzt" → An Lehrkraft
  - "E-Mail wurde geändert" → An neue E-Mail-Adresse
- Siehe [[01_Features/Dashboard/Admin/Status_Emails|Status-Emails]] für Details

### Micromessaging-Integration
- **Nachrichten:** Automatische Nachrichten basierend auf Aktivität
- **Beispiele:**
  - "Onboarding abgeschlossen" → Willkommensnachricht
  - "Inaktiv seit X Tagen" → Erinnerungsnachricht

> [!tip] Implementation Hint
> - Implementiere Audit-Log für alle Account-Änderungen
> - Impersonation sollte sicher und nachvollziehbar sein
> - Notizen sollten verschlüsselt gespeichert werden
> - Aktivitäts-Level sollte automatisch berechnet werden
