-- Migration bestehender Admins in admins Tabelle
-- Migriert alle bestehenden Admin-Users (role='admin') in die neue admins Tabelle

USE dbgqpq6nxd7mlp;

-- Prüfe ob admins Tabelle existiert
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'dbgqpq6nxd7mlp' 
    AND table_name = 'admins'
);

-- Nur ausführen wenn admins Tabelle existiert
SET @sql = IF(@table_exists > 0,
    'INSERT INTO admins (teacher_id, student_id, created_at)
    SELECT 
        t.id as teacher_id,
        COALESCE(t.student_id, 0) as student_id,
        COALESCE(u.created_at, NOW()) as created_at
    FROM users u
    INNER JOIN teachers t ON u.role_id = t.id
    WHERE u.role = ''admin''
    AND NOT EXISTS (
        SELECT 1 FROM admins a WHERE a.teacher_id = t.id
    )
    AND t.student_id IS NOT NULL
    AND t.student_id > 0',
    'SELECT ''admins Tabelle existiert nicht. Bitte zuerst create_admins_table.sql ausführen.'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Zeige Anzahl migrierter Admins
SELECT COUNT(*) as migrated_admins FROM admins;
