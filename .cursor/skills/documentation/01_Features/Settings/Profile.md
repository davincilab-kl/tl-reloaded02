---
title: Profile Management - Profil & Einstellungen
description: Benutzer-Profil bearbeiten und Einstellungen verwalten
enableToc: true
tags:
  - features
  - settings
  - profile
---

# 👤 Profile Management - Profil & Einstellungen

> [!abstract] User Story
> Als Benutzer möchte ich mein Profil bearbeiten, meine Einstellungen verwalten und meine Datenschutz-Präferenzen festlegen.

## Verwandte Features

- **Student Profile Customization:** [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] - Steam-ähnliches Profil-System für Schüler
- **Student Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Profil-Übersicht
- **Teacher Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Profil-Übersicht

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell mit Profil-Daten

## Übersicht

Das Profile Management ermöglicht es Benutzern (Lehrern und Schülern), ihre persönlichen Daten, Einstellungen und Datenschutz-Präferenzen zu verwalten.

## Profil-Bearbeitung

### Persönliche Daten

#### Lehrer-Profil
- **Vorname:** Bearbeitbar
- **Nachname:** Bearbeitbar
- **Bevorzugte Anrede:** Dropdown (Herr, Frau, Divers)
- **E-Mail-Adresse:** Bearbeitbar (mit Bestätigung)
- **Mobiltelefon:** Bearbeitbar (Format: +436991234567)
- **Avatar:** Aus Avatar-Bibliothek auswählen
  - Kein Hochladen von eigenen Bildern möglich
  - Auswahl aus vordefinierten Avataren
  - Verschiedene Kategorien und Stile verfügbar

#### Schüler-Profil
- **Name:** Wird von Lehrer verwaltet (nicht bearbeitbar durch Schüler)
- **Klasse:** Wird von Lehrer zugewiesen (nicht bearbeitbar)
- **Avatar:** Aus Avatar-Bibliothek auswählen
  - Kein Hochladen von eigenen Bildern möglich
  - Auswahl aus vordefinierten Avataren
  - Verschiedene Kategorien und Stile verfügbar
  - Schüler können Avatar in Profil-Customization anpassen (siehe [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]])

### Avatar-Bibliothek

#### Verfügbare Avatare
- **Vordefinierte Avatare:** Auswahl aus einer Bibliothek vordefinierter Avatare
- **Kein Upload:** Benutzer können keine eigenen Bilder hochladen
- **Kategorien:**
  - Standard-Avatare (verschiedene Stile)
  - Tier-Avatare
  - Charakter-Avatare
  - Abstrakte Designs
  - Weitere Kategorien nach Bedarf

#### Avatar-Auswahl
- **Interface:** Grid-Ansicht aller verfügbaren Avatare
- **Vorschau:** Klick auf Avatar zeigt Vorschau
- **Auswahl:** Avatar auswählen und speichern
- **Standard:** Zufälliger Avatar wird bei Registrierung zugewiesen
- **Änderung:** Avatar kann jederzeit geändert werden

#### Avatar-Anpassung (Schüler)
- **Rahmen & Hintergründe:** Schüler können Avatar-Rahmen und -Hintergründe im T!Coins-Shop kaufen
- **Customization:** Siehe [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] für Details
- **Basis-Avatar:** Basis-Avatar bleibt aus Bibliothek, kann aber mit Rahmen/Hintergründen erweitert werden

### Profil-Sichtbarkeit

#### Öffentliches Profil (Schüler)
- **Sichtbarkeit:** Standardmäßig öffentlich
- **Optionen:**
  - **Öffentlich:** Alle können Profil sehen
  - **Nur Klasse:** Nur Klassenmitglieder können Profil sehen
  - **Privat:** Nur Freunde können Profil sehen (optional)
- **Profil-Customization:** Siehe [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] für Shop und Anpassungen

#### Lehrer-Profil
- **Sichtbarkeit:** Standardmäßig nur für Schule sichtbar
- **Optionen:**
  - **Nur Schule:** Nur Lehrkräfte der eigenen Schule
  - **Öffentlich:** Alle können Profil sehen (optional)

