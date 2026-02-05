-- SQL-Script: Setzt alle Werte einer Spalte auf 0
-- 
-- ANPASSUNGEN ERFORDERLICH:
-- 1. Ersetze 'tabellenname' mit dem Namen der Tabelle
-- 2. Ersetze 'spaltenname' mit dem Namen der Spalte, die auf 0 gesetzt werden soll
--
-- BEISPIEL:
-- UPDATE students SET t_coins = 0;
-- UPDATE teachers SET status_id = 0;

UPDATE tabellenname 
SET spaltenname = 0;

-- Optional: Nur bestimmte Zeilen aktualisieren (WHERE-Klausel hinzufügen)
-- UPDATE tabellenname 
-- SET spaltenname = 0
-- WHERE bedingung;

-- Optional: Anzahl der betroffenen Zeilen anzeigen
-- SELECT ROW_COUNT() AS betroffene_zeilen;

