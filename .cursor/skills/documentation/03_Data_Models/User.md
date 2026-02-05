---
title: User Model - Benutzer-Datenmodell
description: Vollständiges Datenmodell für Benutzer (Student, Teacher, Admin)
enableToc: true
tags:
  - data-models
  - user
  - auth
  - student
  - teacher
  - admin
---

# 👤 User Model - Benutzer-Datenmodell

> [!abstract] Übersicht
> Das User Model repräsentiert alle Benutzer der Plattform (Schüler, Lehrer, Admin) mit rollenspezifischen Feldern und Authentifizierungs-Daten.

## Verwandte Dokumentation

- **Auth System:** [[00_Blueprint/Auth_System|Auth System]] - Authentifizierungs-Details
- **WordPress Migration:** [[00_Blueprint/WordPress_Migration|WordPress Migration]] - Passwort-Migration
- **Student Password System:** [[01_Features/Auth/Student_Password_System|Student Password System]] - Schülerpasswort-Details

## Datenbank-Schema

### PostgreSQL Schema

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Informationen
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_title VARCHAR(20), -- 'Herr', 'Frau', 'Divers'
  email VARCHAR(255) UNIQUE, -- NULL für Schüler
  phone VARCHAR(20), -- Format: +436991234567
  
  -- Rolle & Berechtigungen
  role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student', 'teacher', 'admin'
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Authentifizierung (Teacher/Admin)
  username VARCHAR(100) UNIQUE, -- NULL für Schüler
  password_hash TEXT, -- Better Auth Hash
  password_migrated BOOLEAN NOT NULL DEFAULT false,
  password_hash_wp TEXT, -- WordPress Hash (für Migration)
  
  -- Schülerpasswort (nur für Studenten)
  student_password_hash TEXT UNIQUE, -- Passwort-only Hash
  student_password_plain TEXT, -- Nur für Lehrer-Anzeige (verschlüsselt gespeichert)
  
  -- Profil
  avatar_id VARCHAR(100), -- Avatar aus Avatar-Bibliothek
  bio TEXT, -- Optional
  profile_visibility VARCHAR(20) NOT NULL DEFAULT 'public', -- 'public', 'class', 'private'
  
  -- Schule & Klasse (für Schüler)
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  
  -- Gamification
  t_coins_total INTEGER NOT NULL DEFAULT 0, -- Gesammelte T!Coins (für T!Score)
  t_coins_available INTEGER NOT NULL DEFAULT 0, -- Verfügbare T!Coins (nach Shop-Ausgaben)
  t_score DECIMAL(10, 2), -- Berechnet: t_coins_total / Anzahl Schüler in Klasse
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP,
  password_changed_at TIMESTAMP,
  
  -- WordPress Migration
  wp_user_id INTEGER, -- Original WordPress User ID
  wp_migrated_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT chk_role CHECK (role IN ('student', 'teacher', 'admin')),
  CONSTRAINT chk_student_password CHECK (
    (role = 'student' AND student_password_hash IS NOT NULL) OR
    (role != 'student' AND student_password_hash IS NULL)
  ),
  CONSTRAINT chk_email_teacher CHECK (
    (role IN ('teacher', 'admin') AND email IS NOT NULL) OR
    (role = 'student')
  ),
  
  -- Indizes
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_student_password_hash (student_password_hash),
  INDEX idx_role (role),
  INDEX idx_school_id (school_id),
  INDEX idx_class_id (class_id),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
);
```

## TypeScript Interface

```typescript
// user.model.ts
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  CLASS = 'class',
  PRIVATE = 'private'
}

export enum PreferredTitle {
  HERR = 'Herr',
  FRAU = 'Frau',
  DIVERS = 'Divers'
}

export interface User {
  // Primary Key
  id: string;
  
  // Basis-Informationen
  firstName: string;
  lastName: string;
  preferredTitle?: PreferredTitle;
  email?: string; // NULL für Schüler
  phone?: string;
  
  // Rolle & Berechtigungen
  role: UserRole;
  isActive: boolean;
  
  // Authentifizierung (Teacher/Admin)
  username?: string; // NULL für Schüler
  passwordHash?: string; // Better Auth Hash
  passwordMigrated: boolean;
  passwordHashWp?: string; // WordPress Hash (für Migration)
  
  // Schülerpasswort (nur für Studenten)
  studentPasswordHash?: string; // Passwort-only Hash
  studentPasswordPlain?: string; // Verschlüsselt gespeichert (nur für Lehrer-Anzeige)
  
  // Profil
  avatarId?: string;
  bio?: string;
  profileVisibility: ProfileVisibility;
  
  // Schule & Klasse (für Schüler)
  schoolId?: string;
  classId?: string;
  
  // Gamification
  tCoinsTotal: number; // Gesammelte T!Coins
  tCoinsAvailable: number; // Verfügbare T!Coins
  tScore?: number; // Berechnet
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  
  // WordPress Migration
  wpUserId?: number;
  wpMigratedAt?: Date;
}

