---
title: WordPress Passwort-Migration
description: Detaillierte Anleitung zur Migration von WordPress-Passwörtern zu Better Auth
enableToc: true
tags:
  - blueprint
  - migration
  - wordpress
  - auth
---

# 🔄 WordPress Passwort-Migration

> [!abstract] Ziel
> Nahtlose Migration aller WordPress-Passwörter zu Better Auth ohne Benutzer-Unterbrechung.

## Übersicht

Bei der Migration von der alten WordPress-basierten Plattform müssen alle bestehenden Benutzer-Passwörter in das neue Better Auth-System migriert werden, ohne dass Benutzer ihre Passwörter zurücksetzen müssen.

## WordPress Passwort-Format

### Hashing-Algorithmus

WordPress verwendet **phpass** (Portable PHP password hashing framework):
- **Format:** `$P$B` (MD5-basiert) oder `$2a$` (bcrypt) oder `$P$` (ältere Versionen) oder `$wp$` (WordPress-spezifisch)
- **Salt:** Integriert im Hash-String (erste 12 Zeichen)
- **Iterationen:** 8 Runden (bei MD5-basiert)

### Hash-Struktur

#### Standard-Format ($P$B)
```
$P$B[Salt][Hash]
```

Beispiel:
```
$P$B1234567890abcdefghijklmnopqrstuv
```

#### WordPress-spezifisches Format ($wp$)
```
$wp$[Salt][Hash]
```

Beispiel:
```
$wp$1234567890abcdefghijklmnopqrstuv
```

**Hinweis:** `$wp$` ist ein WordPress-spezifisches Format, das ähnlich wie `$P$` funktioniert, aber möglicherweise unterschiedliche Iterationen oder Salt-Längen verwendet.

### Unterstützte Formate

1. **$P$B** - MD5-basiert (häufigste, Standard phpass)
2. **$2a$** - bcrypt (neuere WordPress-Versionen)
3. **$P$** - Ältere MD5-Versionen (phpass)
4. **$wp$** - WordPress-spezifisches Format (ähnlich $P$, aber WordPress-Variante)
5. **$H$** - Alternative MD5-Version

## Migrations-Strategie

### Phase 1: Dual-Auth (Übergangsphase)

#### Konzept
- **Parallel-Betrieb:** WordPress- und Better Auth-Hashes werden parallel unterstützt
- **Automatische Migration:** Beim ersten Login wird Passwort automatisch migriert
- **Transparent:** Benutzer merken nichts von der Migration

#### Implementierung

```typescript
// auth-strategy.ts
async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const user = await db.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  // 1. Versuche Better Auth Hash
  if (user.passwordHash && user.passwordMigrated) {
    const isValid = await verifyPassword(password, user.passwordHash);
    if (isValid) {
      return { success: true, user };
    }
  }
  
  // 2. Versuche WordPress Hash (wenn noch nicht migriert)
  if (user.passwordHashWp && !user.passwordMigrated) {
    const isValid = await validateWordPressPassword(password, user.passwordHashWp);
    if (isValid) {
      // 3. Migriere Passwort zu Better Auth
      await migratePasswordOnLogin(user.id, password, user.passwordHashWp);
      return { success: true, user: { ...user, passwordMigrated: true } };
    }
  }
  
  return { success: false, error: 'Invalid credentials' };
}
```

### Phase 2: Automatische Batch-Migration

#### Konzept
- **Background-Job:** Migration aller inaktiven Accounts
- **Force-Migration:** Temporäre Reset-Tokens für Accounts ohne Login
- **Überwachung:** Migration-Status-Tracking

#### Implementierung

```typescript
// migration-job.ts
async function batchMigrateInactiveUsers() {
  const users = await db.user.findMany({
    where: {
      passwordMigrated: false,
      passwordHashWp: { not: null },
      lastLogin: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // 90 Tage
    }
  });
  
  for (const user of users) {
    // Erstelle temporären Reset-Token
    const resetToken = generateSecureToken();
    
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 Tage
      }
    });
    
    // Sende E-Mail mit Reset-Link
    await sendPasswordResetEmail(user.email, resetToken);
  }
}
```

### Phase 3: Cleanup

