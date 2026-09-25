
# MASTER SPECIFICATION — STANDALONE PRODUCT ANALYTICS PLATFORM
## AI IDE / Principal Engineer Build Contract
**Version:** 3.0  
**Status:** Implementation-ready baseline  
**Deployment model:** One isolated analytics instance per product  
**Repositories:** Two independent repositories; no monorepo

---

# 0. FINAL EXECUTIVE DECISIONS

This is the authoritative v3 build contract. The following decisions are final for v1.

## 0.1 Deployment and tenancy

- Two independent repositories:
  - `analytics-backend`
  - `analytics-frontend`
- No monorepo.
- One isolated analytics deployment per product.
- Production environment only for v1.
- No `project_id`, `organization_id`, tenant switcher, SaaS billing, or cross-product analytics.
- Each product has its own deployment, database, Redis instance, ClickHouse instance, dashboard URL, and ingestion credentials.
- The architecture must leave room for future staging/development environments, but they must not be implemented in v1.

## 0.2 Core technology

- Backend: NestJS + TypeScript.
- Analytical store: ClickHouse.
- Metadata/control-plane store: PostgreSQL + TypeORM.
- Queue: BullMQ + Redis.
- Frontend: React + Vite + TypeScript.
- UI: Tailwind CSS + shadcn/ui.
- Server state: TanStack Query.
- Charts: Recharts.
- Dates: date-fns.
- Production frontend: Nginx static hosting.
- Production API and worker are separate processes/containers.

## 0.3 Ingestion

- Canonical endpoint: `POST /v1/ingest`.
- Batch endpoint: `POST /v1/ingest/batch`.
- Legacy `/webhook` may be provided as a compatibility alias, but all new integrations must use `/v1/ingest`.
- Integration model is HTTP webhook/API only.
- Do not build an official SDK in v1.
- Client-generated `event_id` is supported and strongly encouraged.
- Delivery semantics: at-least-once.
- Unknown events are accepted and automatically discovered.
- Target workload: approximately 1,000,000 events/day per product.
- Target ingestion volume must be configurable and load-tested.

## 0.4 Dashboard authentication

Use **Option 1: local email + password**.

- No Google login in v1.
- No OIDC/SSO in v1.
- Secure HttpOnly cookie-based sessions.
- Roles:
  - `ADMIN`
  - `ANALYST`
- Authentication and ingestion credentials are completely separate.

## 0.5 Data retention and privacy

- Maximum/default retention: 365 days.
- Retention must be configurable but must not exceed 365 days in v1.
- IP address: collected.
- User agent: collected.
- Country: collected when available.
- These fields are considered potentially identifying data and must be documented as such.
- Do not intentionally collect passwords, access tokens, payment credentials, API keys, or secrets inside event properties.
- User/event deletion is required as an administrative capability for v1.
- Analytics timezone: UTC.
- All timestamps stored and queried in UTC.

## 0.6 Dashboards and exports

- Dashboards support both:
  - `PRIVATE`: visible to the owner.
  - `SHARED`: visible to all authenticated dashboard users.
- CSV export is included in v1.
- JSON/Excel export is not required in v1.
- Metric alerts are not included in v1.
- Slack/email/webhook alerts are not included in v1.

## 0.7 AI

- AI-generated insights are not included in v1.
- The query/insight architecture must be structured so an AI insight service can be added later without changing the raw event contract.

## 0.8 Environments

- V1 is **production-only**.
- The frontend must not show an environment selector.
- The event contract must not require callers to provide an environment.
- Internally, the ClickHouse schema may retain a fixed `environment = 'production'` field for future compatibility, but it must not be user-configurable.


---

# 1. PRODUCT GOAL

Build a self-hosted analytics system that lets an internal product send structured events and lets authorized operators answer:

- What happened?
- How many users/events occurred?
- Which events are most common?
- How do metrics change over time?
- Where do users drop in a funnel?
- Do users return after their first activity?
- Which properties or segments behave differently?
- Which events are malformed or poorly instrumented?
- Which saved dashboards/insights should be monitored?

The system must support adding new event names and event properties without database migrations for every new event.

---

# 2. NON-GOALS

Do not implement in v1:

- Multi-tenant SaaS billing.
- Organization/workspace management.
- Public user signup.
- Complex enterprise RBAC.
- Marketing automation.
- Session replay.
- Heatmaps.
- Feature flags.
- A/B testing engine.
- CDP destination syncing.
- Arbitrary user-level data exports.
- AI-generated insights.
- Browser extension.
- Mobile native SDKs.

Design extension points, but do not build these features unless explicitly requested.

---

# 3. CRITICAL DESIGN PRINCIPLES

## 3.1 Events are append-only
Raw analytics events must be treated as immutable.

Corrections should happen through:
- filtering,
- event versioning,
- administrative deletion,
- or future correction events.

Do not update individual ClickHouse event rows during normal ingestion.

## 3.2 Ingestion is asynchronous
The ingestion API must acknowledge valid requests quickly and process ClickHouse writes asynchronously.

`POST /v1/ingest` returns `202 Accepted` after validation/authentication and successful queue enqueue.

## 3.3 At-least-once delivery
The queue pipeline is at-least-once. The implementation must explicitly document this.

Support an optional client-provided `event_id` for deduplication. If absent, generate one server-side.

## 3.4 Dynamic event properties
Event-specific properties must not require PostgreSQL schema migrations.

Store:
- canonical top-level fields as typed ClickHouse columns;
- dynamic properties in JSON-compatible storage.

For v1, keep the raw JSON payload for fidelity. Query builders must whitelist allowed property operations and must never interpolate arbitrary user-provided SQL.

## 3.5 Separate secrets
Use separate credentials for:
- event ingestion;
- dashboard authentication;
- PostgreSQL;
- Redis;
- ClickHouse.

Never expose database credentials or ingestion secrets to the browser.

---

