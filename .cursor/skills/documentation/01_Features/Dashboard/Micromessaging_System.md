---
title: Micromessaging System - Automatisierte Nachrichten
description: Intelligentes System für automatisierte, kontextbezogene Nachrichten zur Lehrer-Führung
enableToc: true
tags:
  - features
  - teacher
  - messaging
  - automation
---

# 📨 Micromessaging System - Automatisierte Nachrichten

> [!abstract] User Story
> Als Admin möchte ich ein flexibles System für automatisierte, kontextbezogene Nachrichten erstellen, die Lehrer durch den Onboarding- und Nutzungsprozess führen - kreativ, aber vollständig verwaltbar.

## Verwandte Features

- **Messaging System:** [[01_Features/Dashboard/Messaging_System|Messaging System]] - Direkte Chat-Kommunikation (separates System)
- **Teacher Onboarding:** [[01_Features/Auth/Teacher_Onboarding|Teacher Onboarding]] - Onboarding-Nachrichten
- **Status Emails:** [[01_Features/Dashboard/Admin/Status_Emails|Status Emails]] - E-Mail-Konfiguration

## Data Models

- **Notification Model:** [[03_Data_Models/Notification|Notification Model]] - Benachrichtigungs-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell

## Übersicht

Das Micromessaging-System ist ein intelligentes, regelbasiertes System für automatisierte Nachrichten. Es ermöglicht kreative, kontextbezogene Kommunikation, während alle Nachrichten zentral verwaltet werden können.

**Hinweis:** Dieses System ist **getrennt** vom [[01_Features/Dashboard/Messaging_System|Messaging-System]]. Das Messaging-System ermöglicht direkte Chat-Kommunikation zwischen Benutzern, während dieses System automatisierte, regelbasierte Nachrichten für Lehrer-Onboarding und Engagement sendet.

## Kern-Prinzipien

### 1. Regelbasiert statt Template-basiert
- **Regeln definieren:** Statt feste Templates zu verwenden, werden Regeln definiert
- **Kreative Variationen:** System kann verschiedene Nachrichten-Varianten generieren
- **Kontextbezogen:** Nachrichten passen sich dem Kontext an

### 2. Vollständige Verwaltbarkeit
- **Zentrale Verwaltung:** Alle Nachrichten-Regeln an einem Ort
- **Aktiv/Inaktiv:** Jede Regel kann aktiviert/deaktiviert werden
- **Statistiken:** Tracking für alle Nachrichten
- **A/B Testing:** Verschiedene Varianten testen

### 3. Intelligente Trigger
- **Event-basiert:** Nachrichten basieren auf Events (Actions)
- **Step-basiert:** Nachrichten basieren auf Onboarding-Steps
- **Zeitbasiert:** Nachrichten basieren auf Zeit-Intervallen
- **Kombiniert:** Mehrere Trigger können kombiniert werden

## Nachrichten-Typen

### 1. E-Mail (📧 Email)
- Standard-E-Mail-Benachrichtigungen
- Rich HTML-Formatierung möglich
- Template-Variablen für Personalisierung

### 2. In-App (🔔 In-App)
- Benachrichtigungen innerhalb der Plattform
- Erscheinen in Benachrichtigungszentrale
- Push-Benachrichtigungen möglich

### 3. Both (📧🔔 Both)
- Kombination aus E-Mail und In-App
- Unterschiedliche Inhalte pro Kanal möglich

## Regel-System

### Regel-Struktur

Jede Regel besteht aus:

#### 1. Trigger
- **Event:** Welches Event löst die Nachricht aus?
- **Step:** In welchem Onboarding-Step?
- **Bedingung:** Zusätzliche Bedingungen (z.B. "nur wenn keine Klasse erstellt")

#### 2. Timing
- **Immediate:** Sofortige Versendung
- **Delayed:** Verzögerte Versendung (X Minuten/Stunden/Tage)
- **Recurring:** Wiederholende Versendung (Every X days)
- **Max Sends:** Maximale Anzahl der Versendungen

#### 3. Inhalt
- **Template:** Basis-Template für Nachricht
- **Variablen:** Dynamische Variablen (z.B. `{school_name}`)
- **Variationen:** Mehrere Varianten für A/B Testing
- **Personalization:** Personalisierte Inhalte basierend auf Daten

#### 4. Zielgruppe
- **Target:** Wer soll die Nachricht erhalten?
- **Filter:** Zusätzliche Filter (z.B. "nur aktive Lehrer")
- **Segmentierung:** Verschiedene Segmente (z.B. "neue Lehrer", "erfahrene Lehrer")

## Verwaltungs-Interface

### Regel-Übersicht

Die Verwaltung erfolgt über eine flexible Tabelle mit folgenden Spalten:

