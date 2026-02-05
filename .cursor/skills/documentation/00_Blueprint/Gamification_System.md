---
title: Gamification System - T!Coins und T!Score
description: Erklärung des Gamification-Systems mit T!Coins und T!Score
enableToc: true
tags:
  - blueprint
  - gamification
---

# 🎮 Gamification System - T!Coins und T!Score

## Übersicht

Das Gamification-System motiviert Schüler durch Belohnungen und schafft einen gesunden Wettbewerb auf Klassen- und Schulebene.

## T!Coins - Persönliche Belohnungen

### Was sind T!Coins?
- **Persönliche Währung:** T!Coins sind Belohnungen für individuelle Leistungen
- **Verdienstquellen:**
  - Lektionen abschließen
  - Quiz bestehen
  - Projekte erstellen und veröffentlichen
  - Challenges gewinnen
  - Engagement und Aktivität
- **Zweck:**
  - Motivation für persönliche Fortschritte
  - Messung des individuellen Engagements
  - Belohnung für Lernaktivitäten

### T!Coins-Typen

**Wichtig:** T!Coins werden in zwei Kategorien unterschieden:

#### 1. Gesammelte T!Coins (für T!Score)
- **Definition:** Alle verdienten T!Coins seit Account-Erstellung
- **Zweck:** Diese T!Coins zählen für T!Score-Berechnung
- **Wichtig:** **T!Coins-Ausgaben im Shop beeinflussen T!Score NICHT**
- **Berechnung:** T!Score basiert auf gesammelten T!Coins, nicht auf verfügbaren T!Coins
- **Anzeige:** "Gesammelt: 150 T!Coins" (immer steigend, nie sinkend)
- **Verwendung:** Nur für T!Score-Berechnung, nicht für Shop-Käufe

#### 2. Verfügbare T!Coins (für Shop)
- **Definition:** Aktuell verfügbare T!Coins für Shop-Käufe
- **Berechnung:** Gesammelte T!Coins - Ausgaben im Shop
- **Zweck:** Diese T!Coins können im T!Coins-Shop ausgegeben werden
- **Anzeige:** "Verfügbar: 120 T!Coins" (kann sinken durch Käufe)
- **Verwendung:** Nur für Shop-Käufe, nicht für T!Score-Berechnung

**Beispiel:**
- Schüler verdient 150 T!Coins → Gesammelt: 150, Verfügbar: 150
- Schüler kauft Item für 30 T!Coins → Gesammelt: 150 (unverändert), Verfügbar: 120
- T!Score basiert weiterhin auf 150 T!Coins (nicht auf 120)

### T!Coins verdienen

#### Zentrale T!Coins-Tabelle

| Aktivität | T!Coins | Kategorie | Hinweise |
|-----------|---------|-----------|----------|
| **Lektionen** |
| Lektion abschließen | 10 | Kurs | Pro abgeschlossene Lektion |
| Quiz bestehen | 5 | Kurs | Bonus zusätzlich zu Lektion |
| Challenge innerhalb Lektion | 15 | Kurs | Zusätzliche T!Coins für Lektions-Challenge |
| **Projekte** |
| Projekt erstellen | 3 | Projekt | Pro neu erstelltes Projekt |
| Projekt veröffentlichen | 5 | Projekt | Nach Lehrer-Approval |
| Like auf Projekt erhalten | 1 | Projekt | Pro Like (max. 1x pro Benutzer) |
| Kommentar auf Projekt erhalten | 2 | Projekt | Pro Kommentar (max. 1x pro Benutzer) |
| Projekt remixt | 3 | Projekt | Wenn jemand dein Projekt als Vorlage nutzt |
| **Challenges** |
| Challenge-Teilnahme | 10 | Challenge | Pro Challenge-Teilnahme |
| Challenge gewinnen (1. Platz) | 100 | Challenge | Zusätzlich zu Teilnahme |
| Challenge gewinnen (2. Platz) | 50 | Challenge | Zusätzlich zu Teilnahme |
| Challenge gewinnen (3. Platz) | 25 | Challenge | Zusätzlich zu Teilnahme |
| **Engagement** |
| Täglicher Login (Streak) | 1 | Engagement | Pro Tag im Streak (max. 7 pro Woche) |
| Kurs vollständig abschließen | 50 | Kurs | Bonus für Kursabschluss |
| Urkunde erhalten | 20 | Achievement | Pro erhaltene Urkunde |

**Hinweise:**
- T!Coins werden pro Schuljahr gesammelt
- Historische T!Coins bleiben im jeweiligen Schuljahr gespeichert
- **Wichtig:** T!Coins-Ausgaben im Shop beeinflussen T!Score NICHT
  - Gesammelte T!Coins (für T!Score) bleiben unverändert
  - Nur verfügbare T!Coins (für Shop) werden durch Käufe reduziert
- T!Coins können im T!Coins-Shop ausgegeben werden (siehe [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]])
- Siehe [[01_Features/Settings/Profile|Profile Management]] für T!Coins-Verwaltung

### T!Coins anzeigen
- **Dashboard:** 
  - Gesammelte T!Coins (für T!Score)
  - Verfügbare T!Coins (für Shop)
- **Statistiken:** T!Coins nach Zeitraum (Schuljahr, Woche)
- **Verdienstquellen:** Übersicht, wie T!Coins verdient wurden
- **Transaktionen:** Alle T!Coins-Transaktionen (Verdienste und Ausgaben)