# 4. EVENT CONTRACT

## 4.1 Canonical endpoint

```http
POST /v1/ingest
Authorization: Bearer <INGESTION_WRITE_TOKEN>
Content-Type: application/json
Idempotency-Key: <optional-request-id>
```

The old `/webhook` endpoint may remain as a compatibility alias, but `/v1/ingest` is canonical.

## 4.2 Payload

```json
{
  "event_id": "optional-client-generated-uuid",
  "event_name": "checkout.completed",
  "event_version": 1,
  "event_data": {
    "amount": 1499,
    "currency": "INR",
    "payment_method": "razorpay"
  },
  "context": {
    "user_id": "user_123",
    "anonymous_id": "anon_456",
    "session_id": "session_789",
    "timestamp": "2026-09-24T08:30:00.000Z",
    "environment": "production",
    "ip": "optional",
    "user_agent": "optional",
    "device_type": "mobile",
    "browser": "Chrome",
    "os": "Android",
    "country": "IN"
  }
}
```

## 4.3 Validation

Validate:
- event name is non-empty and bounded;
- event version is positive;
- event_data is an object;
- context is an object;
- timestamp is ISO-8601 when provided;
- payload size is bounded;
- event name only contains approved characters;
- nested property depth and total property count are bounded.

Recommended event name format:

```text
^[a-z0-9]+([._-][a-z0-9]+)*$
```

Example:

```text
user.signup
checkout.started
payment.completed
charging.session.started
```

---

# 5. EVENT IDENTITY, USERS AND SESSIONS

Each event may have:

- `event_id`
- `user_id`
- `anonymous_id`
- `session_id`

Rules:

1. `event_id` identifies an event.
2. `user_id` identifies an authenticated/product-level user.
3. `anonymous_id` identifies an anonymous browser/device identity.
4. `session_id` identifies a product session.
5. If both `user_id` and `anonymous_id` exist, analytics should use `user_id` as the primary person identity while retaining `anonymous_id`.
6. Never infer a user identity from IP address.
7. The platform should not invent a `user_id`.
8. If no identity is present, event-level counts remain valid but unique-user metrics must exclude the event.

Session creation is primarily the responsibility of the SDK/product integration. The backend may accept an explicit session ID but must not silently manufacture sessions from arbitrary timestamps in v1.

---

# 6. CLICKHOUSE DATA MODEL

Use the existing canonical event fields, but add operational fields required for production.

Recommended table:

```sql
CREATE TABLE analytics.analytics_events
(
    event_id UUID,
    environment LowCardinality(String),
    event_name LowCardinality(String),
    event_version UInt16,

    timestamp DateTime64(3, 'UTC'),
    received_at DateTime64(3, 'UTC'),

    user_id String,
    anonymous_id String,
    session_id String,

    ip String,
    user_agent String,
    device_type LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    country LowCardinality(String),

    event_data String,
    context String,

    ingestion_source LowCardinality(String) DEFAULT 'api'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (event_name, timestamp, user_id, event_id);
```

### Important
Do not use arbitrary dynamic SQL generated directly from `event_data`.

For common numeric/string properties, the query layer may extract JSON properties using ClickHouse JSON functions after validating the requested property path.

Future optimization may introduce materialized columns or extracted property tables after observing real workloads.

---

# 7. POSTGRESQL METADATA MODEL

PostgreSQL stores configuration and control-plane data only.

Minimum entities:

## 7.1 event_definitions

Fields:
- id
- event_name
- display_name
- description
- category
- status
- expected_schema JSONB
- created_at
- updated_at

Statuses:
- ACTIVE
- DEPRECATED
- ARCHIVED

## 7.2 event_property_definitions

Fields:
- id
- event_definition_id
- property_name
- display_name
- data_type
- required
- description
- created_at
- updated_at

This enables an Event Registry/Data Dictionary without forcing ClickHouse migrations.

## 7.3 saved_insights

Fields:
- id
- title
- description
- type
- chart_config JSONB
- visibility (`PRIVATE` or `SHARED`)
- owner_user_id
- is_pinned_to_overview
- created_at
- updated_at

Rules:
- PRIVATE insights are visible only to their owner and ADMIN users.
- SHARED insights are visible to all authenticated dashboard users.
- Never store raw SQL in `chart_config`.

## 7.4 dashboard_definitions

Fields:
- id
- title
- description
- visibility (`PRIVATE` or `SHARED`)
- owner_user_id
- is_default
- created_at
- updated_at

Rules:
- PRIVATE dashboards are visible only to their owner and ADMIN users.
- SHARED dashboards are visible to all authenticated dashboard users.
- ADMIN may manage any dashboard.
- An ANALYST may manage their own private dashboards and create/update shared dashboards if permitted by the simple v1 role policy.
- No complex per-widget ACL system.

## 7.5 dashboard_widgets

Fields:
- id
- dashboard_id
- insight_id
- grid_position JSONB
- created_at

## 7.6 ingestion_api_keys

Store only a secure hash of the ingestion token.

Fields:
- id
- name
- key_prefix
- key_hash
- last_used_at
- expires_at
- status
- created_at
- updated_at

Do not store plaintext ingestion tokens.

## 7.7 dashboard_users

For v1, support simple local dashboard authentication.

Fields:
- id
- email
- password_hash
- display_name
- status
- last_login_at
- created_at
- updated_at

Do not expose passwords or password hashes to frontend clients.

---

# 8. INGESTION PIPELINE

## 8.1 Request path

```text
Client
 -> TLS
 -> Rate limit
 -> Auth
 -> DTO validation
 -> Payload normalization
 -> event_id assignment
 -> queue
 -> 202
```

## 8.2 Worker path

```text
BullMQ job
 -> validate normalized event
 -> transform to ClickHouse row
 -> batch in memory
 -> bulk INSERT
 -> acknowledge jobs
```

