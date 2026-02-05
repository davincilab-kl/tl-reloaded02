---
title: Impersonation System
description: Admin kann sich als Lehrer einloggen
enableToc: true
tags:
  - features
  - admin
  - impersonation
  - security
---

# 🔄 Impersonation System

> [!abstract] User Story
> Als Admin möchte ich mich als Lehrer einloggen können, um deren Perspektive zu sehen und Probleme zu debuggen.

## Verwandte Features

- **Auth System:** [[00_Blueprint/Auth_System|Auth System]] - Authentifizierung
- **Teacher Management:** [[01_Features/Dashboard/Admin/Teacher_Management|Teacher Management]] - Lehrer-Verwaltung

## Übersicht

Das Impersonation System ermöglicht es Admins, sich als Lehrer einzuloggen, um deren Perspektive zu sehen, Probleme zu debuggen und Support zu leisten.

## Sicherheit

### Berechtigungen
- **Nur Admins:** Nur Benutzer mit Admin-Rolle können Impersonation nutzen
- **Session-Management:** Original-Admin-Session wird gespeichert
- **Audit-Log:** Impersonation-Aktionen werden protokolliert

### Session-Struktur
```php
$_SESSION['is_impersonating'] = true;
$_SESSION['original_user_id'] = 1;        // Admin ID
$_SESSION['original_role_id'] = 1;         // Admin Role ID
$_SESSION['original_user_role'] = 'admin';  // Admin Role
$_SESSION['original_user_name'] = 'Admin';  // Admin Name
$_SESSION['original_user_email'] = 'admin@example.com';

$_SESSION['user_id'] = 123;                 // Teacher ID
$_SESSION['role_id'] = 123;                 // Teacher Role ID
$_SESSION['user_role'] = 'teacher';        // Teacher Role
$_SESSION['user_name'] = 'Max Mustermann';  // Teacher Name
$_SESSION['user_email'] = 'max@example.com';
```

## Hauptfunktionen

### 1. Impersonation starten

#### Workflow
```
Admin → Öffnet Teacher Management
  → Klickt "Als Lehrer einloggen"
  → System prüft Admin-Berechtigung
  → Original-Session wird gespeichert
  → Teacher-Session wird gesetzt
  → Redirect zu Teacher Dashboard
  → Impersonation-Bar wird angezeigt
```

#### Impersonation-Bar
- **Anzeige:** Zeigt an, dass Impersonation aktiv ist
- **Teacher-Info:** Name des eingeloggten Lehrers
- **Stop-Button:** Impersonation beenden
- **Collapse:** Bar kann eingeklappt werden

### 2. Impersonation beenden

#### Workflow
```
Admin → Klickt "Zurück zum Admin-Account"
  → System prüft Impersonation-Status
  → Original-Session wird wiederhergestellt
  → Teacher-Session wird entfernt
  → Redirect zu Admin Dashboard
  → Impersonation-Bar wird ausgeblendet
```

## API Endpoints

### Impersonation starten

#### `POST /api/auth/impersonate.php`
Startet Impersonation.

**Request Body:**
```json
{
  "teacher_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "teacher": {
    "id": 123,
    "role_id": 123,
    "role": "teacher",
    "name": "Max Mustermann"
  },
  "redirect": "/teachers/dashboard/"
}
```

**Fehler:**
- `403`: Keine Admin-Berechtigung
- `404`: Lehrer nicht gefunden
- `400`: Ungültige Lehrer-ID

### Impersonation beenden

#### `POST /api/auth/stop_impersonate.php`
Beendet Impersonation.

**Response:**
```json
{
  "success": true,
  "message": "Impersonation beendet",
  "redirect": "/admin/dashboard/"
}
```

**Fehler:**
- `403`: Keine aktive Impersonation

### Impersonation-Status

#### `GET /api/auth/get_impersonation_status.php`
Gibt aktuellen Impersonation-Status zurück.

**Response:**
```json
{
  "success": true,
  "is_impersonating": true,
  "original_user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com"
  },
  "impersonated_user": {
    "id": 123,
    "name": "Max Mustermann",
    "email": "max@example.com"
  }
}
```

## UI/UX

### Impersonation-Bar

#### Design
- **Position:** Fixiert am unteren Bildschirmrand
- **Farbe:** Gelb/Orange (Warnung)
- **Icons:** Info-Icon, Stop-Icon
- **Collapsible:** Kann eingeklappt werden

#### Funktionen
- **Anzeige:** Zeigt Impersonation-Status
- **Stop-Button:** Impersonation beenden
- **Toggle:** Bar ein-/ausblenden
- **Persistent:** Status wird in localStorage gespeichert

### Hauptmenü-Anpassungen

#### Deaktivierte Funktionen
- **Logout:** Im Impersonation-Modus deaktiviert
- **Hinweis:** "Im Impersonation-Modus bitte die Leiste am unteren Rand verwenden"

## Sicherheits-Überlegungen

### Session-Management
- **Original-Session:** Wird sicher gespeichert
- **Session-Timeout:** Normale Session-Timeouts gelten
- **Session-Fixation:** Wird verhindert

### Audit-Logging
- **Impersonation-Start:** Wird protokolliert
- **Impersonation-Ende:** Wird protokolliert
- **Aktionen:** Wichtige Aktionen werden protokolliert

### Berechtigungen
- **Nur Admins:** Nur Benutzer mit Admin-Rolle
- **Validierung:** Wird bei jedem Request geprüft

## Best Practices

1. **Nur wenn nötig:** Impersonation nur bei Bedarf nutzen
2. **Schnell beenden:** Impersonation so schnell wie möglich beenden
3. **Keine Änderungen:** Keine kritischen Änderungen im Impersonation-Modus
4. **Audit-Log:** Alle Impersonation-Aktionen werden protokolliert

## Fehlerbehandlung

### Keine Admin-Berechtigung
```json
{
  "success": false,
  "error": "Nur Admins können sich als Lehrer einloggen"
}
```

### Lehrer nicht gefunden
```json
{
  "success": false,
  "error": "Lehrer nicht gefunden"
}
```

### Keine aktive Impersonation
```json
{
  "success": false,
  "error": "Keine aktive Impersonation"
}
```

## Zukünftige Erweiterungen

- **Impersonation-Historie:** Historie aller Impersonationen
- **Zeit-Limit:** Automatisches Beenden nach Zeit-Limit
- **Multi-Level:** Impersonation von anderen Rollen
- **Notifications:** Benachrichtigungen bei Impersonation
