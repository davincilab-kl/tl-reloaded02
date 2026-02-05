---
title: Testing Strategy
description: Umfassende Testing-Strategie für die Plattform
enableToc: true
tags:
  - blueprint
  - testing
  - quality-assurance
---

# 🧪 Testing Strategy

> [!important] Testing-Prinzipien
> Diese Strategie definiert alle Testing-Ansätze für die Plattform, von Unit-Tests bis E2E-Tests.

---

## 📊 Testing-Pyramide

```
        /\
       /  \      E2E Tests (10%)
      /____\     
     /      \    Integration Tests (30%)
    /________\   
   /          \  Unit Tests (60%)
  /____________\
```

### Verteilung
- **Unit Tests:** 60% - Schnell, isoliert, viele
- **Integration Tests:** 30% - Komponenten zusammen, mittlere Geschwindigkeit
- **E2E Tests:** 10% - Vollständige User-Flows, langsam, kritische Pfade

---

## 🔬 Unit Tests

### Frontend (React)

#### Tools
- **Jest:** Test-Runner
- **React Testing Library:** Component Testing
- **@testing-library/user-event:** User-Interaktionen

#### Beispiel
```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Coverage-Ziele
- **Komponenten:** > 80% Coverage
- **Utilities:** > 90% Coverage
- **Hooks:** > 85% Coverage

### Backend (NestJS)

#### Tools
- **Jest:** Test-Runner
- **@nestjs/testing:** NestJS Testing Utilities
- **Supertest:** HTTP Assertions

#### Beispiel
```typescript
// projects.service.spec.ts
import { Test } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn()
            }
          }
        }
      ]
    }).compile();
    
    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  
  it('should create a project', async () => {
    const projectData = {
      title: 'Test Project',
      authorId: 'user-123'
    };
    
    const mockProject = { id: 'project-123', ...projectData };
    jest.spyOn(prisma.project, 'create').mockResolvedValue(mockProject);
    
    const result = await service.create(projectData);
    
    expect(result).toEqual(mockProject);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: projectData
    });
  });
});
```

#### Coverage-Ziele
- **Services:** > 85% Coverage
- **Controllers:** > 80% Coverage
- **Guards:** > 90% Coverage
- **Utilities:** > 90% Coverage

---

## 🔗 Integration Tests

### API Integration Tests

#### Tools
- **Supertest:** HTTP Testing
- **Test Database:** Separate Test-DB

#### Beispiel
```typescript
// projects.integration.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Projects API (Integration)', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = module.createNestApplication();
    await app.init();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('POST /api/v1/projects - should create a project', async () => {
    const projectData = {
      title: 'Test Project',
      description: 'Test Description'
    };
    
    const response = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send(projectData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(projectData.title);
  });
});
```

### Database Integration Tests

#### Test Database Setup
```typescript
// test-db.setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
});

