---
title: Email Templates Management
description: Verwaltung von E-Mail-Vorlagen
enableToc: true
tags:
  - features
  - admin
  - email
  - templates
---

# 📧 Email Templates Management

> [!abstract] User Story
> Als Admin möchte ich E-Mail-Vorlagen erstellen, bearbeiten und an verschiedene Empfänger-Gruppen senden.

## Verwandte Features

- **Status Emails:** [[01_Features/Dashboard/Admin/Status_Emails|Status Emails]] - Automatische Status-E-Mails

## Data Models

- **Email Template:** [[03_Data_Models/Email_Template|Email Template Model]] - E-Mail-Vorlagen-Datenmodell

## Übersicht

Das Email Templates System ermöglicht es Admins, E-Mail-Vorlagen zu erstellen, zu bearbeiten und an verschiedene Empfänger-Gruppen zu senden. Es unterstützt Platzhalter, HTML-Formatierung und geplante E-Mails.

## Hauptfunktionen

### 1. Vorlagen-Verwaltung

#### Vorlage erstellen
- **Name:** Eindeutiger Name der Vorlage
- **Betreff:** E-Mail-Betreff (mit Platzhaltern)
- **Nachricht:** E-Mail-Nachricht (mit Platzhaltern)
- **HTML-Format:** Optionale HTML-Formatierung

#### Vorlage bearbeiten
- **Bearbeitung:** Bestehende Vorlagen bearbeiten
- **Vorschau:** Vorschau der Vorlage
- **Löschen:** Vorlagen löschen

### 2. Platzhalter

#### Verfügbare Platzhalter
- `{{name}}` - Name des Empfängers
- `{{email}}` - E-Mail-Adresse
- `{{school}}` - Schulname
- `{{date}}` - Aktuelles Datum
- `{{status}}` - Aktueller Status
- `{{class_count}}` - Anzahl Klassen
- `{{student_count}}` - Anzahl Schüler

#### Platzhalter-Verwendung
```
Betreff: Willkommen bei TalentsLounge, {{name}}!

Nachricht:
Hallo {{name}},

Willkommen bei TalentsLounge! Ihre Schule {{school}} wurde erfolgreich registriert.

Mit freundlichen Grüßen
TalentsLounge Team
```

### 3. E-Mail-Versand

#### Empfänger-Typen
- **Alle Lehrkräfte:** Sendet an alle registrierten Lehrer
- **Alle Schulen:** Sendet an alle School Admins
- **Einzelne E-Mail:** Sendet an eine spezifische E-Mail-Adresse
- **Spezifische User-IDs:** Sendet an spezifische User-IDs (zum Testen)

#### Versand-Optionen
- **Sofort:** E-Mail wird sofort gesendet
- **Geplant:** E-Mail wird zu einem bestimmten Zeitpunkt gesendet
- **Batch-Processing:** E-Mails werden in Batches verarbeitet

## API Endpoints

### Vorlagen-Verwaltung

#### `GET /api/email/get_email_templates.php`
Holt alle E-Mail-Vorlagen.

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": 1,
      "name": "Willkommens-E-Mail",
      "subject": "Willkommen bei TalentsLounge, {{name}}!",
      "body": "Hallo {{name}},...",
      "is_html": true,
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00"
    }
  ]
}
```

#### `POST /api/email/save_email_template.php`
Speichert eine E-Mail-Vorlage (erstellt oder aktualisiert).

**Request Body:**
```json
{
  "id": 1,  // Optional: für Update
  "name": "Willkommens-E-Mail",
  "subject": "Willkommen bei TalentsLounge, {{name}}!",
  "body": "Hallo {{name}},\n\nWillkommen bei TalentsLounge!",
  "is_html": true
}
```

**Response:**
```json
{
  "success": true,
  "template": {
    "id": 1,
    "name": "Willkommens-E-Mail",
    "subject": "Willkommen bei TalentsLounge, {{name}}!",
    "body": "Hallo {{name}},\n\nWillkommen bei TalentsLounge!",
    "is_html": true
  }
}
```

#### `POST /api/email/save_email_template.php` (Löschen)
Löscht eine E-Mail-Vorlage.

**Request Body:**
```json
{
  "id": 1,
  "delete": true
}
```

### E-Mail-Versand

#### `POST /api/email/send_email_template.php`
Sendet eine E-Mail-Vorlage.

**Request Body:**
```json
{
  "template_id": 1,
  "recipient_type": "all_teachers",
  "custom_email": null,  // Optional: für "custom"
  "user_ids": null  // Optional: für "user_ids"
}
```

**Response:**
```json
{
  "success": true,
  "message": "E-Mails werden gesendet",
  "sent_count": 150,
  "failed_count": 0
}
```

## Workflow

### 1. Vorlage erstellen

```
Admin → Klickt "Neue Vorlage erstellen"
  → Gibt Name, Betreff und Nachricht ein
  → Verwendet Platzhalter
  → Aktiviert HTML-Format (optional)
  → Speichert Vorlage
  → Vorlage wird in Liste angezeigt