// Rollen-spezifische Interfaces
export interface Student extends User {
  role: UserRole.STUDENT;
  studentPasswordHash: string;
  schoolId: string;
  classId: string;
  email: null;
  username: null;
}

export interface Teacher extends User {
  role: UserRole.TEACHER;
  email: string;
  username: string;
  passwordHash: string;
  studentPasswordHash: null;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  email: string;
  username: string;
  passwordHash: string;
  studentPasswordHash: null;
}
```

## Felder-Erklärung

### Basis-Informationen

#### `first_name` / `last_name`
- **Typ:** VARCHAR(100)
- **Pflicht:** Ja
- **Beschreibung:** Vor- und Nachname des Benutzers
- **Bearbeitbar:** 
  - Lehrer: Ja (selbst)
  - Schüler: Nein (nur durch Lehrer)

#### `preferred_title`
- **Typ:** VARCHAR(20)
- **Pflicht:** Nein
- **Werte:** 'Herr', 'Frau', 'Divers'
- **Beschreibung:** Bevorzugte Anrede (nur für Lehrer)

#### `email`
- **Typ:** VARCHAR(255)
- **Pflicht:** Nur für Teacher/Admin
- **Unique:** Ja
- **Beschreibung:** E-Mail-Adresse (NULL für Schüler)
- **Validierung:** E-Mail-Format

#### `phone`
- **Typ:** VARCHAR(20)
- **Pflicht:** Nein
- **Format:** +436991234567
- **Beschreibung:** Mobiltelefon (optional)

### Rolle & Berechtigungen

#### `role`
- **Typ:** VARCHAR(20)
- **Pflicht:** Ja
- **Werte:** 'student', 'teacher', 'admin'
- **Default:** 'student'
- **Beschreibung:** Benutzerrolle

#### `is_active`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** true
- **Beschreibung:** Ob Benutzer aktiv ist (Soft Delete)

### Authentifizierung

#### Teacher/Admin Authentifizierung

##### `username`
- **Typ:** VARCHAR(100)
- **Pflicht:** Nur für Teacher/Admin
- **Unique:** Ja
- **Beschreibung:** Benutzername für Login
- **NULL:** Für Schüler

##### `password_hash`
- **Typ:** TEXT
- **Pflicht:** Nur für Teacher/Admin
- **Beschreibung:** Better Auth Hash (bcrypt/Argon2)
- **NULL:** Für Schüler

##### `password_migrated`
- **Typ:** BOOLEAN
- **Pflicht:** Ja
- **Default:** false
- **Beschreibung:** Ob Passwort von WordPress migriert wurde

##### `password_hash_wp`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** WordPress Hash (für Migration)
- **Format:** `$P$B`, `$wp$`, `$P$`, `$2a$`

#### Schülerpasswort-Authentifizierung

##### `student_password_hash`
- **Typ:** TEXT
- **Pflicht:** Nur für Studenten
- **Unique:** Ja
- **Beschreibung:** Passwort-only Hash (bcrypt/Argon2)
- **Format:** Einzigartiges Passwort, gehasht

##### `student_password_plain`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Verschlüsselt gespeichertes Passwort (nur für Lehrer-Anzeige)
- **Sicherheit:** Verschlüsselt (nicht gehasht, da es angezeigt werden muss)
- **Siehe:** [[01_Features/Auth/Student_Password_System|Student Password System]]

### Profil

#### `avatar_id`
- **Typ:** VARCHAR(100)
- **Pflicht:** Nein
- **Beschreibung:** Avatar aus Avatar-Bibliothek
- **Hinweis:** Kein Hochladen von eigenen Bildern

#### `bio`
- **Typ:** TEXT
- **Pflicht:** Nein
- **Beschreibung:** Profil-Beschreibung (optional)

#### `profile_visibility`
- **Typ:** VARCHAR(20)
- **Pflicht:** Ja
- **Default:** 'public'
- **Werte:** 'public', 'class', 'private'
- **Beschreibung:** Profil-Sichtbarkeit

### Schule & Klasse

#### `school_id`
- **Typ:** UUID
- **Pflicht:** Ja (für Schüler)
- **Foreign Key:** schools(id)
- **Beschreibung:** Zugewiesene Schule

#### `class_id`
- **Typ:** UUID
- **Pflicht:** Ja (für Schüler)
- **Foreign Key:** classes(id)
- **Beschreibung:** Zugewiesene Klasse

### Gamification

#### `t_coins_total`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Gesammelte T!Coins (für T!Score-Berechnung)
- **Wichtig:** Wird nie reduziert (nur erhöht)

#### `t_coins_available`
- **Typ:** INTEGER
- **Pflicht:** Ja
- **Default:** 0
- **Beschreibung:** Verfügbare T!Coins (nach Shop-Ausgaben)
- **Berechnung:** `t_coins_total - shop_ausgaben`

#### `t_score`
- **Typ:** DECIMAL(10, 2)
- **Pflicht:** Nein
- **Beschreibung:** Berechneter T!Score (für Klassen/Schulen)
- **Berechnung:** `t_coins_total / anzahl_schüler_in_klasse`

### Timestamps

#### `created_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Default:** NOW()
- **Beschreibung:** Erstellungsdatum