Recommended initial batch:
- 500 events OR
- 1 second flush interval

Make both configurable through environment variables.

## 8.3 Failure handling

Implement:
- exponential retry;
- bounded retry count;
- failed-job storage;
- dead-letter queue;
- structured logs.

A failed ClickHouse insert must not silently lose events.

## 8.4 Backpressure

When Redis/ClickHouse is unavailable:
- ingestion must expose a clear failure state;
- queue growth must be observable;
- worker concurrency must be configurable;
- do not accept unlimited request bodies.

---

# 9. DEDUPLICATION

The platform is at-least-once.

For v1:
- require/strongly encourage `event_id`;
- use a bounded deduplication strategy;
- document that perfect global deduplication is not guaranteed.

Do not build a giant PostgreSQL event-id table that becomes a second analytics store.

If exact deduplication becomes necessary, introduce a ClickHouse-compatible strategy after measuring volume and latency.

---

# 10. EVENT REGISTRY / DATA QUALITY

The Event Registry must be more than a list.

For every event show:

- event name;
- description;
- category;
- status;
- first seen;
- last seen;
- event volume;
- unique users;
- properties observed;
- property types observed;
- schema definition;
- missing required properties;
- malformed payload count;
- environments;
- example payload.

Support:

- register event;
- edit definition;
- deprecate event;
- archive event;
- inspect properties;
- define expected schema;
- data-quality status.

### Automatic discovery
If an event is received that is not registered:
- ingestion must NOT fail merely because the event is unknown;
- record it as `UNREGISTERED` / discovered;
- surface it in Event Registry.

This is essential for an adaptive analytics platform.

---

# 11. ANALYTICS QUERY ENGINE

Never allow frontend users to submit raw SQL.

Frontend submits a typed query configuration.

Example:

```json
{
  "chart_type": "line",
  "event_name": "payment.completed",
  "aggregation": "COUNT",
  "breakdown_by": null,
  "property_key": null,
  "filters": [],
  "date_range": {
    "from": "2026-09-01T00:00:00Z",
    "to": "2026-09-24T23:59:59Z"
  },
  "interval": "day"
}
```

The backend translates this into parameterized/validated ClickHouse SQL.

Allowed aggregations:
- COUNT
- UNIQUE_USERS
- SUM
- AVG
- MIN
- MAX

Allowed chart types:
- METRIC
- LINE
- AREA
- BAR
- PIE
- FUNNEL
- RETENTION
- TABLE

Allowed filter operators:
- equals
- not_equals
- contains
- starts_with
- ends_with
- greater_than
- greater_than_or_equal
- less_than
- less_than_or_equal
- in
- not_in
- exists
- not_exists

The backend must maintain a strict allowlist.

---

# 12. CORE ANALYTICS

## 12.1 Overview

Return:
- DAU
- WAU
- MAU
- total events
- unique users
- active sessions
- top events
- event trend
- comparison to previous equivalent period

Do not compare periods unless the frontend/backend explicitly defines the comparison window.

## 12.2 Time series

Support:
- minute
- hour
- day
- week
- month

Backend must choose a safe interval based on date range if the client requests `auto`.

## 12.3 Funnels

Input:

```json
{
  "steps": [
    "product.viewed",
    "checkout.started",
    "payment.completed"
  ]
}
```

Return:
- step count;
- unique users;
- conversion from previous step;
- overall conversion;
- drop-off count;
- drop-off percentage.

Funnels must use a clearly documented identity and ordering rule.

## 12.4 Retention

Default cohort model:
- cohort date = first qualifying event date;
- returning activity = any qualifying event by the same identity;
- return windows = Day 0, Day 1, Day 7, Day 14, Day 30.

Make retention event configurable.

Return a matrix suitable for a heatmap.

---

# 13. EVENTS EXPLORER

The Event Explorer must support:

- pagination;
- newest/oldest ordering;
- event-name filter;
- environment filter;
- user ID filter;
- session ID filter;
- date range;
- text/property filtering;
- event detail drawer;
- raw event JSON viewer;
- copy event ID;
- copy payload.

Prefer cursor pagination for large datasets.

Do not expose unlimited raw event retrieval.

---

# 14. DASHBOARDS

A dashboard contains reusable insight widgets.

Widget types:
- metric;
- time series;
- bar;
- pie;
- funnel;
- retention;
- table.

Every widget stores:
- insight reference;
- title;
- configuration;
- grid position;
- optional refresh interval.

The frontend must support:
- add widget;
- remove widget;
- move widget;
- resize widget;
- duplicate widget;
- edit widget;
- save dashboard;
- reset layout.

Use a stable grid layout library or implement a deterministic grid system.

---

# 15. SAVED INSIGHTS

A saved insight is a reusable query configuration.

Lifecycle:

```text
Create -> Validate -> Save -> Execute -> Render
                     |
                     v
                  Update
                     |
                     v
                  Delete
```

Never save raw SQL.

Store the semantic configuration.

---

# 16. FRONTEND APPLICATION

## 16.1 Pages

Required:

1. Login
2. Overview
3. Event Explorer
4. Event Registry
5. Funnels
6. Retention
7. Insights
8. Dashboards
9. Settings

## 16.2 Global UI

- responsive sidebar;
- top navigation;
- date range picker;
- environment selector;
- refresh button;
- loading skeletons;
- empty states;
- error states;
- toast notifications;
- accessible dialogs;
- keyboard navigation where practical.

## 16.3 Query state

TanStack Query must own server state.

URL query parameters should represent shareable analytical state where practical:
- date range;
- environment;
- selected event;
- filters;
- breakdown;
- chart type.

---

# 17. FRONTEND SECURITY

The browser must never receive:
- PostgreSQL credentials;
- Redis credentials;
- ClickHouse credentials;
- plaintext ingestion token.

The ingestion token is for product/server SDKs, not dashboard JavaScript.

