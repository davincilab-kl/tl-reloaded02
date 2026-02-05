---
title: Student Password System - Schülerpasswort-System
description: Detaillierte Dokumentation des Schülerpasswort-Systems (Passwort-only Authentication)
enableToc: true
tags:
  - features
  - auth
  - student
  - security
---

# 🎓 Student Password System - Schülerpasswort-System

> [!abstract] User Story
> Als Schüler möchte ich mich mit meinem persönlichen Schülerpasswort anmelden, ohne einen Benutzernamen eingeben zu müssen.

## Übersicht

Das Schülerpasswort-System ist ein spezielles Authentifizierungs-System, das nur Passwörter verwendet (keine Benutzernamen). Jeder Schüler erhält ein einzigartiges, automatisch generiertes Passwort.

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Schüler-Datenmodell mit Schülerpasswort-System

## Besonderheiten

### Passwort-only Authentication

#### Kein Username erforderlich
- **Nur Passwort:** Schüler geben nur ihr Passwort ein
- **Eindeutigkeit:** Jedes Passwort ist eindeutig und identifiziert einen Schüler
- **Einfachheit:** Einfacher Login-Prozess für junge Benutzer

#### Warum Passwort-only?
- **Altersgerecht:** Einfacher für jüngere Schüler
- **Verwaltung:** Lehrer erstellen Schüler ohne E-Mail-Adressen
- **Sicherheit:** Einzigartige, starke Passwörter
- **Keine Konflikte:** Keine Probleme mit doppelten Benutzernamen

## Passwort-Generierung

### Algorithmus

#### Sicherheits-Anforderungen
- **Länge:** Minimum 12 Zeichen
- **Komplexität:** Alphanumerisch + Sonderzeichen
- **Eindeutigkeit:** Jedes Passwort ist eindeutig
- **Zufälligkeit:** Kryptographisch sicherer Zufallsgenerator

#### Generierungs-Code

```typescript
// password-generator.ts
import crypto from 'crypto';

interface PasswordOptions {
  length?: number;
  includeSpecialChars?: boolean;
}

function generateStudentPassword(options: PasswordOptions = {}): string {
  const length = options.length || 12;
  const includeSpecial = options.includeSpecialChars !== false;
  
  // Zeichensatz
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let charset = lowercase + uppercase + numbers;
  if (includeSpecial) {
    charset += special;
  }
  
  // Sicherer Zufallsgenerator
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  // Sicherstellen, dass mindestens ein Zeichen jeder Kategorie vorhanden ist
  if (!/[a-z]/.test(password)) {
    password = replaceRandomChar(password, lowercase);
  }
  if (!/[A-Z]/.test(password)) {
    password = replaceRandomChar(password, uppercase);
  }
  if (!/[0-9]/.test(password)) {
    password = replaceRandomChar(password, numbers);
  }
  if (includeSpecial && !/[!@#$%^&*]/.test(password)) {
    password = replaceRandomChar(password, special);
  }
  
  return password;
}

function replaceRandomChar(str: string, charset: string): string {
  const randomIndex = Math.floor(Math.random() * str.length);
  const randomChar = charset[Math.floor(Math.random() * charset.length)];
  return str.substring(0, randomIndex) + randomChar + str.substring(randomIndex + 1);
}
```

### Eindeutigkeits-Prüfung

```typescript
// password-uniqueness.ts
async function ensureUniquePassword(
  password: string,
  excludeUserId?: string
): Promise<boolean> {
  const existing = await db.student.findFirst({
    where: {
      passwordHash: await hashPassword(password),
      id: excludeUserId ? { not: excludeUserId } : undefined
    }
  });
  
  return !existing; // true wenn eindeutig
}

async function generateUniquePassword(
  excludeUserId?: string
): Promise<string> {
  let password: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    password = generateStudentPassword();
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Could not generate unique password');
    }
  } while (!(await ensureUniquePassword(password, excludeUserId)));
  
  return password;
}
```

## Passwort-Speicherung

### Hashing

