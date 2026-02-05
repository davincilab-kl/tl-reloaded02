---
title: Admin Status Emails - Status-E-Mail-Verwaltung
description: Automatische Status-E-Mails verwalten
enableToc: true
tags:
  - features
  - admin
  - emails
---

# 📧 Admin Status Emails - Status-E-Mail-Verwaltung

> [!abstract] User Story
> Als Admin möchte ich automatische Status-E-Mails konfigurieren und überwachen.

## Verwandte Features

- **School Management:** [[01_Features/Dashboard/Admin/School_Management|School Management]] - Schule-Status-Änderungen
- **Teacher Management:** [[01_Features/Dashboard/Admin/Teacher_Management|Teacher Management]] - Lehrkraft-Status-Änderungen
- **Password Reset:** [[01_Features/Auth/Password_Reset|Password Reset]] - Passwort-Reset-E-Mails

## Data Models

- **School Model:** [[03_Data_Models/School|School Model]] - Schul-Datenmodell mit Status
- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell
- **Notification Model:** [[03_Data_Models/Notification|Notification Model]] - Benachrichtigungs-Datenmodell

## Übersicht

Die Status-E-Mail-Verwaltung ermöglicht es Admins, automatische E-Mails zu konfigurieren, die bei Statusänderungen von Lehrkräften und Schulen versendet werden.

## Automatische E-Mail-Versendung

### Status-Änderungen (Trigger)

#### Schule-Status
- **Schule freigeschaltet:**
  - Trigger: Admin schaltet Schule frei
  - Empfänger: Alle wartenden Lehrkräfte der Schule
  - Inhalt: Willkommensnachricht, nächste Schritte
- **Förderer zugewiesen:**
  - Trigger: Admin weist Förderer zu
  - Empfänger: Schul-Admin
  - Inhalt: Förderer-Informationen, Gratis-Lizenzen

#### Lehrkraft-Status
- **Lehrkraft freigeschaltet:**
  - Trigger: Admin oder Schul-Admin schaltet Lehrkraft frei
  - Empfänger: Lehrkraft
  - Inhalt: Willkommensnachricht, nächste Schritte
- **Passwort zurückgesetzt:**
  - Trigger: Admin setzt Passwort zurück
  - Empfänger: Lehrkraft
  - Inhalt: Neues Passwort, Sicherheitshinweise
- **E-Mail geändert:**
  - Trigger: Admin ändert E-Mail
  - Empfänger: Neue E-Mail-Adresse
  - Inhalt: Bestätigungs-Link

#### Challenge-Status
- **Neue Challenge verfügbar:**
  - Trigger: Admin aktiviert neue Challenge
  - Empfänger: Alle betroffenen Schulen/Lehrkräfte
  - Inhalt: Challenge-Details, Deadline, Teilnahmebedingungen
- **Challenge-Deadline naht:**
  - Trigger: 7 Tage vor Deadline
  - Empfänger: Alle Teilnehmer
  - Inhalt: Erinnerung, verbleibende Zeit

## E-Mail-Konfiguration

### E-Mail-Templates

#### Template-Verwaltung
- **Templates anzeigen:** Alle verfügbaren E-Mail-Templates
- **Template bearbeiten:** Inhalt und Formatierung anpassen
- **Template-Variablen:** Dynamische Variablen (z.B. `{teacher_name}`, `{school_name}`)
- **Vorschau:** Template mit Beispiel-Daten anzeigen

#### Template-Kategorien
- **Willkommensnachrichten:** Für neue Schulen/Lehrkräfte
- **Status-Änderungen:** Bei Freischaltung, etc.
- **Erinnerungen:** Bei Deadlines, etc.
- **Benachrichtigungen:** Bei wichtigen Änderungen

### E-Mail-Einstellungen

#### Versendungs-Optionen
- **Sofort:** E-Mail wird sofort versendet
- **Verzögert:** E-Mail wird nach X Minuten/Stunden versendet
- **Gebündelt:** Mehrere E-Mails werden gebündelt versendet (z.B. täglich)

#### E-Mail-Format
- **HTML:** Rich HTML-Formatierung
- **Plain Text:** Einfacher Text
- **Beide:** HTML + Plain Text Fallback

### E-Mail-Überwachung

#### Versendungs-Status
- **Gesendet:** E-Mail wurde erfolgreich versendet
- **Fehlgeschlagen:** E-Mail konnte nicht versendet werden
- **Ausstehend:** E-Mail wartet auf Versendung
- **Gebündelt:** E-Mail wartet auf Bündelung

#### E-Mail-Logs
- **Versendungs-Historie:** Alle versendeten E-Mails
- **Details:** Empfänger, Betreff, Status, Zeitstempel
- **Fehler-Logs:** Fehlgeschlagene Versendungen mit Fehlermeldung
- **Retry:** Fehlgeschlagene E-Mails erneut versenden

## E-Mail-Konfiguration pro Status

### Schule freigeschaltet
- **Aktiv:** ✅ Standardmäßig aktiviert
- **Template:** "Schule freigeschaltet - Willkommensnachricht"
- **Empfänger:** Alle wartenden Lehrkräfte der Schule
- **Inhalt:**
  - Willkommensnachricht
  - Nächste Schritte
  - Link zur Plattform

### Förderer zugewiesen
- **Aktiv:** ✅ Standardmäßig aktiviert
- **Template:** "Förderer zugewiesen - Informationsnachricht"
- **Empfänger:** Schul-Admin
- **Inhalt:**
  - Förderer-Informationen
  - Gratis-Lizenzen (falls vorhanden)
  - Kontakt-Informationen

### Lehrkraft freigeschaltet
- **Aktiv:** ✅ Standardmäßig aktiviert
- **Template:** "Lehrkraft freigeschaltet - Willkommensnachricht"
- **Empfänger:** Lehrkraft
- **Inhalt:**
  - Willkommensnachricht
  - Nächste Schritte (Klasse anlegen, etc.)
  - Link zur Plattform

### Passwort zurückgesetzt
- **Aktiv:** ✅ Standardmäßig aktiviert
- **Template:** "Passwort zurückgesetzt - Sicherheitsnachricht"
- **Empfänger:** Lehrkraft
- **Inhalt:**
  - Neues Passwort (temporär)
  - Sicherheitshinweise
  - Link zur Passwort-Änderung

## Integration

### Micromessaging-Integration
- **Zusammenhang:** Status-E-Mails sind Teil des Micromessaging-Systems
- **Unterschied:** Status-E-Mails sind system-generiert, Micromessaging ist regelbasiert
- Siehe [[01_Features/Dashboard/Micromessaging_System|Micromessaging System]] für Details

### Admin-Dashboard-Integration
- **E-Mail-Status:** Wird im Admin-Dashboard angezeigt
- **Fehler-Benachrichtigung:** Admin wird bei fehlgeschlagenen E-Mails benachrichtigt

> [!tip] Implementation Hint
> - Verwende Queue-System für zuverlässige E-Mail-Versendung
> - Implementiere Retry-Mechanismus für fehlgeschlagene E-Mails
> - Verwende Template-Engine für Variablen-Ersetzung
> - Logge alle E-Mails für Audit-Zwecke
> - Implementiere Rate-Limiting für Spam-Schutz
