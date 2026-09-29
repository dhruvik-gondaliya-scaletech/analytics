# Analytics Platform MVP

This is the repository for the Analytics Platform, designed with a modular backend and a highly responsive React/Next.js frontend. It handles event ingestion at scale using Redpanda (Kafka), raw analytics querying via ClickHouse, and configuration storage via PostgreSQL.

## 🏗 Architecture Overview

- **Frontend (`/frontend`)**: Next.js App Router (React), Tailwind CSS v4, React Query, and Axios. Features a Smart/Dumb component architecture and strict OKLCH design variables.
- **Backend API (`/backend`)**: NestJS backend providing REST APIs for dashboard configurations, user profiles, and event ingestion.
- **Worker (`/worker` - upcoming)**: Will consume events from Redpanda and batch insert them into ClickHouse and PostgreSQL.
- **Infrastructure**: PostgreSQL, ClickHouse, and Redpanda orchestrated via Docker Compose.

---

## 🚀 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js (v20+)](https://nodejs.org/)

### Option 1: Run the Entire Stack (Docker)
The easiest way to start the entire ecosystem (Infrastructure + Backend API + Frontend UI) is using Docker Compose.

1. From the root `analytics` directory, run:
   ```bash
   docker-compose up --build
   ```
2. Wait for the containers to initialize.
3. Access the platform:
   - **Frontend UI**: [http://localhost:3001/dashboard](http://localhost:3001/dashboard)
   - **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)

### Option 2: Local Development Mode (Recommended for Coding)
If you are actively modifying the code, it's faster to run the infrastructure via Docker and the application servers directly on your host machine.

1. **Start Infrastructure only**:
   ```bash
   docker-compose up postgres clickhouse redpanda -d
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   *Note: TypeORM is configured with `synchronize: true` for MVP, so PostgreSQL tables will auto-generate upon startup.*

3. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will be available at http://localhost:3001*

---

## ⚙️ Environment Variables

The `docker-compose.yml` is already configured to work seamlessly out-of-the-box. If you run the services locally without Docker Compose, ensure your `.env` files map correctly.

**Backend (`backend/.env`)**
```env
# SERVER
PORT=3000
NODE_ENV=development

# DATABASE (POSTGRES)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=analytics_db

# KAFKA / REDPANDA
REDPANDA_BROKERS=localhost:9092

# CLICKHOUSE
CLICKHOUSE_HOST=http://localhost:8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=analytics

# AUTH
ANALYTICS_API_KEY=ak_live_123456789
```

**Frontend (`frontend/.env`)**
```env
# Points to the Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 📡 Default Ports Map
- **Frontend UI:** `3001`
- **Backend API:** `3000`
- **PostgreSQL:** `5432`
- **ClickHouse:** `8123` (HTTP) / `9000` (TCP)
- **Redpanda (Kafka API):** `9092` / `19092`
