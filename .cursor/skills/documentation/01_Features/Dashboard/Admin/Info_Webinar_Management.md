---
title: Info-Webinar Management - Calendly Integration
description: Verwaltung von Info-Webinar-Terminen über Calendly Integration
enableToc: true
tags:
  - features
  - admin
  - calendly
  - infowebinar
---

# 📅 Info-Webinar Management - Calendly Integration

> [!abstract] User Story
> Als Admin möchte ich Info-Webinar-Termine von Calendly synchronisieren, Teilnehmer verwalten und Anwesenheit tracken.

## Verwandte Features

- **Teacher Onboarding:** [[01_Features/Auth/Teacher_Onboarding|Teacher Onboarding]] - Info-Webinar ist Teil des Onboarding-Prozesses
- **Teacher Pipeline:** [[01_Features/Dashboard/Admin/Teacher_Pipeline|Teacher Pipeline]] - Info-Webinar-Teilnahme beeinflusst Teacher Status
- **Calendly Integration:** [[00_Blueprint/Calendly_Integration|Calendly Integration]] - Technische Details zur Integration

## Data Models

- **Calendly Event:** [[03_Data_Models/Calendly_Event|Calendly Event Model]] - Event-Datenmodell
- **Calendly Event Attendee:** [[03_Data_Models/Calendly_Event_Attendee|Calendly Event Attendee Model]] - Teilnehmer-Datenmodell
- **Teacher Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell

## Übersicht

Das Info-Webinar System ermöglicht es Admins, Info-Webinar-Termine von Calendly zu synchronisieren, Teilnehmer zu verwalten und Anwesenheit zu tracken. Dies ist ein wichtiger Teil des Teacher-Onboarding-Prozesses.

## Hauptfunktionen

### 1. Calendly Synchronisation

#### Automatische Synchronisation
- **30-Tage-Sync:** Synchronisiert alle Events der letzten 30 Tage
- **Custom Date Range:** Optionale Synchronisation ab einem bestimmten Datum
- **Full Sync:** Synchronisiert alle verfügbaren Events

#### Synchronisierte Daten
- Event-Informationen (Name, Startzeit, Status, Location)
- Teilnehmer-Informationen (Name, E-Mail)
- Event-Status (active, cancelled)

#### Synchronisations-Prozess
```
1. Admin klickt auf "Aktualisieren"
2. System ruft Calendly API auf
3. Events werden synchronisiert:
   - Neue Events werden eingefügt
   - Bestehende Events werden aktualisiert
4. Teilnehmer werden synchronisiert:
   - Neue Teilnehmer werden hinzugefügt
   - Bestehende Teilnehmer werden aktualisiert
5. Letzte Synchronisationszeit wird gespeichert
```

### 2. Event-Verwaltung

#### Event-Übersicht
- **Anstehende Events:** Events der nächsten 14 Tage
- **Event-Details:**
  - Event-Name
  - Startzeit
  - Location (Meeting-Link)
  - Anzahl Teilnehmer
  - Anwesenheits-Status

#### Event-Bearbeitung
- Event-Details anzeigen
- Teilnehmer-Liste anzeigen
- Anwesenheit verwalten

### 3. Teilnehmer-Verwaltung

#### Teilnehmer-Liste
- Alle Teilnehmer eines Events
- Name und E-Mail
- Anwesenheits-Status (pending, attended, not_attended)
- Zuordnung zu User-Account (optional)

#### Teilnehmer-Aktionen
- **User zuordnen:** Teilnehmer mit User-Account verknüpfen
- **Anwesenheit eintragen:**
  - ✅ Teilgenommen
  - ❌ Nicht teilgenommen
  - ⏳ Noch nicht bewertet
- **Notizen hinzufügen:**
  - Prognose Anzahl Klassen
  - Prognose Start
  - Formlose Notizen

### 4. Anwesenheits-Tracking

#### Anwesenheits-Status
- **Pending:** Noch nicht bewertet (NULL)
- **Attended:** Teilgenommen (TRUE)
- **Not Attended:** Nicht teilgenommen (FALSE)

#### Anwesenheits-Verwaltung
- Bulk-Update für mehrere Teilnehmer
- Einzelne Updates
- Automatische Zuordnung zu Teacher-Accounts

