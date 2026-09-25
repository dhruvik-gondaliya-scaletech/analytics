# Frontend Technology Stack Specification

This document details the frontend architecture, technology stack, design choices, and directory conventions for the Analytics Platform Dashboard.

---

## 1. Executive Summary & Core Stack

The Analytics Dashboard is built as a fast, client-side **React Single Page Application (SPA)** using **Vite** (explicitly **NOT Next.js**). This architectural choice avoids server-side rendering (SSR) complexity, serverless function cold starts, and node runtime overhead—delivering instant interactive chart rendering and client-side cached data management.

### Key Technology Stack Summary

| Layer / Concern | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Core UI Framework** | **React** (v18+) + **Vite** | Modern client-side SPA runtime; fast HMR and lightweight bundle sizes. *(Not Next.js)* |
| **Language** | **TypeScript** | Strict type definitions for analytical query payloads, API DTOs, and component props. |
| **Styling & Utility** | **Tailwind CSS** | Utility-first CSS framework for responsive layout, dark mode support, and custom themes. |
| **UI Component Library** | **shadcn/ui** | Accessible, unstyled Radix UI primitives wrapped in Tailwind CSS with customizable component ownership. |
| **Data Fetching & Server State** | **TanStack Query** (React Query) | Declarative asynchronous state management, caching, polling, deduplication, and background refetching. |
| **Data Visualization & Charts** | **Recharts** | Composability-driven React SVG charting library for time-series charts, bar graphs, funnels, and metrics. |
| **Date & Time Manipulation** | **date-fns** | Modular, immutable utility library for date math, formatting, timezone adjustments, and date-range pickers. |
| **Routing** | **React Router** (v6+) | Client-side declarative routing and navigation for dashboards, funnels, retention, and settings pages. |
| **Forms & Schema Validation** | **React Hook Form** + **Zod** | High-performance form state management with strict type-safe schema validation. |

---

## 2. Technology Deep-Dive & Architectural Choices

### 2.1 React (Vite SPA) — *Explicitly NOT Next.js*
- **Why React SPA over Next.js?**
  - **No SSR Overhead:** Analytical dashboards are dynamic, user-authenticated client applications where pre-rendering dynamic charts on a node server yields little benefit.
  - **Client-Side Data Caching:** Analytics dashboards rely heavily on client-side state caching (managed by TanStack Query). An SPA model allows seamless query persistence across tab switches without route hydration mismatches.
  - **Simplified Deployment:** Builds into static HTML/JS/CSS assets that can be served directly via Nginx, Caddy, Cloudflare Pages, or S3/CDN containers alongside the backend.

### 2.2 Styling with Tailwind CSS & shadcn/ui
- **Tailwind CSS:**
  - Provides design system consistency using defined color tokens, spacing primitives, and responsive breakpoints.
  - Native dark mode support (`dark:` classes) critical for analytical dashboards.
- **shadcn/ui Integration:**
  - Built on top of **Radix UI** primitives for full WAI-ARIA accessibility (modals, dropdowns, popovers, tooltips).
  - Code resides directly in `src/components/ui/`, granting complete control over component styling without external library locking.
  - Key components used: `Button`, `Dialog`, `Popover`, `Select`, `Calendar`, `Table`, `DropdownMenu`, `Card`, `Tabs`, `Badge`, `Skeleton`.

### 2.3 Async State & Caching: TanStack Query (`@tanstack/react-query`)
- **Key Responsibilities:**
  - Automatic caching & stale-time strategy for expensive analytical queries.
  - Background auto-refetching & live polling intervals for real-time dashboard monitoring.
  - Window focus refetching and request deduplication across multiple dashboard widgets querying shared endpoints.
  - Optimistic updates for metadata management (creating dashboards, editing custom metrics, saving funnels).

