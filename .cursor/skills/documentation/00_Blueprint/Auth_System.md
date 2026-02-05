---
title: Authentication System - Better Auth Integration
description: Detaillierte Dokumentation des Authentication-Systems mit Better Auth
enableToc: true
tags:
  - blueprint
  - auth
  - security
---

# 🔐 Authentication System - Better Auth Integration

> [!abstract] Übersicht
> Das Authentication-System basiert auf Better Auth und unterstützt Multi-Role-Authentifizierung mit speziellen Anforderungen für Schülerpasswörter und WordPress-Migration.

## Better Auth - Warum?

### Vorteile
- **TypeScript-first:** Vollständige Type-Safety
- **Flexibel:** Unterstützt verschiedene Auth-Strategien
- **Modern:** Aktive Entwicklung, gute Dokumentation
- **Erweiterbar:** Einfache Anpassung für spezielle Anforderungen
- **Sicher:** Best Practices für Security

### Integration
- **Framework:** Better Auth
- **Session-Management:** Cookie-basiert mit JWT
- **Password Hashing:** bcrypt oder Argon2
- **Rate Limiting:** Integriert für Brute-Force-Schutz

## Multi-Role Authentication

### Rollen-System

#### 1. Teacher (Lehrer/Lehrerin)
- **Authentifizierung:** E-Mail/Username + Passwort
- **Standard-Auth:** Normale Credentials-basierte Authentifizierung
- **Passwort-Reset:** E-Mail-basiert
- **Session:** Standard Better Auth Session

#### 2. Student (Schüler/Schülerin)
- **Authentifizierung:** Nur Passwort (kein Username!)
- **Spezial-Auth:** Custom Authentication Strategy
- **Passwort-Reset:** Durch Lehrer im Dashboard
- **Session:** Better Auth Session mit Student-Rolle

#### 3. Admin (Administrator)
- **Authentifizierung:** Verwendet Teacher-Login (gleiche Credentials)
- **Rolle:** Zusätzliche Admin-Rolle zusätzlich zu Teacher-Rolle
- **Session:** Better Auth Session mit Admin-Rolle

## Schülerpasswort-System

### Besonderheiten

#### Passwort-only Authentication
- **Kein Username:** Schüler haben nur ein Passwort
- **Einzigartigkeit:** Jedes Schülerpasswort ist eindeutig
- **Generierung:** Automatisch durch System generiert
- **Format:** Sicher, zufällig generiert (z.B. 12 Zeichen, alphanumerisch + Sonderzeichen)

### Implementierung mit Better Auth

#### Custom Authentication Strategy
```typescript
// Custom Student Password Strategy
export const studentPasswordAuth = {
  name: 'student-password',
  authenticate: async (password: string) => {
    // 1. Suche Schüler anhand des Passworts (gehasht)
    const student = await db.student.findFirst({
      where: {
        passwordHash: await hashPassword(password)
      }
    });
    
    // 2. Wenn gefunden: Session erstellen
    if (student) {
      return {
        userId: student.id,
        role: 'student',
        session: await createSession(student.id)
      };
    }
    
    return null;
  }
};
```

#### Sicherheits-Überlegungen
- **Rate Limiting:** Strikte Limits für Passwort-only Auth (5 Versuche pro 15 Minuten)
- **Brute-Force-Schutz:** IP-basiertes Rate Limiting
- **CAPTCHA:** Erforderlich nach 3 fehlgeschlagenen Versuchen
- **Device Fingerprinting:** Zusätzliche Sicherheitsschicht (optional)
- **Password Hashing:** Starke Hashing-Algorithmen (Argon2 bevorzugt, bcrypt Fallback)
- **Session-Sicherheit:** Secure, HttpOnly Cookies mit SameSite=Strict
- **Siehe:** [[00_Blueprint/Security_Guidelines|Security Guidelines]] für detaillierte Sicherheitsmaßnahmen

### Passwort-Generierung