#### Nach erfolgreicher Migration
- **WordPress-Hashes entfernen:** Nach X Monaten (z.B. 6 Monate)
- **Dual-Auth deaktivieren:** WordPress-Auth-Code entfernen
- **Datenbank-Bereinigung:** Alte Hash-Spalten entfernen

## WordPress Hash Validierung

### Implementierung

#### PHP-äquivalente Validierung in TypeScript

```typescript
// wordpress-hash.ts
import crypto from 'crypto';

interface WordPressHash {
  type: 'P$B' | 'wp$' | 'P$' | '2a$' | 'H$';
  salt: string;
  hash: string;
}

function parseWordPressHash(wpHash: string): WordPressHash | null {
  if (wpHash.startsWith('$P$B')) {
    return {
      type: 'P$B',
      salt: wpHash.substring(4, 12), // 8 Zeichen Salt
      hash: wpHash.substring(12)
    };
  }
  if (wpHash.startsWith('$wp$')) {
    return {
      type: 'wp$',
      salt: wpHash.substring(4, 12), // 8 Zeichen Salt
      hash: wpHash.substring(12)
    };
  }
  if (wpHash.startsWith('$P$')) {
    return {
      type: 'P$',
      salt: wpHash.substring(3, 11), // 8 Zeichen Salt
      hash: wpHash.substring(11)
    };
  }
  // Weitere Formate...
  return null;
}

async function validateWordPressPassword(
  password: string,
  wpHash: string
): Promise<boolean> {
  const parsed = parseWordPressHash(wpHash);
  if (!parsed) return false;
  
  switch (parsed.type) {
    case 'P$B':
      return validatePBPHash(password, parsed.salt, parsed.hash);
    case 'wp$':
      // $wp$ verwendet ähnliche Logik wie $P$B
      return validatePBPHash(password, parsed.salt, parsed.hash);
    case 'P$':
      // Ältere $P$ Version
      return validatePBPHash(password, parsed.salt, parsed.hash);
    case '2a$':
      return validateBcryptHash(password, wpHash);
    // Weitere Formate...
    default:
      return false;
  }
}

function validatePBPHash(
  password: string,
  salt: string,
  hash: string
): boolean {
  // PHPass MD5-basierte Validierung
  // 8 Iterationen, MD5-Hashing
  let hashResult = crypto.createHash('md5')
    .update(salt + password)
    .digest('hex');
  
  for (let i = 0; i < 8; i++) {
    hashResult = crypto.createHash('md5')
      .update(hashResult + password)
      .digest('hex');
  }
  
  // Base64-Encoding (wie in PHPass)
  const encoded = encodeBase64(hashResult);
  return encoded === hash;
}
```

### Alternative: NPM-Package

```typescript
// Verwendung eines WordPress-Hash-Packages
import { checkPassword } from 'wordpress-hash';

async function validateWordPressPassword(
  password: string,
  wpHash: string
): Promise<boolean> {
  return checkPassword(password, wpHash);
}
```

## Datenbank-Schema

### Erweiterte User-Tabelle

```sql
-- Temporäre Spalten für Migration
ALTER TABLE users ADD COLUMN password_hash_wp TEXT;
ALTER TABLE users ADD COLUMN password_migrated BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN password_migrated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;

-- Index für Migration-Queries
CREATE INDEX idx_password_migrated ON users(password_migrated);
CREATE INDEX idx_password_hash_wp ON users(password_hash_wp) WHERE password_hash_wp IS NOT NULL;
```

### Migrations-Status-Tracking

```sql
-- Tabelle für Migration-Statistiken
CREATE TABLE password_migration_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_users INTEGER NOT NULL,
  migrated_users INTEGER NOT NULL DEFAULT 0,
  failed_migrations INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Migrations-Workflow

### Schritt 1: Daten-Export aus WordPress

```sql
-- WordPress-Datenbank-Export
SELECT 
  user_email,
  user_pass, -- WordPress Hash
  user_registered,
  display_name
