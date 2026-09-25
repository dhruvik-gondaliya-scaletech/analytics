# Analytics Platform - Design System & Color Code Specification

This document defines the visual identity, color tokens, typography, dark theme variables, and component guidelines for the **Analytics Platform** (`frontend`).

---

## 1. Design Philosophy & Tech Stack

- **Design System Style**: Deep Slate & Teal Glassmorphism with sleek dark mode aesthetics.
- **CSS Engine**: Tailwind CSS v4 (`@import "tailwindcss";` with custom theme inline mappings).
- **Typography**: 
  - **Sans (Body)**: `Manrope` (Clean, highly legible sans-serif for UI controls and analytics data)
  - **Display (Headings)**: `Sora` (Geometric, modern headings for page titles & metric values)
  - **Monospace**: `JetBrains Mono` (For event IDs, timestamp logs, SQL/ClickHouse queries, JSON schemas)
- **Icons**: Lucide React (`lucide-react`)
- **Data Visualization**: Recharts tailored with deep dark palette and teal/emerald highlight lines and bars.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Core Dark Mode Palette

| Token Name | Color Value | HEX / RGBA Equivalent | Usage / Purpose |
| :--- | :--- | :--- | :--- |
| **`--background`** | `#0b1417` | `rgb(11, 20, 23)` | Main application background |
| **`--foreground`** | `#f1f5f9` | `rgb(241, 245, 249)` | Default text & primary elements |
| **`--card`** | `#111e22` | `rgb(17, 30, 34)` | Dashboard widgets, glass panels, cards |
| **`--card-foreground`** | `#f8fafc` | `rgb(248, 250, 252)` | Card titles, metric headers |
| **`--popover`** | `#111e22` | `rgb(17, 30, 34)` | Dropdowns, tooltips, context menus |
| **`--primary`** | `#4a7c8f` | `rgb(74, 124, 143)` | Primary actions, active navigation, key buttons |
| **`--primary-hover`** | `#3b6777` | `rgb(59, 103, 119)` | Hover state for primary buttons |
| **`--secondary`** | `#1a2f37` | `rgb(26, 47, 55)` | Secondary buttons, subtle badges |
| **`--accent`** | `#24404b` | `rgb(36, 64, 75)` | Active tab highlights, pill backgrounds |
| **`--muted`** | `#17272d` | `rgb(23, 39, 45)` | Table header backgrounds, input containers |
| **`--muted-foreground`** | `#cbd5e1` | `rgb(203, 213, 225)` | Secondary labels, timestamps, subtitles |
| **`--border`** | `rgba(255, 255, 255, 0.1)` | `rgba(255, 255, 255, 0.1)` | Subtle dividers, card borders |
| **`--input`** | `rgba(255, 255, 255, 0.12)` | `rgba(255, 255, 255, 0.12)` | Form field borders |
| **`--ring`** | `#4a7c8f` | `rgb(74, 124, 143)` | Focus ring outline color |

### 2.2 Brand & Highlight Tokens

| Token Name | HEX Code | Purpose |
| :--- | :--- | :--- |
| **`--brand-primary`** | `#4a7c8f` | Muted Teal Accent |
| **`--brand-secondary`** | `#1a2f37` | Deep Navy/Slate Container |
| **`--brand-green`** | `#059669` | Emerald active status indicator |
| **`--brand-emerald`** | `#10b981` | Positive metric growth / funnel conversion |
| **`--brand-amber`** | `#f59e0b` | Warning / pending ingestion alerts |
| **`--brand-rose`** | `#ef4444` | Errors / funnel drop-off alerts |

---

## 3. Typography Hierarchy

- **Page Titles (`h1`)**: Font `Sora`, `text-2xl font-bold tracking-tight text-slate-100`
- **Section Headers (`h2`)**: Font `Sora`, `text-lg font-semibold text-slate-200`
- **Widget Headers (`h3`)**: Font `Manrope`, `text-sm font-semibold text-slate-300`
- **Metric Values**: Font `Sora`, `text-2xl font-bold text-slate-100 tracking-tight`
- **Body Text**: Font `Manrope`, `text-sm text-slate-300`
- **Muted Text / Metadata**: Font `Manrope`, `text-xs text-slate-400`
- **Technical Logs & SQL**: Font `JetBrains Mono`, `text-xs text-slate-300 bg-slate-900/60 p-2 rounded-md border border-slate-800`

---

## 4. Layout & UI Utilities

### 4.1 Surface Cards & Glassmorphism
```css
.surface-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3);
}

.glass-panel {
  background: rgba(17, 30, 34, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 4.2 Interactive Elements
- **Primary Buttons**: `bg-[#4a7c8f] hover:bg-[#3b6777] text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm`
- **Secondary Buttons**: `bg-[#1a2f37] hover:bg-[#24404b] text-slate-200 border border-slate-700/50 font-medium px-4 py-2 rounded-lg transition-colors`
- **Active Navigation Pill**: `bg-[#4a7c8f]/20 text-[#4a7c8f] border border-[#4a7c8f]/30 font-medium`

---

## 5. Chart & Visualization Color Mapping

When rendering charts in Recharts, use the following palette order:
1. **Primary Series (Teal)**: `#4a7c8f`
2. **Secondary Series (Emerald)**: `#10b981`
3. **Accent Series (Sky Blue)**: `#38bdf8`
4. **Warning/Compare Series (Amber)**: `#f59e0b`
5. **Purple Series (Violet)**: `#a855f7`

Tooltip Backgrounds: `#111e22` with border `rgba(255, 255, 255, 0.1)` and text `#f8fafc`.
