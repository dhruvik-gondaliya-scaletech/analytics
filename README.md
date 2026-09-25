# Standalone Product Analytics Platform

A self-hosted, high-performance product analytics platform built for isolated, single-tenant product deployments (such as Scale EV, Kollabary, or MedBridge).

## Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM, ClickHouse, Redis, BullMQ
- **Analytical Store**: ClickHouse (MergeTree engine)
- **Metadata Store**: PostgreSQL (TypeORM metadata entities)
- **Queue Pipeline**: Redis + BullMQ (At-least-once asynchronous write buffer)
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, TanStack Query, Recharts

## Quick Start

### 1. Run Infrastructure via Docker Compose

```bash
# Run database & redis services for local development:
docker compose up -d postgres clickhouse redis

# (Optional) Or run the full stack including containerized backend:
# docker compose up -d
```

This starts:
- PostgreSQL on host port `5433` (container `5432`)
- ClickHouse on port `8123` (HTTP) & `9000` (Native)
- Redis on port `6379`

### 2. Start Backend API

```bash
cd backend
npm install
npm run start:dev
```

The backend starts at `http://localhost:3000`. Swagger API docs are available at `http://localhost:3000/docs`.

### 3. Start Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

The dashboard opens at `http://localhost:5173`.

### Default Credentials (Development Mode)

- **Admin User**: `admin@analytics.local` / `AdminPass@2026`
- **Analyst User**: `analyst@analytics.local` / `AnalystPass@2026`
- **Default Ingestion Token**: `default-write-token`

## Ingesting Your First Event

```bash
curl -X POST http://localhost:3000/v1/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default-write-token" \
  -d '{
    "event_name": "checkout.completed",
    "event_version": 1,
    "event_data": {
      "amount": 1499,
      "currency": "INR"
    },
    "context": {
      "user_id": "user_123",
      "anonymous_id": "anon_456",
      "session_id": "session_789"
    }
  }'
```

Returns `202 Accepted` with queued event ID.

## Core Features

- **Asynchronous Ingestion**: Fast API acknowledgement (`202 Accepted`) with BullMQ Redis batching and bulk ClickHouse writes.
- **Auto Discovery**: Unknown events are automatically ingested and registered in the Event Registry.
- **Event Explorer**: Search raw payloads with filtering, pagination, and CSV exports (up to 50k rows).
- **Core Analytics**: DAU/WAU/MAU KPIs, time-series query builder, step-by-step conversion funnels, cohort retention heatmaps.
- **Saved Insights & Dashboards**: Create, save, and pin private or shared insights and custom widget layouts.
- **Data Privacy & GDPR Purge**: Administrative user data purge endpoints (`POST /v1/admin/data-deletion/users`).
