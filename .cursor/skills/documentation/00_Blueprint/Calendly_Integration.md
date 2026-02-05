---
title: Calendly Integration - Technische Dokumentation
description: Technische Details zur Calendly API Integration
enableToc: true
tags:
  - blueprint
  - integration
  - calendly
  - api
---

# 🔌 Calendly Integration - Technische Dokumentation

> [!abstract] Integration-Ziel
> Integration der Calendly API für automatische Synchronisation von Info-Webinar-Terminen und Teilnehmern.

## Übersicht

Die Calendly Integration ermöglicht es, Info-Webinar-Termine und Teilnehmer automatisch von Calendly zu synchronisieren. Dies ist ein wichtiger Teil des Teacher-Onboarding-Prozesses.

## Calendly API

### Authentifizierung

**Personal Access Token:**
- Erstellt über: https://calendly.com/integrations/api_webhooks
- Token wird in `api/config/calendly_config.php` gespeichert
- Token hat keine Ablaufzeit (kann aber manuell widerrufen werden)

### API Base URL

```
https://api.calendly.com
```

### Wichtige Endpunkte

#### Scheduled Events
```
GET /scheduled_events
```

**Query Parameters:**
- `user`: User/Organization URI
- `status`: Event-Status (active, cancelled)
- `sort`: Sortierung (start_time:asc)
- `min_start_time`: Mindest-Startzeit (optional)

**Response:**
```json
{
  "collection": [
    {
      "uri": "https://api.calendly.com/scheduled_events/abc123",
      "name": "TLr - Infowebinar",
      "start_time": "2024-01-20T14:00:00.000000Z",
      "status": "active",
      "location": {
        "type": "google_conference",
        "status": "pushed",
        "join_url": "https://meet.google.com/..."
      }
    }
  ]
}
```

#### Event Invitees
```
GET /scheduled_events/{event_uri}/invitees
```

**Response:**
```json
{
  "collection": [
    {
      "name": "Max Mustermann",
      "email": "max@example.com",
      "uri": "https://api.calendly.com/event_invitees/xyz789"
    }
  ]
}
```

## Konfiguration

### Config-Datei

`api/config/calendly_config.php`:

```php
function calendly_config() {
    return [
        'api_token' => 'YOUR_PERSONAL_ACCESS_TOKEN',
        'event_type_uri' => 'https://api.calendly.com/event_types/...',
        'user_uri' => 'https://api.calendly.com/users/...',
        'api_base_url' => 'https://api.calendly.com'
    ];
}
```

### Token-Erstellung

1. Gehe zu https://calendly.com/integrations/api_webhooks
2. Klicke auf "Personal Access Tokens"
3. Erstelle einen neuen Token
4. Kopiere den Token in die Config-Datei

### User URI finden

Die User URI kann über die Calendly API abgerufen werden:

```
GET https://api.calendly.com/users/me
Authorization: Bearer YOUR_TOKEN
```

## Synchronisations-Prozess

### 1. Events abrufen

```php
$scheduledEventsUrl = $apiBaseUrl . '/scheduled_events?' . http_build_query([
    'user' => $userUri,
    'status' => 'active',
    'sort' => 'start_time:asc',
    'min_start_time' => $minStartTime // optional
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $scheduledEventsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiToken,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
```

### 2. Events in DB speichern

```php
foreach ($events as $event) {
    // Extrahiere calendly_id aus URI
    $calendlyId = extractCalendlyId($event['uri']);
    
    // Prüfe ob Event bereits existiert
    $existingEvent = findEventByCalendlyId($calendlyId);
    
    if ($existingEvent) {
        // Update bestehendes Event
        updateEvent($existingEvent['id'], $event);
    } else {
        // Neues Event einfügen
        insertEvent($event);
    }
}
```

### 3. Teilnehmer abrufen

```php
foreach ($events as $event) {
    $inviteesUrl = $event['uri'] . '/invitees';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $inviteesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiToken,
        'Content-Type: application/json'
    ]);
    
    $inviteesResponse = curl_exec($ch);
    $inviteesData = json_decode($inviteesResponse, true);
    curl_close($ch);
    
    // Speichere Teilnehmer in DB
    foreach ($inviteesData['collection'] as $invitee) {
        saveAttendee($eventId, $invitee);
    }
}
```

## Location-Parsing

Calendly Events können verschiedene Location-Typen haben:

### Google Conference
```json
{
  "location": {
    "type": "google_conference",
    "status": "pushed",
    "join_url": "https://meet.google.com/..."
  }
}
```

**Parsing:**
```php
if ($event['location']['type'] === 'google_conference') {
    if ($event['location']['status'] === 'pushed') {
        $location = $event['location']['join_url'];
    }
}
```

### String Location
```json
{
  "location": "https://zoom.us/j/..."
}
```

**Parsing:**
```php
if (is_string($event['location'])) {
    $location = $event['location'];
}
```

## Error Handling

### API-Fehler

```php
if ($httpCode !== 200) {
    $errorData = json_decode($response, true);
    $errorMessage = 'Calendly API Fehler (HTTP ' . $httpCode . ')';
    
    if (isset($errorData['message'])) {
        $errorMessage .= ': ' . $errorData['message'];
    }
    
    throw new Exception($errorMessage);
}
```

### Network-Fehler

```php
$curlError = curl_error($ch);
if ($curlError) {
    throw new Exception('cURL Fehler: ' . $curlError);
}
```

### Token-Fehler

```php
if (empty($apiToken)) {
    throw new Exception('Calendly API Token nicht konfiguriert');
}
```

## Rate Limiting

Calendly API hat Rate Limits:
- **100 Requests pro Minute** pro Token
- Bei Überschreitung: HTTP 429 (Too Many Requests)

**Handling:**
```php
if ($httpCode === 429) {
    // Warte 60 Sekunden
    sleep(60);
    // Retry
}
```

## Datenbank-Schema

Siehe:
- [[03_Data_Models/Calendly_Event|Calendly Event Model]]
- [[03_Data_Models/Calendly_Event_Attendee|Calendly Event Attendee Model]]

## Best Practices

1. **Token-Sicherheit:** Token niemals in Git committen
2. **Error Logging:** Alle API-Fehler loggen
3. **Retry-Mechanismus:** Bei temporären Fehlern retry
4. **Incremental Sync:** Nur neue/geänderte Events synchronisieren
5. **Batch-Processing:** Events in Batches verarbeiten

## Zukünftige Erweiterungen

### Webhook-Integration

Statt Polling könnte Webhook-Integration verwendet werden:

```
POST /api/infowebinar/webhook
```

**Webhook-Events:**
- `invitee.created` - Neuer Teilnehmer
- `invitee.canceled` - Teilnehmer abgesagt
- `scheduled_event.created` - Neues Event
- `scheduled_event.canceled` - Event abgesagt

### Automatische Synchronisation

- **Cron Job:** Täglich automatisch synchronisieren
- **Real-time:** Via Webhooks in Echtzeit

## Troubleshooting

### Token ungültig
- **Problem:** HTTP 401 Unauthorized
- **Lösung:** Neuen Token erstellen und in Config eintragen

### User URI nicht gefunden
- **Problem:** HTTP 404 Not Found
- **Lösung:** User URI über `/users/me` Endpunkt abrufen

### Location nicht verfügbar
- **Problem:** Location ist NULL
- **Lösung:** Prüfe ob Event-Status "pushed" ist (bei Google Conference)

### Duplicate Events
- **Problem:** Events werden mehrfach eingefügt
- **Lösung:** Prüfe auf `calendly_id` Unique Constraint
