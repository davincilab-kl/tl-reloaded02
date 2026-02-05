---
title: Performance & Caching Guidelines
description: Richtlinien für Performance-Optimierung, Caching-Strategien und Skalierung
enableToc: true
tags:
  - blueprint
  - performance
  - caching
  - scalability
---

# ⚡ Performance & Caching Guidelines

> [!important] Performance-Prinzipien
> Diese Richtlinien definieren Strategien für Performance-Optimierung, Caching und Skalierung der Plattform.

---

## 🎯 Performance-Ziele

### Response-Zeiten
- **API-Endpunkte:** < 200ms (95. Perzentil)
- **GraphQL Queries:** < 500ms (95. Perzentil)
- **Auto-Save:** < 1s (95. Perzentil)
- **Asset-Upload:** < 5s (95. Perzentil)
- **Dashboard-Laden:** < 2s (First Contentful Paint)

### Throughput
- **API-Requests:** 1000+ Requests/Sekunde
- **Auto-Save:** 100+ gleichzeitige Saves
- **Asset-Uploads:** 50+ gleichzeitige Uploads

---

## 💾 Caching-Strategien

### Redis Caching

#### Session-Management
- **Speicherung:** Redis für Session-Daten
- **TTL:** 7 Tage (Standard-Session)
- **Key-Format:** `session:{userId}:{sessionId}`

#### API-Response Caching
```typescript
// Caching-Strategie für API-Responses
const cacheKey = `api:${endpoint}:${params}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await fetchData();
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 Minuten TTL
return data;
```

#### Cache-Invalidierung
- **Strategie:** Tag-basiertes Caching
- **Invalidierung:** Bei Datenänderungen
- **Pattern:** `cache:tag:{tag}:*`

### T!Score Caching

#### Materialized Views (PostgreSQL)
```sql
-- Materialized View für Klassen-T!Score
CREATE MATERIALIZED VIEW class_t_score_cache AS
SELECT 
  c.id AS class_id,
  c.school_id,
  sy.id AS school_year_id,
  COUNT(DISTINCT u.id) AS student_count,
  COALESCE(SUM(u.t_coins_total), 0) AS total_coins,
  CASE 
    WHEN COUNT(DISTINCT u.id) > 0 
    THEN COALESCE(SUM(u.t_coins_total), 0) / COUNT(DISTINCT u.id)
    ELSE 0
  END AS t_score
FROM classes c
LEFT JOIN users u ON u.class_id = c.id AND u.role = 'student'
LEFT JOIN school_years sy ON sy.is_active = true
WHERE u.is_active = true
GROUP BY c.id, c.school_id, sy.id;

-- Index für schnelle Abfragen
CREATE INDEX idx_class_t_score_cache_class_id ON class_t_score_cache(class_id);
CREATE INDEX idx_class_t_score_cache_school_id ON class_t_score_cache(school_id);