Dashboard authentication should use:
- secure HttpOnly cookie session, or
- a short-lived access token with secure refresh strategy.

Prefer HttpOnly cookies for the initial self-hosted dashboard.

---

# 18. API CONTRACT

All dashboard APIs use `/v1`.

## Health

```http
GET /health
GET /health/live
GET /health/ready
```

## Authentication

```http
POST /v1/auth/login
POST /v1/auth/logout
GET  /v1/auth/me
```

## Ingestion

```http
POST /v1/ingest
POST /v1/ingest/batch
```

## Events

```http
GET /v1/analytics/events
GET /v1/analytics/events/export.csv
```

The CSV export must respect the same filters, date range, authorization, retention window, and maximum row limit as the Event Explorer.

## Analytics

```http
GET  /v1/analytics/overview
POST /v1/analytics/query
POST /v1/analytics/funnel
POST /v1/analytics/retention
```

## Insights

```http
POST   /v1/insights
GET    /v1/insights
GET    /v1/insights/:id
PUT    /v1/insights/:id
DELETE /v1/insights/:id
```

## Dashboards

```http
POST   /v1/dashboards
GET    /v1/dashboards
GET    /v1/dashboards/:id
PUT    /v1/dashboards/:id
DELETE /v1/dashboards/:id

POST   /v1/dashboards/:id/widgets
PUT    /v1/dashboards/:id/widgets/:widgetId
DELETE /v1/dashboards/:id/widgets/:widgetId
```

## Registry

```http
GET  /v1/registry/events
GET  /v1/registry/events/:eventName
POST /v1/registry/events
PUT  /v1/registry/events/:eventName
POST /v1/registry/events/:eventName/deprecate
```

## Settings / ingestion keys

```http
GET    /v1/settings
GET    /v1/settings/ingestion-keys
POST   /v1/settings/ingestion-keys
DELETE /v1/settings/ingestion-keys/:id
```

A newly created ingestion token is displayed only once.

## Users

```http
GET    /v1/settings/users
POST   /v1/settings/users
PUT    /v1/settings/users/:id
DELETE /v1/settings/users/:id
```

Only ADMIN may manage dashboard users.

## Data deletion

```http
POST /v1/admin/data-deletion/users
```

Only ADMIN may initiate deletion.


---

# 19. ERROR FORMAT

All APIs return a consistent error shape:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "The requested analytics query is invalid",
    "details": {}
  },
  "request_id": "req_..."
}
```

Success responses should use:

```json
{
  "success": true,
  "data": {},
  "request_id": "req_..."
}
```

Paginated responses should include:
- `items`;
- `next_cursor`;
- `has_more`.

---

# 20. AUTHORIZATION MODEL

Because this is single-tenant, keep authorization intentionally simple.

Roles:
- `ADMIN`
- `ANALYST`

ADMIN:
- manage dashboard users;
- manage ingestion keys;
- manage event registry;
- manage dashboards/insights;
- read analytics.

ANALYST:
- read analytics;
- create/update personal/shared insights according to implementation;
- manage dashboards;
- cannot manage ingestion credentials.

Do not build a complex permissions matrix in v1.

---

# 21. SECURITY REQUIREMENTS

Mandatory:
- TLS in production;
- Helmet;
- CORS allowlist;
- rate limiting;
- request size limits;
- DTO validation;
- secure cookies;
- password hashing with Argon2 or bcrypt;
- secret values only through environment variables;
- no secrets committed to git;
- structured audit logging for auth/key-management actions;
- no raw SQL endpoint;
- no arbitrary ClickHouse endpoint;
- safe JSON parsing;
- protection against oversized nested payloads.

Never place a real production secret in `docker-compose.yml` or `.env.example`.

---

# 22. PRIVACY / PII

The product owner has explicitly chosen to collect IP address, user agent, and country.

## 22.1 Collected context

The canonical event context may contain:

- IP address;
- user agent;
- device type;
- browser;
- operating system;
- country;
- user ID;
- anonymous ID;
- session ID.

## 22.2 Rules

- IP collection is enabled in v1.
- User-agent collection is enabled in v1.
- Country may be derived from the IP at ingestion time when practical.
- Do not infer identity from IP.
- Do not intentionally store passwords, authentication tokens, API keys, card details, payment credentials, or other secrets in `event_data`.
- Document that event properties may contain product-specific personal data.
- Add a clear PII warning to the Event Tracking Guide.
- Support administrative deletion by `user_id` and anonymous identity where technically applicable.
- Deletion operations must be audited.
- Do not send raw event payloads to third-party observability services by default.
- Secrets must never be logged.

## 22.3 Deletion semantics

The backend must provide an administrative deletion workflow.

Required API:

```http
POST /v1/admin/data-deletion/users
```

Example:

```json
{
  "user_id": "user_123"
}
```

The implementation must document ClickHouse deletion latency and use mutation/partition-safe mechanisms rather than pretending deletion is instantaneous.


---

# 23. RETENTION

The product owner requires retention of **up to 365 days**.

## 23.1 Defaults

```env
EVENT_RETENTION_DAYS=365
```

Allowed range:

```text
1..365
```

The application must reject values greater than 365.

## 23.2 ClickHouse lifecycle

Prefer ClickHouse TTL/partition-aware lifecycle management.

Do not run ad-hoc row-by-row deletion jobs for normal retention.

Recommended:

```sql
TTL timestamp + INTERVAL {retention_days} DAY DELETE
```

or an equivalent production-safe lifecycle policy supported by the chosen ClickHouse version.

## 23.3 Historical analytics

Queries must never silently include data older than the configured retention period.

The UI should communicate the available historical window when a user selects an older range.


---

# 24. OBSERVABILITY

Backend must provide:
- structured JSON logs;
- request ID;
- health checks;
- queue metrics;
- ingestion throughput;
- ingestion failure count;
- worker latency;
- ClickHouse query latency;
- API latency;
- database connection health.

Expose a protected operational metrics endpoint if Prometheus integration is enabled.

Frontend must log:
- API errors;
- failed queries;
- route-level errors.

Do not send event payloads or secrets to third-party observability services by default.

---

# 25. CONFIGURATION

Backend `.env.example`:

```env
NODE_ENV=development
PORT=3000