## T!Coins-Verwaltung (Schüler)

### T!Coins-Anzeige

**Wichtig:** T!Coins werden in zwei Kategorien angezeigt:

#### 1. Gesammelte T!Coins (für T!Score)
- **Anzeige:** Alle verdienten T!Coins seit Account-Erstellung
- **Zweck:** Diese T!Coins zählen für T!Score-Berechnung
- **Wichtig:** **T!Coins-Ausgaben im Shop beeinflussen T!Score NICHT**
- **Berechnung:** T!Score basiert auf gesammelten T!Coins, nicht auf verfügbaren T!Coins
- **Anzeige:** "Gesammelt: 150 T!Coins" (immer steigend)
- **Siehe:** [[01_Features/GLOSSARY|Glossar]] für T!Coins-Definition

#### 2. Verfügbare T!Coins (für Shop)
- **Anzeige:** Aktuell verfügbare T!Coins für Shop-Käufe
- **Berechnung:** Gesammelte T!Coins - Ausgaben im Shop
- **Zweck:** Diese T!Coins können im T!Coins-Shop ausgegeben werden
- **Anzeige:** "Verfügbar: 120 T!Coins" (kann sinken durch Käufe)
- **Siehe:** [[01_Features/GLOSSARY|Glossar]] für T!Coins-Definition

### T!Coins-Transaktionen

#### Transaktions-Historie
- **Übersicht:** Alle T!Coins-Transaktionen
- **Kategorien:**
  - **Verdient:** Lektionen, Projekte, Challenges, etc.
  - **Ausgegeben:** Shop-Käufe
- **Filter:** Nach Kategorie, Datum, Betrag
- **Details:** Datum, Betrag, Beschreibung, Kategorie

#### T!Coins-Statistiken
- **Gesamt gesammelt:** Alle verdienten T!Coins (für T!Score)
- **Gesamt ausgegeben:** Alle im Shop ausgegebenen T!Coins
- **Aktuell verfügbar:** Verfügbare T!Coins für Shop
- **Verdienstquellen:** Übersicht, wie T!Coins verdient wurden

### T!Coins-Shop (Schüler)

Siehe [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] für Details zum Shop.

**Wichtig:** 
- Shop-Käufe reduzieren nur die **verfügbaren T!Coins**
- **Gesammelte T!Coins bleiben unverändert** (für T!Score-Berechnung)
- T!Score wird **nicht** durch Shop-Ausgaben beeinflusst

## Benachrichtigungs-Einstellungen

### Micromessaging Opt-in/Opt-out (Lehrer)

#### E-Mail-Benachrichtigungen
- **Opt-in/Opt-out:** Lehrer können Micromessaging-E-Mails aktivieren/deaktivieren
- **Kategorien:**
  - Onboarding & Registrierung
  - Schulverbindung
  - Engagement & Erfolge
  - System-Updates
- **Granularität:** Pro Kategorie aktivieren/deaktivieren
- **Standard:** Opt-in (aktiviert)

#### In-App-Benachrichtigungen
- **Opt-in/Opt-out:** Lehrer können In-App-Benachrichtigungen aktivieren/deaktivieren
- **Kategorien:** Gleiche wie E-Mail
- **Standard:** Opt-in (aktiviert)

### Allgemeine Benachrichtigungen

#### E-Mail-Benachrichtigungen
- **Neue Nachrichten:** Benachrichtigung bei neuen Chat-Nachrichten
- **Projekt-Feedback:** Benachrichtigung bei neuem Lehrer-Feedback
- **Challenge-Updates:** Benachrichtigung bei Challenge-Änderungen
- **System-Updates:** Wichtige Plattform-Updates

#### Push-Benachrichtigungen (optional)
- **Browser-Push:** Push-Benachrichtigungen im Browser
- **Mobile-Push:** Push-Benachrichtigungen in Mobile-App (falls verfügbar)

