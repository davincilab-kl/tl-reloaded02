
-- Prüfe welche Lehrer noch keinen Student-Eintrag haben und erstelle diese
-- Schritt 1: Erstelle Student-Einträge für alle Lehrer ohne student_id
INSERT INTO students (class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins, is_teacher_placeholder)
SELECT 
    NULL as class_id,
    t.school_id,
    0 as courses_done,
    0 as projects_wip,
    0 as projects_pending,
    0 as projects_public,
    0 as t_coins,
    1 as is_teacher_placeholder
FROM teachers t
INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
LEFT JOIN students s ON s.id = t.id AND s.is_teacher_placeholder = 1
WHERE (t.student_id IS NULL OR t.student_id = 0)
AND s.id IS NULL
AND t.id > 0;

-- Schritt 2: Aktualisiere student_id in teachers Tabelle
-- Verwende einen Subquery-Ansatz: Für jeden Lehrer ohne student_id,
-- finde den neuesten Student-Eintrag mit is_teacher_placeholder = 1 und gleicher school_id,
-- der noch keinem anderen Lehrer zugeordnet ist
UPDATE teachers t
INNER JOIN (
    SELECT 
        t2.id as teacher_id,
        s2.id as student_id,
        ROW_NUMBER() OVER (PARTITION BY t2.id ORDER BY s2.id DESC) as rn
    FROM teachers t2
    INNER JOIN users u2 ON u2.role_id = t2.id AND u2.role = 'teacher'
    INNER JOIN students s2 ON s2.school_id = t2.school_id 
        AND s2.is_teacher_placeholder = 1 
        AND s2.class_id IS NULL
        AND s2.id NOT IN (SELECT COALESCE(student_id, 0) FROM teachers WHERE student_id IS NOT NULL AND student_id > 0)
    WHERE (t2.student_id IS NULL OR t2.student_id = 0)
    AND t2.id > 0
    AND t2.school_id IS NOT NULL
) matched ON matched.teacher_id = t.id AND matched.rn = 1
SET t.student_id = matched.student_id
WHERE t.id > 0;
