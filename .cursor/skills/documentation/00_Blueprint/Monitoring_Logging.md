---
title: Monitoring & Logging Strategy
description: Umfassende Strategie für Monitoring, Logging und Observability
enableToc: true
tags:
  - blueprint
  - monitoring
  - logging
  - observability
---

# 📊 Monitoring & Logging Strategy

> [!important] Observability-Prinzipien
> Diese Strategie definiert alle Monitoring- und Logging-Ansätze für die Plattform.

---

## 📈 Monitoring-Stack

### Tools & Services

#### Primäre Tools
- **Prometheus:** Metriken-Sammlung
- **Grafana:** Visualisierung & Dashboards
- **Sentry:** Error-Tracking & Performance Monitoring
- **Loki:** Log-Aggregation (optional)

#### Alternative Tools
- **Datadog:** All-in-One APM (kostenpflichtig)
- **New Relic:** Application Performance Monitoring (kostenpflichtig)

---

## 📊 Metriken

### Application Metrics

#### Key Performance Indicators (KPIs)
```typescript
// Metriken-Definition
interface ApplicationMetrics {
  // API Performance
  apiResponseTime: {
    p50: number; // Median
    p95: number; // 95. Perzentil
    p99: number; // 99. Perzentil
  };
  
  // Request Rates
  requestsPerSecond: number;
  requestsPerMinute: number;
  
  // Error Rates
  errorRate: number; // Prozent
  errorCount: number;
  
  // Database
  dbQueryTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  dbConnectionPool: {
    active: number;
    idle: number;
    waiting: number;
  };
  
  // Queue
  queueSize: number;
  queueProcessingTime: number;
  queueFailedJobs: number;
  
  // Cache
  cacheHitRate: number; // Prozent
  cacheMissRate: number; // Prozent
}
```

### Business Metrics

#### User Metrics
- **Active Users:** DAU, WAU, MAU
- **New Registrations:** Pro Tag/Woche/Monat
- **Login Rate:** Erfolgreiche/Fehlgeschlagene Logins
- **Session Duration:** Durchschnittliche Session-Dauer

#### Content Metrics
- **Projects Created:** Pro Tag/Woche
- **Projects Published:** Pro Tag/Woche
- **Challenge Submissions:** Pro Challenge
- **T!Coins Earned:** Pro Tag/Woche

### Infrastructure Metrics

#### Server Metrics
- **CPU Usage:** Prozent
- **Memory Usage:** Prozent
- **Disk Usage:** Prozent
- **Network I/O:** Bytes pro Sekunde

#### Database Metrics
- **Connection Count:** Aktive Verbindungen
- **Query Performance:** Langsamste Queries
- **Replication Lag:** Bei Master-Slave Setup

---

## 🔍 Logging

### Structured Logging

#### Log-Format
```typescript
// Structured Log Format
interface LogEntry {
  timestamp: string; // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: {
    service: string; // 'api', 'worker', 'web'
    requestId?: string; // Für Request-Tracking
    userId?: string; // Optional
    ipAddress?: string; // Optional
  };
  metadata?: Record<string, any>; // Zusätzliche Daten
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```

#### Logger-Implementierung
```typescript
// logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Console-Output in Development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Log-Levels

#### Verwendung
- **DEBUG:** Detaillierte Informationen für Entwicklung
- **INFO:** Allgemeine Informationen (Requests, Operations)
- **WARN:** Warnungen (Rate Limits, Deprecated Features)
- **ERROR:** Fehler (Exceptions, Failed Operations)

### Request Logging

#### Middleware
```typescript
// request-logging.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    req['requestId'] = requestId;
    
    const startTime = Date.now();
    
    // Log Request
    logger.info('Incoming request', {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Log Response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration
      });
    });
    
    next();
  }
}
```

---

## 🚨 Alerting

### Alert-Konfiguration

#### Alert-Rules (Prometheus)
```yaml
# alerts.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighAPIResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API Response Time is high"
          description: "95th percentile response time is {{ $value }}s"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}"
      
      - alert: QueueBacklog
        expr: bullmq_queue_size > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Queue backlog is high"
          description: "Queue size is {{ $value }}"
      
      - alert: DatabaseConnectionPoolExhausted
        expr: db_connection_pool_active / db_connection_pool_max > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value }}% of connections in use"