#### Spalten
1. **Name:** Name der Regel (z.B. "Registrierung bestätigen - Erinnerung 1")
2. **Trigger:** Event oder Step, der die Regel auslöst
3. **Type:** Nachrichten-Typ (📧 Email, 🔔 In-App, 📧🔔 Both)
4. **Timing:** Zeit-Intervall und Bedingungen
5. **Status:** Active/Inactive
6. **Statistics:** 
   - Total: Gesamtanzahl gesendeter Nachrichten
   - Today: Heute gesendet
   - Success Rate: Erfolgsrate
   - Engagement: Öffnungsrate/Klickrate
7. **Actions:** 
   - Edit: Regel bearbeiten
   - Duplicate: Regel duplizieren
   - Activate/Deactivate: Regel aktivieren/deaktivieren
   - Delete: Regel löschen
   - Test: Test-Nachricht senden

### Regel-Editor

#### Trigger-Konfiguration
- **Event auswählen:** Dropdown mit verfügbaren Events
- **Step auswählen:** Dropdown mit Onboarding-Steps
- **Bedingungen hinzufügen:** Zusätzliche Bedingungen definieren
- **Logik:** AND/OR-Logik für mehrere Bedingungen

#### Timing-Konfiguration
- **Timing-Typ:** Immediate, Delayed, Recurring
- **Intervall:** Zeit-Intervall (Minuten, Stunden, Tage)
- **Max Sends:** Maximale Anzahl der Versendungen
- **Cooldown:** Mindest-Abstand zwischen Nachrichten

#### Inhalt-Konfiguration
- **Template-Editor:** Rich Text Editor für Nachrichten-Inhalt
- **Variablen:** Verfügbare Variablen anzeigen und einfügen
- **Variationen:** Mehrere Varianten erstellen
- **Preview:** Vorschau der Nachricht mit Beispiel-Daten

#### Zielgruppe-Konfiguration
- **Target auswählen:** Wer soll die Nachricht erhalten?
- **Filter hinzufügen:** Zusätzliche Filter definieren
- **Segmentierung:** Verschiedene Segmente auswählen

## Kreative Features

### 1. Intelligente Variationen
- **Mehrere Varianten:** System kann verschiedene Varianten einer Nachricht generieren
- **Rotation:** Varianten werden rotiert, um Monotonie zu vermeiden
- **A/B Testing:** Verschiedene Varianten werden getestet
- **Best Performer:** Beste Variante wird automatisch bevorzugt

### 2. Personalisierung
- **Dynamische Inhalte:** Inhalte passen sich dem Benutzer an
- **Verhalten-basiert:** Nachrichten basieren auf Benutzer-Verhalten
- **Engagement-Level:** Verschiedene Nachrichten für verschiedene Engagement-Levels

### 3. Kontextbezogenheit
- **Schuljahr-bezogen:** Nachrichten passen sich dem Schuljahr an
- **Klassen-bezogen:** Nachrichten berücksichtigen Klassen-Kontext
- **Erfolgs-bezogen:** Nachrichten feiern Erfolge

### 4. Emoji & Visuals
- **Emoji-Integration:** Emojis für bessere Lesbarkeit
- **Rich Media:** Bilder, GIFs, Videos möglich
- **Branding:** Konsistentes Branding in allen Nachrichten

## Beispiel-Regeln (Inspiration)

### Onboarding & Registrierung

#### Regel: "E-Mail-Bestätigung - Erste Erinnerung"
- **Trigger:** Event: `email_not_confirmed`, Step: 1, Bedingung: "24 Stunden nach Registrierung"
- **Timing:** Delayed: 24 hours, Max Sends: 1
- **Type:** 📧 Email
- **Variationen:**
  - "Erinnerung: Bitte bestätigen Sie Ihre Registrierung auf der TalentsLounge"
  - "Fast geschafft! Bestätigen Sie noch Ihre E-Mail-Adresse"
  - "Ein letzter Schritt: E-Mail-Bestätigung ausstehend"
- **Personalization:** Name des Lehrers, Registrierungsdatum

#### Regel: "E-Mail-Bestätigung - Finale Warnung"
- **Trigger:** Event: `email_not_confirmed`, Step: 1, Bedingung: "14 Tage nach Registrierung"
- **Timing:** Delayed: 14 days, Max Sends: 1
- **Type:** 📧 Email
- **Variationen:**
  - "Wichtig: Ihr TalentsLounge-Account wird bald deaktiviert"
  - "Letzte Chance: Bestätigen Sie Ihre E-Mail innerhalb von 24 Stunden"
  - "Account-Löschung droht: Bitte bestätigen Sie jetzt"
- **Tone:** Dringender, aber freundlich

### Schulverbindung

#### Regel: "Schulverbindung - Sofortige Aufforderung"
- **Trigger:** Event: `school_not_connected`, Step: 2, Bedingung: "15 Minuten nach E-Mail-Bestätigung"
- **Timing:** Delayed: 15 minutes, Max Sends: 1
- **Type:** 📧 Email
- **Variationen:**
  - "🏫 Verbinden Sie sich jetzt mit Ihrer Schule auf der TalentsLounge"
  - "Schritt 2: Verbinden Sie sich mit Ihrer Schule"
  - "Fast da! Verbinden Sie sich jetzt mit Ihrer Schule"
