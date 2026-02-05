---
title: Security Guidelines
description: Sicherheits-Richtlinien für die Plattform, insbesondere Schülerpasswort-System
enableToc: true
tags:
  - blueprint
  - security
  - auth
  - student-password
---

# 🔒 Security Guidelines

> [!important] Sicherheits-Prinzipien
> Diese Richtlinien definieren Sicherheitsmaßnahmen für die gesamte Plattform, mit besonderem Fokus auf das Schülerpasswort-System.

---

## 🎓 Schülerpasswort-Sicherheit

### Erweiterte Sicherheitsmaßnahmen

#### CAPTCHA nach fehlgeschlagenen Versuchen
```typescript
// CAPTCHA-Integration für Schülerpasswort-Auth
interface StudentLoginAttempt {
  ipAddress: string;
  attempts: number;
  lastAttempt: Date;
  captchaRequired: boolean;
}

const MAX_ATTEMPTS_BEFORE_CAPTCHA = 3;
const CAPTCHA_COOLDOWN = 15 * 60 * 1000; // 15 Minuten

async function authenticateStudent(
  password: string,
  captchaToken?: string,
  ipAddress: string
): Promise<AuthResult> {
  // 1. Prüfe Login-Versuche
  const attempts = await getLoginAttempts(ipAddress);
  
  if (attempts.count >= MAX_ATTEMPTS_BEFORE_CAPTCHA) {
    // CAPTCHA erforderlich
    if (!captchaToken) {
      return {
        success: false,
        error: 'CAPTCHA_REQUIRED',
        captchaRequired: true
      };
    }
    
    // CAPTCHA validieren
    const captchaValid = await validateCAPTCHA(captchaToken);
    if (!captchaValid) {
      await incrementLoginAttempts(ipAddress);
      return {
        success: false,
        error: 'INVALID_CAPTCHA'
      };
    }
  }
  
  // 2. Passwort validieren
  const student = await findStudentByPassword(password);
  
  if (!student) {
    await incrementLoginAttempts(ipAddress);
    return {
      success: false,
      error: 'INVALID_CREDENTIALS'
    };
  }
  
  // 3. Erfolgreicher Login - Versuche zurücksetzen
  await resetLoginAttempts(ipAddress);
  
  // 4. Session erstellen
  const session = await createSession(student.id);
  
  return {
    success: true,
    user: student,
    session
  };
}
```

#### CAPTCHA-Implementierung
```typescript
// CAPTCHA-Service (hCaptcha oder reCAPTCHA v3)
import axios from 'axios';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET;
const CAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

async function validateCAPTCHA(token: string): Promise<boolean> {
  try {
    const response = await axios.post(CAPTCHA_VERIFY_URL, {
      secret: CAPTCHA_SECRET,
      response: token
    });
    
    return response.data.success === true;
  } catch (error) {
    console.error('CAPTCHA validation error:', error);
    return false;
  }
}
```

#### Frontend CAPTCHA-Integration
```typescript
// React CAPTCHA Component
import HCaptcha from '@hcaptcha/react-hcaptcha';

const StudentLoginForm = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);
  
  const handleLogin = async (password: string) => {
    const response = await fetch('/api/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        captchaToken: captchaToken || undefined
      })
    });
    
    const result = await response.json();
    
    if (result.error === 'CAPTCHA_REQUIRED') {
      setCaptchaRequired(true);
      captchaRef.current?.execute();
      return;
    }
    
    if (result.success) {
      // Login erfolgreich
      router.push('/dashboard');
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(password);
    }}>
      <input
        type="password"
        placeholder="Schülerpasswort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {captchaRequired && (
        <HCaptcha
          ref={captchaRef}
          sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
          onVerify={(token) => setCaptchaToken(token)}
        />
      )}
      
      <button type="submit">Anmelden</button>
    </form>
  );
};
```

### Rate Limiting für Schülerpasswort

#### Strikte Rate Limits
```typescript
// Rate Limiting für Schülerpasswort-Auth
import { RateLimiterRedis } from 'rate-limiter-flexible';

const studentPasswordLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'student_password_auth',
  points: 5, // 5 Versuche
  duration: 900, // pro 15 Minuten
  blockDuration: 1800 // Block für 30 Minuten nach Überschreitung
});

async function rateLimitStudentAuth(ipAddress: string): Promise<boolean> {
  try {
    await studentPasswordLimiter.consume(ipAddress);
    return true;
  } catch (rejRes) {
    // Rate Limit überschritten
    return false;
  }
}
```

### Device Fingerprinting

#### Zusätzliche Sicherheitsschicht
```typescript
// Device Fingerprinting
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const fpPromise = FingerprintJS.load();

async function getDeviceFingerprint(): Promise<string> {
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}

// Bei Login speichern
async function authenticateStudent(
  password: string,
  deviceFingerprint: string
) {
  // 1. Passwort validieren
  const student = await findStudentByPassword(password);
  
  if (!student) {
    return { success: false };
  }
  
  // 2. Device Fingerprint speichern/validieren
  await saveDeviceFingerprint(student.id, deviceFingerprint);
  
  // 3. Session mit Device-Fingerprint
  const session = await createSession(student.id, {
    deviceFingerprint
  });
  
  return { success: true, session };
}
```

### Passwort-Verschlüsselung für Lehrer-Anzeige

#### Sichere Verschlüsselung
```typescript
// Verschlüsselung für student_password_plain
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 Bytes
const IV_LENGTH = 16; // AES Block Size

function encryptPassword(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptPassword(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}
```

