---
title: Teacher Onboarding - Lehrer-Registrierung & Schulverbindung
description: User Journey für Lehrer-Registrierung, Schulauswahl und Schulverbindung
enableToc: true
tags:
  - features
  - auth
  - onboarding
  - teacher
---

# 🎓 Teacher Onboarding - Lehrer-Registrierung & Schulverbindung

> [!abstract] User Story
> Als Lehrer möchte ich mich registrieren, meine Schule finden oder eine neue Schule anlegen, und mich mit meiner Schule verbinden.

## Verwandte Features

- **Register:** [[01_Features/Auth/Register|Register]] - Registrierung vor Onboarding
- **Login:** [[01_Features/Auth/Login|Login]] - Anmeldung nach Onboarding
- **Admin School Management:** [[01_Features/Dashboard/Admin/School_Management|Admin School Management]] - Schul-Freischaltung
- **Teacher Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Nach erfolgreichem Onboarding

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell
- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell

## Übersicht

Das Teacher Onboarding führt neue Lehrer durch den Registrierungs- und Schulverbindungsprozess. Lehrer können bestehende Schulen durchsuchen, auf Wartelisten eintragen, Einladungscodes verwenden oder neue Schulen anlegen.

## User Flow: Schulauswahl & Verbindung

### 1. Schule auswählen

#### Zugriff
- Nach erfolgreicher Registrierung und E-Mail-Bestätigung
- Automatische Weiterleitung zur Schulauswahl
- Oder manueller Zugriff über "Schule auswählen" Link

#### Interface: "Schule auswählen"

**Header:**
- **Titel:** "Schule auswählen"
- **Beschreibung:** "Wählen Sie Ihre Schule aus der Liste aus oder fügen Sie eine neue hinzu, falls sie nicht angezeigt wird."

**Such-Interface (weiße Karte):**
- **Bundesland auswählen:**
  - Dropdown-Menü
  - Platzhalter: "Bundesland auswählen"
  - Alle österreichischen Bundesländer verfügbar
  - Filtert Schulen nach Bundesland

- **Schulform auswählen:**
  - Dropdown-Menü
  - Platzhalter: "Schulform auswählen"
  - Optionen: AHS, NMS, VS, etc.
  - Filtert Schulen nach Schulform

- **Name der Schule:**
  - Text-Eingabefeld
  - Platzhalter: "Tippen Sie die Anfangsbuchstaben ein, um nach Ihrer Schule zu suchen"
  - Lupe-Icon rechts (Suchfunktion)
  - **Funktionalität:**
    - Live-Suche während Tippen
    - Autocomplete-Vorschläge
    - Filtert nach eingegebenen Buchstaben
    - Kombiniert mit Bundesland- und Schulform-Filter

**Ergebnisse:**
- Liste der gefundenen Schulen
- Anzeige: Schulname, Adresse, Schulform
- Klick auf Schule öffnet Verbindungs-Dialog

**Alternative Option (orange-bordierte Sektion):**
- **Warnung:** "Ist Ihre Schule nicht in der Liste?"
- **Button:** "+ Neue Schule anlegen" (rot)
- Führt zu "Neue Schule anlegen" Formular

### 2. Verbindung mit Schule

#### Interface: "Verbindung mit Schule"

**Header:**
- **Titel:** "Verbindung mit Schule" (mit Gebäude-Icon)
- **Schul-Informationen:**
  - **Schulname:** z.B. "AHS Theodor Kramer"
  - **Adresse:** z.B. "Theodor Kramer Straße 3, 1220 Wien"
  - **Verwaltet durch:** z.B. "Verwaltet durch: Simone Füreder"

**Option 1: Auf Warteliste eintragen**

**Sektion:** "Sie haben keinen Einladungscode?"
- **Text:** "Sobald Sie auf der Warteliste stehen, wird eine bereits verifizierte Lehrkraft Ihre Anmeldung prüfen und freischalten."
- **Button:** "Auf Warteliste eintragen" (rot, prominent)
- **Funktionalität:**
  - Lehrer wird auf Warteliste der Schule gesetzt
  - Status: "Auf Warteliste"
  - Benachrichtigung an Schul-Admin
  - Lehrer erhält Bestätigungs-E-Mail

**Option 2: Einladungscode verwenden**

**Sektion:** "Sie haben einen Einladungscode?"
- **Text:** "Sie haben bereits einen Einladungscode bekommen. Tragen Sie diesen ein und Sie werden als Lehrkraft für diese Schule sofort freigeschaltet."
- **Eingabefeld:** 
  - Platzhalter: "Einladungscode hier eingeben"
  - Text-Eingabefeld
- **Button:** "Absenden" (blau)
- **Funktionalität:**
  - Code wird validiert
  - Bei gültigem Code: Sofortige Freischaltung
  - Lehrer wird direkt mit Schule verbunden
  - Status: "Aktiv"

**Alternative Option:**
- **Link:** "Doch nicht Ihre Schule? Neue Schule anlegen"
- Führt zurück zu Schulauswahl oder "Neue Schule anlegen"

