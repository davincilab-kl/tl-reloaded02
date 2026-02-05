-- Quiz für Lektion "Benutzeroberfläche" (lection_id = 2) - Thema: Scratch

USE dbgqpq6nxd7mlp;
-- 1. Quiz erstellen
INSERT INTO quizzes (lection_id, title, description) 
VALUES (2, 'Quiz: Scratch', 'Testen Sie Ihr Wissen über Scratch - die visuelle Programmiersprache.');

SET @quiz_id = LAST_INSERT_ID();

-- 2. Fragen hinzufügen

-- Frage 1: Single Choice - Was ist Scratch?
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'single_choice', 'Was ist Scratch?', 
        'Wählen Sie die richtige Antwort aus.', 1, 2, 1,
        '{
          "options": [
            {"text": "Eine visuelle, blockbasierte Programmiersprache", "is_correct": true, "explanation": "Richtig! Scratch ist eine visuelle Programmiersprache, bei der man mit Blöcken programmiert."},
            {"text": "Ein Texteditor", "is_correct": false, "explanation": "Falsch. Scratch ist eine Programmiersprache, kein Texteditor."},
            {"text": "Ein Betriebssystem", "is_correct": false, "explanation": "Falsch. Scratch ist keine Betriebssystem."},
            {"text": "Eine Datenbank", "is_correct": false, "explanation": "Falsch. Scratch ist eine Programmiersprache."}
          ]
        }');

-- Frage 2: Multiple Choice - Scratch-Blöcke
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'multiple_choice', 'Welche Arten von Blöcken gibt es in Scratch?', 
        'Wählen Sie alle zutreffenden Antworten aus.', 2, 3, 1,
        '{
          "options": [
            {"text": "Bewegungs-Blöcke", "is_correct": true, "explanation": "Richtig! Bewegungs-Blöcke steuern die Bewegung von Sprites."},
            {"text": "Aussehen-Blöcke", "is_correct": true, "explanation": "Richtig! Aussehen-Blöcke ändern das Aussehen von Sprites."},
            {"text": "Ereignis-Blöcke", "is_correct": true, "explanation": "Richtig! Ereignis-Blöcke starten Skripte."},
            {"text": "Hardware-Blöcke", "is_correct": false, "explanation": "Falsch. Es gibt keine Hardware-Blöcke in der Standard-Version von Scratch."}
          ],
          "min_selections": 1,
          "max_selections": 3
        }');

-- Frage 3: True/False - Sprites
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'true_false', 'In Scratch werden die Objekte, die man programmiert, Sprites genannt.', 
        'Ist diese Aussage richtig oder falsch?', 3, 1, 1,
        '{
          "correct_answer": true
        }');

-- Frage 4: Single Choice - Grüner Flaggen-Block
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'single_choice', 'Was passiert, wenn man auf die grüne Flagge in Scratch klickt?', 
        'Wählen Sie die richtige Antwort aus.', 4, 2, 1,
        '{
          "options": [
            {"text": "Das Programm startet", "is_correct": true, "explanation": "Richtig! Die grüne Flagge startet das Programm."},
            {"text": "Das Programm wird gelöscht", "is_correct": false, "explanation": "Falsch. Die grüne Flagge startet das Programm, löscht es aber nicht."},
            {"text": "Das Programm wird gespeichert", "is_correct": false, "explanation": "Falsch. Die grüne Flagge startet das Programm, speichert es aber nicht automatisch."},
            {"text": "Das Programm wird gestoppt", "is_correct": false, "explanation": "Falsch. Die grüne Flagge startet das Programm, stoppt es aber nicht."}
          ]
        }');

-- Frage 5: Single Choice - Koordinatensystem
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'single_choice', 'Wo befindet sich der Ursprung (0, 0) im Scratch-Koordinatensystem?', 
        'Wählen Sie die richtige Antwort aus.', 5, 2, 1,
        '{
          "options": [
            {"text": "In der Mitte der Bühne", "is_correct": true, "explanation": "Richtig! Der Ursprung (0, 0) ist in der Mitte der Bühne."},
            {"text": "Oben links", "is_correct": false, "explanation": "Falsch. In Scratch ist der Ursprung in der Mitte."},
            {"text": "Unten links", "is_correct": false, "explanation": "Falsch. In Scratch ist der Ursprung in der Mitte."},
            {"text": "Oben rechts", "is_correct": false, "explanation": "Falsch. In Scratch ist der Ursprung in der Mitte."}
          ]
        }');