#### Algorithmus
```typescript
function generateStudentPassword(): string {
  // 12 Zeichen, alphanumerisch + Sonderzeichen
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  // Sicherer Zufallsgenerator
  return generateSecureRandom(length, charset);
}
```

#### Anforderungen
- **Länge:** Minimum 12 Zeichen
- **Komplexität:** Alphanumerisch + Sonderzeichen
- **Eindeutigkeit:** Prüfung auf Duplikate
- **Speicherung:** Gehasht in Datenbank

### Passwort-Verwaltung

#### Durch Lehrer
- **Erstellung:** Automatisch bei Schüler-Erstellung
- **Reset:** Lehrer kann Passwort zurücksetzen
- **Anzeige:** Passwort wird einmalig angezeigt (dann nur Reset möglich)
- **Export:** Passwort-Liste für Lehrer (optional, verschlüsselt)

#### Durch Schüler
- **Anzeige:** Passwort wird bei Erstellung einmalig angezeigt
- **Reset:** Nur durch Lehrer möglich
- **Speicherung:** Schüler sollten Passwort sicher speichern

## WordPress Passwort-Migration

### Überblick

Bei der Migration von der alten WordPress-basierten Plattform müssen bestehende Passwörter migriert werden.

### WordPress Passwort-Format

WordPress verwendet einen speziellen Hashing-Algorithmus:
- **Algorithmus:** phpass (Portable PHP password hashing)
- **Format:** `$P$B` (Standard), `$wp$` (WordPress-spezifisch), `$P$` (ältere Version), `$2a$` (bcrypt)
- **Salt:** Integriert im Hash-String
- **Siehe:** [[00_Blueprint/WordPress_Migration|WordPress Migration]] für alle unterstützten Formate

### Migrations-Strategie

#### Phase 1: Dual-Auth (Übergangsphase)
- **Zweifach-Authentifizierung:** Unterstützung für WordPress- und Better Auth-Hashes
- **Login-Flow:**
  1. Versuche Better Auth Hash
  2. Wenn fehlgeschlagen: Versuche WordPress Hash
  3. Bei erfolgreichem WordPress-Login: Hash zu Better Auth migrieren
  4. Nächstes Login: Nur Better Auth Hash

#### Phase 2: Automatische Migration
- **Beim Login:** Automatische Migration bei erstem Login
- **Background-Job:** Migration aller inaktiven Accounts
- **Vollständige Migration:** Nach X Monaten WordPress-Auth deaktivieren

### Implementierung

#### WordPress Hash Validierung
```typescript
import { checkPassword } from 'wordpress-hash';

async function validateWordPressPassword(
  password: string,
  wpHash: string
): Promise<boolean> {
  // WordPress Hash validieren
  return checkPassword(password, wpHash);
}
```

#### Migrations-Flow
```typescript
async function migratePasswordOnLogin(
  userId: string,
  password: string,
  wpHash: string
): Promise<void> {
  // 1. WordPress Hash validieren
  const isValid = await validateWordPressPassword(password, wpHash);
  
  if (isValid) {
    // 2. Better Auth Hash erstellen
    const betterAuthHash = await hashPassword(password);
    
    // 3. In Datenbank speichern
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: betterAuthHash,
        passwordMigrated: true,
        passwordMigratedAt: new Date()
      }
    });
  }
}
```

### Datenbank-Schema

#### User-Tabelle (Erweiterung)
```sql
ALTER TABLE users ADD COLUMN password_hash_wp TEXT; -- WordPress Hash (temporär)
ALTER TABLE users ADD COLUMN password_migrated BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN password_migrated_at TIMESTAMP;
```

#### Migrations-Status
- **password_migrated:** Boolean - Ob Passwort migriert wurde
- **password_migrated_at:** Timestamp - Wann migriert wurde
- **password_hash_wp:** Temporär - WordPress Hash (wird nach Migration gelöscht)