**Info-Box (gelb, unten):**
- **Icon:** Häkchen
- **Titel:** "Warum diese Verifizierung?"
- **Text:** "Diese Maßnahme verhindert, dass schulfremde Personen oder versehentlich registrierte Schüler:innen als Lehrkraft mit einer Schule verbunden werden."
- **Zweck:** Erklärt den Verifizierungsprozess

### 3. Neue Schule anlegen

#### Interface: "Neue Schule anlegen"

**Header:**
- **Titel:** "Schule auswählen"
- **Beschreibung:** "Wählen Sie Ihre Schule aus der Liste aus oder fügen Sie eine neue hinzu, falls sie nicht angezeigt wird."

**Action Buttons:**
- **Links:** "Sich doch mit einer Schule verbinden?" (blau)
  - Führt zurück zur Schulauswahl
- **Rechts:** "Zurück zur Schulauswahl" (blau)
  - Führt zurück zur Schulauswahl

**Formular: "Neue Schule anlegen"**

**Anleitung:**
- "Bitte füllen Sie die folgenden Informationen aus. * Pflichtfeld"

**Sektion 1: Schuldaten**

- **Schulbezeichnung ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. Akademisches Gymnasium Wien"
  - **Hilfetext:** "Offizielle Schulbezeichnung inkl. Schulart, falls vorhanden."
  - **Pflichtfeld:** Ja

- **Schulart ***
  - Dropdown-Menü
  - Optionen: 
    - "Allgemeinbildende höhere Schule (AHS)"
    - "Neue Mittelschule (NMS)"
    - "Volksschule (VS)"
    - Weitere Schularten
  - **Pflichtfeld:** Ja

- **SKZ (Schulkennzahl) ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. 923456"
  - **Hilfetext:** "Österreichische Schulkennzahl, falls vorhanden."
  - **Pflichtfeld:** Ja
  - **Validierung:** Format-Prüfung für österreichische SKZ

- **Privatschule**
  - Checkbox
  - **Hilfetext:** "Markieren Sie diese Option, wenn es sich um eine Privatschule handelt."
  - **Optional**

**Sektion 2: Adresse**

- **Straße und Hausnummer ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. Teststraße 128"
  - **Pflichtfeld:** Ja

- **PLZ ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. 1140"
  - **Pflichtfeld:** Ja
  - **Validierung:** Österreichische PLZ-Format

- **Ort ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. Wien"
  - **Pflichtfeld:** Ja

- **Bundesland ***
  - Dropdown-Menü
  - Optionen: Alle österreichischen Bundesländer
  - Aktuell: "Wien" (Beispiel)
  - **Pflichtfeld:** Ja

**Sektion 3: Demografische Daten**

- **Geschätzter Anteil der Kinder an Ihrer Schule, die Deutsch nicht als Muttersprache haben (in %) ***
  - **Slider-Control:** Horizontaler Slider
  - **Aktueller Wert:** "0 %" (Beispiel)
  - **Bereich:** 0-100%
  - **Hilfetext:** "Die Angabe wird ausschließlich in aggregierter Form für unseren Wirkungsbericht verwendet und nicht schulspezifisch veröffentlicht."
  - **Pflichtfeld:** Ja
  - **Datenschutz:** Hinweis auf aggregierte Verwendung

**Sektion 4: Umfang**

- **Geschätzte Anzahl der teilnehmenden Klassen ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. 3"
  - **Pflichtfeld:** Ja
  - **Validierung:** Nur Zahlen, Minimum 1

- **Geschätzte Anzahl der teilnehmenden Lehrkräfte ***
  - Text-Eingabefeld
  - Platzhalter: "z. B. 2"
  - **Pflichtfeld:** Ja
  - **Validierung:** Nur Zahlen, Minimum 1

**Sektion 5: Anmerkung**

- **Anmerkung**
  - Textarea (mehrzeilig)
  - Platzhalter: "z. B. Wir starten im Oktober mit zwei 1. Klassen."
  - **Optional**
  - **Zweck:** Zusätzliche Informationen für Admin

**Submit-Button:**
- **"Anlegen"** (rot, prominent)
- **Funktionalität:**
  - Validiert alle Pflichtfelder
  - Erstellt neue Schule
  - Verbindet Lehrer automatisch mit neuer Schule
  - Status: "Wartet auf Admin-Freigabe"
  - Benachrichtigung an Admin
  - Bestätigungs-E-Mail an Lehrer

## Workflow-Übersicht

### Szenario 1: Schule existiert bereits

```
1. Lehrer sucht nach Schule
   ↓
2. Schule wird gefunden
   ↓
3. Lehrer klickt auf Schule
   ↓
4. Verbindungs-Dialog öffnet sich
   ↓
5a. Lehrer hat Einladungscode
   → Code eingeben → Sofortige Freischaltung
   
5b. Lehrer hat keinen Code
   → Auf Warteliste eintragen → Wartet auf Freigabe
```

### Szenario 2: Schule existiert nicht

