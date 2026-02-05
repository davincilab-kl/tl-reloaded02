---
title: Order Management - Bestellverwaltung
description: Verwaltung von Kurspaket-Bestellungen
enableToc: true
tags:
  - features
  - teacher
  - orders
  - invoices
---

# 🛒 Order Management - Bestellverwaltung

> [!abstract] User Story
> Als Lehrer möchte ich Kurspakete bestellen, Bestellungen einsehen und Rechnungen herunterladen.

## Verwandte Features

- **Course Management:** [[01_Features/Dashboard/Teacher/Course_Management|Course Management]] - Kurspakete
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Klassen für Bestellungen

## Data Models

- **Class Order:** [[03_Data_Models/Class_Order|Class Order Model]] - Bestellungs-Datenmodell
- **Course Package:** [[03_Data_Models/Course_Package|Course Package Model]] - Kurspaket-Datenmodell

## Übersicht

Das Order Management System ermöglicht es Lehrern, Kurspakete für ihre Klassen zu bestellen. Es unterstützt verschiedene Bereitstellungsformen (gefördert, Rechnung, UEW) und generiert automatisch Rechnungen.

## Hauptfunktionen

### 1. Bestellung erstellen

#### Bestellungs-Prozess
```
Lehrer → Wählt Klasse aus
  → Wählt Kurspaket aus
  → Wählt Bereitstellungsform
  → Gibt Anzahl Schüler ein
  → Bestellt
  → Bestellung wird erstellt
  → Rechnung wird generiert (falls nötig)
```

#### Bereitstellungsformen
- **Funded (gefördert):** Kostenlos, durch Sponsor finanziert
- **Invoice (Rechnung):** Bezahlung per Rechnung
- **UEW (Unterrichtsmittel eigener Wahl):** Bezahlung durch Schule

### 2. Bestellungen verwalten

#### Bestellungs-Übersicht
- **Alle Bestellungen:** Liste aller Bestellungen
- **Filter:** Nach Status, Schuljahr, Klasse filtern
- **Sortierung:** Nach Datum, Status sortieren

#### Bestellungs-Details
- **Klasse:** Klasse für die bestellt wurde
- **Kurspaket:** Bestelltes Kurspaket
- **Schüler-Anzahl:** Anzahl Schüler
- **Status:** Bestellungs-Status
- **Preis:** Preis pro Schüler
- **Gesamtpreis:** Gesamtpreis inkl. Steuern

### 3. Rechnungen

#### Rechnung generieren
- **Automatisch:** Rechnung wird automatisch generiert
- **PDF-Format:** Rechnung als PDF
- **Download:** Rechnung herunterladen
- **E-Mail:** Rechnung per E-Mail senden (optional)

#### Rechnungs-Details
- **Rechnungsnummer:** Eindeutige Rechnungsnummer
- **Rechnungsdatum:** Datum der Rechnung
- **Leistungen:** Bestellte Kurspakete
- **Preis:** Einzelpreise und Gesamtpreis
- **Steuern:** Steuersatz und Steuerbetrag
- **Gesamtbetrag:** Gesamtbetrag inkl. Steuern

## Bestellungs-Status

### Status-Werte
- **pending:** Ausstehend (noch nicht bezahlt)
- **paid:** Bezahlt
- **completed:** Abgeschlossen
- **cancelled:** Storniert

### Status-Übergänge
```
pending
  ↓ (Zahlung)
paid
  ↓ (Aktivierung)
completed
```

## API Endpoints

### Bestellungen

#### `GET /api/classes/get_class_orders.php`
Holt alle Bestellungen eines Lehrers.

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": 1,
      "class_id": 123,
      "class_name": "1A",
      "course_package_id": 1,
      "package_name": "DigiGrubi Basis",
      "provisioning_type": "invoice",
      "student_count": 25,
      "status": "pending",
      "price_per_student": 12.00,
      "tax_rate": 0.20,
      "total_price": 360.00,
      "school_year_id": 1,
      "school_year_name": "2024/2025",
      "created_at": "2024-01-15 10:30:00"
    }
  ]
}
```

#### `POST /api/classes/create_class_order.php`
Erstellt eine neue Bestellung.

**Request Body:**
```json
{
  "class_id": 123,
  "course_package_id": 1,
  "provisioning_type": "invoice",
  "student_count": 25,
  "school_year_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "order_id": 1,
    "class_id": 123,
    "course_package_id": 1,
    "provisioning_type": "invoice",
    "student_count": 25,
    "status": "pending",
    "price_per_student": 12.00,
    "total_price": 360.00
  }
}
```

### Rechnungen

#### `GET /api/classes/generate_invoice_pdf.php`
Generiert Rechnung als PDF.

**Parameters:**
- `order_id`: ID der Bestellung

**Response:**
- PDF-Datei (Content-Type: application/pdf)

## Workflow

### 1. Bestellung erstellen

```
Lehrer → Geht zu "Kurspakete"
  → Wählt "Bestellen"
  → Wählt Klasse
  → Wählt Kurspaket
  → Wählt Bereitstellungsform
  → Gibt Schüler-Anzahl ein
  → Bestätigt Bestellung
  → Bestellung wird erstellt
  → Rechnung wird generiert (falls nötig)
```

### 2. Rechnung herunterladen

```
Lehrer → Geht zu "Bestellverlauf"
  → Wählt Bestellung aus
  → Klickt "Rechnung herunterladen"
  → PDF wird generiert
  → PDF wird heruntergeladen
```

## Preis-Berechnung

### Berechnung
```php
$pricePerStudent = 12.00;  // EUR
$studentCount = 25;
$taxRate = 0.20;  // 20%

$subtotal = $pricePerStudent * $studentCount;  // 300.00
$tax = $subtotal * $taxRate;  // 60.00
$total = $subtotal + $tax;  // 360.00
```

### Bereitstellungsformen
- **Funded:** Preis = 0.00 (kostenlos)
- **Invoice:** Preis = berechneter Preis
- **UEW:** Preis = berechneter Preis

## Schuljahr-Verknüpfung

### Schuljahr
- **Aktuelles Schuljahr:** Wird automatisch zugewiesen
- **Manuelle Auswahl:** Lehrer kann Schuljahr wählen
- **Historie:** Bestellungen werden nach Schuljahr gruppiert

## Best Practices

1. **Korrekte Schüler-Anzahl:** Genaue Anzahl Schüler angeben
2. **Bereitstellungsform:** Richtige Bereitstellungsform wählen
3. **Schuljahr:** Korrektes Schuljahr wählen
4. **Rechnungen aufbewahren:** Rechnungen für Buchhaltung aufbewahren

## Zukünftige Erweiterungen

- **Zahlungs-Integration:** Online-Zahlung
- **Bestellungs-Historie:** Detaillierte Historie
- **Automatische Rechnungen:** Automatische Rechnungs-Generierung
- **E-Mail-Versand:** Rechnungen per E-Mail senden
