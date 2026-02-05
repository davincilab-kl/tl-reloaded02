# Quiz-System Dokumentation

## Datenbank-Schema

Das Quiz-System verwendet eine flexible Struktur, die verschiedene Fragetypen unterstützt.

### Tabellenstruktur

#### quizzes
Speichert die Quiz-Container für jede Lektion.

**Felder:**
- `id`: Eindeutige ID des Quiz
- `lection_id`: Verweis auf die Lektion
- `title`: Titel des Quiz (optional)
- `description`: Beschreibung des Quiz (optional)
- `created_at`, `updated_at`: Zeitstempel

#### quiz_questions
Speichert die einzelnen Fragen eines Quiz.

**Felder:**
- `id`: Eindeutige ID der Frage
- `quiz_id`: Verweis auf das Quiz
- `type`: Fragetyp (z.B. 'multiple_choice', 'single_choice', 'text', 'true_false', 'drag_drop', 'code')
- `title`: Titel/Überschrift der Frage
- `text`: Fragetext
- `order_index`: Reihenfolge der Frage im Quiz
- `points`: Punkte für diese Frage
- `required`: Muss die Frage beantwortet werden?
- `question_data`: JSON-Feld mit allen typspezifischen Daten (Optionen, Konfigurationen, etc.)

#### quiz_results
Speichert nur das Quiz-Ergebnis (ob bestanden), um die Lektion als erledigt zu markieren.

**Felder:**
- `id`: Eindeutige ID des Ergebnisses
- `student_id`: Verweis auf den Studenten
- `quiz_id`: Verweis auf das Quiz
- `points_earned`: Erreichte Punkte
- `points_total`: Maximale Punkte des Quiz
- `passed`: Wurde der Schwellenwert überschritten? (bestanden = 1, nicht bestanden = 0)
- `completed_at`: Zeitstempel der Quiz-Absolvierung

## Unterstützte Fragetypen

### 1. Multiple Choice (`multiple_choice`)
Mehrere Antworten können ausgewählt werden.

**quiz_questions.question_data:**
```json
{
  "options": [
    {"text": "Option 1", "is_correct": true, "explanation": "Richtig, weil..."},
    {"text": "Option 2", "is_correct": false, "explanation": "Falsch, weil..."},
    {"text": "Option 3", "is_correct": true, "explanation": "Richtig, weil..."},
    {"text": "Option 4", "is_correct": false, "explanation": "Falsch, weil..."}
  ],
  "min_selections": 1,
  "max_selections": 3
}
```

**Hinweis:** Einzelne Antworten werden nicht gespeichert. Nur das Gesamtergebnis wird in `quiz_results` gespeichert.

### 2. Single Choice (`single_choice`)
Nur eine Antwort kann ausgewählt werden.

**quiz_questions.question_data:**
```json
{
  "options": [
    {"text": "Option 1", "is_correct": false},
    {"text": "Option 2", "is_correct": true},
    {"text": "Option 3", "is_correct": false}
  ]
}
```

**Hinweis:** Einzelne Antworten werden nicht gespeichert. Nur das Gesamtergebnis wird in `quiz_results` gespeichert.

### 3. True/False (`true_false`)
Einfache Ja/Nein-Frage.

**quiz_questions.question_data:**
```json
{
  "correct_answer": true
}
```

**Hinweis:** Einzelne Antworten werden nicht gespeichert. Nur das Gesamtergebnis wird in `quiz_results` gespeichert.

### 4. Text-Antwort (`text`)
Freitext-Antwort.

**quiz_questions.question_data:**
```json
{
  "max_length": 500,
  "min_length": 10,
  "pattern": "^[A-Z].*",  // Optional: Regex-Pattern
  "case_sensitive": false
}
```

**Hinweis:** Einzelne Antworten werden nicht gespeichert. Nur das Gesamtergebnis wird in `quiz_results` gespeichert.

### 5. Drag & Drop (`drag_drop`)
Elemente müssen in die richtige Reihenfolge gebracht werden.