```

### 2. E-Mail senden

```
Admin → Wählt Vorlage aus
  → Klickt "E-Mail senden"
  → Wählt Empfänger-Typ
  → Sieht Vorschau
  → Bestätigt Versand
  → E-Mails werden gesendet
  → Versand-Status wird angezeigt
```

## Platzhalter-Ersetzung

### Ersetzungs-Logik
```php
function replacePlaceholders($template, $data) {
    $replacements = [
        '{{name}}' => $data['name'] ?? '',
        '{{email}}' => $data['email'] ?? '',
        '{{school}}' => $data['school'] ?? '',
        '{{date}}' => date('d.m.Y'),
        '{{status}}' => $data['status'] ?? '',
        '{{class_count}}' => $data['class_count'] ?? 0,
        '{{student_count}}' => $data['student_count'] ?? 0
    ];
    
    foreach ($replacements as $placeholder => $value) {
        $template = str_replace($placeholder, $value, $template);
    }
    
    return $template;
}
```

## HTML-Formatierung

### HTML-Support
- **HTML-Tags:** Unterstützt HTML-Tags
- **CSS:** Inline CSS wird unterstützt
- **Links:** Links werden korrekt formatiert
- **Bilder:** Bilder werden eingebettet (optional)

### Beispiel
```html
<h1>Willkommen bei TalentsLounge, {{name}}!</h1>
<p>Hallo {{name}},</p>
<p>Willkommen bei TalentsLounge! Ihre Schule <strong>{{school}}</strong> wurde erfolgreich registriert.</p>
<p><a href="https://talentslounge.at">Zur Plattform</a></p>
```

## Geplante E-Mails

### Scheduling
- **Scheduled At:** Datum und Uhrzeit für Versand
- **Automatischer Versand:** E-Mails werden automatisch gesendet
- **Status-Tracking:** Versand-Status wird verfolgt

### Scheduled E-Mail
```json
{
  "template_id": 1,
  "recipient_type": "all_teachers",
  "scheduled_at": "2024-01-20 10:00:00"
}
```

## Best Practices

1. **Platzhalter verwenden:** Verwende Platzhalter für Personalisierung
2. **HTML-Formatierung:** Verwende HTML für bessere Formatierung
3. **Testen:** Teste Vorlagen vor dem Versand
4. **Empfänger prüfen:** Prüfe Empfänger-Liste vor dem Versand
5. **Vorschau:** Nutze Vorschau-Funktion

## Fehlerbehandlung

### Validierung
- **Name:** Muss eindeutig sein
- **Betreff:** Muss nicht leer sein
- **Nachricht:** Muss nicht leer sein
- **Empfänger:** Muss gültig sein

### Versand-Fehler
- **Fehlgeschlagene E-Mails:** Werden protokolliert
- **Retry-Mechanismus:** Automatischer Retry bei Fehlern
- **Fehler-Bericht:** Detaillierter Fehler-Bericht

## Zukünftige Erweiterungen

- **Rich Text Editor:** WYSIWYG-Editor für Vorlagen
- **Vorlagen-Kategorien:** Kategorisierung von Vorlagen
- **A/B Testing:** A/B Testing für E-Mails
- **Analytics:** Öffnungs- und Klick-Raten
- **Attachments:** Datei-Anhänge
