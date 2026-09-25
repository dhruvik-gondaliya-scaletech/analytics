# Architecture Documentation

## System Topology

```text
Product / Web Client / Server SDK
               │
               ▼ HTTP POST /v1/ingest (Bearer Token)
       ┌───────────────┐
       │ Ingestion API │  ───────> Validates DTO & Assigns event_id
       └───────┬───────┘
               │ Enqueue
               ▼
       ┌───────────────┐
       │ Redis/BullMQ  │  ───────> Ingestion Queue Buffer
       └───────┬───────┘
               │ Batch Consumed (500 events / 1s flush)
               ▼
       ┌───────────────┐
       │ Ingestion Worker│
       └───────┬───────┘
               ├──────────────────────────┐
               │ Bulk INSERT              │ Auto Discover
               ▼                          ▼
      ┌──────────────────┐      ┌────────────────────┐
      │  ClickHouse DB   │      │ PostgreSQL Metadata│
      │ analytics_events │      │ event_definitions  │
      └──────────────────┘      └────────────────────┘
```

## Data Stores & Responsibilities

1. **ClickHouse Store (`analytics.analytics_events`)**:
   - Engine: `MergeTree`
   - Partitioning: `PARTITION BY toYYYYMM(timestamp)`
   - Order Key: `ORDER BY (event_name, timestamp, user_id, event_id)`
   - TTL: Configurable retention up to 365 days (`TTL timestamp + INTERVAL 365 DAY DELETE`)
   - Append-only event store.

2. **PostgreSQL Store (`analytics_metadata`)**:
   - TypeORM entities (`DashboardUser`, `IngestionApiKey`, `EventDefinition`, `EventPropertyDefinition`, `SavedInsight`, `DashboardDefinition`, `DashboardWidget`, `AuditLog`).
   - Configuration and control-plane data.

3. **Redis & BullMQ**:
   - Queue: `analytics-ingestion`
   - High-throughput asynchronous write buffer with exponential backoff retries and dead-letter queue (DLQ) support.

## User Identity Basis

For all unique user, funnel, and retention queries:
```text
identity = user_id != '' ? user_id : (anonymous_id != '' ? anonymous_id : null)
```
Events with no identity remain valid event records but are excluded from unique-user metrics.