-- Refresh-Strategie
REFRESH MATERIALIZED VIEW CONCURRENTLY class_t_score_cache;
```

#### Refresh-Strategie
- **Automatisch:** Alle 5 Minuten (Cron-Job)
- **Manuell:** Bei T!Coins-Transaktionen
- **On-Demand:** Bei Dashboard-Aufruf (mit Cache-Fallback)

#### Redis-Cache für T!Score
```typescript
// T!Score Caching
const getClassTScore = async (classId: string): Promise<number> => {
  const cacheKey = `t_score:class:${classId}`;
  
  // 1. Redis-Cache prüfen
  const cached = await redis.get(cacheKey);
  if (cached) {
    return parseFloat(cached);
  }
  
  // 2. Materialized View abfragen
  const result = await db.query(`
    SELECT t_score FROM class_t_score_cache WHERE class_id = $1
  `, [classId]);
  
  if (result.rows.length > 0) {
    const tScore = result.rows[0].t_score;
    await redis.setex(cacheKey, 300, tScore.toString()); // 5 Minuten
    return tScore;
  }
  
  // 3. Fallback: Live-Berechnung
  return await calculateClassTScore(classId);
};
```

### Apollo Client Caching

#### Cache-Konfiguration
```typescript
// Apollo Client Cache
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        projects: {
          merge(existing, incoming, { args }) {
            return incoming; // Ersetze vollständig
          }
        },
        user: {
          merge(existing, incoming) {
            return { ...existing, ...incoming }; // Merge
          }
        }
      }
    },
    Project: {
      fields: {
        versions: {
          merge(existing, incoming) {
            return incoming; // Ersetze vollständig
          }
        }
      }
    }
  }
});
```

#### Cache-Updates
- **Optimistic Updates:** Für bessere UX
- **Refetch Queries:** Nach Mutations
- **Cache-Eviction:** Automatisch nach TTL

### Next.js ISR (Incremental Static Regeneration)

#### Statische Seiten
```typescript
// Statische Seiten mit ISR
export async function getStaticProps() {
  return {
    props: {
      data: await fetchData()
    },
    revalidate: 60 // Revalidate alle 60 Sekunden
  };
}
```

#### Verwendung
- **Landing Page:** ISR mit 1 Stunde Revalidation
- **Projekt-Galerie:** ISR mit 5 Minuten Revalidation
- **Challenge-Übersicht:** ISR mit 10 Minuten Revalidation

---

## 🔄 Queue-System für Auto-Save

### BullMQ Integration

#### Installation
```bash
npm install bullmq ioredis
```

#### Queue-Konfiguration
```typescript
// queue.config.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// Auto-Save Queue
export const autoSaveQueue = new Queue('autosave', { connection });

