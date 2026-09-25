# Backend Technology Stack Specification

This document details the backend architecture, technology stack, database choices, module breakdown, and development patterns for the Analytics Platform Backend API.

---

## 1. Executive Summary & Core Stack

The Analytics Backend is built as a high-performance, modular **NestJS** application running on **Node.js** with **TypeScript**. It handles event ingestion from client/server SDKs, metadata persistence, ClickHouse analytical query execution, background queue processing, and security/rate limiting.

### Key Technology Stack Summary

| Layer / Concern | Technology | Version / Package | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **NestJS** | `^11.0.1` | Modular Node.js framework providing Dependency Injection (DI), decorators, and enterprise architecture. |
| **Language** | **TypeScript** | `^5.7.3` | Strict static typing for DTOs, entities, ClickHouse query builders, and service contracts. |
| **Analytical Database** | **ClickHouse** | Time-Series Engine | Column-oriented DBMS for sub-second analytical queries across millions of ingestion events. |
| **Metadata Storage & ORM**| **PostgreSQL** + **TypeORM** | `pg ^8.20`, `typeorm ^0.3.28` | Relational storage for metadata, event schemas, funnels, user cohorts, and custom dashboards. |
| **Queueing & Background Jobs**| **BullMQ** + **Redis** | `bullmq ^5.76`, `ioredis ^5.10` | High-throughput asynchronous message queues for batching event ingestion and analytical aggregation. |
| **Caching & Memory Store** | **Cache Manager** + **Redis** | `@nestjs/cache-manager ^3.1` | In-memory query result caching, rate-limit counters, and active session tokens. |
| **Authentication & AuthZ** | **JWT** + **Passport** | `@nestjs/jwt ^11.0`, `passport-jwt` | Stateless token authentication, role-based guards, and ingestion API key verification. |
| **Security & Middleware** | **Helmet** + **Express Rate Limit** | `helmet ^8.1`, `express-rate-limit ^8.0` | HTTP security headers, CORS enforcement, and DDoS protection on ingestion endpoints. |
| **API Documentation** | **Swagger / OpenAPI** | `@nestjs/swagger ^11.4` | Auto-generated interactive REST API documentation and DTO schemas at `/api/docs`. |
| **Validation & DTOs** | **class-validator** + **class-transformer**| `class-validator ^0.15` | Runtime payload validation, pipe transformations, and strict payload sanitization. |
| **Logging System** | **Winston** | `winston ^3.19`, `nest-winston` | Structured JSON logging with multi-transport support (console, file, centralized logging). |
| **Testing Framework** | **Jest** + **Supertest** | `jest ^30.3`, `supertest ^7.2` | Unit tests for controllers/services and End-to-End (E2E) HTTP integration tests. |

---

## 2. Architecture & Data Flow

```text
                                  +-----------------------+
                                  | Client / Server SDKs  |
                                  +-----------+-----------+
                                              |
                                              v  HTTP REST / JSON
                                  +-----------+-----------+
                                  | NestJS Ingestion API  |
                                  | (Rate Limit & Auth)   |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     | Async Ingestion Buffer                          | API Direct Queries
                     v                                                 v
          +----------+----------+                          +-----------+-----------+
          | BullMQ Queue        |                          | ClickHouse Analytics DB  |
          | (Redis Stream)      |                          | (Events, Aggregates)      |
          +----------+----------+                          +---------------------------+
                     | Batch Workers                                   ^
                     v                                                 |
          +----------+----------+                                      |
          | ClickHouse Batch    +--------------------------------------+
          | Ingestion Service   |
          +---------------------+

                     +----------------------------------+
                     | PostgreSQL (TypeORM)             |
                     | Dashboards, Metrics, Event Schemas|
                     +----------------------------------+
```

---

## 3. Technology Deep-Dive & Architectural Rationale

### 3.1 Framework & Architecture (NestJS)
- **Modular Structure:** Domain logic is organized into isolated NestJS modules (`AuthModule`, `EventsModule`, `AnalyticsModule`, `DatabaseModule`).
- **Dependency Injection:** Simplifies unit testing by permitting easy mocking of database repositories and Redis connection pools.
- **Global Pipes & Filters:**
  - `ValidationPipe`: Enforces DTO schema validation globally.
  - `HttpExceptionFilter`: Standardizes error responses into clean JSON structures.

### 3.2 Database Strategy: Dual-Database Paradigm
1. **ClickHouse (Analytical DB):**
   - Stores raw time-series event records (`events` table).
   - Columnar layout optimized for aggregate queries (`COUNT`, `SUM`, `UNIQUES`, `QUANTILE`, `RETENTION`).
   - Inserts are buffered via BullMQ to avoid high-frequency single-row insert penalties.
2. **PostgreSQL + TypeORM (Metadata DB):**
   - Manages relational entities: Users, API Keys, Event Schema Registries, Saved Funnels, Dashboard Configs.
   - Utilizes TypeORM migrations for schema evolution.

