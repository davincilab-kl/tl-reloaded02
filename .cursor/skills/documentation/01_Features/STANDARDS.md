---
title: Standards & Best Practices
description: Standardisierte Richtlinien für die Dokumentation
enableToc: true
tags:
  - standards
  - documentation
  - best-practices
---

# 📐 Standards & Best Practices

> [!abstract] Zweck
> Dieses Dokument definiert Standards und Best Practices für die Feature-Dokumentation, um Konsistenz und Klarheit sicherzustellen.

## Dokumentations-Struktur

### Standard-Struktur für Feature-Dokumente

```markdown
---
title: Feature Name - Kurzbeschreibung
description: Eine kurze Beschreibung des Features
enableToc: true
tags:
  - features
  - [kategorie]
---

# 🎯 Feature Name - Kurzbeschreibung

> [!abstract] User Story
> Als [Rolle] möchte ich [Ziel], um [Nutzen].

## Verwandte Features

- **Feature 1:** [[Link]] - Beschreibung
- **Feature 2:** [[Link]] - Beschreibung

## Übersicht

[Feature-Beschreibung]

## [Hauptabschnitte]

[Inhalt]

> [!tip] Implementation Hint
> [Hinweise für Implementierung]
```

## Status-Namen

### Projekt-Status (Standardisiert)

**Frontend/UI (Deutsch):**
1. **"In Bearbeitung"** - Projekt wird entwickelt
2. **"Zur Veröffentlichung eingereicht"** - Wartet auf Lehrer-Approval
3. **"Veröffentlicht"** - Projekt ist öffentlich sichtbar
4. **"Archiviert"** - Projekt wurde archiviert (optional)

**Backend/API (Englisch):**
1. `draft` - Projekt in Bearbeitung
2. `submitted_for_review` - Zur Veröffentlichung eingereicht
3. `published` - Veröffentlicht
4. `archived` - Archiviert

**Verwendung:**
- In User Stories und UI-Texten: Deutsche Status-Namen
- In technischer Dokumentation: Englische Status-Namen mit Mapping
- **Immer konsistent verwenden!**

## Terminologie

### Primäre Begriffe

| Begriff | Verwendung | Alternative |
|---------|-----------|-------------|
| Challenge | Primär | Wettbewerb |
| Lehrer | Primär | Lehrkraft |
| Projekt | Primär | Scratch-Projekt (nur wenn nötig) |
| Schüler | Primär | Student (nur in technischer Dokumentation) |

### Konsistenz-Regeln

1. **Ein Begriff pro Konzept:** Wähle einen Begriff und verwende ihn konsistent
2. **Kontext beachten:** In User-facing Texten: Deutsch, in technischer Dokumentation: Englisch oder Deutsch (konsistent)
3. **Glossar konsultieren:** Bei Unklarheiten [[01_Features/GLOSSARY|Glossar]] verwenden

## Gamification-Begriffe

### T!Coins
- **Schreibweise:** Immer "T!Coins" (großes T, Ausrufezeichen, großes C)
- **Definition:** Virtuelle Währung für Engagement
- **Zwei Kategorien:**
  - **Gesammelte T!Coins:** Für T!Score-Berechnung
  - **Verfügbare T!Coins:** Für Shop-Käufe

### T!Score
- **Schreibweise:** Immer "T!Score" (großes T, Ausrufezeichen, großes S)
- **Definition:** Durchschnittlicher Score für Klassen/Schulen
- **Berechnung:** Summe T!Coins ÷ Anzahl Schüler (aktuelles Schuljahr)
- **Wichtig:** Basiert auf gesammelten T!Coins, nicht verfügbaren T!Coins

## Formatierung

### Status-Namen
- **Fettdruck** für Status-Namen in Beschreibungen: **"In Bearbeitung"**
- Klare Unterscheidung zwischen UI-Status und Backend-Status

### Wichtige Hinweise
- **Wichtig:** Für wichtige Informationen
- **Achtung:** Für Warnungen und irreversible Aktionen
- **Hinweis:** Für zusätzliche Informationen

### Links
- Immer [[01_Features/...|Link-Text]] Format verwenden
- Verwandte Features immer am Anfang des Dokuments verlinken

## Workflow-Beschreibungen

### Standard-Format

1. **Nummerierte Schritte:** Klare, nummerierte Schritte
2. **Status-Änderungen:** Immer Status-Namen in **Fettdruck** erwähnen
3. **Voraussetzungen:** Klar definieren
4. **Konsequenzen:** Alle Folgen einer Aktion klar beschreiben

### Beispiel

```markdown
### 1. Projekt veröffentlichen
- **Zugriff:** [Wie]
- **Voraussetzung:** Projekt muss Status **"In Bearbeitung"** haben
- **Aktion:** [Was]
- **Ergebnis:** Status ändert sich zu **"Zur Veröffentlichung eingereicht"**
- **Konsequenz:** [Was passiert danach]
```

## Verknüpfungen

### Verwandte Features
- **Immer am Anfang:** Nach User Story, vor Übersicht
- **Konsistent formatieren:** [[Link|Name]] - Kurzbeschreibung
- **Relevante Links:** Nur wirklich relevante Features verlinken

### Glossar-Verweise
- Bei Begriffen, die erklärt werden müssen: [[01_Features/GLOSSARY|Glossar]] verlinken
- Besonders bei: T!Coins, T!Score, Status-Namen

## Best Practices

### Klarheit
- **Einfache Sprache:** Vermeide Fachjargon, wenn nicht nötig
- **Klare Struktur:** Überschriften und Abschnitte klar trennen
- **Beispiele:** Verwende konkrete Beispiele

### Vollständigkeit
- **Alle Schritte:** Jeder Workflow-Schritt dokumentieren
- **Alle Status:** Alle möglichen Status-Übergänge beschreiben
- **Alle Konsequenzen:** Alle Folgen einer Aktion klar machen

### Konsistenz
- **Einheitliche Begriffe:** Immer die gleichen Begriffe verwenden
- **Einheitliche Formatierung:** Gleiche Formatierung für ähnliche Inhalte
- **Einheitliche Struktur:** Ähnliche Features ähnlich strukturieren

> [!tip] Checkliste
> - [ ] Status-Namen konsistent verwendet?
> - [ ] Terminologie standardisiert?
> - [ ] Verwandte Features verlinkt?
> - [ ] Glossar-Verweise bei Bedarf?
> - [ ] Workflow-Schritte klar beschrieben?
> - [ ] Alle Konsequenzen dokumentiert?
