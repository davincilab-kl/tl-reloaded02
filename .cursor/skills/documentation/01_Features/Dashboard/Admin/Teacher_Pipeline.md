---
title: Teacher Pipeline - Status System
description: Vollständige Dokumentation des Teacher Status Pipeline Systems
enableToc: true
tags:
  - features
  - admin
  - pipeline
  - teacher-status
---

# 🔄 Teacher Pipeline - Status System

> [!abstract] User Story
> Als Admin möchte ich den Status von Lehrkräften im Onboarding-Prozess verfolgen, Statistiken einsehen und Status-Übergänge validieren.

## Verwandte Features

- **Teacher Management:** [[01_Features/Dashboard/Admin/Teacher_Management|Teacher Management]] - Lehrer-Verwaltung
- **Info-Webinar:** [[01_Features/Dashboard/Admin/Info_Webinar_Management|Info-Webinar Management]] - Info-Webinar beeinflusst Status
- **Teacher Onboarding:** [[01_Features/Auth/Teacher_Onboarding|Teacher Onboarding]] - Onboarding-Prozess

## Data Models

- **Teacher Status:** [[03_Data_Models/Teacher_Status|Teacher Status Model]] - Status-Definitionen
- **Teacher Status History:** [[03_Data_Models/Teacher_Status_History|Teacher Status History Model]] - Status-Verlauf
- **User Model:** [[03_Data_Models/User|User Model]] - Lehrer-Datenmodell

## Übersicht

Das Teacher Pipeline System verwaltet den Status von Lehrkräften während des gesamten Onboarding-Prozesses. Es gibt 20 verschiedene Stati, die den Fortschritt einer Lehrkraft von der Registrierung bis zur aktiven Nutzung abbilden.

## Teacher Stati (20)

### Registrierung & Onboarding (1-3)

#### 1. `email_bestaetigen` - E-Mail bestätigen
- **Initialer Status:** Wird bei Registrierung gesetzt
- **Nächster Status:** `schule_verbinden` (nach E-Mail-Verifizierung)
- **Beschreibung:** Lehrer muss E-Mail-Adresse bestätigen

#### 2. `schule_verbinden` - Schule verbinden
- **Vorheriger Status:** `email_bestaetigen`
- **Nächster Status:** `warteliste_schule` oder `infowebinar_besuchen`
- **Beschreibung:** Lehrer muss sich mit einer Schule verbinden

#### 3. `warteliste_schule` - Auf Warteliste einer Schule
- **Vorheriger Status:** `schule_verbinden`
- **Nächster Status:** `infowebinar_besuchen` (nach Akzeptierung)
- **Beschreibung:** Lehrer wartet auf Akzeptierung durch School Admin

### Schule & Infowebinar (4-8)

#### 4. `infowebinar_besuchen` - Schule verbunden - Infowebinar besuchen
- **Vorheriger Status:** `schule_verbinden` oder `warteliste_schule`
- **Nächster Status:** `infowebinar_gebucht`
- **Beschreibung:** Schule verbunden, Lehrer soll Info-Webinar besuchen

#### 5. `schule_letztes_jahr_aktiv` - Schule war letztes Jahr aktiv
- **Vorheriger Status:** Automatisch gesetzt
- **Nächster Status:** `schule_aktiv`
- **Beschreibung:** Schule war im vorherigen Schuljahr aktiv

#### 6. `infowebinar_gebucht` - Infowebinar gebucht
- **Vorheriger Status:** `infowebinar_besuchen`
- **Nächster Status:** `nicht_teilgenommen` oder `schule_aktiv`
- **Beschreibung:** Lehrer hat Info-Webinar gebucht

#### 7. `nicht_teilgenommen` - Nicht teilgenommen
- **Vorheriger Status:** `infowebinar_gebucht`
- **Nächster Status:** Keiner (End-Status)
- **Beschreibung:** Lehrer hat nicht am Info-Webinar teilgenommen

#### 8. `schule_aktiv` - Schule aktiv
- **Vorheriger Status:** `infowebinar_gebucht` oder `schule_letztes_jahr_aktiv`
- **Nächster Status:** `klasse_erstellt`
- **Beschreibung:** Schule ist aktiv, Lehrer kann Klassen erstellen

