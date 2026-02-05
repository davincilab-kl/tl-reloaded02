-- Skript zum Nachträgen fehlender initialer Einträge in teacher_status_history
-- Findet alle Lehrer ohne Historie-Eintrag und erstellt einen initialen Eintrag

-- 1. Finde alle Lehrer, die keinen Eintrag in teacher_status_history haben
-- 2. Erstelle für jeden einen initialen Eintrag mit dem aktuellen Status

INSERT INTO teacher_status_history (teacher_id, status_id, previous_status_id, changed_at)
SELECT 
    t.id AS teacher_id,
    t.status_id,
    NULL AS previous_status_id,
    NOW() AS changed_at
FROM teachers t
LEFT JOIN teacher_status_history h ON t.id = h.teacher_id
WHERE h.id IS NULL 
  AND t.status_id IS NOT NULL
ORDER BY t.id;

-- Zeige Statistiken
SELECT 
    COUNT(*) AS fehlende_eintraege_behoben
FROM teachers t
LEFT JOIN teacher_status_history h ON t.id = h.teacher_id
WHERE h.id IS NULL 
  AND t.status_id IS NOT NULL;

