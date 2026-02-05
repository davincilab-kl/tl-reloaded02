-- Füge Avatar-Felder zur users Tabelle hinzu
-- avatar_seed: Eindeutiger String für DiceBear Avatar-Generierung
-- avatar_style: Gewählter Avatar-Style (z.B. avataaars, bottts, identicon, etc.)
-- Diese Felder können für alle Rollen (Student, Teacher, Admin) verwendet werden

ALTER TABLE users 
ADD COLUMN avatar_seed VARCHAR(255) NULL,
ADD COLUMN avatar_style VARCHAR(50) NULL DEFAULT 'avataaars';

