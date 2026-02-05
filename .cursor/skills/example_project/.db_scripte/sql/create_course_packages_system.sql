-- Migration: Kurspakete-System einführen
-- Erstellt Tabellen für Kurspakete und Bestellungen
-- KEINE Änderungen an classes oder schools Tabellen

-- 1. Erstelle Tabelle course_packages mit JSON-Spalte für Kurs-IDs
CREATE TABLE IF NOT EXISTS course_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Name des Kurspakets',
    description TEXT NULL COMMENT 'Beschreibung des Kurspakets',
    course_ids JSON NULL COMMENT 'Array der Kurs-IDs als JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Erstelle Tabelle class_orders für Bestellungen
CREATE TABLE IF NOT EXISTS class_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT 'Verknüpfung mehrerer Einträge zu einer Order (für Rechnungsstellung)',
    class_id INT NOT NULL COMMENT 'Verknüpfung zur Klasse',
    course_package_id INT NOT NULL COMMENT 'Verknüpfung zum Kurspaket',
    provisioning_type ENUM('funded', 'invoice', 'uew') NOT NULL COMMENT 'Bereitstellungsform: funded=gefördert, invoice=Rechnung, uew=Unterrichtsmittel eigener Wahl',
    student_count INT NOT NULL COMMENT 'Anzahl der Schüler in dieser Bestellung',
    user_id INT NOT NULL COMMENT 'User-ID des Bestellers (teacher_id aus users.role_id)',
    status ENUM('pending', 'paid', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Status der Order: pending=ausstehend, paid=bezahlt, completed=abgeschlossen, cancelled=storniert',
    price_per_student DECIMAL(10,2) NOT NULL DEFAULT 12.00 COMMENT 'Preis pro Schüler in Euro',
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.2000 COMMENT 'Steuersatz (z.B. 0.2000 für 20%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_class_id (class_id),
    INDEX idx_course_package_id (course_package_id),
    INDEX idx_provisioning_type (provisioning_type),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (course_package_id) REFERENCES course_packages(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Erstelle initiales Paket "Alle Kurse" mit allen vorhandenen Kurs-IDs als JSON-Array
INSERT INTO course_packages (name, description, course_ids)
SELECT 
    'Alle Kurse', 
    'Dieses Paket enthält alle verfügbaren Kurse.',
    COALESCE(JSON_ARRAYAGG(id), JSON_ARRAY())
FROM courses
WHERE NOT EXISTS (SELECT 1 FROM course_packages WHERE name = 'Alle Kurse');

