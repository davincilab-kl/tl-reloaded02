---
title: Admin Lists System
description: Dynamische Listen-Erstellung für Lehrer-Verwaltung
enableToc: true
tags:
  - features
  - admin
  - lists
---

# 📋 Admin Lists System

> [!abstract] User Story
> Als Admin möchte ich dynamische Listen von Lehrkräften erstellen, basierend auf Filtern, und diese mit Notizen, Tags und Farb-Markierungen verwalten.

## Verwandte Features

- **Teacher Management:** [[01_Features/Dashboard/Admin/Teacher_Management|Teacher Management]] - Lehrer-Verwaltung
- **Teacher Pipeline:** [[01_Features/Dashboard/Admin/Teacher_Pipeline|Teacher Pipeline]] - Status-basierte Filterung

## Data Models

- **Admin Teacher List:** [[03_Data_Models/Admin_Teacher_List|Admin Teacher List Model]] - Listen-Definition
- **Admin Teacher List Cache:** [[03_Data_Models/Admin_Teacher_List_Cache|Admin Teacher List Cache Model]] - Gecachte Einträge

## Übersicht

Das Admin Lists System ermöglicht es Admins, dynamische Listen von Lehrkräften zu erstellen, basierend auf komplexen Filtern. Die Listen werden gecacht für bessere Performance und können mit Notizen, Tags und Farb-Markierungen verwaltet werden.

## Hauptfunktionen

### 1. Listen-Erstellung

#### Filter-Konfiguration
- **Status-Filter:** Nach Teacher-Status filtern
- **Schule-Filter:** Nach Schule filtern
- **Datum-Filter:** Nach Registrierungsdatum, letztem Login, etc.
- **Aktivitäts-Filter:** Nach Anzahl Klassen, Schülern, Projekten
- **Kombinierte Filter:** Mehrere Filter kombinieren (AND/OR)

#### Spalten-Konfiguration
- **Wählbare Spalten:** Welche Informationen angezeigt werden
- **Sortierung:** Nach verschiedenen Spalten sortieren
- **Anzeige-Reihenfolge:** Spalten-Reihenfolge anpassen

### 2. Cache-System

#### Automatische Cache-Generierung
- **Background-Processing:** Cache wird im Hintergrund generiert
- **Progress-Tracking:** Fortschritt der Cache-Generierung
- **Inkrementelle Updates:** Nur geänderte Einträge aktualisieren

#### Cache-Verwaltung
- **Manuelle Aktualisierung:** Cache manuell neu generieren
- **Automatische Aktualisierung:** Bei Änderungen automatisch aktualisieren
- **Cache-Status:** Anzeige ob Cache aktuell ist

### 3. Listen-Verwaltung

#### Listen-Aktionen
- **Öffnen:** Liste anzeigen
- **Bearbeiten:** Filter und Spalten ändern
- **Löschen:** Liste löschen
- **Duplizieren:** Liste kopieren

#### Eintrags-Verwaltung
- **Notizen:** Notizen zu einzelnen Einträgen hinzufügen
- **Tags:** Tags zu Einträgen hinzufügen
- **Farb-Markierungen:** Einträge farblich markieren
- **Transfer:** Notizen zwischen Listen übertragen

## Filter-Konfiguration

### Verfügbare Filter

#### Status-Filter
```json
{
  "type": "status",
  "operator": "equals",
  "value": 8
}
```

#### Schule-Filter
```json
{
  "type": "school",
  "operator": "equals",
  "value": 123
}
```

#### Datum-Filter
```json
{
  "type": "registration_date",
  "operator": "after",
  "value": "2024-01-01"
}
```

#### Aktivitäts-Filter
```json
{
  "type": "class_count",
  "operator": "greater_than",
  "value": 5
}
```

### Kombinierte Filter
```json
{
  "logic": "AND",
  "filters": [
    {
      "type": "status",
      "operator": "equals",
      "value": 8
    },
    {
      "type": "class_count",
      "operator": "greater_than",
      "value": 0
    }
  ]
}
```

## Spalten-Konfiguration

### Verfügbare Spalten

- **ID:** Lehrer-ID
- **Name:** Vor- und Nachname
- **E-Mail:** E-Mail-Adresse
- **Schule:** Schulname
- **Status:** Aktueller Status
- **Klassen:** Anzahl Klassen
- **Schüler:** Anzahl Schüler
- **Projekte:** Anzahl Projekte
- **Letzter Login:** Letztes Login-Datum
- **Registrierungsdatum:** Registrierungsdatum

### Spalten-Konfiguration
```json
{
  "columns": [
    {
      "key": "id",
      "label": "ID",
      "visible": true,
      "width": 80
    },
    {
      "key": "name",
      "label": "Name",
      "visible": true,
      "width": 200
    },
    {
      "key": "email",
      "label": "E-Mail",
      "visible": true,
      "width": 250
    }
  ]
}
```

## API Endpoints

### Listen-Verwaltung

#### `POST /api/admin/lists/create_list.php`
Erstellt eine neue Liste.