POSTGRES_URL=postgres://analytics:password@localhost:5432/analytics_metadata
REDIS_URL=redis://localhost:6379
CLICKHOUSE_URL=http://localhost:8123

DASHBOARD_SESSION_SECRET=change-me
CORS_ORIGINS=http://localhost:5173

INGESTION_MAX_PAYLOAD_BYTES=262144
INGESTION_BATCH_SIZE=500
INGESTION_BATCH_FLUSH_MS=1000
INGESTION_WORKER_CONCURRENCY=10
INGESTION_MAX_RETRIES=5

EVENT_RETENTION_DAYS=365
RAW_EVENT_RETENTION_ENABLED=true
```

Frontend:

```env
VITE_API_URL=http://localhost:3000
```

---

# 26. DOCKER

Backend compose must provide:
- ClickHouse;
- PostgreSQL;
- Redis;
- API;
- worker if worker is separated from API.

Prefer a separate worker container in production:

```text
api
worker
clickhouse
postgres
redis
```

This prevents analytical/ingestion processing from competing with HTTP request handling.

For local development, API and worker may run in one process only if explicitly documented.

---

# 27. MIGRATIONS

Do not rely only on `init.sql`.

PostgreSQL must use versioned migrations through TypeORM.

ClickHouse schema initialization must be idempotent.

Deployment must support:

```text
migrate -> start API -> start worker
```

Never destroy existing analytics data during deployment.

---

# 28. TESTING

Backend:
- DTO unit tests;
- auth tests;
- ingestion controller tests;
- queue producer tests;
- worker tests;
- ClickHouse query-builder tests;
- analytics calculation tests;
- registry tests;
- dashboard CRUD tests;
- integration tests with Docker services.

Frontend:
- component tests;
- query hook tests;
- page rendering tests;
- chart configuration tests;
- authentication flow tests;
- critical E2E tests.

Minimum critical E2E flow:

```text
Login
 -> send event
 -> worker processes event
 -> event appears in Event Explorer
 -> Overview count updates
 -> saved insight executes
 -> dashboard widget renders
```

---

# 29. SEED DATA

Development mode must create:
- one ADMIN user;
- one ANALYST user;
- sample event definitions;
- sample events;
- sample saved insights;
- one default dashboard.

Never use real production credentials as seed values.

Print generated development credentials clearly after seed.

---

# 30. SDK / INTEGRATION EXAMPLES

The platform must include a `/docs` directory with examples.

JavaScript example:

```ts
await fetch(`${ANALYTICS_URL}/v1/ingest`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ANALYTICS_WRITE_TOKEN}`
  },
  body: JSON.stringify({
    event_id: crypto.randomUUID(),
    event_name: "checkout.completed",
    event_version: 1,
    event_data: {
      amount: 1499,
      currency: "INR"
    },
    context: {
      user_id: "user_123",
      anonymous_id: "anon_456",
      session_id: "session_789",
      timestamp: new Date().toISOString(),
      environment: "production"
    }
  })
});
```

Also provide:
- cURL;
- Node.js;
- browser/server integration guidance;
- NestJS example;
- Next.js example.

Do not embed ingestion credentials in public frontend bundles.

---

# 31. PERFORMANCE TARGETS

Initial targets, to be validated by load tests:

### Ingestion
- p95 API acknowledgement under 300ms under normal load;
- asynchronous ClickHouse processing;
- batch writes;
- configurable worker concurrency.

### Analytics
- common overview queries target p95 under 2 seconds on the expected initial dataset;
- cached/repeated dashboard queries should be faster;
- prevent unbounded date ranges in expensive queries.

### Frontend
- fast initial static load;
- lazy-load heavy chart modules where beneficial;
- avoid rendering thousands of DOM rows;
- virtualize large event tables.

These are engineering targets, not guarantees.

---

# 32. CACHING

Use TanStack Query on the frontend.

Backend Redis may cache:

- overview metrics;
- repeated dashboard queries;
- event registry metadata;
- saved insight metadata.

Recommended default analytics cache TTL:

```text
30–60 seconds
```

Cache keys must include every semantic query dimension:

- date range;
- event;
- aggregation;
- filters;
- breakdown;
- interval;
- identity basis where applicable.

Invalidate or naturally expire dashboard caches after ingestion. Do not promise real-time consistency.

Raw event explorer queries should generally not be cached for long periods.


---

# 33. QUERY SAFETY

The analytics query builder must:

1. validate the chart/query DTO;
2. validate event names against registry or discovered events;
3. validate property names;
4. validate operators;
5. validate aggregation;
6. validate date range;
7. enforce maximum date range;
8. enforce maximum breakdown cardinality;
9. use ClickHouse query parameters where supported;
10. never execute frontend-provided SQL.

Add query timeouts.

---

# 34. RATE LIMITING

Apply separate rate limits:

### Ingestion
High throughput, keyed by ingestion credential/IP.

### Dashboard APIs
Lower rate, keyed by authenticated dashboard user/session.

### Authentication
Strict rate limiting with temporary lockout/backoff.

All limits must be configurable.

---

# 35. EVENT BATCH API

In addition to single-event ingestion, implement:

```http
POST /v1/ingest/batch
```

Payload:

```json
{
  "events": [
    {
      "event_name": "page.viewed",
      "event_data": {},
      "context": {}
    }
  ]
}
```

Limits:
- maximum events per request configurable;
- maximum request body configurable.

This is important for browser/mobile/server SDK efficiency.

---

# 36. EVENT DISCOVERY AND ADAPTABILITY