#### In-App-Benachrichtigungen
- **Benachrichtigungszentrale:** Alle In-App-Benachrichtigungen
- **Kategorien:** Nachrichten, Projekte, Challenges, Kurse, Achievements, System

## Datenschutz-Einstellungen

### Datenschutz-Präferenzen

#### Profil-Sichtbarkeit
- **Öffentlich/Privat:** Siehe "Profil-Sichtbarkeit" oben
- **Daten-Freigabe:** Welche Daten werden geteilt?

#### Daten-Export
- **Daten exportieren:** Benutzer können alle persönlichen Daten exportieren
- **Format:** JSON oder PDF
- **Inhalt:** Profil-Daten, Projekte, Statistiken, Nachrichten

#### Daten-Löschung
- **Account löschen:** Benutzer können Account löschen
- **Bestätigung:** Mehrstufiger Bestätigungsprozess
- **Warnung:** Alle Daten werden unwiderruflich gelöscht
- **Frist:** 30 Tage Wartezeit (Account wird deaktiviert, kann innerhalb 30 Tagen wiederhergestellt werden)

### DSGVO-Rechte

#### Recht auf Auskunft
- **Daten-Anzeige:** Alle gespeicherten Daten anzeigen
- **Zweck:** Transparenz über Datenverwendung

#### Recht auf Berichtigung
- **Daten bearbeiten:** Persönliche Daten korrigieren
- **Profil-Bearbeitung:** Siehe "Profil-Bearbeitung" oben

#### Recht auf Löschung
- **Account löschen:** Siehe "Daten-Löschung" oben

#### Recht auf Datenübertragbarkeit
- **Daten exportieren:** Siehe "Daten-Export" oben

## Passwort-Verwaltung

### Passwort ändern

#### Lehrer
- **Zugriff:** "Passwort ändern" in Einstellungen
- **Prozess:**
  1. Aktuelles Passwort eingeben
  2. Neues Passwort eingeben
  3. Neues Passwort bestätigen
  4. Passwort ändern
- **Anforderungen:**
  - Mindestens 8 Zeichen
  - Mindestens 1 Großbuchstabe
  - Mindestens 1 Kleinbuchstabe
  - Mindestens 1 Zahl
  - Mindestens 1 Sonderzeichen

#### Schüler
- **Passwort-Reset:** Wird von Lehrer im Teacher Dashboard durchgeführt
- **Schüler kann Passwort nicht selbst ändern**

### Passwort vergessen

Siehe [[01_Features/Auth/Password_Reset|Password Reset]] für Details.

## Einstellungen nach Rolle

### Lehrer-Einstellungen
- Profil-Bearbeitung (Name, E-Mail, Telefon, Avatar)
- Avatar aus Bibliothek erstellt
- Micromessaging Opt-in/Opt-out
- Benachrichtigungs-Einstellungen
- Datenschutz-Einstellungen
- Passwort ändern

### Schüler-Einstellungen
- Avatar aus Bibliothek erstellt
- Profil-Sichtbarkeit
- T!Coins-Verwaltung (Anzeige, Transaktionen)
- Benachrichtigungs-Einstellungen
- Datenschutz-Einstellungen
- Profil-Customization (Shop, Anpassungen)

## Integration

### Verknüpfte Features
- [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] - Shop und Profil-Anpassungen
- [[01_Features/Dashboard/Micromessaging_System|Micromessaging System]] - Automatisierte Nachrichten
- [[01_Features/Dashboard/Messaging_System|Messaging System]] - Chat-Benachrichtigungen
- [[00_Blueprint/Gamification_System|Gamification System]] - T!Coins und T!Score

> [!tip] Implementation Hint
> - T!Coins-Ausgaben im Shop reduzieren nur verfügbare T!Coins, nicht gesammelte T!Coins
> - T!Score-Berechnung basiert auf gesammelten T!Coins (unabhängig von Shop-Ausgaben)
> - Implementiere separate Tracking für gesammelte vs. verfügbare T!Coins
> - Micromessaging Opt-in/Opt-out sollte pro Kategorie speicherbar sein
> - Datenschutz-Einstellungen müssen DSGVO-konform sein