### Migrations-Script

#### Batch-Migration
```typescript
async function batchMigratePasswords() {
  const users = await db.user.findMany({
    where: {
      passwordMigrated: false,
      passwordHashWp: { not: null }
    }
  });
  
  for (const user of users) {
    // Versuche Migration beim nächsten Login
    // Oder: Force Migration mit temporärem Reset-Token
  }
}
```

## Better Auth Konfiguration

### Setup

#### Installation
```bash
npm install better-auth
```

#### Konfiguration
```typescript
// auth.config.ts
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 Tage
    updateAge: 60 * 60 * 24, // 1 Tag
  },
  plugins: [
    studentPasswordAuth, // Custom Plugin
    wordPressMigrationPlugin // Custom Plugin
  ]
});
```

### Custom Plugins

#### Student Password Plugin
```typescript
export const studentPasswordAuth = {
  name: 'student-password',
  endpoints: {
    '/api/auth/student/login': {
      method: 'POST',
      handler: async (req) => {
        const { password } = await req.json();
        // Custom Student Authentication
        return authenticateStudent(password);
      }
    }
  }
};
```

#### WordPress Migration Plugin
```typescript
export const wordPressMigrationPlugin = {
  name: 'wordpress-migration',
  hooks: {
    beforeSignIn: async (user, password) => {
      // Prüfe ob WordPress Hash vorhanden
      if (user.passwordHashWp && !user.passwordMigrated) {
        // Migriere Passwort
        await migratePasswordOnLogin(user.id, password, user.passwordHashWp);
      }
    }
  }
};
```

## Sicherheit

### Best Practices

#### Password Hashing
- **Algorithmus:** bcrypt (cost factor 12) oder Argon2
- **Salt:** Automatisch generiert
- **Never store plaintext:** Niemals Klartext-Passwörter speichern

#### Rate Limiting
- **Login-Versuche:** Max. 5 Versuche pro 15 Minuten
- **IP-basiert:** Rate Limiting pro IP-Adresse
- **Account-Lockout:** Temporäre Sperre nach zu vielen Versuchen

#### Session-Sicherheit
- **HttpOnly Cookies:** Verhindert XSS-Angriffe
- **Secure Flag:** Nur über HTTPS
- **SameSite:** Strict für CSRF-Schutz
- **Expiration:** Automatische Ablaufzeit

#### Schülerpasswort-Sicherheit
- **Starke Generierung:** Sicherer Zufallsgenerator
- **Keine Wiederverwendung:** Jedes Passwort ist eindeutig
- **Rate Limiting:** Strikte Limits für Passwort-only Auth
- **Monitoring:** Überwachung auf verdächtige Aktivitäten

## Migration von WordPress

### Migrations-Plan

#### Vorbereitung
1. **Datenbank-Export:** WordPress User-Daten exportieren
2. **Hash-Extraktion:** WordPress Passwort-Hashes extrahieren
3. **Datenbank-Setup:** Better Auth Datenbank-Schema erstellen

#### Durchführung
1. **Daten-Import:** WordPress-Daten in neue Datenbank importieren
2. **Dual-Auth aktivieren:** WordPress + Better Auth parallel
3. **Migration beim Login:** Automatische Migration bei erstem Login
4. **Background-Migration:** Migration inaktiver Accounts

#### Nach Migration
1. **Überwachung:** Migration-Status überwachen
2. **Cleanup:** WordPress-Hashes nach Migration entfernen
3. **Deaktivierung:** WordPress-Auth nach X Monaten deaktivieren

### Siehe auch
- [[00_Blueprint/WordPress_Migration|WordPress Migration]] - Detaillierte Migrations-Dokumentation

> [!tip] Implementation Hint
> - Implementiere Dual-Auth für nahtlose Migration
> - Verwende Background-Jobs für Batch-Migration
> - Überwache Migration-Status regelmäßig
> - Teste Migration gründlich vor Produktion