### Aktivität & Engagement (9-19)

#### 9. `klasse_erstellt` - Klasse erstellt
- **Vorheriger Status:** `schule_aktiv`
- **Nächster Status:** Automatisch (nächster Status basierend auf Aktivität)
- **Beschreibung:** Lehrer hat erste Klasse erstellt

#### 10. `10_tcoins_gesammelt` - 10 T!Coins gesammelt
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** Lehrer hat 10 T!Coins gesammelt (durch Schüler-Aktivität)

#### 11. `10_schueler_5_tcoins` - 10 Schüler haben mehr als 5 T!Coins gesammelt
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** 10 Schüler haben jeweils mehr als 5 T!Coins gesammelt

#### 12. `5_projekte_erstellt` - 5 Projekte erstellt
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** Schüler haben 5 Projekte erstellt

#### 13. `erstes_projekt_eingereicht` - Erstes eingereichtes Projekt
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** Erstes Projekt wurde zur Bewertung eingereicht

#### 14. `erstes_projekt_bewertet` - Erstes Projekt mit Bewertung von Lehrkraft
- **Vorheriger Status:** `erstes_projekt_eingereicht`
- **Nächster Status:** Automatisch
- **Beschreibung:** Lehrer hat erstes Projekt bewertet

#### 15. `projekt_oeffentlich` - Projekt öffentlich
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** Erstes Projekt wurde öffentlich veröffentlicht

#### 16. `projekt_3_likes` - Projekt mit 3+ Likes
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** Projekt hat 3 oder mehr Likes erhalten

#### 17. `10_projekte_veroeffentlicht` - 10+ Projekte veröffentlicht
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** 10 oder mehr Projekte wurden veröffentlicht

#### 18. `1_schueler_100_punkte` - 1 Schüler hat 100+ Punkte
- **Vorheriger Status:** Automatisch
- **Nächster Status:** Automatisch
- **Beschreibung:** Mindestens ein Schüler hat 100+ Punkte erreicht

#### 19. `3_schueler_100_punkte` - 3 Schüler haben 100+ Punkte
- **Vorheriger Status:** `1_schueler_100_punkte`
- **Nächster Status:** Automatisch
- **Beschreibung:** Mindestens drei Schüler haben 100+ Punkte erreicht

### Deaktivierung (20)

#### 20. `konto_deaktiviert` - Konto deaktiviert
- **Vorheriger Status:** Jeder Status
- **Nächster Status:** Keiner (End-Status)
- **Beschreibung:** Lehrer-Konto wurde deaktiviert

## Status-Übergänge

### Automatische Übergänge

Viele Status-Übergänge erfolgen automatisch basierend auf Aktivitäten:

```
email_bestaetigen
  ↓ (E-Mail-Verifizierung)
schule_verbinden
  ↓ (Schule verbinden)
warteliste_schule ODER infowebinar_besuchen
  ↓ (Info-Webinar buchen)
infowebinar_gebucht
  ↓ (Info-Webinar teilnehmen)
schule_aktiv
  ↓ (Klasse erstellen)
klasse_erstellt
  ↓ (Schüler-Aktivität)
[Automatische Status 10-19]
```

### Manuelle Übergänge

Einige Status-Übergänge müssen manuell durch Admin erfolgen:
- `nicht_teilgenommen` - Nach Info-Webinar
- `konto_deaktiviert` - Admin-Aktion

## Pipeline-Dashboard

### Aktueller Status

- **Chart:** Visualisierung der Status-Verteilung
- **Datum-Slider:** Status zu einem bestimmten Datum anzeigen
- **Statistiken:**
  - Anzahl Schulen
  - Anzahl Lehrkräfte
  - Anzahl Klassen
  - Anzahl Schüler

### Vergleich

- **Datum 1 vs. Datum 2:** Vergleich zweier Zeitpunkte
- **Änderungen:** Zeigt Änderungen zwischen den Zeitpunkten
- **Wachstum:** Prozentuale Änderungen

### Lehrer-Liste