**quiz_questions.question_data:**
```json
{
  "items": [
    {"id": 0, "text": "Schritt 1"},
    {"id": 1, "text": "Schritt 2"},
    {"id": 2, "text": "Schritt 3"}
  ],
  "correct_order": [1, 0, 2]  // Indizes in der richtigen Reihenfolge
}
```

**Hinweis:** Einzelne Antworten werden nicht gespeichert. Nur das Gesamtergebnis wird in `quiz_results` gespeichert.

### 6. Code-Aufgabe (`code`)
Programmieraufgabe mit Code-Eingabe.

**quiz_questions.question_data:**
```json
{
  "language": "python",
  "template": "def function_name():\n    # Your code here\n    pass",
  "test_cases": [
    {
      "input": "test_input",
      "expected_output": "expected_output",
      "description": "Test Case 1"
    }
  ]
}
```

**Hinweis:** Einzelne Antworten werden nicht gespeichert. Nur das Gesamtergebnis wird in `quiz_results` gespeichert.

## Beispiel-Inserts

### Multiple Choice Frage erstellen:

```sql
-- Quiz erstellen
INSERT INTO quizzes (lection_id, title) VALUES (1, 'Grundlagen-Quiz');

-- Frage mit allen Daten erstellen
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, question_data)
VALUES (1, 'multiple_choice', 'Welche Sprachen sind Programmiersprachen?', 
        'Wählen Sie alle zutreffenden Antworten aus.', 1, 2,
        '{
          "options": [
            {"text": "Python", "is_correct": true, "explanation": "Python ist eine Programmiersprache"},
            {"text": "HTML", "is_correct": false, "explanation": "HTML ist eine Auszeichnungssprache"},
            {"text": "JavaScript", "is_correct": true, "explanation": "JavaScript ist eine Programmiersprache"},
            {"text": "CSS", "is_correct": false, "explanation": "CSS ist eine Stylesheet-Sprache"}
          ],
          "min_selections": 1,
          "max_selections": 3
        }');
```

### Text-Antwort Frage erstellen:

```sql
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, question_data)
VALUES (1, 'text', 'Erklären Sie...', 'Beschreiben Sie in eigenen Worten...', 2, 3,
        '{"max_length": 500, "min_length": 50}');
```

## Quiz-Ergebnisse speichern

Nachdem ein Student ein Quiz abgeschlossen hat, wird nur das Gesamtergebnis gespeichert:

```sql
-- Quiz-Ergebnis speichern (z.B. nach Abschluss des Quiz)
INSERT INTO quiz_results (student_id, quiz_id, points_earned, points_total, passed)
VALUES (123, 1, 8, 10, 1)  -- 8 von 10 Punkten erreicht, bestanden (Schwellenwert z.B. 70%)
ON DUPLICATE KEY UPDATE 
    points_earned = VALUES(points_earned),
    points_total = VALUES(points_total),
    passed = VALUES(passed),
    completed_at = CURRENT_TIMESTAMP;
```

**Schwellenwert-Logik:** Die `passed` Spalte wird basierend auf einem Schwellenwert (z.B. 70% der Punkte) gesetzt. Dies kann in der Anwendungslogik berechnet werden.

## Vorteile dieser Struktur

1. **Einfachheit**: Alles typspezifische in einem JSON-Feld - keine verwirrende Trennung
2. **Flexibilität**: Neue Fragetypen können einfach hinzugefügt werden, ohne Schema-Änderungen
3. **Konsistenz**: Alle Fragetypen verwenden das gleiche `question_data` Feld
4. **Weniger Tabellen**: Keine separate Options-Tabelle nötig - alles in einem JSON
5. **Minimaler Speicherbedarf**: Nur das Quiz-Ergebnis wird gespeichert, nicht jede einzelne Antwort
6. **Einfache Abfrage**: Schnell prüfbar, ob ein Student eine Lektion abgeschlossen hat