beforeEach(async () => {
  // Cleanup vor jedem Test
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## 🎭 E2E Tests

### Tools
- **Playwright:** Browser Automation (bevorzugt)
- **Cypress:** Alternative (optional)

### Kritische User-Flows

#### 1. Schüler-Registrierung & Login
```typescript
// e2e/student-auth.spec.ts
import { test, expect } from '@playwright/test';

test('Student can login with password', async ({ page }) => {
  await page.goto('/login/student');
  
  // Passwort eingeben
  await page.fill('input[type="password"]', 'student-password-123');
  
  // Login klicken
  await page.click('button[type="submit"]');
  
  // Dashboard sollte geladen werden
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

#### 2. Projekt-Erstellung & Veröffentlichung
```typescript
// e2e/project-publishing.spec.ts
test('Student can create and publish project', async ({ page }) => {
  // Login
  await loginAsStudent(page);
  
  // Projekt erstellen
  await page.goto('/projects/new');
  await page.fill('input[name="title"]', 'My Test Project');
  
  // Scratch-Editor öffnen (Mock)
  await page.click('button:has-text("Editor öffnen")');
  
  // Projekt speichern
  await page.click('button:has-text("Speichern")');
  
  // Veröffentlichen
  await page.click('button:has-text("Veröffentlichen")');
  await page.fill('textarea[name="description"]', 'Test description');
  await page.click('button:has-text("Einreichen")');
  
  // Status prüfen
  await expect(page.locator('.status')).toContainText('Zur Veröffentlichung eingereicht');
});
```

#### 3. Challenge-Teilnahme
```typescript
// e2e/challenge-participation.spec.ts
test('Student can participate in challenge', async ({ page }) => {
  await loginAsStudent(page);
  
  // Challenge finden
  await page.goto('/challenges');
  await page.click('a:has-text("Game Development Challenge")');
  
  // Projekt für Challenge einreichen
  await page.click('button:has-text("Projekt einreichen")');
  await page.selectOption('select[name="project"]', 'my-project-id');
  await page.click('button:has-text("Einreichen")');
  
  // Bestätigung
  await expect(page.locator('.success-message')).toContainText('Erfolgreich eingereicht');
});
```

### Test-Daten

#### Fixtures
```typescript
// e2e/fixtures.ts
export const testUsers = {
  student: {
    password: 'test-student-password-123',
    id: 'student-test-id'
  },
  teacher: {
    email: 'teacher@test.com',
    password: 'teacher-password-123',
    id: 'teacher-test-id'
  }
};

export const testProjects = {
  draft: {
    id: 'project-draft-id',
    title: 'Draft Project',
    status: 'draft'
  },
  published: {
    id: 'project-published-id',
    title: 'Published Project',
    status: 'published'
  }
};
```

---

## 🔄 Auto-Save Testing

### Queue-System Tests

#### Unit Tests
```typescript
// autosave-queue.spec.ts
import { Queue } from 'bullmq';

describe('Auto-Save Queue', () => {
  it('should queue auto-save job', async () => {
    const job = await autoSaveQueue.add('test-project', {
      projectId: 'project-123',
      scratchData: mockScratchData
    });
    
    expect(job.id).toBeDefined();
    expect(job.data.projectId).toBe('project-123');
  });
  
  it('should process auto-save job', async () => {
    const job = await autoSaveQueue.add('test-project', {
      projectId: 'project-123',
      scratchData: mockScratchData
    });
    
    await job.finished();
    
    const project = await db.project.findUnique({
      where: { id: 'project-123' }
    });
    
    expect(project.lastSavedAt).toBeDefined();
  });
});
```

#### Integration Tests
```typescript
// autosave.integration.spec.ts
test('Auto-save should save project after 30 seconds', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/projects/new');
  
  // Projekt bearbeiten
  await page.fill('input[name="title"]', 'Auto-Save Test');
  
  // Warten auf Auto-Save (30 Sekunden)
  await page.waitForTimeout(30000);
  
  // Prüfen ob gespeichert
  await expect(page.locator('.save-status')).toContainText('Gespeichert');
});
```

---

## 🧪 WordPress-Migration Tests

### Migration-Tests

#### WordPress Hash Validierung
```typescript
// wordpress-migration.spec.ts
describe('WordPress Password Migration', () => {
  it('should validate WordPress hash', async () => {
    const wpHash = '$P$B1234567890abcdefghijklmnopqrstuv';
    const password = 'test-password';
    
    const isValid = await validateWordPressPassword(password, wpHash);
    expect(isValid).toBe(true);
  });
  
  it('should migrate password on login', async () => {
    const user = await createUserWithWordPressHash();
    
    // Login mit WordPress Hash
    const result = await authenticateUser(user.email, 'password');
    
    expect(result.success).toBe(true);
    expect(user.passwordMigrated).toBe(true);
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHashWp).toBeNull();
  });
});
```

---

## 📊 Test-Coverage

### Coverage-Ziele

#### Minimum Coverage
- **Unit Tests:** > 80%
- **Integration Tests:** > 70%
- **E2E Tests:** Kritische Pfade 100%

#### Coverage-Reporting
```json
// package.json
{
  "scripts": {
    "test:unit": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js --coverage",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage --coverageReporters=html"
  }
}
```

### Coverage-Tools
- **Jest Coverage:** Für Unit/Integration Tests
- **Playwright Coverage:** Für E2E Tests (optional)
- **Codecov / Coveralls:** Coverage-Tracking (optional)

---

## 🚀 CI/CD Integration

### GitHub Actions

#### Test-Pipeline
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
  
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## 📋 Testing-Checklist

### Vor jedem Commit
- [ ] Unit Tests lokal durchlaufen
- [ ] Linter-Checks bestehen
- [ ] Type-Checks bestehen

### Vor jedem PR
- [ ] Alle Tests bestehen (Unit, Integration, E2E)
- [ ] Coverage-Ziele erreicht
- [ ] Neue Features getestet
- [ ] Breaking Changes dokumentiert

### Vor jedem Release
- [ ] Vollständige Test-Suite durchlaufen
- [ ] E2E Tests für kritische Pfade
- [ ] Performance-Tests
- [ ] Security-Tests
- [ ] Regression-Tests

---

> [!tip] Implementation Hint
> - Schreibe Tests parallel zur Implementierung (TDD)
> - Teste kritische Business-Logik zuerst
> - Mock externe Dependencies (APIs, DB)
> - Verwende Test-Datenbank für Integration Tests
> - Automatisiere alle Tests in CI/CD
> - Überwache Test-Coverage kontinuierlich