- **Filter:** Nach Status filtern
- **Sortierung:** Nach verschiedenen Kriterien
- **Details:** Einzelne Lehrer-Details anzeigen

## API Endpoints

### Status-Abfragen

#### `GET /api/pipeline/get_teachers_by_status.php`
Holt alle Lehrer mit einem bestimmten Status zu einem Datum.

**Query Parameters:**
- `status_id`: ID des Status
- `date`: Datum (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "teachers": [
    {
      "id": 123,
      "name": "Max Mustermann",
      "email": "max@example.com",
      "school_name": "MS Beispiel",
      "status_reached_at": "2024-01-15 10:30:00",
      "last_login": "2024-01-20 14:00:00"
    }
  ]
}
```

#### `GET /api/pipeline/get_status_counts_by_date.php`
Holt Status-Zählungen für ein Datum.

**Query Parameters:**
- `date`: Datum (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "status_counts": [
    {
      "status_id": 1,
      "status_label": "email_bestaetigen",
      "count": 10
    }
  ]
}
```

#### `GET /api/pipeline/get_teacher_details.php`
Holt detaillierte Informationen über einen Lehrer.

**Query Parameters:**
- `teacher_id`: ID des Lehrers

**Response:**
```json
{
  "success": true,
  "teacher": {
    "id": 123,
    "name": "Max Mustermann",
    "email": "max@example.com",
    "current_status": {
      "id": 8,
      "label": "schule_aktiv",
      "reached_at": "2024-01-15 10:30:00"
    },
    "status_history": [
      {
        "status_id": 1,
        "label": "email_bestaetigen",
        "changed_at": "2024-01-10 09:00:00"
      }
    ]
  }
}
```

### Status-Validierung

#### `POST /api/pipeline/check_teacher_status.php`
Prüft ob Status eines Lehrers korrekt ist.

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
  "is_valid": true,
  "current_status": 8,
  "expected_status": 8
}
```

#### `POST /api/pipeline/fix_teacher_status.php`
Korrigiert Status eines Lehrers.

**Request Body:**
```json
{
  "teacher_id": 123,
  "target_status_id": 8
}
```

#### `POST /api/pipeline/validate_all_teacher_status.php`
Validiert alle Lehrer-Status.

**Response:**
```json
{
  "success": true,
  "validated": 100,
  "fixed": 5,
  "errors": []
}
```

## Status-Historie

Jede Status-Änderung wird in `teacher_status_history` protokolliert:

```sql
CREATE TABLE `teacher_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `status_id` int NOT NULL,
  `previous_status_id` int DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_status_id` (`status_id`),
  KEY `idx_changed_at` (`changed_at`)
);
```

## Automatische Status-Updates

### Trigger-Events

Status werden automatisch aktualisiert bei:

1. **E-Mail-Verifizierung:** `email_bestaetigen` → `schule_verbinden`
2. **Schule verbinden:** `schule_verbinden` → `infowebinar_besuchen`
3. **Info-Webinar buchen:** `infowebinar_besuchen` → `infowebinar_gebucht`
4. **Info-Webinar teilnehmen:** `infowebinar_gebucht` → `schule_aktiv`
5. **Klasse erstellen:** `schule_aktiv` → `klasse_erstellt`
6. **Schüler-Aktivität:** Automatische Status 10-19

### Status-Checks

Regelmäßige Checks prüfen ob Status korrekt sind:

```php
// Beispiel: Prüfe ob Lehrer Status 8 haben sollte
if ($teacher->hasClass() && $teacher->status_id !== 8) {
    updateTeacherStatus($teacher->id, 8);
}
```

## Best Practices

1. **Status-Historie:** Immer Status-Änderungen protokollieren
2. **Validierung:** Regelmäßig Status validieren
3. **Automatische Updates:** Status automatisch basierend auf Aktivität aktualisieren
4. **Manuelle Korrekturen:** Admin kann Status manuell korrigieren

## Zukünftige Erweiterungen

- **Status-Alerts:** Benachrichtigungen bei Status-Änderungen
- **Status-Reports:** Automatische Reports über Status-Verteilung
- **Status-Predictions:** Vorhersage wann Status erreicht wird
