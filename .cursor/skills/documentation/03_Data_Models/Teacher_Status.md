---
title: Teacher Status Model
description: Datenmodell für Teacher Status Definitionen
enableToc: true
tags:
  - data-models
  - teacher
  - status
---

# 📊 Teacher Status Model

## Übersicht

Das `teacher_stati` Model definiert alle verfügbaren Status-Werte für Lehrer im Onboarding-Prozess.

## Datenbank-Schema

```sql
CREATE TABLE `teacher_stati` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order` int NOT NULL,
  `label` varchar(45) DEFAULT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `order` | int | Sortier-Reihenfolge | NOT NULL |
| `label` | varchar(45) | Technischer Name | NULL |
| `display_name` | varchar(100) | Anzeige-Name | NULL |
| `description` | text | Beschreibung | NULL |

## Status-Liste (20 Stati)

| ID | Order | Label | Display Name | Beschreibung |
|----|------|-------|--------------|--------------|
| 1 | 1 | `email_bestaetigen` | E-Mail bestätigen | E-Mail-Adresse bestätigen |
| 2 | 2 | `schule_verbinden` | Schule verbinden | Schule verbinden |
| 3 | 3 | `warteliste_schule` | Auf Warteliste | Auf Warteliste einer Schule |
| 4 | 4 | `infowebinar_besuchen` | Infowebinar besuchen | Schule verbunden - Infowebinar besuchen |
| 5 | 5 | `schule_letztes_jahr_aktiv` | Schule letztes Jahr aktiv | Schule war letztes Jahr aktiv |
| 6 | 6 | `infowebinar_gebucht` | Infowebinar gebucht | Infowebinar gebucht |
| 7 | 7 | `nicht_teilgenommen` | Nicht teilgenommen | Nicht teilgenommen |
| 8 | 8 | `schule_aktiv` | Schule aktiv | Schule aktiv |
| 9 | 9 | `klasse_erstellt` | Klasse erstellt | Klasse erstellt |
| 10 | 10 | `10_tcoins_gesammelt` | 10 T!Coins gesammelt | 10 T!Coins gesammelt |
| 11 | 11 | `10_schueler_5_tcoins` | 10 Schüler 5 T!Coins | 10 Schüler haben mehr als 5 T!Coins |
| 12 | 12 | `5_projekte_erstellt` | 5 Projekte erstellt | 5 Projekte erstellt |
| 13 | 13 | `erstes_projekt_eingereicht` | Erstes Projekt eingereicht | Erstes eingereichtes Projekt |
| 14 | 14 | `erstes_projekt_bewertet` | Erstes Projekt bewertet | Erstes Projekt mit Bewertung |
| 15 | 15 | `projekt_oeffentlich` | Projekt öffentlich | Projekt öffentlich |
| 16 | 16 | `projekt_3_likes` | Projekt 3+ Likes | Projekt mit 3+ Likes |
| 17 | 17 | `10_projekte_veroeffentlicht` | 10+ Projekte veröffentlicht | 10+ Projekte veröffentlicht |
| 18 | 18 | `1_schueler_100_punkte` | 1 Schüler 100+ Punkte | 1 Schüler hat 100+ Punkte |
| 19 | 19 | `3_schueler_100_punkte` | 3 Schüler 100+ Punkte | 3 Schüler haben 100+ Punkte |
| 20 | 20 | `konto_deaktiviert` | Konto deaktiviert | Konto deaktiviert |

## Status-Gruppen

### Registrierung & Onboarding (1-3)
- Status 1-3: Initiale Registrierung und Onboarding

### Schule & Infowebinar (4-8)
- Status 4-8: Schule-Verbindung und Info-Webinar

### Aktivität & Engagement (9-19)
- Status 9-19: Aktivitäts-basierte Status

### Deaktivierung (20)
- Status 20: End-Status (Deaktivierung)

## Verwendung

### Status abrufen
```php
SELECT * FROM teacher_stati
ORDER BY `order` ASC
```

### Status nach Label
```php
SELECT * FROM teacher_stati
WHERE label = 'schule_aktiv'
```

### Status-Gruppe
```php
SELECT * FROM teacher_stati
WHERE `order` BETWEEN 1 AND 3  -- Registrierung & Onboarding
ORDER BY `order` ASC
```

## Verwandte Models

- [[03_Data_Models/User|User Model]] - Lehrer haben einen Status
- [[03_Data_Models/Teacher_Status_History|Teacher Status History]] - Status-Verlauf
