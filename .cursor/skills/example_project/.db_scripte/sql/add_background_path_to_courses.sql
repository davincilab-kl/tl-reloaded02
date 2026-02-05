-- Füge background_path Spalte zur courses Tabelle hinzu
ALTER TABLE courses 
ADD COLUMN background_path VARCHAR(255) NULL AFTER cover_path;