FROM wp_users
WHERE user_status = 0; -- Nur aktive Benutzer
```

### Schritt 2: Daten-Import in neue Datenbank

```typescript
// import-wordpress-users.ts
async function importWordPressUsers(wpUsers: WordPressUser[]) {
  for (const wpUser of wpUsers) {
    await db.user.create({
      data: {
        email: wpUser.user_email,
        passwordHashWp: wpUser.user_pass, // WordPress Hash temporär speichern
        passwordMigrated: false,
        name: wpUser.display_name,
        createdAt: wpUser.user_registered
      }
    });
  }
}
```

### Schritt 3: Dual-Auth aktivieren

```typescript
// auth.config.ts
export const auth = betterAuth({
  // ... andere Konfiguration
  plugins: [
    wordPressMigrationPlugin // Aktiviert Dual-Auth
  ]
});
```

### Schritt 4: Migration beim Login

```typescript
// Automatisch beim Login (siehe Phase 1)
```

### Schritt 5: Batch-Migration inaktiver Accounts

```typescript
// Background-Job (siehe Phase 2)
```

## Überwachung & Monitoring

### Migrations-Status-Dashboard

```typescript
// migration-status.ts
async function getMigrationStatus() {
  const total = await db.user.count({
    where: { passwordHashWp: { not: null } }
  });
  
  const migrated = await db.user.count({
    where: { passwordMigrated: true }
  });
  
  const failed = await db.user.count({
    where: {
      passwordHashWp: { not: null },
      passwordMigrated: false,
      lastLoginAttempt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });
  
  return {
    total,
    migrated,
    failed,
    percentage: (migrated / total) * 100
  };
}
```

### Logging

```typescript
// migration-logger.ts
async function logMigration(userId: string, success: boolean, error?: string) {
  await db.migrationLog.create({
    data: {
      userId,
      success,
      error,
      timestamp: new Date()
    }
  });
}
```

## Fehlerbehandlung

### Häufige Probleme

#### 1. Ungültige WordPress-Hashes
- **Problem:** Hash-Format wird nicht erkannt
- **Lösung:** Fallback auf Passwort-Reset

#### 2. Migration schlägt fehl
- **Problem:** Passwort-Validierung funktioniert nicht
- **Lösung:** Logging, manuelle Überprüfung, Reset-Token senden

#### 3. Doppelte Migration
- **Problem:** Passwort wird mehrfach migriert
- **Lösung:** Prüfung auf `passwordMigrated` Flag

### Rollback-Strategie

```typescript
// rollback-migration.ts
async function rollbackMigration(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      passwordMigrated: false,
      passwordHash: null // Better Auth Hash entfernen
    }
  });
}
```

## Testing

### Test-Szenarien

1. **Login mit WordPress-Hash:** Sollte funktionieren und migrieren
2. **Login mit Better Auth-Hash:** Sollte funktionieren
3. **Falsches Passwort:** Sollte fehlschlagen
4. **Ungültiger Hash:** Sollte Fallback auf Reset
5. **Batch-Migration:** Sollte alle inaktiven Accounts migrieren

### Test-Daten

```typescript
// test-data.ts
const testWordPressHashes = [
  '$P$B1234567890abcdefghijklmnopqrstuv', // MD5-basiert (Standard phpass)
  '$wp$1234567890abcdefghijklmnopqrstuv', // WordPress-spezifisch
  '$P$1234567890abcdefghijklmnopqrstuv', // Ältere phpass Version
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // bcrypt
  // Weitere Test-Hashes...
];
```

## Cleanup-Plan

### Nach erfolgreicher Migration (6 Monate)

```sql
-- WordPress-Hashes entfernen
UPDATE users 
SET password_hash_wp = NULL 
WHERE password_migrated = TRUE 
  AND password_migrated_at < NOW() - INTERVAL '6 months';

-- Spalte entfernen (nach Bestätigung)
ALTER TABLE users DROP COLUMN password_hash_wp;
```

### Code-Cleanup

```typescript
// WordPress-Auth-Code entfernen
// Dual-Auth-Logik entfernen
// Nur Better Auth verwenden
```

## Siehe auch

- [[00_Blueprint/Auth_System|Auth System]] - Better Auth Integration
- [[01_Features/Auth/Login|Login]] - Login-Feature
- [[01_Features/Auth/Password_Reset|Password Reset]] - Passwort-Reset

> [!tip] Implementation Hint
> - Teste Migration gründlich mit echten WordPress-Hashes
> - Implementiere umfassendes Logging
> - Überwache Migration-Status regelmäßig
> - Plane genug Zeit für Dual-Auth-Phase ein (mindestens 6 Monate)