#### Verwendung
```typescript
// Bei Schüler-Erstellung
const plainPassword = generateStudentPassword();
const encrypted = encryptPassword(plainPassword);

await db.user.create({
  data: {
    studentPasswordHash: await hashPassword(plainPassword),
    studentPasswordPlain: encrypted, // Verschlüsselt gespeichert
    // ...
  }
});

// Bei Lehrer-Anzeige
const user = await db.user.findUnique({ where: { id: studentId } });
const decryptedPassword = decryptPassword(user.studentPasswordPlain);
// Anzeige für Lehrer (nur einmalig)
```

---

## 🔐 Allgemeine Sicherheitsmaßnahmen

### Password Hashing

#### Best Practices
- **Algorithmus:** Argon2 (besser) oder bcrypt (Fallback)
- **Cost Factor:** 
  - bcrypt: 12 Runden
  - Argon2: memoryCost: 65536, timeCost: 3, parallelism: 4
- **Salt:** Automatisch generiert (nie manuell)

```typescript
import * as argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await argon2.verify(hash, password);
}
```

### Session-Sicherheit

#### Secure Session Cookies
```typescript
// Session-Cookie-Konfiguration
const sessionConfig = {
  httpOnly: true, // Verhindert XSS
  secure: true, // Nur über HTTPS
  sameSite: 'strict' as const, // CSRF-Schutz
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
  domain: process.env.COOKIE_DOMAIN,
  path: '/'
};
```

### API-Sicherheit

#### Input Validation
```typescript
import { z } from 'zod';

// Schema für Input-Validation
const createProjectSchema = z.object({
  title: z.string().min(1).max(25),
  description: z.string().min(20).max(400),
  scratchData: z.object({
    targets: z.array(z.any()),
    monitors: z.array(z.any())
  })
});

// Validierung
const validated = createProjectSchema.parse(requestBody);
```

#### SQL Injection Prevention
- **ORM verwenden:** Prisma/TypeORM (parametrisierte Queries)
- **Nie String-Concatenation:** Für SQL-Queries
- **Input Sanitization:** Für alle User-Inputs

#### XSS Prevention
```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTML-Sanitization
const sanitized = DOMPurify.sanitize(userInput);
```

### Rate Limiting

#### API Rate Limits
```typescript
// NestJS Throttler Konfiguration
@Throttle(100, 60) // 100 Requests pro Minute
@Controller('api/v1')
export class ApiController {
  // ...
}

// Strikte Limits für Auth
@Throttle(5, 900) // 5 Requests pro 15 Minuten
@Controller('auth')
export class AuthController {
  // ...
}
```

### Security Headers

#### Helmet.js Konfiguration
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 🚨 Incident Response

### Logging & Monitoring

#### Security Events Logging
```typescript
// Security Event Logger
async function logSecurityEvent(
  event: SecurityEvent,
  userId?: string,
  ipAddress?: string
) {
  await db.securityLog.create({
    data: {
      eventType: event.type,
      severity: event.severity,
      userId,
      ipAddress,
      details: event.details,
      timestamp: new Date()
    }
  });
  
  // Alerting bei kritischen Events
  if (event.severity === 'critical') {
    await sendSecurityAlert(event);
  }
}
```

#### Security Event Types
- **Failed Login Attempts:** Nach X Versuchen
- **CAPTCHA Triggers:** Bei CAPTCHA-Anforderung
- **Rate Limit Exceeded:** Bei Rate-Limit-Überschreitung
- **Suspicious Activity:** Ungewöhnliche Patterns
- **Password Reset Requests:** Für Audit-Trail

### Alerting

#### Security Alerts
```typescript
// Security Alerting
async function sendSecurityAlert(event: SecurityEvent) {
  // E-Mail an Security-Team
  await sendEmail({
    to: process.env.SECURITY_EMAIL,
    subject: `Security Alert: ${event.type}`,
    body: formatSecurityAlert(event)
  });
  
  // Optional: Slack/Discord Webhook
  await sendWebhook(process.env.SECURITY_WEBHOOK, {
    text: `🚨 Security Alert: ${event.type}`,
    details: event.details
  });
}
```

---

## 📋 Security Checklist

### Vor Deployment
- [ ] Alle Passwörter gehasht (nie Klartext)
- [ ] HTTPS überall aktiviert
- [ ] Security Headers konfiguriert
- [ ] Rate Limiting aktiviert
- [ ] Input Validation implementiert
- [ ] SQL Injection Prevention (ORM)
- [ ] XSS Prevention (Sanitization)
- [ ] CSRF Protection (SameSite Cookies)
- [ ] CAPTCHA für Schülerpasswort-Auth
- [ ] Security Logging aktiviert
- [ ] Error Messages (keine sensiblen Daten)
- [ ] Dependency Scanning (npm audit)

### Regelmäßige Überprüfung
- [ ] Security Updates (Dependencies)
- [ ] Log-Review (Suspicious Activity)
- [ ] Penetration Testing (jährlich)
- [ ] Security Audit (halbjährlich)
- [ ] Access Review (Berechtigungen)

---

> [!tip] Implementation Hint
> - Implementiere Security von Anfang an (nicht nachträglich)
> - Defense in Depth: Mehrere Sicherheitsschichten
> - Least Privilege: Minimale Berechtigungen
> - Security by Design: Sicherheit in Architektur integrieren
> - Regelmäßige Security-Reviews
> - Incident Response Plan dokumentieren