-- Frage 6: Multiple Choice - Schleifen in Scratch
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'multiple_choice', 'Welche Schleifen-Blöcke gibt es in Scratch?', 
        'Wählen Sie alle zutreffenden Antworten aus.', 6, 3, 1,
        '{
          "options": [
            {"text": "Wiederhole fortlaufend", "is_correct": true, "explanation": "Richtig! Das ist eine Endlosschleife in Scratch."},
            {"text": "Wiederhole (X) mal", "is_correct": true, "explanation": "Richtig! Das ist eine Zählschleife in Scratch."},
            {"text": "Wiederhole bis", "is_correct": true, "explanation": "Richtig! Das ist eine Bedingungsschleife in Scratch."},
            {"text": "Wiederhole für immer", "is_correct": false, "explanation": "Falsch. Der Block heißt Wiederhole fortlaufend, nicht für immer."}
          ],
          "min_selections": 1,
          "max_selections": 3
        }');

-- Frage 7: True/False - Variablen
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'true_false', 'In Scratch kann man Variablen erstellen, um Werte zu speichern.', 
        'Ist diese Aussage richtig oder falsch?', 7, 1, 1,
        '{
          "correct_answer": true
        }');

-- Frage 8: Single Choice - Bühne
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'single_choice', 'Was ist die Bühne in Scratch?', 
        'Wählen Sie die richtige Antwort aus.', 8, 2, 1,
        '{
          "options": [
            {"text": "Der Bereich, auf dem die Sprites sich bewegen", "is_correct": true, "explanation": "Richtig! Die Bühne ist der sichtbare Bereich, auf dem alles passiert."},
            {"text": "Ein spezieller Sprite", "is_correct": false, "explanation": "Falsch. Die Bühne ist kein Sprite, sondern der Hintergrund."},
            {"text": "Ein Programm-Block", "is_correct": false, "explanation": "Falsch. Die Bühne ist der sichtbare Bereich, kein Block."},
            {"text": "Eine Variable", "is_correct": false, "explanation": "Falsch. Die Bühne ist der sichtbare Bereich, keine Variable."}
          ]
        }');

-- Frage 9: Text-Antwort - Eigene Erklärung
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'text', 'Erklären Sie kurz, warum Scratch für Anfänger gut geeignet ist.', 
        'Geben Sie eine kurze Erklärung in eigenen Worten.', 9, 3, 1,
        '{
          "max_length": 300,
          "min_length": 20
        }');

-- Frage 10: Single Choice - Klone
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'single_choice', 'Was sind Klone in Scratch?', 
        'Wählen Sie die richtige Antwort aus.', 10, 2, 1,
        '{
          "options": [
            {"text": "Kopien von Sprites, die zur Laufzeit erstellt werden", "is_correct": true, "explanation": "Richtig! Klone sind Kopien von Sprites, die während des Programms erstellt werden."},
            {"text": "Ein spezieller Block-Typ", "is_correct": false, "explanation": "Falsch. Klone sind keine Blöcke, sondern Sprite-Kopien."},
            {"text": "Eine Art Variable", "is_correct": false, "explanation": "Falsch. Klone sind Sprite-Kopien, keine Variablen."},
            {"text": "Ein Hintergrundbild", "is_correct": false, "explanation": "Falsch. Klone sind Sprite-Kopien, keine Hintergründe."}
          ]
        }');

-- Frage 11: Multiple Choice - Ereignis-Blöcke
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'multiple_choice', 'Welche Ereignis-Blöcke gibt es in Scratch?', 
        'Wählen Sie alle zutreffenden Antworten aus.', 11, 3, 1,
        '{
          "options": [
            {"text": "Wenn die grüne Flagge angeklickt wird", "is_correct": true, "explanation": "Richtig! Das ist ein wichtiger Ereignis-Block."},
            {"text": "Wenn Taste gedrückt wird", "is_correct": true, "explanation": "Richtig! Das ist ein Ereignis-Block für Tasteneingaben."},
            {"text": "Wenn Sprite angeklickt wird", "is_correct": true, "explanation": "Richtig! Das ist ein Ereignis-Block für Mausklicks."},
            {"text": "Wenn Programm beendet wird", "is_correct": false, "explanation": "Falsch. Es gibt keinen solchen Block in Scratch."}
          ],
          "min_selections": 1,
          "max_selections": 3
        }');

-- Frage 12: True/False - Sound-Blöcke
INSERT INTO quiz_questions (quiz_id, type, title, text, order_index, points, required, question_data)
VALUES (@quiz_id, 'true_false', 'In Scratch kann man Sounds abspielen und selbst aufnehmen.', 
        'Ist diese Aussage richtig oder falsch?', 12, 1, 1,
        '{
          "correct_answer": true
        }');

-- Zusammenfassung
SELECT 
    'Quiz erstellt!' as Status,
    @quiz_id as Quiz_ID,
    (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = @quiz_id) as Anzahl_Fragen,
    (SELECT SUM(points) FROM quiz_questions WHERE quiz_id = @quiz_id) as Gesamtpunkte;