```
1. Lehrer sucht nach Schule
   ↓
2. Schule wird nicht gefunden
   ↓
3. Lehrer klickt "+ Neue Schule anlegen"
   ↓
4. Formular öffnet sich
   ↓
5. Lehrer füllt Formular aus
   ↓
6. Lehrer klickt "Anlegen"
   ↓
7. Schule wird erstellt
   ↓
8. Lehrer wird automatisch verbunden
   ↓
9. Status: "Wartet auf Admin-Freigabe"
```

## Status & Freigabe

### Status-Typen

#### 1. Auf Warteliste
- **Trigger:** Lehrer trägt sich auf Warteliste ein
- **Aktion erforderlich:** Schul-Admin muss freigeben
- **Benachrichtigung:** Schul-Admin wird benachrichtigt
- **Nächster Schritt:** Admin-Freigabe

#### 2. Wartet auf Admin-Freigabe
- **Trigger:** Neue Schule wurde angelegt
- **Aktion erforderlich:** Admin muss Schule freigeben
- **Benachrichtigung:** Admin wird benachrichtigt
- **Nächster Schritt:** Admin-Freigabe
- **Förderung:** Admin kann bei Freischaltung einen saisonalen Förderer zuweisen (z.B. für Gratis-Lizenzen)

#### 3. Aktiv
- **Trigger:** 
  - Gültiger Einladungscode wurde eingegeben
  - Admin hat Schule/Lehrer freigegeben
- **Status:** Lehrer kann Plattform nutzen
- **Nächster Schritt:** Info-Webinar buchen (optional)

## Einladungscode-System

### Code-Generierung
- **Wer kann Codes generieren:** Schul-Admins (verifizierte Lehrkräfte)
- **Code-Format:** Alphanumerisch, z.B. "ABC123XYZ"
- **Gültigkeit:** Unbegrenzt oder zeitlich begrenzt (konfigurierbar)
- **Verwendung:** Einmalig pro Code

### Code-Verwaltung
- **Schul-Admin kann:**
  - Neue Codes generieren
  - Codes anzeigen
  - Codes deaktivieren
  - Codes löschen
  - Code-Statistiken ansehen

### Code-Versendung
- **E-Mail:** Codes können per E-Mail versendet werden
- **Manuell:** Codes können manuell geteilt werden
- **Tracking:** Code-Verwendung wird getrackt

## Warteliste-System

### Warteliste-Verwaltung

#### Schul-Admin-Ansicht
- **Warteliste anzeigen:** Alle wartenden Lehrer sehen
- **Details:** Name, E-Mail, Registrierungsdatum
- **Aktionen:**
  - **Freigeben:** Lehrer wird freigeschaltet
  - **Ablehnen:** Lehrer wird abgelehnt (mit Grund)
  - **Details anzeigen:** Weitere Informationen

#### Lehrer-Ansicht
- **Status:** "Auf Warteliste"
- **Information:** "Eine verifizierte Lehrkraft prüft Ihre Anmeldung"
- **Benachrichtigung:** Wird benachrichtigt bei Freigabe/Ablehnung

## Validierung & Fehlerbehandlung

### Formular-Validierung

#### Client-Side
- **Pflichtfelder:** Werden beim Absenden geprüft
- **Format-Prüfung:** PLZ, SKZ werden formatiert geprüft
- **Live-Validierung:** Fehler werden sofort angezeigt

#### Server-Side
- **Duplikat-Prüfung:** Prüft ob Schule bereits existiert
- **SKZ-Validierung:** Prüft SKZ-Format und Eindeutigkeit
- **Daten-Integrität:** Prüft alle Daten auf Konsistenz

### Fehlerbehandlung
- **Fehlermeldungen:** Klare, verständliche Fehlermeldungen
- **Hilfe-Texte:** Kontextbezogene Hilfe-Texte
- **Retry-Mechanismus:** Möglichkeit zum erneuten Versuch

## Integration

### Micromessaging-Integration
- **Nachrichten:** Automatische Nachrichten basierend auf Status
- **Beispiele:**
  - "Auf Warteliste" → Benachrichtigung an Schul-Admin
  - "Schule erstellt" → Bestätigung an Lehrer
  - "Freigeschaltet" → Willkommensnachricht

### Admin-Dashboard-Integration
- **Neue Schulen:** Erscheinen im Admin-Dashboard
- **Wartelisten:** Erscheinen im Admin-Dashboard
- **Freigabe:** Kann direkt aus Admin-Dashboard erfolgen

## Datenschutz & Sicherheit

### Datenschutz
- **Minimale Daten:** Nur notwendige Daten werden abgefragt
- **Aggregierte Daten:** Demografische Daten werden aggregiert verwendet
- **Transparenz:** Klare Hinweise zur Datenverwendung

### Sicherheit
- **Verifizierung:** Verhindert unbefugten Zugriff
- **Code-Sicherheit:** Codes sind sicher generiert
- **Rate-Limiting:** Schutz vor Missbrauch

> [!tip] Implementation Hint
> - Implementiere Autocomplete für Schulsuche
> - Verwende Debouncing für Live-Suche
> - Implementiere Duplikat-Erkennung für Schulen
> - Verwende Queue-System für Admin-Benachrichtigungen
> - Implementiere Code-Generierung mit Kryptographie
> - Logge alle Aktionen für Audit-Zwecke