The analytics system must be adaptive.

New event:

```text
Product emits new event
        |
        v
Ingestion accepts it
        |
        v
Event becomes discovered/unregistered
        |
        v
Registry observes it
        |
        v
Operator defines metadata/schema
        |
        v
Event becomes documented/active
```

Removing an event from the registry must not delete historical analytics data.

Deprecating an event only affects future instrumentation guidance and registry status.

---

# 37. UI INFORMATION ARCHITECTURE

## Overview

- KPI cards;
- activity trend;
- top events;
- active users;
- recent events;
- pinned/shared insights.

## Event Explorer

- event table;
- filters;
- CSV export;
- JSON drawer;
- event detail;
- pagination.

## Registry

- event catalog;
- schema;
- properties;
- quality status;
- first/last seen;
- event volume.

## Funnels

- step builder;
- date range;
- filters;
- conversion visualization;
- conversion/drop-off metrics.

## Retention

- cohort event selector;
- retention activity definition;
- heatmap;
- cohort size.

## Insights

- saved query list;
- query builder;
- preview;
- save;
- edit;
- delete;
- pin to dashboards.

## Dashboards

- dashboard selector;
- private/shared visibility;
- owner display;
- edit mode;
- widget grid;
- duplicate dashboard.

## Settings

- dashboard users;
- ingestion keys;
- webhook endpoint;
- retention;
- data deletion;
- system health;
- documentation links.

Do not show an environment selector in v1.


---

# 38. UI DESIGN SYSTEM

Use:
- Tailwind CSS;
- shadcn/ui;
- accessible Radix primitives;
- restrained analytics-dashboard visual language;
- responsive layouts;
- consistent spacing;
- semantic status colors;
- skeleton loading;
- clear empty states.

Avoid:
- excessive gradients;
- unnecessary animation;
- huge decorative sections;
- charts without units;
- ambiguous metric labels.

Every metric must explain:
- what it measures;
- time range;
- identity basis when relevant.

---

# 39. REPOSITORY STRUCTURE — FINAL

## Backend

