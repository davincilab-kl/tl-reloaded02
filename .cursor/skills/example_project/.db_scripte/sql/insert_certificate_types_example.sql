-- Beispiel: Urkunden-Typ für Coding-Grundkurs einfügen
-- Für den coding-grundkurs ist die urkunde vom type: coding_1
-- Im template_file_path steht <zertifikatname>.jpg (z.B. "coding_1.jpg")

USE dbgqpq6nxd7mlp;
INSERT INTO certificate_types (type, title, description, template_file_path) 
VALUES 
    ('coding_1', 'Coding-Grundkurs', 'Urkunde für den erfolgreichen Abschluss des Coding-Grundkurses', 'coding_1.jpg')
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    description = VALUES(description),
    template_file_path = VALUES(template_file_path);

-- Weitere Beispiel-Urkunden-Typen können hier hinzugefügt werden:
-- INSERT INTO certificate_types (type, title, description, template_file_path) 
-- VALUES 
--     ('top_class', 'Top 3 in der Klasse', 'Urkunde für die Top 3 Platzierung in der Klasse', 'top_class.jpg'),
--     ('top_school', 'Top 3 in der Schule', 'Urkunde für die Top 3 Platzierung in der Schule', 'top_school.jpg'),
--     ('project_milestone_5', '5 Projekte veröffentlicht', 'Urkunde für 5 veröffentlichte Projekte', 'project_5.jpg'),
--     ('project_milestone_10', '10 Projekte veröffentlicht', 'Urkunde für 10 veröffentlichte Projekte', 'project_10.jpg')
-- ON DUPLICATE KEY UPDATE 
--     title = VALUES(title),
--     description = VALUES(description),
--     template_file_path = VALUES(template_file_path);

