---
title: Certificates - Urkunden
description: Urkunden-Anzeige und -Verwaltung für Schüler
enableToc: true
tags:
  - features
  - student
  - certificates
---

# 🏆 Certificates - Urkunden

> [!abstract] User Story
> Als Schüler möchte ich meine erhaltenen Urkunden ansehen, herunterladen und teilen können.

## Verwandte Features

- **Admin Certificate Management:** [[01_Features/Dashboard/Admin/Certificate_Management|Certificate Management]] - Urkunden-Erstellung
- **Stats:** [[01_Features/Dashboard/Student/Stats|Stats]] - Urkunden-Statistiken
- **Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Urkunden-Übersicht

## Data Models

- **Certificate Model:** [[03_Data_Models/Certificate|Certificate Model]] - Urkunden-Datenmodell
- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell

## Übersicht

Schüler können alle erhaltenen Urkunden ansehen, als PDF herunterladen und optional teilen. Urkunden werden automatisch bei Kursabschluss, Challenge-Gewinn oder Meilensteinen vergeben.

## Meine Urkunden

### Urkunden-Übersicht
- **Alle Urkunden:** Liste aller erhaltenen Urkunden
- **Filter:**
  - Nach Typ (Kursabschluss, Challenge, Meilenstein)
  - Nach Kurs
  - Nach Challenge
  - Nach Datum
- **Sortierung:**
  - Neueste zuerst
  - Nach Typ
  - Nach Kurs

### Urkunden-Karten
- **Urkunden-Thumbnail:** Vorschaubild der Urkunde
- **Titel:** Urkunden-Name
- **Typ:** Kursabschluss, Challenge, Meilenstein
- **Datum:** Wann wurde Urkunde erhalten
- **Kurs/Challenge:** Zu welchem Kurs/Challenge gehört die Urkunde

## Urkunden-Details

### Detailansicht
- **Vollständige Urkunde:** Großes Bild der Urkunde
- **Informationen:**
  - Schülername
  - Kursname/Challenge-Name
  - Datum
  - Beschreibung
- **Aktionen:**
  - PDF herunterladen
  - Urkunde teilen (optional)
  - Zurück zur Übersicht

## PDF-Download

### Download-Funktion
- **PDF-Generierung:** PDF wird bei Bedarf generiert
- **Qualität:** Hohe Qualität für Druck
- **Format:** Standard PDF-Format
- **Dateiname:** "Urkunde_[Titel]_[Datum].pdf"

### Download-Optionen
- **Einzelne Urkunde:** Eine Urkunde herunterladen
- **Mehrere Urkunden:** Mehrere Urkunden als ZIP herunterladen
- **Alle Urkunden:** Alle Urkunden als ZIP herunterladen

## Urkunden teilen

### Teilen-Optionen
- **Link kopieren:** Link zur Urkunde kopieren
- **QR-Code:** QR-Code generieren
- **Social Media:** In sozialen Medien teilen (optional)
- **E-Mail:** Per E-Mail teilen (optional)

### Öffentliche Urkunden
- **Sichtbarkeit:** Urkunden können öffentlich oder privat sein
- **Einstellungen:** Schüler kann Sichtbarkeit ändern (optional)

## Urkunden-Statistiken

### Persönliche Statistiken
- **Gesamt:** Anzahl aller erhaltenen Urkunden
- **Nach Typ:**
  - Kursabschluss-Urkunden
  - Challenge-Urkunden
  - Meilenstein-Urkunden
- **Aktuelles Schuljahr:** Urkunden im laufenden Schuljahr

### Urkunden-Historie
- **Chronologisch:** Urkunden nach Datum sortiert
- **Timeline:** Visuelle Timeline der Urkunden

## Automatische Vergabe

### Kursabschluss-Urkunden
- **Automatisch:** Bei Kursabschluss wird Urkunde automatisch vergeben
- **Benachrichtigung:** Schüler wird benachrichtigt
- **Anzeige:** Urkunde erscheint in "Meine Urkunden"

### Challenge-Gewinner-Urkunden
- **Automatisch:** Bei Challenge-Gewinn wird Urkunde automatisch vergeben
- **Benachrichtigung:** Schüler wird benachrichtigt
- **Anzeige:** Urkunde erscheint in "Meine Urkunden"

### Meilenstein-Urkunden
- **Automatisch:** Bei Meilenstein wird Urkunde automatisch vergeben
- **Beispiele:**
  - 10 Projekte veröffentlicht
  - 1000 T!Coins erreicht
  - 5 Challenges gewonnen
- **Benachrichtigung:** Schüler wird benachrichtigt

## Integration

### Dashboard
- **Übersicht:** Anzahl Urkunden im Dashboard
- **Neueste Urkunde:** Neueste Urkunde wird angezeigt
- **Link:** Direkter Link zu "Meine Urkunden"

### Stats
- **Statistiken:** Urkunden in Statistiken
- **Vergleich:** Vergleich mit anderen Schülern

### Profile Customization
- **Anzeige:** Urkunden können im Profil angezeigt werden
- **Showcase:** Beste Urkunden im Profil

> [!tip] Implementation Hint
> - Implementiere Lazy Loading für Urkunden-Liste
> - Cache PDF-Generierung für bessere Performance
> - Implementiere Sharing-Funktionalität
> - Urkunden sollten als hochwertige PDFs generiert werden