### 2.4 Data Visualization: Recharts
- **Key Responsibilities:**
  - Render responsive interactive charts for event metrics, active user trends, session durations, and conversions.
  - SVG-based components (`<ResponsiveContainer>`, `<AreaChart>`, `<LineChart>`, `<BarChart>`, `<PieChart>`, `<XAxis>`, `<YAxis>`, `<Tooltip>`, `<Legend>`).
  - Seamless integration with date-fns for formatting time-series tick labels and tooltip date display.
  - Custom dark theme styling matching Tailwind CSS token palettes.

### 2.5 Date & Time Operations: `date-fns`
- **Key Responsibilities:**
  - Lightweight date calculations (e.g., `subDays`, `differenceInDays`, `startOfDay`, `endOfDay`, `format`).
  - Powers the Dashboard Date Range Picker (e.g., *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *Year to Date*, *Custom Range*).
  - Handles ISO-8601 string formatting required by NestJS backend ClickHouse query parameters.

---

## 3. Recommended Directory & Folder Structure

```text
frontend/
├── public/                     # Static assets (favicons, logos)
├── src/
│   ├── assets/                 # SVGs, images, fonts
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (Button, Card, Popover, etc.)
│   │   ├── common/             # Shared layout components (Header, Sidebar, DatePicker)
│   │   ├── charts/             # Recharts wrappers (TimeSeriesChart, FunnelChart, BarMetric)
│   │   └── dashboard/          # Dashboard grid components & widget cards
│   ├── hooks/                  # Custom hooks & TanStack Query wrapper hooks
│   │   ├── useAnalyticsQuery.ts
│   │   ├── useMetrics.ts
│   │   └── useDateRange.ts
│   ├── lib/                    # Helper functions & utilities
│   │   ├── utils.ts            # clsx & tailwind-merge helper (`cn()`)
│   │   ├── date-utils.ts       # date-fns formatting and preset helpers
│   │   └── api-client.ts       # Fetch / Axios instance with standard error interceptors
│   ├── pages/                  # Top-level route pages
│   │   ├── OverviewPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── FunnelsPage.tsx
│   │   ├── RetentionPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/                  # TypeScript DTOs, Event schemas, and Query Interfaces
│   │   ├── api.ts
│   │   ├── events.ts
│   │   └── metrics.ts
│   ├── App.tsx                 # Main layout & router configuration
│   ├── index.css               # Global Tailwind CSS imports & theme CSS variables
│   └── main.tsx                # Entrypoint rendering QueryClientProvider & React DOM root
├── index.html                  # HTML template entrypoint
├── components.json             # shadcn/ui configuration
├── tailwind.config.js          # Tailwind styling tokens & keyframes
├── tsconfig.json               # TypeScript compiler config
└── vite.config.ts              # Vite bundle & dev server settings
```

---

## 4. Sample Integration Patterns

### 4.1 TanStack Query + API Client Example
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTimeSeriesMetrics } from '@/lib/api-client';
import { DateRange } from '@/types/metrics';

export function useTimeSeries(metricName: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['timeSeries', metricName, dateRange.from, dateRange.to],
    queryFn: () => fetchTimeSeriesMetrics({ metricName, ...dateRange }),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchInterval: 1000 * 30, // 30s live auto-refresh
  });
}
```

### 4.2 Recharts + date-fns Component Example
```tsx
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartProps {
  data: { timestamp: string; value: number }[];
}

export function EventTimeSeriesChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(str) => format(parseISO(str as string), 'PPP p')}
        />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

---

## 5. Development & Deployment Workflow

### Prerequisites & Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (React, Vite, Tailwind, shadcn, TanStack Query, Recharts, date-fns)
npm install

# Start local development server
npm run dev

# Production build output (dist/)
npm run build
```

---

## 6. Summary Matrix

| Requirement | Solution |
| :--- | :--- |
| **Framework** | React SPA (Vite) |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Charting Engine** | Recharts |
| **Date Library** | `date-fns` |
| **Data Fetching** | TanStack Query (`@tanstack/react-query`) |
| **SSR / Next.js** | **Disabled / Excluded** |