```text
analytics-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   ├── common/
│   │   ├── auth/
│   │   ├── guards/
│   │   ├── pipes/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── logging/
│   │   ├── pagination/
│   │   └── errors/
│   ├── database/
│   │   ├── postgres/
│   │   └── clickhouse/
│   └── modules/
│       ├── auth/
│       ├── ingestion/
│       ├── analytics/
│       ├── registry/
│       ├── insights/
│       ├── dashboards/
│       ├── exports/
│       ├── settings/
│       ├── data-deletion/
│       └── health/
├── migrations/
├── infrastructure/
│   ├── clickhouse/
│   └── postgres/
├── docs/
├── test/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

## Frontend

```text
analytics-frontend/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   ├── charts/
│   │   ├── analytics/
│   │   ├── registry/
│   │   ├── dashboards/
│   │   ├── insights/
│   │   └── exports/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── stores/
│   ├── router/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
├── e2e/
├── Dockerfile
├── nginx.conf
├── vite.config.ts
├── components.json
├── .env.example
└── package.json
```


---


# 40. SCALE PROFILE — 1M EVENTS/DAY

The first production target is approximately:

```text
1,000,000 events/day/product
≈ 11.6 events/second average
```

The system must be designed for bursts substantially above the average.

## 40.1 Ingestion sizing principles

Do not size the system only for average throughput.

Support configurable:
- API replicas;
- worker concurrency;
- BullMQ batch size;
- flush interval;
- ClickHouse insert batch size;
- rate limits.

Initial defaults:

```env
INGESTION_BATCH_SIZE=500
INGESTION_BATCH_FLUSH_MS=1000
INGESTION_WORKER_CONCURRENCY=10
INGESTION_MAX_RETRIES=5
```

These are starting values, not immutable capacity guarantees.

## 40.2 ClickHouse

Use MergeTree.

Start with monthly partitions:

```text
PARTITION BY toYYYYMM(timestamp)
```

and an order key optimized for event-name/time exploration.

Do not introduce distributed ClickHouse clusters in v1.

A single ClickHouse instance is sufficient for the initial 1M/day target, provided load tests validate the selected hardware.

## 40.3 Query limits

Prevent expensive accidental queries.

Default limits should include:
- maximum date range for interactive queries;
- maximum breakdown cardinality;
- maximum event explorer page size;
- maximum CSV export size;
- query timeout;
- maximum concurrent expensive analytics queries per dashboard session.

All limits must be configurable.

## 40.4 Load testing

Before production launch, run a load test representing:
- sustained ingestion;
- burst ingestion;
- dashboard reads during ingestion;
- funnel queries;
- retention queries;
- Event Explorer queries;
- CSV export.

Record:
- ingestion acknowledgement p50/p95/p99;
- worker throughput;
- ClickHouse insert latency;
- queue depth;
- analytics query p50/p95/p99;
- error rate;
- memory/CPU usage.

Do not claim the 1M/day target is validated until these tests have been executed.

---

# 41. AI IDE EXECUTION PROTOCOL

The AI IDE must not attempt to write the entire application blindly in one pass.

Execute in phases.

## Phase 0 — Analyze
- inspect repository;
- inspect environment;
- verify Node/npm versions;
- verify Docker;
- verify available ports;
- confirm no monorepo is introduced.

## Phase 1 — Backend foundation
- initialize NestJS;
- config;
- logging;
- error handling;
- health;
- PostgreSQL;
- ClickHouse;
- Redis.

## Phase 2 — Authentication
- dashboard users;
- password hashing;
- login/logout/me;
- session/cookie;
- ADMIN/ANALYST role.

## Phase 3 — Ingestion
- DTO;
- auth;
- rate limiting;
- `/v1/ingest`;
- `/v1/ingest/batch`;
- queue;
- worker;
- retries;
- DLQ;
- ClickHouse batch insert.

## Phase 4 — Registry
- event discovery;
- definitions;
- property definitions;
- data-quality metadata.

## Phase 5 — Analytics
Implement in order:
1. overview;
2. events;
3. time series;
4. breakdowns;
5. funnels;
6. retention.

## Phase 6 — Insights, dashboards, exports and deletion
- saved insights;
- private/shared visibility;
- dashboard CRUD;
- widgets;
- layout persistence;
- CSV export;
- administrative data deletion;
- audit logging.

## Phase 7 — Frontend
- routing;
- auth;
- shell;
- overview;
- explorer;
- registry;
- funnels;
- retention;
- insights;
- dashboards;
- settings.

## Phase 8 — Testing
Run:
```bash
npm run lint
npm run test
npm run build
```

Run backend integration/E2E tests with Docker services.

## Phase 9 — Production hardening
- secrets;
- rate limits;
- CORS;
- TLS deployment documentation;
- migrations;
- backups;
- retention;
- observability;
- 1M/day load testing;
- restore testing;
- query timeout validation.

---

# 42. DEFINITION OF DONE

The implementation is complete only when:

- both repositories build independently;
- no monorepo exists;
- Docker starts the backend stack;
- PostgreSQL migrations run safely;
- ClickHouse initializes safely;
- Redis queue works;
- dashboard authentication works;
- ingestion authentication works;
- single event ingestion works;
- batch ingestion works;
- worker writes events to ClickHouse;
- retries and DLQ work;
- unknown events are discoverable;
- Event Explorer displays events;
- Overview calculates metrics;
- time-series queries work;
- funnels work;
- retention works;
- insights can be saved/edited/deleted;
- dashboards can be created and rearranged;
- registry works;
- settings work;
- private/shared dashboard visibility works;
- CSV export works with row limits;
- administrative user deletion works;
- no secret is exposed to frontend;
- no raw SQL endpoint exists;
- API errors are consistent;
- tests pass;
- frontend production build passes;
- Docker production build passes;
- documentation contains setup and integration instructions.

---

# 43. REQUIRED DOCUMENTATION

Generate:

```text
README.md
ARCHITECTURE.md
API.md
EVENT_TRACKING_GUIDE.md
ANALYTICS_QUERY_GUIDE.md
DEPLOYMENT.md
SECURITY.md
PRIVACY.md
TROUBLESHOOTING.md
BACKUP_AND_RESTORE.md
CHANGELOG.md
```

The documentation must explain:
- local setup;
- architecture;
- event contract;
- ingestion;
- query semantics;
- dashboard use;
- environment variables;
- production deployment;
- backups;
- retention;
- security;
- troubleshooting.

---

# 43. RESOLVED PRODUCT DECISIONS

| Decision | Final v1 decision |
|---|---|
| Dashboard authentication | Local email/password |
| Social login | Not in v1 |
| Dashboard roles | ADMIN / ANALYST |
| Expected event volume | ~1M events/day/product |
| Retention | Up to 365 days |
| IP collection | Yes |
| User-agent collection | Yes |
| Country collection | Yes |
| Official SDK | No; HTTP webhook/API only |
| Alerts | No |
| CSV export | Yes |
| JSON/Excel export | No |
| Environment support | Production only |
| Dashboard visibility | Private + Shared |
| AI insights | No in v1 |
| Session replay | No |
| Heatmaps | No |
| Feature flags | No |
| A/B testing | No |
| Multi-tenancy | No |
| Canonical ingestion | `/v1/ingest` |
| Batch ingestion | Yes |
| Delivery guarantee | At-least-once |
| Unknown events | Accept + discover |
| Query model | Typed semantic configuration |
| Raw SQL API | Never |
| Analytics timezone | UTC |
| Funnel ordering | Ordered steps |
| Default funnel window | 7 days |
| Retention cohort | First qualifying event |
| Returning activity | Any qualifying activity by same identity |
| Unique-user identity | `user_id` when present, otherwise `anonymous_id` |
| Events with no identity | Included in event counts, excluded from unique-user metrics |
| Production worker | Separate process/container |
| PostgreSQL schema | TypeORM migrations |
| ClickHouse schema | Idempotent DDL + controlled migrations where applicable |
| Default query cache | 30–60 seconds |
| Default max retention | 365 days |
| Future AI | Extension point only |


---

# 44. FINAL IMPLEMENTATION DEFAULTS

No product-owner questions remain blocking for v1.

Use these implementation defaults:

## 44.1 Unique user identity

For user-based metrics:

```text
if user_id exists:
    identity = user_id
else if anonymous_id exists:
    identity = anonymous_id
else:
    identity = null
```

Events with `identity = null` remain valid event records but do not contribute to unique-user, funnel-user, or retention-user calculations.

## 44.2 Funnel semantics

- Steps must occur in the configured order.
- The same identity must complete the steps.
- Default maximum completion window: 7 days.
- The window must be configurable per query.
- Repeated occurrences of a step are handled according to first valid occurrence after the previous step.
- Funnel results must clearly state the identity basis and window.

## 44.3 Retention semantics

- Cohort date = first occurrence of the selected cohort event for the identity.
- Returning activity = occurrence of the selected activity event or activity set.
- Default retention periods:
  - Day 0
  - Day 1
  - Day 7
  - Day 14
  - Day 30
- Cohort calculations use UTC calendar boundaries.

## 44.4 Dashboard visibility

```text
PRIVATE
  -> owner + ADMIN

SHARED
  -> all authenticated dashboard users
