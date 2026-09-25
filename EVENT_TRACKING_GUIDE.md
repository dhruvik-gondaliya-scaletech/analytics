# Event Tracking & Integration Guide

## Standard Event Ingestion Protocol

- **Endpoint**: `POST /v1/ingest`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <INGESTION_WRITE_TOKEN>`

## Single Event Sample Payload

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
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
    "ip": "127.0.0.1",
    "user_agent": "Mozilla/5.0...",
    "device_type": "mobile",
    "browser": "Chrome",
    "os": "Android",
    "country": "IN"
  }
}
```

## Batch Event Ingestion Protocol

- **Endpoint**: `POST /v1/ingest/batch`

```json
{
  "events": [
    {
      "event_name": "page.viewed",
      "event_data": { "url": "/pricing" },
      "context": { "user_id": "user_123" }
    },
    {
      "event_name": "button.clicked",
      "event_data": { "button_id": "cta_signup" },
      "context": { "user_id": "user_123" }
    }
  ]
}
```

## Event Naming Conventions

- Lowercase alphanumeric characters separated by dots (`.`), dashes (`-`), or underscores (`_`).
- Examples:
  - `user.signup`
  - `checkout.completed`
  - `charging.session.started`

## PII & Privacy Notice

Do NOT send sensitive credentials such as plaintext passwords, credit card numbers, payment access tokens, or private secrets inside `event_data`.
