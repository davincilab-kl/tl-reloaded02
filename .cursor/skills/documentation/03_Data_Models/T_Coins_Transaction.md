---
title: T!Coins Transaction Model - T!Coins-Transaktions-Datenmodell
description: Vollständiges Datenmodell für T!Coins-Transaktionen
enableToc: true
tags:
  - data-models
  - gamification
  - t-coins
  - transaction
---

# 💰 T!Coins Transaction Model - T!Coins-Transaktions-Datenmodell

> [!abstract] Übersicht
> Das T!Coins Transaction Model trackt alle T!Coins-Transaktionen (Verdienste und Ausgaben) für Gamification und T!Score-Berechnung.

## Verwandte Dokumentation

- **Student Stats:** [[01_Features/Dashboard/Student/Stats|Stats]] - T!Coins-Statistiken
- **Profile Customization:** [[01_Features/Dashboard/Student/Profile_Customization|Profile Customization]] - T!Coins-Shop
- **User Model:** [[03_Data_Models/User|User Model]] - T!Coins im User Model

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE t_coins_transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Zuordnung
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_year_id UUID NOT NULL REFERENCES school_years(id),
  
  -- Transaktion
  transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'spend'
  amount INTEGER NOT NULL, -- Betrag (positiv für earn, negativ für spend)
  balance_after INTEGER NOT NULL, -- Kontostand nach Transaktion
  
  -- Quelle/Ziel
  source_type VARCHAR(50) NOT NULL, -- 'lesson', 'quiz', 'project', 'challenge', 'shop', 'milestone', 'manual'
  source_id UUID, -- ID der Quelle (lesson_id, quiz_id, project_id, etc.)
  source_description TEXT, -- Beschreibung (z.B. "Lektion abgeschlossen", "Projekt veröffentlicht")
  
  -- Shop (für Ausgaben)
  shop_item_id UUID REFERENCES shop_items(id), -- Optional: Welches Shop-Item wurde gekauft?
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('earn', 'spend')),
  CONSTRAINT chk_source_type CHECK (source_type IN ('lesson', 'quiz', 'project', 'challenge', 'shop', 'milestone', 'manual')),
  CONSTRAINT chk_amount CHECK (
    (transaction_type = 'earn' AND amount > 0) OR
    (transaction_type = 'spend' AND amount < 0)
  ),
  
  -- Indizes
  INDEX idx_user_id (user_id),
  INDEX idx_school_year_id (school_year_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_source_type (source_type),
  INDEX idx_created_at (created_at)
);

-- Shop-Items (für T!Coins-Shop)
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  name VARCHAR(255) NOT NULL,
  description TEXT,
  item_type VARCHAR(50) NOT NULL, -- 'avatar_frame', 'profile_background', 'badge', 'title', 'effect'
  image_url TEXT,
  
  -- Preis
  price INTEGER NOT NULL, -- Preis in T!Coins
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_limited BOOLEAN NOT NULL DEFAULT false, -- Begrenzte Verfügbarkeit
  stock_count INTEGER, -- Verfügbare Anzahl (wenn limited)
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_item_type CHECK (item_type IN ('avatar_frame', 'profile_background', 'badge', 'title', 'effect')),
  CONSTRAINT chk_price CHECK (price > 0),
  
  -- Indizes
  INDEX idx_item_type (item_type),
  INDEX idx_is_active (is_active),
  INDEX idx_price (price)
);

-- Gekaufte Shop-Items (Many-to-Many)
CREATE TABLE user_shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true, -- Ob Item aktiv verwendet wird
  UNIQUE(user_id, shop_item_id),
  INDEX idx_user_id (user_id),
  INDEX idx_shop_item_id (shop_item_id)
);
```

## TypeScript Interface

```typescript
// t-coins-transaction.model.ts
export enum TransactionType {
  EARN = 'earn',
  SPEND = 'spend'
}

export enum SourceType {
  LESSON = 'lesson',
  QUIZ = 'quiz',
  PROJECT = 'project',
  CHALLENGE = 'challenge',
  SHOP = 'shop',
  MILESTONE = 'milestone',
  MANUAL = 'manual'
}

export enum ShopItemType {
  AVATAR_FRAME = 'avatar_frame',
  PROFILE_BACKGROUND = 'profile_background',
  BADGE = 'badge',
  TITLE = 'title',
  EFFECT = 'effect'
}

export interface TCoinsTransaction {
  // Primary Key
  id: string;
  