### 3.3 Asynchronous Queueing (BullMQ & Redis)
- **High Ingestion Throughput:** Ingestion endpoints acknowledge receipt immediately (`202 Accepted`) and enqueue events into Redis via BullMQ.
- **Batch Processing:** Dedicated worker threads dequeue events in batches (e.g., 500 events or 1-second timeout) and execute bulk `INSERT` statements into ClickHouse.

### 3.4 Security & Validation Layer
- **Authentication:** JWT tokens for admin dashboard access; hashed ingestion tokens (`X-Ingestion-Key`) for SDK events.
- **Rate Limiting:** IP and API key rate-limiting enforced at entry points via Redis.
- **Security Headers:** `helmet` for defense against XSS, clickjacking, and mime-sniffing.

---

## 4. Recommended Backend Directory Structure

```text
backend/
├── src/
│   ├── main.ts                       # Application entrypoint (Swagger, validation, pipes)
│   ├── app.module.ts                 # Root NestJS module registering sub-modules
│   ├── app.controller.ts             # Health check endpoints
│   ├── app.service.ts
│   │
│   ├── core/                         # Enterprise cross-cutting concerns
│   │   ├── crypto/                   # Encryption & token utilities
│   │   ├── dto/                      # Global DTOs (pagination, response wrappers)
│   │   ├── exception-filters/        # Global HTTP & RPC exception handling
│   │   ├── hashing/                  # Bcrypt hashing service
│   │   ├── interceptor/              # Logging & response transformation interceptors
│   │   ├── roles/                    # RBAC decorators and guards
│   │   ├── swagger/                  # OpenAPI configuration helpers
│   │   └── utils/                    # Common helper utilities
│   │
│   ├── database/                     # PostgreSQL & ClickHouse database modules
│   │   ├── data-source.ts            # TypeORM CLI migration configuration
│   │   ├── database.module.ts        # Database connection providers
│   │   ├── typeorm-root.module.ts    # TypeORM root config loader
│   │   └── clickhouse/               # ClickHouse client provider & migration scripts
│   │
│   └── modules/                      # Feature modules
│       ├── auth/                     # JWT authentication, login, token refresh
│       ├── ingestion/                # SDK event ingestion controller & BullMQ producer
│       ├── analytics/                # ClickHouse analytical queries (Funnels, Retention, Metrics)
│       ├── dashboards/               # Custom dashboard configuration & metadata CRUD
│       └── events-registry/          # Event schema registry & validation definitions
│
├── test/                             # End-to-End (E2E) Jest integration tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── nest-cli.json                     # NestJS CLI configuration
├── tsconfig.json                     # TypeScript compiler configuration
├── tsconfig.build.json               # Build tsconfig for production output
└── package.json                      # Project dependencies & npm scripts
```

---

## 5. Core Implementation Patterns

### 5.1 ClickHouse Query Service Pattern
```typescript
import { Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly clickHouseClient: ClickHouseClient) {}

  async getTimeSeriesMetrics(event: string, startDate: string, endDate: string) {
    const query = `
      SELECT 
        toStartOfDay(timestamp) AS date,
        count(*) AS total_events,
        uniqExact(distinct_id) AS unique_users
      FROM events
      WHERE event_name = {event: String}
        AND timestamp >= {startDate: DateTime}
        AND timestamp <= {endDate: DateTime}
      GROUP BY date
      ORDER BY date ASC
    `;

    const resultSet = await this.clickHouseClient.query({
      query,
      query_params: { event, startDate, endDate },
      format: 'JSONEachRow',
    });

    return resultSet.json();
  }
}
```

### 5.2 BullMQ Batch Ingestion Processor Example
```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Processor('event-ingestion')
@Injectable()
export class IngestionProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<void> {
    const eventsBatch = job.data.events;
    // Bulk insert batch into ClickHouse
    await this.bulkInsertToClickHouse(eventsBatch);
  }

  private async bulkInsertToClickHouse(events: any[]) {
    // ClickHouse bulk insert logic
  }
}
```

---

## 6. Development & Operations Guide

### Prerequisites
- **Node.js**: `^20.0.0` or `^22.0.0`
- **PostgreSQL**: `^15` or `^16`
- **Redis**: `^7.0`
- **ClickHouse**: `^23.8` or newer

### Local Development Commands
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start in development mode with hot reload
npm run start:dev

# Run unit tests
npm run test

# Run End-to-End (E2E) tests
npm run test:e2e

# Compile production build
npm run build

# Start production server
npm run start:prod
```

---

## 7. Summary Matrix

| Requirement | Solution | Package |
| :--- | :--- | :--- |
| **Framework** | NestJS | `@nestjs/core` |
| **Language** | TypeScript | `typescript` |
| **Metadata Database** | PostgreSQL | `pg` + `typeorm` |
| **Analytical Database**| ClickHouse | `@clickhouse/client` |
| **Queueing & Async** | BullMQ | `@nestjs/bullmq` + `bullmq` |
| **Cache & Store** | Redis | `ioredis` / `@nestjs/cache-manager` |
| **Authentication** | JWT & Passport | `@nestjs/jwt` + `passport-jwt` |
| **Documentation** | Swagger / OpenAPI | `@nestjs/swagger` |
| **Logging** | Winston | `nest-winston` + `winston` |
