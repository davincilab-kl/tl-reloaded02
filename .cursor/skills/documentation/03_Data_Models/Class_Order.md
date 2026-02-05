---
title: Class Order Model
description: Datenmodell für Kurspaket-Bestellungen
enableToc: true
tags:
  - data-models
  - orders
  - invoices
---

# 🛒 Class Order Model

## Übersicht

Das `class_orders` Model speichert Bestellungen von Kurspaketen für Klassen.

## Datenbank-Schema

```sql
CREATE TABLE `class_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT 'Verknüpfung mehrerer Einträge zu einer Order',
  `class_id` int NOT NULL COMMENT 'FK zu classes',
  `course_package_id` int NOT NULL COMMENT 'FK zu course_packages',
  `provisioning_type` enum('funded','invoice','uew') NOT NULL,
  `student_count` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'User-ID des Bestellers',
  `school_year_id` int DEFAULT NULL COMMENT 'FK zu school_years',
  `status` enum('pending','paid','completed','cancelled') NOT NULL DEFAULT 'pending',
  `price_per_student` decimal(10,2) NOT NULL DEFAULT '12.00',
  `tax_rate` decimal(5,4) NOT NULL DEFAULT '0.2000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_course_package_id` (`course_package_id`),
  KEY `idx_provisioning_type` (`provisioning_type`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_school_year_id` (`school_year_id`),
  CONSTRAINT `class_orders_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_orders_ibfk_2` FOREIGN KEY (`course_package_id`) REFERENCES `course_packages` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Felder

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | int | Primärschlüssel | AUTO_INCREMENT, PRIMARY KEY |
| `order_id` | int | Order-Gruppierung | NOT NULL |
| `class_id` | int | FK zu classes | NOT NULL, FOREIGN KEY |
| `course_package_id` | int | FK zu course_packages | NOT NULL, FOREIGN KEY |
| `provisioning_type` | enum | Bereitstellungsform | NOT NULL |
| `student_count` | int | Anzahl Schüler | NOT NULL |
| `user_id` | int | Besteller (Teacher) | NOT NULL |
| `school_year_id` | int | FK zu school_years | NULL, FOREIGN KEY |
| `status` | enum | Bestellungs-Status | NOT NULL, DEFAULT 'pending' |
| `price_per_student` | decimal(10,2) | Preis pro Schüler | NOT NULL, DEFAULT '12.00' |
| `tax_rate` | decimal(5,4) | Steuersatz | NOT NULL, DEFAULT '0.2000' |
| `created_at` | timestamp | Erstellungszeit | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | timestamp | Letzte Aktualisierung | ON UPDATE CURRENT_TIMESTAMP |

## Bereitstellungsformen

### Funded (gefördert)
- **Wert:** `'funded'`
- **Beschreibung:** Kostenlos, durch Sponsor finanziert
- **Preis:** 0.00 EUR

### Invoice (Rechnung)
- **Wert:** `'invoice'`
- **Beschreibung:** Bezahlung per Rechnung
- **Preis:** Berechneter Preis

### UEW (Unterrichtsmittel eigener Wahl)
- **Wert:** `'uew'`
- **Beschreibung:** Bezahlung durch Schule
- **Preis:** Berechneter Preis

## Status-Werte

- **pending:** Ausstehend (noch nicht bezahlt)
- **paid:** Bezahlt
- **completed:** Abgeschlossen
- **cancelled:** Storniert

## Preis-Berechnung

```php
$subtotal = $price_per_student * $student_count;
$tax = $subtotal * $tax_rate;
$total = $subtotal + $tax;
```

## Beispiel-Daten

```json
{
  "id": 1,
  "order_id": 1,
  "class_id": 123,
  "course_package_id": 1,
  "provisioning_type": "invoice",
  "student_count": 25,
  "user_id": 456,
  "school_year_id": 1,
  "status": "pending",
  "price_per_student": 12.00,
  "tax_rate": 0.2000,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00"
}
```

## Verwendung

### Bestellung erstellen
```php
INSERT INTO class_orders (order_id, class_id, course_package_id, provisioning_type, student_count, user_id, school_year_id)
VALUES (?, ?, ?, ?, ?, ?, ?)
```

### Bestellungen abrufen
```php
SELECT * FROM class_orders
WHERE user_id = ?
ORDER BY created_at DESC
```

### Status aktualisieren
```php
UPDATE class_orders
SET status = ?
WHERE id = ?
```

## Verwandte Models

- [[03_Data_Models/Class|Class Model]] - Klasse
- [[03_Data_Models/Course_Package|Course Package Model]] - Kurspaket
- [[03_Data_Models/School_Year|School Year Model]] - Schuljahr
