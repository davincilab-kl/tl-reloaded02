-- Tabelle für Challenge-Teilnahmen (Many-to-Many Beziehung zwischen Challenges und Projekten)
-- Ein Projekt kann an mehreren Challenges teilnehmen
-- Eine Challenge kann mehrere Projekte enthalten

CREATE TABLE IF NOT EXISTS challenge_participations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_challenge_project (challenge_id, project_id),
    KEY idx_challenge_id (challenge_id),
    KEY idx_project_id (project_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