#### `updated_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Ja
- **Default:** NOW()
- **Beschreibung:** Letztes Update-Datum
- **Auto-Update:** Bei jedem Update

#### `last_login_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Letzter Login-Zeitpunkt

#### `password_changed_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Letzte Passwort-Änderung

### WordPress Migration

#### `wp_user_id`
- **Typ:** INTEGER
- **Pflicht:** Nein
- **Beschreibung:** Original WordPress User ID

#### `wp_migrated_at`
- **Typ:** TIMESTAMP
- **Pflicht:** Nein
- **Beschreibung:** Migrations-Zeitpunkt

## Constraints & Validierungen

### Rollen-spezifische Constraints

1. **Schülerpasswort:** Schüler müssen `student_password_hash` haben
2. **Email:** Teacher/Admin müssen `email` haben
3. **Username:** Teacher/Admin müssen `username` haben
4. **Schule/Klasse:** Schüler müssen `school_id` und `class_id` haben

### Datenintegrität

- **Unique Constraints:** email, username, student_password_hash
- **Foreign Keys:** school_id, class_id
- **Check Constraints:** role, student_password, email_teacher

## Indizes

### Performance-Indizes

- `idx_email` - Für Login-Lookup
- `idx_username` - Für Login-Lookup
- `idx_student_password_hash` - Für Schülerpasswort-Lookup
- `idx_role` - Für Rollen-Filter
- `idx_school_id` - Für Schule-Filter
- `idx_class_id` - Für Klasse-Filter
- `idx_is_active` - Für aktive Benutzer-Filter

## Beziehungen

### Zu anderen Modellen

- **School:** `users.school_id` → `schools.id` (Many-to-One)
- **Class:** `users.class_id` → `classes.id` (Many-to-One)
- **Projects:** `projects.author_id` → `users.id` (One-to-Many)
- **Certificates:** `certificates.user_id` → `users.id` (One-to-Many)
- **Messages:** `messages.sender_id` / `messages.recipient_id` → `users.id` (Many-to-Many)

## Beispiel-Daten

### Schüler (Student)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": null,
  "role": "student",
  "isActive": true,
  "username": null,
  "passwordHash": null,
  "studentPasswordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "studentPasswordPlain": "encrypted:AbC123XyZ789",
  "schoolId": "660e8400-e29b-41d4-a716-446655440001",
  "classId": "770e8400-e29b-41d4-a716-446655440002",
  "avatarId": "avatar_001",
  "profileVisibility": "public",
  "tCoinsTotal": 1500,
  "tCoinsAvailable": 1200,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T14:30:00Z",
  "lastLoginAt": "2024-01-20T14:30:00Z"
}
```

### Lehrer (Teacher)

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "firstName": "Maria",
  "lastName": "Schmidt",
  "preferredTitle": "Frau",
  "email": "maria.schmidt@schule.at",
  "phone": "+436991234567",
  "role": "teacher",
  "isActive": true,
  "username": "mschmidt",
  "passwordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "passwordMigrated": true,
  "passwordHashWp": null,
  "studentPasswordHash": null,
  "avatarId": "avatar_042",
  "profileVisibility": "public",
  "tCoinsTotal": 0,
  "tCoinsAvailable": 0,
  "createdAt": "2023-09-01T08:00:00Z",
  "updatedAt": "2024-01-18T12:00:00Z",
  "lastLoginAt": "2024-01-18T12:00:00Z"
}
```

### Admin

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "firstName": "Admin",
  "lastName": "User",
  "preferredTitle": null,
  "email": "admin@platform.at",
  "phone": null,
  "role": "admin",
  "isActive": true,
  "username": "admin",
  "passwordHash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "passwordMigrated": false,
  "passwordHashWp": null,
  "studentPasswordHash": null,
  "avatarId": null,
  "profileVisibility": "private",
  "tCoinsTotal": 0,
  "tCoinsAvailable": 0,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "lastLoginAt": "2024-01-15T10:00:00Z"
}
```

## Migration von WordPress

### Dual-Auth Phase

Während der Migration werden beide Hash-Formate unterstützt:

```typescript
// Authentifizierung mit WordPress Hash
if (user.passwordHashWp && !user.passwordMigrated) {
  const isValid = await validateWordPressPassword(password, user.passwordHashWp);
  if (isValid) {
    // Migriere zu Better Auth
    await migratePassword(user.id, password);
  }
}
```

**Siehe:** [[00_Blueprint/WordPress_Migration|WordPress Migration]] für Details.

> [!tip] Implementation Hint
> - Verwende Prisma oder TypeORM für ORM
> - Implementiere Soft Delete mit `is_active`
> - Schülerpasswort sollte verschlüsselt (nicht gehasht) gespeichert werden für Lehrer-Anzeige
> - T!Coins sollten in separater Tabelle für Transaktionen getrackt werden
> - Implementiere Audit-Log für Passwort-Änderungen