**Request Body:**
```json
{
  "name": "Lehrer ohne Infowebinar",
  "filter_config": {
    "logic": "AND",
    "filters": [
      {
        "type": "status",
        "operator": "equals",
        "value": 4
      }
    ]
  },
  "columns_config": {
    "columns": [
      {"key": "id", "visible": true},
      {"key": "name", "visible": true},
      {"key": "email", "visible": true}
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "list": {
    "id": 1,
    "name": "Lehrer ohne Infowebinar",
    "teacher_count": 0,
    "is_generating": true
  }
}
```

#### `GET /api/admin/lists/get_lists.php`
Holt alle Listen.

**Response:**
```json
{
  "success": true,
  "lists": [
    {
      "id": 1,
      "name": "Lehrer ohne Infowebinar",
      "teacher_count": 15,
      "is_generating": false,
      "last_updated": "2024-01-15 10:30:00"
    }
  ]
}
```

#### `GET /api/admin/lists/get_list_data.php`
Holt Einträge einer Liste.

**Parameters:**
- `list_id`: ID der Liste
- `page` (optional): Seitenzahl
- `limit` (optional): Anzahl pro Seite

**Response:**
```json
{
  "success": true,
  "list": {
    "id": 1,
    "name": "Lehrer ohne Infowebinar",
    "entries": [
      {
        "teacher_id": 123,
        "cached_data": {
          "id": 123,
          "name": "Max Mustermann",
          "email": "max@example.com",
          "school": "MS Beispiel",
          "status": "infowebinar_besuchen"
        },
        "color_marker": "red",
        "tags": ["wichtig", "nachfassen"],
        "notes": "Sollte kontaktiert werden"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 50
  }
}
```

#### `POST /api/admin/lists/update_entry.php`
Aktualisiert einen Eintrag (Notizen, Tags, Farb-Markierung).

**Request Body:**
```json
{
  "list_id": 1,
  "teacher_id": 123,
  "color_marker": "red",
  "tags": ["wichtig", "nachfassen"],
  "notes": "Sollte kontaktiert werden"
}
```

#### `POST /api/admin/lists/generate_cache.php`
Generiert Cache für eine Liste.

**Request Body:**
```json
{
  "list_id": 1
}
```

#### `POST /api/admin/lists/delete_list.php`
Löscht eine Liste.

**Request Body:**
```json
{
  "list_id": 1
}
```

### Cache-Verwaltung

#### `GET /api/admin/lists/get_statuses.php`
Holt Status aller Listen (Generierungs-Status).

**Response:**
```json
{
  "success": true,
  "lists": [
    {
      "id": 1,
      "is_generating": false,
      "cache_progress_total": 100,
      "cache_progress_processed": 100
    }
  ]
}
```

## Workflow

### 1. Liste erstellen

```
Admin → Klickt "Neue Liste erstellen"
  → Wählt Filter aus
  → Wählt Spalten aus
  → Speichert Liste
  → Cache-Generierung startet im Hintergrund
  → Liste wird angezeigt
```

### 2. Liste bearbeiten

```
Admin → Öffnet Liste
  → Klickt "Bearbeiten"
  → Ändert Filter oder Spalten
  → Speichert Änderungen
  → Cache wird neu generiert
```

### 3. Eintrag verwalten

```
Admin → Öffnet Liste
  → Klickt auf Eintrag
  → Fügt Notizen/Tags hinzu
  → Markiert farblich
  → Änderungen werden gespeichert
```

## Farb-Markierungen

Verfügbare Farben:
- **red:** Wichtig/Dringend
- **yellow:** Aufmerksamkeit erforderlich
- **green:** Erledigt/OK
- **blue:** Information
- **orange:** Warnung
- **purple:** Speziell
- **gray:** Neutral

## Tags

Tags können frei definiert werden:
- **wichtig:** Wichtiger Eintrag
- **nachfassen:** Nachfassen erforderlich
- **erledigt:** Erledigt
- **kontaktiert:** Bereits kontaktiert

## Performance

### Caching
- **Background-Processing:** Cache wird asynchron generiert
- **Inkrementelle Updates:** Nur geänderte Einträge aktualisieren
- **Progress-Tracking:** Fortschritt wird angezeigt

### Optimierungen
- **Indexed Queries:** Optimierte Datenbank-Abfragen
- **Batch-Processing:** Einträge werden in Batches verarbeitet
- **Lazy Loading:** Daten werden bei Bedarf geladen

## Best Practices

1. **Spezifische Listen:** Erstelle spezifische Listen für verschiedene Zwecke
2. **Regelmäßige Updates:** Cache regelmäßig aktualisieren
3. **Notizen:** Wichtige Informationen in Notizen festhalten
4. **Tags:** Verwende konsistente Tags
5. **Farb-Markierungen:** Verwende Farben konsistent

## Zukünftige Erweiterungen

- **Export:** Listen als CSV/Excel exportieren
- **Automatische Listen:** Automatisch generierte Listen basierend auf Regeln
- **Listen-Sharing:** Listen mit anderen Admins teilen
- **Listen-Templates:** Vorlagen für häufig genutzte Listen