```

### Alert-Channels

#### Notification-Channels
- **E-Mail:** Für kritische Alerts
- **Slack:** Für Team-Notifications
- **PagerDuty:** Für kritische Incidents (optional)
- **SMS:** Für kritische Alerts (optional)

#### Alert-Implementierung
```typescript
// alerting.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertingService {
  private transporter = nodemailer.createTransport({
    // SMTP-Konfiguration
  });
  
  async sendAlert(alert: Alert) {
    // E-Mail
    await this.transporter.sendMail({
      to: process.env.ALERT_EMAIL,
      subject: `🚨 Alert: ${alert.title}`,
      text: alert.message
    });
    
    // Slack Webhook
    await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *${alert.title}*\n${alert.message}`,
        channel: '#alerts'
      })
    });
  }
}
```

---

## 📊 Dashboards

### Grafana Dashboards

#### API Performance Dashboard
- **Response Times:** P50, P95, P99
- **Request Rates:** Requests pro Sekunde/Minute
- **Error Rates:** Fehlerrate pro Endpunkt
- **Top Endpoints:** Meist aufgerufene Endpunkte

#### Database Dashboard
- **Query Performance:** Langsamste Queries
- **Connection Pool:** Aktive/Idle Connections
- **Transaction Rate:** Transactions pro Sekunde
- **Cache Hit Rate:** Redis Cache-Effizienz

#### Queue Dashboard
- **Queue Size:** Anzahl Jobs in Queue
- **Processing Time:** Durchschnittliche Verarbeitungszeit
- **Failed Jobs:** Anzahl fehlgeschlagener Jobs
- **Throughput:** Jobs pro Minute

#### Business Dashboard
- **Active Users:** DAU, WAU, MAU
- **Projects Created:** Pro Tag/Woche
- **Challenge Submissions:** Pro Challenge
- **T!Coins Earned:** Pro Tag/Woche

---

## 🔐 Security Monitoring

### Security Events

#### Event-Types
- **Failed Login Attempts:** Nach X Versuchen
- **CAPTCHA Triggers:** Bei CAPTCHA-Anforderung
- **Rate Limit Exceeded:** Bei Rate-Limit-Überschreitung
- **Suspicious Activity:** Ungewöhnliche Patterns
- **Password Reset Requests:** Für Audit-Trail

#### Security Logging
```typescript
// security-logger.ts
async function logSecurityEvent(
  event: SecurityEvent,
  userId?: string,
  ipAddress?: string
) {
  await logger.warn('Security event', {
    eventType: event.type,
    severity: event.severity,
    userId,
    ipAddress,
    details: event.details,
    timestamp: new Date().toISOString()
  });
  
  // Alert bei kritischen Events
  if (event.severity === 'critical') {
    await alertingService.sendAlert({
      title: `Security Alert: ${event.type}`,
      message: JSON.stringify(event.details),
      severity: 'critical'
    });
  }
}
```

---

## 📋 Monitoring-Checklist

### Setup
- [ ] Prometheus konfiguriert
- [ ] Grafana Dashboards erstellt
- [ ] Sentry integriert
- [ ] Logging-Infrastructure eingerichtet
- [ ] Alert-Rules definiert
- [ ] Notification-Channels konfiguriert

### Regelmäßige Überprüfung
- [ ] Dashboard-Review (täglich)
- [ ] Alert-Review (wöchentlich)
- [ ] Log-Review (wöchentlich)
- [ ] Performance-Analyse (monatlich)
- [ ] Capacity-Planning (vierteljährlich)

---

> [!tip] Implementation Hint
> - Implementiere Monitoring von Anfang an
> - Definiere klare Metriken und Ziele
> - Automatisiere Alerting
> - Review Dashboards regelmäßig
> - Dokumentiere alle Metriken und Alerts
> - Plane Capacity basierend auf Metriken