#### Algorithmus
- **Better Auth Standard:** bcrypt oder Argon2
- **Cost Factor:** 12 (bcrypt) oder höher
- **Salt:** Automatisch generiert

#### Implementierung

```typescript
// password-hashing.ts
import { hash, verify } from 'better-auth/utils';

async function hashStudentPassword(password: string): Promise<string> {
  return await hash(password, {
    algorithm: 'bcrypt',
    cost: 12
  });
}

async function verifyStudentPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await verify(password, hash);
}
```

### Datenbank-Schema

```sql
-- Student-Tabelle
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id),
  password_hash TEXT NOT NULL, -- Gehashtes Passwort
  password_generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  password_reset_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_password_hash (password_hash) -- Für schnelle Suche
);
```

## Authentifizierung

### Login-Flow

#### 1. Passwort-Eingabe
- Schüler gibt nur Passwort ein
- Kein Username-Feld

#### 2. Passwort-Suche
```typescript
// student-auth.ts
async function authenticateStudent(password: string): Promise<AuthResult> {
  // 1. Passwort hashen
  const passwordHash = await hashStudentPassword(password);
  
  // 2. Schüler anhand Hash suchen
  const student = await db.student.findFirst({
    where: {
      passwordHash: passwordHash
    },
    include: {
      class: {
        include: {
          school: true
        }
      }
    }
  });
  
  if (!student) {
    return {
      success: false,
      error: 'Invalid password'
    };
  }
  
  // 3. Session erstellen
  const session = await createStudentSession(student.id);
  
  return {
    success: true,
    user: {
      id: student.id,
      name: student.name,
      role: 'student',
      classId: student.classId
    },
    session
  };
}
```

#### 3. Session-Erstellung
- Better Auth Session mit Student-Rolle
- Cookie-basiert, HttpOnly, Secure

### Sicherheits-Überlegungen

#### Rate Limiting
- **Strikte Limits:** Max. 5 Versuche pro 15 Minuten pro IP
- **Account-Lockout:** Temporäre Sperre nach zu vielen Versuchen
- **Monitoring:** Überwachung auf verdächtige Aktivitäten

#### Brute-Force-Schutz
```typescript
// rate-limiting.ts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  const attempts = loginAttempts.get(ip);
  const now = Date.now();
  
  if (!attempts || attempts.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  
  if (attempts.count >= 5) {
    return false; // Rate limit exceeded
  }
  
  attempts.count++;
  return true;
}
```

## Passwort-Verwaltung

### Durch Lehrer

#### Erstellung
- **Automatisch:** Bei Schüler-Erstellung wird Passwort automatisch generiert
- **Anzeige:** Passwort wird einmalig angezeigt (dann nur Reset möglich)
- **Export:** Optional: Passwort-Liste für Lehrer (verschlüsselt)

#### Reset
- **Zugriff:** Lehrer kann Passwort im Dashboard zurücksetzen
- **Neue Generierung:** Neues Passwort wird automatisch generiert
- **Anzeige:** Neues Passwort wird einmalig angezeigt
- **Tracking:** Reset-Count wird erhöht

```typescript
// password-reset.ts
async function resetStudentPassword(studentId: string): Promise<string> {
  // 1. Neues Passwort generieren
  const newPassword = await generateUniquePassword(studentId);
  
  // 2. Passwort hashen
  const passwordHash = await hashStudentPassword(newPassword);
  
  // 3. In Datenbank speichern
  await db.student.update({
    where: { id: studentId },
    data: {
      passwordHash,
      passwordGeneratedAt: new Date(),
      passwordResetCount: { increment: 1 }
    }
  });
  
  // 4. Passwort zurückgeben (für einmalige Anzeige)
  return newPassword;
}
```

### Durch Schüler

#### Anzeige
- **Einmalig:** Passwort wird bei Erstellung einmalig angezeigt
- **Dann:** Nur Reset durch Lehrer möglich
- **Speicherung:** Schüler sollten Passwort sicher speichern (z.B. in Passwort-Manager)