```

No anonymous dashboard access.

## 44.5 CSV export

CSV export is available from Event Explorer.

Requirements:
- filters must match the current Event Explorer state;
- maximum export row count must be configurable;
- export is asynchronous for large datasets;
- do not stream unlimited ClickHouse data into the browser;
- CSV values must be safely escaped;
- ADMIN and ANALYST may export data visible to them;
- export actions should be audit logged.

For v1, a synchronous export is acceptable below a configurable threshold such as 50,000 rows. Larger exports should be queued.

## 44.6 Production-only environment

All ingestion is implicitly:

```text
environment = production
```

Do not expose an environment selector or environment filter in the v1 dashboard.

## 44.7 Data deletion

User deletion must be implemented as an explicit administrative operation.

The system must:
1. validate the requested identity;
2. create an audit record;
3. execute the ClickHouse deletion mechanism;
4. report whether the deletion is queued/completed;
5. document ClickHouse mutation behavior and expected completion time.

## 44.8 Future AI extension

Do not implement AI features now.

However, keep analytics results and semantic query configurations structured so a future service can consume:

```text
query definition
+
query result
+
time-series context
+
comparison period
```

without accessing ClickHouse credentials directly.


---


# 44.5 REQUIRED IMPLEMENTATION DETAILS

## Backend module boundaries

### AuthModule
Owns:
- login;
- logout;
- session creation;
- password hashing;
- current-user lookup;
- role guard.

### IngestionModule
Owns:
- ingestion DTOs;
- ingestion key authentication;
- rate limiting integration;
- normalization;
- event ID assignment;
- queue producer;
- single and batch ingestion.

### Worker
Owns:
- BullMQ consumer;
- retry policy;
- batching;
- ClickHouse insertion;
- dead-letter handling;
- ingestion metrics.

### RegistryModule
Owns:
- event discovery;
- definitions;
- property definitions;
- schema metadata;
- data-quality state.

### AnalyticsModule
Owns:
- semantic query DTOs;
- query validation;
- query builders;
- ClickHouse execution;
- query caching;
- overview/funnel/retention calculations.

### InsightsModule
Owns:
- saved semantic queries;
- insight visibility;
- pinning.

### DashboardsModule
Owns:
- dashboard CRUD;
- private/shared visibility;
- widgets;
- layout persistence.

### ExportsModule
Owns:
- CSV generation;
- row limits;
- export authorization;
- large-export queueing if implemented.

### DataDeletionModule
Owns:
- deletion requests;
- audit records;
- ClickHouse deletion execution;
- deletion status.

## Frontend boundaries

The frontend must separate:

```text
pages
  ↓
feature components
  ↓
TanStack Query hooks
  ↓
API service layer
  ↓
typed HTTP client
```

Do not call `fetch()` directly from page components.

## Type safety

- TypeScript strict mode enabled.
- No `any` in core application logic unless justified and isolated.
- DTOs and API response types must be explicit.
- Runtime validation must exist at API boundaries.
- Frontend API responses should be validated for critical flows.

## API request IDs

Every request receives a request ID.

The request ID must:
- be included in server logs;
- be returned in API responses;
- be included in error responses;
- be propagated into worker jobs when applicable.

## Audit logging

Audit the following:
- login success/failure where appropriate;
- logout;
- user creation/update/deletion;
- ingestion key creation/revocation;
- event definition changes;
- dashboard visibility changes;
- data deletion requests;
- large CSV exports.

Audit logs belong in PostgreSQL metadata storage.

## Backup policy

Provide documented backup procedures.

Minimum recommendation:
- PostgreSQL daily backup;
- ClickHouse backup strategy appropriate to deployment;
- backup retention documented;
- restore procedure tested before production launch.

Do not claim backups are configured merely because a Docker volume exists.


# 44. FINAL DECISION SUMMARY FOR THE AI IDE

Implement exactly these product choices:

```text
Authentication:
  Email + password

Dashboard users:
  ADMIN + ANALYST

Scale target:
  ~1M events/day/product

Retention:
  Up to 365 days

PII/context:
  IP = yes
  User-Agent = yes
  Country = yes

Integration:
  HTTP webhook/API only
  No official SDK in v1

Alerts:
  No

Export:
  CSV = yes

Environment:
  Production only

Dashboards:
  Private + Shared

AI insights:
  No in v1
  Architecture-ready for future addition

Timezone:
  UTC

Unique user:
  user_id first, anonymous_id fallback

Funnel:
  Ordered
  7-day default completion window

Retention:
  First qualifying event cohort
  Day 0/1/7/14/30

Delivery:
  At-least-once

Unknown events:
  Accept + discover

Raw SQL:
  Never exposed

Tenancy:
  Single isolated product deployment
```

If an implementation detail is not explicitly specified, prefer:
1. the simplest production-safe design;
2. the existing architecture in this document;
3. configurable values over hard-coded product assumptions;
4. backwards-compatible behavior;
5. tests before claiming completion.

# 45. FINAL AI IDE INSTRUCTION

You are responsible for producing working software, not merely scaffolding.

Rules:
- Do not stop after creating files.
- Do not leave placeholder functions for core features.
- Do not silently change the architecture.
- Do not introduce a monorepo.
- Do not introduce multi-tenancy.
- Do not expose secrets.
- Do not expose raw SQL.
- Do not claim a feature works without testing it.
- If a dependency/API has changed, inspect its installed/current documentation before implementing.
- Prefer small, testable modules.
- Keep backend query generation strongly typed and allowlisted.
- Keep frontend server state in TanStack Query.
- Keep ClickHouse optimized for analytical workloads.
- Keep PostgreSQL focused on metadata/configuration.
- Keep Redis/BullMQ focused on asynchronous ingestion.
- Make event tracking extensible without database migrations.
- Preserve backward compatibility when practical.
- Record important architectural decisions in `ARCHITECTURE.md`.

At the end of implementation, provide:

```text
1. What was built
2. Repository structure
3. How to run locally
4. Environment variables
5. API endpoints
6. Event integration example
7. Test results
8. Docker status
9. Known limitations
10. Recommended next steps
```

The final result must be a production-oriented, self-hosted analytics platform that can be deployed independently for products such as Scale EV, Kollabary, MedBridge, or any future product without changing the core analytics architecture.