## API Endpoints

### Synchronisation

#### `POST /api/infowebinar/sync_calendly_events.php`
Synchronisiert Events von Calendly.

**Query Parameters:**
- `min_start_time` (optional): Datum ab dem synchronisiert werden soll (ISO 8601)

**Response:**
```json
{
  "success": true,
  "message": "Synchronisation abgeschlossen",
  "synced": 10,
  "new": 5,
  "updated": 5
}
```

#### `GET /api/infowebinar/get_last_sync_time.php`
Gibt die letzte Synchronisationszeit zurück.

**Response:**
```json
{
  "success": true,
  "last_sync_time": "2024-01-15 10:30:00"
}
```

### Events

#### `GET /api/infowebinar/get_calendly_events.php`
Holt alle synchronisierten Events.

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "calendly_id": "abc123",
      "event_name": "TLr - Infowebinar",
      "start_time": "2024-01-20 14:00:00",
      "location": "https://meet.google.com/...",
      "status": "active"
    }
  ]
}
```

#### `GET /api/infowebinar/get_upcoming_webinars.php`
Holt anstehende Webinare (nächste 14 Tage).

**Response:**
```json
{
  "success": true,
  "webinars": [
    {
      "webinar_date": "2024-01-20 14:00:00",
      "webinar_date_formatted": "20.01.2024 14:00 Uhr",
      "event_name": "TLr - Infowebinar",
      "location": "https://meet.google.com/...",
      "participation_count": 15,
      "pending_count": 10,
      "participated_count": 3,
      "not_participated_count": 2
    }
  ]
}
```

#### `GET /api/infowebinar/get_event_details.php`
Holt Details eines Events inklusive Teilnehmer.

**Parameters:**
- `event_id`: ID des Events

**Response:**
```json
{
  "success": true,
  "event": {
    "id": 1,
    "event_name": "TLr - Infowebinar",
    "start_time": "2024-01-20 14:00:00",
    "location": "https://meet.google.com/...",
    "attendees": [
      {
        "id": 1,
        "name": "Max Mustermann",
        "email": "max@example.com",
        "attended": true,
        "user_id": 123,
        "prognosis_class_count": 2,
        "prognosis_start": "Q1 2024",
        "notes": "Interessiert an Coding-Kursen"
      }
    ]
  }
}
```

### Teilnehmer

#### `POST /api/infowebinar/create_attendee.php`
Erstellt einen neuen Teilnehmer (manuell).

**Request Body:**
```json
{
  "event_id": 1,
  "name": "Max Mustermann",
  "email": "max@example.com"
}
```

#### `POST /api/infowebinar/update_attendee.php`
Aktualisiert Teilnehmer-Informationen.

**Request Body:**
```json
{
  "attendee_id": 1,
  "name": "Max Mustermann",
  "email": "max@example.com",
  "user_id": 123,
  "prognosis_class_count": 2,
  "prognosis_start": "Q1 2024",
  "notes": "Interessiert an Coding-Kursen"
}
```

#### `POST /api/infowebinar/update_attendee_attendance.php`
Aktualisiert Anwesenheits-Status.

**Request Body:**
```json
{
  "attendee_id": 1,
  "attended": true
}
```

#### `GET /api/infowebinar/get_participations.php`
Holt Teilnahmen eines Events.

**Parameters:**
- `event_id`: ID des Events

**Response:**
```json
{
  "success": true,
  "participations": [
    {
      "id": 1,
      "teacher_id": 123,
      "webinar_date": "2024-01-20 14:00:00",
      "participated": true,
      "updated_by_user_id": 1
    }
  ]
}
```

#### `POST /api/infowebinar/register_participation.php`
Registriert eine Teilnahme (verknüpft mit Teacher).

**Request Body:**
```json
{
  "teacher_id": 123,
  "webinar_date": "2024-01-20 14:00:00"
}
```

#### `POST /api/infowebinar/update_participation.php`
Aktualisiert Teilnahme-Status.

**Request Body:**
```json
{
  "participation_id": 1,
  "participated": true
}
```

#### `GET /api/infowebinar/search_users.php`
Sucht User für Zuordnung zu Teilnehmern.

**Parameters:**
- `query`: Suchbegriff (Name oder E-Mail)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 123,
      "name": "Max Mustermann",
      "email": "max@example.com",
      "role": "teacher"
    }
  ]
}
```