- **CTA:** Direkter Link zur Schulverbindung

#### Regel: "Schulverbindung - Erinnerung"
- **Trigger:** Event: `school_not_connected`, Step: 2, Bedingung: "3 Tage nach letzter Erinnerung"
- **Timing:** Recurring: Every 3 days, Max Sends: 2
- **Type:** 📧 Email
- **Variationen:**
  - "Fehlt nur noch Ihre Schule bei TalentsLounge"
  - "Noch ein Schritt: Verbinden Sie sich mit Ihrer Schule"
  - "Ihre Schule wartet auf Sie"
- **Escalation:** Zweite Erinnerung ist dringender

### Engagement & Erfolge

#### Regel: "Erstes Projekt eingereicht"
- **Trigger:** Event: `first_project_submitted`, Step: 15
- **Timing:** Immediate, Max Sends: 1
- **Type:** 📧🔔 Both
- **Variationen:**
  - "Bitte überprüfen: Das erste Projekt wartet auf Freigabe! 📝"
  - "🎉 Erstes Projekt eingereicht! Bitte prüfen"
  - "Neues Projekt: [Projektname] wartet auf Ihre Freigabe"
- **Personalization:** Projektname, Schülername, Klasse

#### Regel: "Schüler mit 10+ T!Coins"
- **Trigger:** Event: `student_10_coins`, Step: 12
- **Timing:** Immediate, Max Sends: 1
- **Type:** 📧🔔 Both
- **Variationen:**
  - "Es regnet T!Coins bei deinen Schülern! 🪙"
  - "Sammelfieber ausgebrochen! 🪙"
  - "[Schülername] hat 10 T!Coins erreicht! 🎉"
- **Personalization:** Schülername, Anzahl T!Coins, Klasse

## Erweiterte Features

### 1. Regel-Templates
- **Vorgefertigte Regeln:** Häufig verwendete Regeln als Templates
- **Schnellstart:** Neue Regeln basierend auf Templates erstellen
- **Anpassbar:** Templates können angepasst werden

### 2. Regel-Gruppen
- **Gruppierung:** Ähnliche Regeln in Gruppen organisieren
- **Bulk-Actions:** Mehrere Regeln gleichzeitig aktivieren/deaktivieren
- **Gruppen-Statistiken:** Statistiken pro Gruppe

### 3. A/B Testing
- **Automatisches Testing:** System testet verschiedene Varianten
- **Metriken:** Erfolgsrate, Engagement, Conversion
- **Auto-Optimization:** Beste Variante wird automatisch bevorzugt

### 4. Analytics & Reporting
- **Nachrichten-Statistiken:** Detaillierte Statistiken pro Regel
- **Engagement-Metriken:** Öffnungsrate, Klickrate, Conversion
- **Trends:** Trends über Zeit
- **Reports:** Automatische Reports

### 5. Workflow-Integration
- **Onboarding-Steps:** Integration mit Onboarding-Workflow
- **Event-System:** Integration mit Event-System
- **User-Journey:** Nachrichten passen sich User-Journey an

## Template-Variablen

### Verfügbare Variablen
- `{teacher_name}` - Name des Lehrers
- `{school_name}` - Name der Schule
- `{class_name}` - Name der Klasse
- `{student_name}` - Name des Schülers
- `{project_name}` - Name des Projekts
- `{package_name}` - Name des Kurspakets
- `{coins}` - Anzahl T!Coins
- `{date}` - Aktuelles Datum
- `{deadline}` - Deadline (falls vorhanden)
- Weitere Variablen nach Bedarf

### Bedingte Variablen
- `{if_student_name}[Text]{/if_student_name}` - Nur anzeigen wenn Schülername vorhanden
- `{if_class_name}[Text]{/if_class_name}` - Nur anzeigen wenn Klassenname vorhanden
- Weitere bedingte Variablen möglich

## Best Practices

### 1. Timing
- **Nicht zu häufig:** Vermeide Spam
- **Relevante Zeiten:** Nachrichten zu passenden Zeiten senden
- **Cooldown:** Mindest-Abstand zwischen Nachrichten

### 2. Ton
- **Freundlich:** Immer freundlich und unterstützend
- **Motivierend:** Motivierend, nicht drängend
- **Klar:** Klare Handlungsaufforderungen

### 3. Personalisierung
- **Name verwenden:** Immer Namen verwenden
- **Kontext:** Kontextbezogene Informationen
- **Relevanz:** Nur relevante Informationen

### 4. Testing
- **Testen:** Immer testen vor Aktivierung
- **A/B Testing:** Verschiedene Varianten testen
- **Optimieren:** Basierend auf Daten optimieren

> [!tip] Implementation Hint
> - Verwende Event-Driven Architecture für Trigger
> - Implementiere Queue-System für zuverlässige Versendung
> - Verwende Template-Engine für Variablen-Ersetzung
> - Implementiere A/B Testing Framework
> - Logge alle Nachrichten für Analytics
> - Verwende Rate-Limiting für Spam-Schutz