#### Reset
- **Nicht möglich:** Schüler können Passwort nicht selbst zurücksetzen
- **Nur durch Lehrer:** Reset erfolgt durch Lehrer im Dashboard

## UI/UX

### Login-Interface

#### Schüler-Login-Tab
```typescript
// login-ui.tsx
<StudentLoginTab>
  <Title>Schülerpasswort Eingabe</Title>
  <Instruction>
    Melde dich immer mit deinem persönlichen Schülerpasswort an.
  </Instruction>
  <PasswordInput
    placeholder="Schülerpasswort eingeben"
    type="password"
    autoComplete="off"
  />
  <LoginButton>Anmelden</LoginButton>
  <HelpText>
    Hast du dein Passwort vergessen? Wende dich an deinen Lehrer.
  </HelpText>
</StudentLoginTab>
```

### Passwort-Anzeige (bei Erstellung/Reset)

#### Einmalige Anzeige
- **Modal/Dialog:** Passwort wird in Modal angezeigt
- **Kopieren-Button:** Passwort kann kopiert werden
- **Warnung:** "Bitte Passwort sicher speichern - wird nicht erneut angezeigt"
- **Bestätigung:** "Ich habe mein Passwort gespeichert" Checkbox

## Integration mit Better Auth

### Custom Authentication Strategy

```typescript
// better-auth-student-plugin.ts
import { BetterAuthPlugin } from 'better-auth/plugins';

export const studentPasswordAuth: BetterAuthPlugin = {
  id: 'student-password',
  endpoints: {
    '/api/auth/student/login': {
      method: 'POST',
      handler: async (req) => {
        const { password } = await req.json();
        
        // Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (!(await checkRateLimit(ip))) {
          return Response.json(
            { error: 'Too many attempts. Please try again later.' },
            { status: 429 }
          );
        }
        
        // Authentifizierung
        const result = await authenticateStudent(password);
        
        if (!result.success) {
          return Response.json(
            { error: 'Invalid password' },
            { status: 401 }
          );
        }
        
        // Session erstellen
        const session = await createSession(result.user.id, {
          role: 'student',
          classId: result.user.classId
        });
        
        return Response.json({
          user: result.user,
          session
        });
      }
    }
  }
};
```

## Sicherheit

### Best Practices

#### Password Hashing
- **Starker Algorithmus:** bcrypt (cost 12) oder Argon2
- **Salt:** Automatisch generiert
- **Never plaintext:** Niemals Klartext-Passwörter speichern

#### Rate Limiting
- **Strikte Limits:** 5 Versuche pro 15 Minuten
- **IP-basiert:** Rate Limiting pro IP-Adresse
- **Account-Lockout:** Temporäre Sperre nach zu vielen Versuchen

#### Monitoring
- **Login-Versuche:** Alle Versuche loggen
- **Fehlgeschlagene Logins:** Überwachung auf verdächtige Muster
- **Alerts:** Benachrichtigung bei ungewöhnlichen Aktivitäten

### Datenschutz

#### DSGVO-Konformität
- **Minimale Daten:** Nur notwendige Daten speichern
- **Verschlüsselung:** Passwörter werden gehasht gespeichert
- **Zugriff:** Nur autorisierte Lehrer können Passwörter zurücksetzen

## Verwandte Features

- **Login:** [[01_Features/Auth/Login|Login]] - Login-Interface
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Schüler-Erstellung und Passwort-Verwaltung
- **Password Reset:** [[01_Features/Auth/Password_Reset|Password Reset]] - Passwort-Reset durch Lehrer
- **Auth System:** [[00_Blueprint/Auth_System|Auth System]] - Better Auth Integration

> [!tip] Implementation Hint
> - Implementiere striktes Rate Limiting für Passwort-only Auth
> - Verwende kryptographisch sicheren Zufallsgenerator
> - Teste Eindeutigkeit gründlich
> - Implementiere umfassendes Monitoring
> - Zeige Passwort nur einmalig an
