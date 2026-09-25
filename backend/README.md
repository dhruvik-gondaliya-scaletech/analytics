# Analytics Platform Backend API

The backend for the Analytics Platform is a high-performance, modular **NestJS** application written in **TypeScript**.

## Technology Stack Specification

- **Framework:** NestJS (`^11.0.1`)
- **Language:** TypeScript (`^5.7.3`)
- **Analytical Storage:** ClickHouse (Time-series event engine)
- **Metadata Storage:** PostgreSQL (`pg` + `typeorm`)
- **Queueing & Async Jobs:** BullMQ + Redis
- **Caching & Rate Limiting:** Cache Manager + Redis (`ioredis`)
- **Authentication:** JWT (`@nestjs/jwt`) & Passport (`passport-jwt`)
- **API Documentation:** Swagger / OpenAPI (`/api/docs`)
- **Logging:** Winston (`nest-winston`)

For the comprehensive backend technology stack architecture, database strategies, directory breakdown, code examples, and production deployment instructions, please see [backend-tech-stack.md](../backend-tech-stack.md).

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server with hot-reload
npm run start:dev

# Run unit tests
npm run test

# Run End-to-End (E2E) tests
npm run test:e2e

# Build for production
npm run build
```