  // Zuordnung
  userId: string;
  schoolYearId: string;
  
  // Transaktion
  transactionType: TransactionType;
  amount: number; // Positiv für earn, negativ für spend
  balanceAfter: number; // Kontostand nach Transaktion
  
  // Quelle/Ziel
  sourceType: SourceType;
  sourceId?: string; // lesson_id, quiz_id, project_id, etc.
  sourceDescription?: string;
  
  // Shop
  shopItemId?: string;
  
  // Timestamps
  createdAt: Date;
  
  // Relations (nicht in DB)
  user?: User;
  schoolYear?: SchoolYear;
  shopItem?: ShopItem;
}

export interface ShopItem {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  name: string;
  description?: string;
  itemType: ShopItemType;
  imageUrl?: string;
  
  // Preis
  price: number; // T!Coins
  
  // Status
  isActive: boolean;
  isLimited: boolean;
  stockCount?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (nicht in DB)
  userShopItems?: UserShopItem[];
}

export interface UserShopItem {
  id: string;
  userId: string;
  shopItemId: string;
  purchasedAt: Date;
  isActive: boolean;
  
  // Relations
  user?: User;
  shopItem?: ShopItem;
}
```

## Felder-Erklärung

### Transaktion

#### `transaction_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'earn' - Verdient
  - 'spend' - Ausgegeben
- **Beschreibung:** Transaktions-Typ

#### `amount`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Beschreibung:** Betrag (positiv für earn, negativ für spend)
- **Constraint:** Muss positiv für earn, negativ für spend sein

#### `balance_after`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Beschreibung:** Kontostand nach Transaktion
- **Verwendung:** Für Audit-Trail

### Quelle/Ziel

#### `source_type`
- **Typ:** VARCHAR(50)
- **Pflicht:** Ja
- **Werte:**
  - 'lesson' - Lektion abgeschlossen
  - 'quiz' - Quiz bestanden
  - 'project' - Projekt veröffentlicht
  - 'challenge' - Challenge gewonnen
  - 'shop' - Shop-Kauf
  - 'milestone' - Meilenstein erreicht
  - 'manual' - Manuell (durch Admin/Lehrer)
- **Beschreibung:** Quelle der Transaktion

#### `source_id`
- **Typ:** UUID
- **Pflicht:** Nein
- **Beschreibung:** ID der Quelle (lesson_id, quiz_id, project_id, etc.)

#### `source_description`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Beschreibung (z.B. "Lektion abgeschlossen", "Projekt veröffentlicht")

## T!Coins-Berechnung

### Gesammelte T!Coins (`t_coins_total`)
- **Berechnung:** Summe aller `earn`-Transaktionen
- **Wichtig:** Wird nie reduziert (nur erhöht)
- **Verwendung:** Für T!Score-Berechnung

### Verfügbare T!Coins (`t_coins_available`)
- **Berechnung:** `t_coins_total - shop_ausgaben`
- **Verwendung:** Für Shop-Käufe

### T!Score
- **Berechnung:** `t_coins_total / anzahl_schüler_in_klasse`
- **Wichtig:** Basiert auf gesammelten T!Coins, nicht auf verfügbaren

## Beziehungen

### Zu anderen Modellen

- **Users:** `t_coins_transactions.user_id` → `users.id` (One-to-Many)
- **School Years:** `t_coins_transactions.school_year_id` → `school_years.id` (One-to-Many)
- **Shop Items:** `shop_items.id` → `user_shop_items.shop_item_id` (Many-to-Many)

## Beispiel-Daten

```json
{
  "id": "330e8400-e29b-41d4-a716-446655440015",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "schoolYearId": "880e8400-e29b-41d4-a716-446655440006",
  "transactionType": "earn",
  "amount": 50,
  "balanceAfter": 1500,
  "sourceType": "lesson",
  "sourceId": "dd0e8400-e29b-41d4-a716-446655440010",
  "sourceDescription": "Lektion abgeschlossen: Einführung in Scratch",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

> [!tip] Implementation Hint
> - T!Coins werden pro Schuljahr getrackt
> - Gesammelte T!Coins werden nie reduziert (nur erhöht)
> - Verfügbare T!Coins = Gesammelte - Shop-Ausgaben
> - T!Score basiert auf gesammelten T!Coins
> - Cache T!Coins-Statistiken für Performance
> - Validierung: Prüfe, ob genug T!Coins für Shop-Kauf vorhanden sind