## Workflow

### 1. Event-Synchronisation

```
Admin → Klickt "Aktualisieren"
  → System ruft Calendly API auf
  → Events werden synchronisiert
  → Teilnehmer werden synchronisiert
  → Letzte Sync-Zeit wird gespeichert
```

### 2. Anwesenheits-Tracking

```
Admin → Öffnet Event-Details
  → Sieht Teilnehmer-Liste
  → Markiert Anwesenheit
  → System aktualisiert Status
  → Teacher Status wird aktualisiert (falls verknüpft)
```

### 3. User-Zuordnung

```
Admin → Öffnet Teilnehmer-Details
  → Sucht nach User
  → Verknüpft Teilnehmer mit User
  → System aktualisiert Verknüpfung
```

## Integration mit Teacher Pipeline

Die Info-Webinar-Teilnahme beeinflusst den Teacher-Status:

- **Status 4:** `infowebinar_besuchen` - Schule verbunden, Infowebinar besuchen
- **Status 6:** `infowebinar_gebucht` - Infowebinar gebucht
- **Status 7:** `nicht_teilgenommen` - Nicht teilgenommen
- **Status 8:** `schule_aktiv` - Schule aktiv (nach erfolgreicher Teilnahme)

> [!tip] Status-Update
> Nach erfolgreicher Teilnahme am Info-Webinar wird der Teacher-Status automatisch auf "schule_aktiv" gesetzt.

## Sicherheit

- **Nur Admins:** Alle Endpunkte erfordern Admin-Berechtigung
- **API-Token:** Calendly API-Token wird sicher in Config gespeichert
- **Validierung:** Alle Eingaben werden validiert

## Fehlerbehandlung

### Calendly API Fehler
- **Token ungültig:** Fehlermeldung mit Hinweis auf Konfiguration
- **API-Fehler:** HTTP-Status-Code wird zurückgegeben
- **Network-Fehler:** Retry-Mechanismus (optional)

### Datenbank-Fehler
- **Duplicate Entry:** Wird ignoriert (Update statt Insert)
- **Foreign Key Constraint:** Fehlermeldung mit Details

## Performance

- **Caching:** Letzte Sync-Zeit wird gecacht
- **Batch-Processing:** Events werden in Batches verarbeitet
- **Optimierte Queries:** JOINs statt N+1 Queries

## UI/UX

### Event-Übersicht
- **Karten-Layout:** Jedes Event als Karte
- **Status-Badges:** Farbcodierte Status-Anzeige
- **Quick Actions:** Schnellzugriff auf häufig genutzte Aktionen

### Teilnehmer-Liste
- **Tabelle:** Sortierbare Tabelle
- **Filter:** Nach Status filtern
- **Bulk-Actions:** Mehrere Teilnehmer gleichzeitig bearbeiten

### Anwesenheits-Tracking
- **Checkboxen:** Einfache Checkboxen für Anwesenheit
- **Bulk-Update:** Mehrere Teilnehmer gleichzeitig aktualisieren
- **Visual Feedback:** Sofortiges visuelles Feedback

## Technische Details

### Calendly API Integration

Siehe [[00_Blueprint/Calendly_Integration|Calendly Integration]] für technische Details.

### Datenbank-Schema

Siehe [[03_Data_Models/Calendly_Event|Calendly Event Model]] und [[03_Data_Models/Calendly_Event_Attendee|Calendly Event Attendee Model]].

## Best Practices

1. **Regelmäßige Synchronisation:** Täglich synchronisieren
2. **Anwesenheit zeitnah eintragen:** Innerhalb von 24 Stunden nach Event
3. **User-Zuordnung:** Teilnehmer mit User-Accounts verknüpfen
4. **Notizen:** Wichtige Informationen in Notizen festhalten

## Zukünftige Erweiterungen

- **Automatische E-Mails:** E-Mail-Benachrichtigungen bei neuen Events
- **Webhook-Integration:** Automatische Synchronisation bei neuen Bookings
- **Analytics:** Statistiken über Teilnahme-Raten
- **Export:** Export von Teilnehmer-Listen