## T!Score - Gruppen-Vergleiche

### Was ist T!Score?
- **Gruppen-Score:** T!Score ist der durchschnittliche Score einer Klasse oder Schule
- **Berechnung:**
  - **Klassen-T!Score:** Summe aller T!Coins der Klassenmitglieder ÷ Anzahl Schüler in der Klasse
  - **Schul-T!Score:** Summe aller T!Coins aller Schüler der Schule ÷ Anzahl Schüler in der Schule
- **Formel:**
  ```
  Klassen-T!Score = Σ(T!Coins aller Klassenmitglieder) / Anzahl Schüler
  Schul-T!Score = Σ(T!Coins aller Schüler) / Anzahl Schüler
  ```
- **Zweck:**
  - Fairer Vergleich zwischen Klassen (unabhängig von Klassengröße)
  - Fairer Vergleich zwischen Schulen (unabhängig von Schulgröße)
  - Motivation durch Team-Erfolg
  - Förderung von Zusammenarbeit

### Schuljahrspezifität
- **Wichtig:** T!Score wird schuljahrspezifisch berechnet
- **Berechnung:**
  - Nur T!Coins des aktuellen Schuljahres werden berücksichtigt
  - Nur Schüler, die im aktuellen Schuljahr aktiv sind, werden gezählt
- **Filter:**
  - Dashboard zeigt T!Score des aktuellen Schuljahres
  - Statistiken können nach Schuljahr gefiltert werden
  - Leaderboards zeigen Rankings des aktuellen Schuljahres

## Schuljahr-Struktur

### Schuljahr-Definition

Ein Schuljahr wird in der Datenbank als Tabelle mit folgenden Feldern gespeichert:

| Feld | Typ | Beschreibung | Beispiel |
|------|-----|--------------|----------|
| `id` | UUID | Eindeutige ID | `550e8400-e29b-41d4-a716-446655440000` |
| `title` | String | Schuljahr-Titel | `"2025/2026"` |
| `start_date` | Date | Startdatum | `2025-09-01` |
| `end_date` | Date | Enddatum | `2026-06-30` |
| `is_active` | Boolean | Ist aktuelles Schuljahr | `true` |
| `created_at` | Timestamp | Erstellungsdatum | `2025-01-01T00:00:00Z` |
| `updated_at` | Timestamp | Letzte Aktualisierung | `2025-01-27T12:00:00Z` |

### Schuljahr-Format

- **Titel:** Format `"YYYY/YYYY"` (z.B. `"2025/2026"`)
- **Startdatum:** Typischerweise 1. September (z.B. `01.09.2025`)
- **Enddatum:** Typischerweise 30. Juni (z.B. `30.06.2026`)
- **Anzeige:** Kombiniert Titel und Datum (z.B. `"2025/2026 (01.09.25 bis 30.06.26)"`)

### Schuljahr-Verwaltung

- **Aktuelles Schuljahr:** Nur ein Schuljahr kann als `is_active = true` markiert sein
- **Automatische Übertragung:** Klassen können ins aktuelle Schuljahr übertragen werden
- **T!Coins:** Werden pro Schuljahr gesammelt, historische T!Coins bleiben im jeweiligen Schuljahr gespeichert
- **Statistiken:** Können nach Schuljahr gefiltert werden

### T!Score-Ebenen
- **Klassen-T!Score:**
  - Durchschnittlicher Score aller Schüler einer Klasse (im aktuellen Schuljahr)
  - Vergleich mit anderen Klassen der Schule
  - Anzeige in Leaderboards (Top 3 Klassen)
- **Schul-T!Score:**
  - Durchschnittlicher Score aller Schüler einer Schule (im aktuellen Schuljahr)
  - Vergleich mit anderen Schulen
  - Regionale/nationale Rankings

### T!Score anzeigen
- **Dashboard:** Klassen- und Schul-T!Score (aktuelles Schuljahr)
- **Leaderboards:** Top 3 Klassen und Schulen (aktuelles Schuljahr)
- **Statistiken:** Entwicklung über Zeit, nach Schuljahr filterbar

## Unterschiede

### T!Coins vs. T!Score
- **T!Coins:**
  - Persönlich
  - Individuelle Belohnungen
  - Fokus auf persönliche Fortschritte
- **T!Score:**
  - Gruppen-basiert
  - Vergleich zwischen Klassen/Schulen
  - Fokus auf Team-Erfolg

## Integration

### Dashboard
- **Persönliche Box:** T!Coins gesamt
- **Klassen-Box:** Klassen-T!Score
- **Schul-Box:** Schul-T!Score

### Leaderboards
- **Klassen-Ranking:** Nach T!Score sortiert
- **Schüler-Ranking:** Nach T!Coins sortiert

### Statistiken
- **Persönlich:** T!Coins-Entwicklung
- **Vergleich:** Klassen- und Schul-T!Score

## Design-Prinzipien

### Motivation
- **Positiv:** Fokus auf Belohnungen, nicht auf Bestrafungen
- **Fair:** Transparente Berechnung
- **Erreichbar:** Realistische Ziele

### Balance
- **Individuell vs. Team:** Balance zwischen persönlichen und Gruppen-Erfolgen
- **Wettbewerb vs. Zusammenarbeit:** Förderung von Teamwork ohne übermäßigen Druck