// Worker für Auto-Save
export const autoSaveWorker = new Worker(
  'autosave',
  async (job) => {
    const { projectId, scratchData, userId } = job.data;
    
    // Validierung
    validateScratchData(scratchData);
    
    // Speichern
    await saveProjectVersion(projectId, scratchData, userId);
    
    // Projekt aktualisieren
    await updateProject(projectId, {
      scratchData,
      lastSavedAt: new Date()
    });
  },
  {
    connection,
    concurrency: 10, // Max. 10 gleichzeitige Jobs
    limiter: {
      max: 100, // Max. 100 Jobs pro Minute
      duration: 60000
    }
  }
);
```

#### Frontend-Integration
```typescript
// Auto-Save mit Queue
const useAutoSave = (projectId: string, scratchData: ScratchProject) => {
  const debouncedSave = useMemo(
    () => debounce(async (data: ScratchProject) => {
      // Job in Queue einreihen
      await fetch('/api/v1/projects/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          scratchData: data,
          priority: 'low' // Auto-Save hat niedrige Priorität
        })
      });
    }, 30000), // 30 Sekunden Debounce
    [projectId]
  );
  
  useEffect(() => {
    if (!projectId || !scratchData) return;
    
    debouncedSave(scratchData);
    
    return () => {
      debouncedSave.cancel();
    };
  }, [projectId, scratchData, debouncedSave]);
};
```

#### Backend-API für Auto-Save
```typescript
// Auto-Save Endpoint
@Post('/projects/autosave')
async autoSave(@Body() dto: AutoSaveDto) {
  // Job in Queue einreihen
  await autoSaveQueue.add(
    `autosave:${dto.projectId}`,
    {
      projectId: dto.projectId,
      scratchData: dto.scratchData,
      userId: dto.userId
    },
    {
      jobId: `autosave:${dto.projectId}`, // Deduplication
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  );
  
  return { success: true, queued: true };
}
```

#### Job-Prioritäten
- **High:** Manuelles Speichern (Strg+S)
- **Medium:** Wichtige Änderungen
- **Low:** Auto-Save (Standard)

#### Monitoring
```typescript
// Queue-Monitoring
autoSaveQueue.on('completed', (job) => {
  console.log(`Auto-save completed: ${job.id}`);
});

autoSaveQueue.on('failed', (job, err) => {
  console.error(`Auto-save failed: ${job.id}`, err);
  // Alerting
});
```

---

## 📊 Database-Optimierung

### Indizes

#### Wichtige Indizes
```sql
-- User-Indizes
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_class_id ON users(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX idx_users_school_id ON users(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_users_t_coins_total ON users(t_coins_total) WHERE role = 'student';

-- Project-Indizes
CREATE INDEX idx_projects_author_id ON projects(author_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_challenge_id ON projects(challenge_id) WHERE challenge_id IS NOT NULL;

-- Composite Indizes
CREATE INDEX idx_projects_author_status ON projects(author_id, status);
CREATE INDEX idx_users_class_active ON users(class_id, is_active) WHERE role = 'student';
```

### Query-Optimierung

#### N+1 Problem vermeiden
```typescript
// ❌ Schlecht: N+1 Queries
const projects = await db.project.findMany();
for (const project of projects) {
  const author = await db.user.findUnique({ where: { id: project.authorId } });
}

// ✅ Gut: Eager Loading
const projects = await db.project.findMany({
  include: {
    author: true,
    class: true
  }
});
```

#### Pagination
```typescript
// Cursor-basierte Pagination (besser als Offset)
const projects = await db.project.findMany({
  take: 20,
  cursor: { id: lastId },
  orderBy: { createdAt: 'desc' }
});
```

### Connection Pooling
```typescript
// Prisma Connection Pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'error', 'warn']
});

// Connection Pool Konfiguration
// DATABASE_URL muss pool-Parameter enthalten:
// postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

---

## 🚀 CDN & Asset-Optimierung

### S3 + CloudFront

#### Asset-Delivery
- **S3:** Origin für Assets
- **CloudFront:** CDN für globale Verteilung
- **Cache-Control:** 1 Jahr für immutable Assets
- **Versionierung:** Asset-Versionen in URL

#### Asset-Optimierung
```typescript
// Asset-Upload mit Optimierung
const uploadAsset = async (file: File) => {
  // 1. Bildoptimierung (Sharp)
  const optimized = await sharp(file.buffer)
    .resize(480, 360, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();
  
  // 2. Upload zu S3
  const key = `assets/${uuid()}.webp`;
  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: optimized,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable'
  });
  
  // 3. CloudFront URL
  return `https://cdn.platform.com/${key}`;
};
```

---

## 📈 Monitoring & Alerting

### Performance-Metriken

#### Key Metrics
- **API Response Time:** P50, P95, P99
- **Database Query Time:** Langsamste Queries
- **Queue Processing Time:** Job-Dauer
- **Cache Hit Rate:** Redis Cache-Effizienz
- **Error Rate:** Fehlerrate pro Endpunkt

#### Monitoring-Tools
- **Prometheus:** Metriken-Sammlung
- **Grafana:** Visualisierung
- **Sentry:** Error-Tracking
- **New Relic / Datadog:** APM (optional)

### Alerting-Regeln
```yaml
# Alerting-Konfiguration
alerts:
  - name: HighAPIResponseTime
    condition: api_response_time_p95 > 500ms
    duration: 5m
    severity: warning
    
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 2m
    severity: critical
    
  - name: QueueBacklog
    condition: autosave_queue_size > 1000
    duration: 10m
    severity: warning
```

---

## 🔧 Best Practices

### Frontend
- **Code Splitting:** Lazy Loading für Routes
- **Image Optimization:** Next.js Image Component
- **Bundle Size:** < 200KB initial (gzipped)
- **Debouncing/Throttling:** Für User-Input

### Backend
- **Connection Pooling:** Effiziente DB-Verbindungen
- **Batch Operations:** Mehrere Operationen zusammenfassen
- **Async Processing:** Lange Operationen in Queue
- **Rate Limiting:** Schutz vor Überlastung

### Database
- **Indizes:** Für alle häufig abgerufenen Felder
- **Materialized Views:** Für komplexe Berechnungen
- **Partitioning:** Für große Tabellen (optional)
- **VACUUM:** Regelmäßige Wartung

---

> [!tip] Implementation Hint
> - Implementiere Caching von Anfang an
> - Überwache Performance-Metriken kontinuierlich
> - Teste unter Last (Load Testing)
> - Optimiere schrittweise basierend auf Metriken
> - Dokumentiere alle Performance-Entscheidungen
