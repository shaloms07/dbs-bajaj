# Technical Specification
## DBS Insurer Dashboard

| Field | Detail |
|---|---|
| **Document Type** | Technical Specification |
| **Product** | DBS Insurer Dashboard |
| **Version** | 1.0 — MVP |
| **Status** | Draft |
| **Companion Doc** | `PRD-DBS-Insurer-Dashboard.md` |
| **Last Updated** | March 2026 |

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Project Structure](#3-project-structure)
4. [Component Specifications](#4-component-specifications)
5. [State Management](#5-state-management)
6. [API Service Layer](#6-api-service-layer)
7. [Routing](#7-routing)
8. [Authentication Flow](#8-authentication-flow)
9. [Environment & Configuration](#9-environment--configuration)
10. [Data Models & TypeScript Types](#10-data-models--typescript-types)
11. [Styling System](#11-styling-system)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Performance Considerations](#13-performance-considerations)
14. [Testing Strategy](#14-testing-strategy)
15. [Build & Deployment](#15-build--deployment)
16. [Git Workflow](#16-git-workflow)
17. [Dependency Registry](#17-dependency-registry)

---

## 1. System Architecture

### 1.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│                                                             │
│   React + Vite SPA  (this repo)                             │
│   ┌─────────────┐  ┌────────────┐  ┌──────────────────┐    │
│   │  Auth Layer │  │  UI Layer  │  │  Service Layer   │    │
│   │  (JWT/ctx)  │  │ Components │  │  api.ts / hooks  │    │
│   └──────┬──────┘  └─────┬──────┘  └────────┬─────────┘    │
│          └───────────────┴──────────────────┘              │
│                           │ HTTPS + Bearer token            │
└───────────────────────────┼─────────────────────────────────┘
                            │
                ┌───────────▼────────────┐
                │   DBS REST API         │
                │   api.dbs.sii.in/v1    │
                │                        │
                │  /auth/login           │
                │  /score                │
                │  /batch                │
                │  /batch/:id/status     │
                │  /batch/:id/results    │
                │  /status               │
                │  /logs                 │
                └───────────┬────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
   ┌──────────▼──────────┐    ┌────────────▼───────────┐
   │  Violation Data DB  │    │  Insurer Account DB    │
   │  (Vahan / RTO feed) │    │  (Users, Keys, Quotas) │
   └─────────────────────┘    └────────────────────────┘
```

### 1.2 Frontend–Backend Contract

The frontend is a pure SPA. It communicates with the backend exclusively via the REST API defined in the PRD (Section 5). There is no SSR, no BFF (Backend for Frontend), and no direct database access from the frontend. All business logic (score calculation, TP loading formula, band classification) lives entirely in the backend.

### 1.3 Deployment Topology (MVP)

| Layer | Service | Notes |
|---|---|---|
| Frontend hosting | Vercel or Netlify | Static SPA deploy, CI/CD on push to `main` |
| API backend | Separate repo / service | Not in scope of this document |
| DNS | `dashboard.dbs.sii.in` | Frontend; `api.dbs.sii.in` for backend |
| TLS | Auto via hosting provider | HTTPS enforced, HTTP redirected |

---

## 2. Frontend Architecture

### 2.1 Stack Decision

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **React 18** | Component model ideal for dashboard UI patterns; large ecosystem; team familiarity |
| Build tool | **Vite 5** | Fast HMR, native ESM, minimal config for SPAs |
| Language | **TypeScript** | Type safety on API responses and props prevents runtime bugs in data-heavy UI |
| Styling | **Tailwind CSS v3** | Utility-first; avoids CSS file sprawl; consistent with design token approach in wireframe |
| State management | **Zustand** | Lightweight, no boilerplate; sufficient for dashboard-scale global state |
| Data fetching | **TanStack Query v5** | Caching, loading/error states, polling, refetch — eliminates manual `useEffect` fetch patterns |
| Charts | **Recharts** | React-native, composable, works with Tailwind; sufficient for MVP chart types |
| Icons | **Lucide React** | Clean, consistent icon set; tree-shakeable |
| HTTP client | **Axios** | Interceptors for auth headers and global error handling; cleaner than raw fetch |
| Form handling | **React Hook Form** | Minimal re-renders; built-in validation; used for login and batch upload forms |
| Routing | **React Router v6** | Standard SPA routing; nested routes for dashboard layout |

### 2.2 Why Not Next.js

Next.js is not used for MVP. This dashboard has no SEO requirement, no server-rendered pages, and no need for API routes. The added complexity of SSR/RSC slows prototype velocity. Migration to Next.js is straightforward if server components or SSR become necessary in v2.

---

## 3. Project Structure

```
dbs-insurer-dashboard/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/                    # Static images, logos
│   │
│   ├── components/                # Reusable, screen-agnostic components
│   │   ├── ui/                    # Primitives: Button, Badge, Card, Input, Modal, Toast
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── ScoreGauge.tsx         # SVG semi-circle gauge
│   │   ├── BandBadge.tsx          # Excellent/Good/Average/Poor/High Risk pill
│   │   ├── DataTable.tsx          # Generic sortable table
│   │   ├── ViolationTable.tsx     # Violations with THZ tags
│   │   ├── StatCard.tsx           # KPI number card
│   │   ├── APILogRow.tsx          # Single log entry row
│   │   └── BatchProgressCard.tsx  # Batch job status tracker
│   │
│   ├── pages/                     # One file per route/screen
│   │   ├── Login.tsx
│   │   ├── VehicleLookup.tsx
│   │   ├── PortfolioAnalytics.tsx
│   │   ├── BatchProcessing.tsx
│   │   └── APIConsole.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useScoreLookup.ts      # Wraps TanStack Query for score fetch
│   │   ├── useBatchJob.ts         # Polling hook for batch status
│   │   ├── usePortfolioData.ts    # Portfolio KPI + chart data fetch
│   │   ├── useAPILogs.ts          # Auto-refreshing API call log
│   │   └── useAuth.ts             # Login / logout / token refresh
│   │
│   ├── store/                     # Zustand stores
│   │   ├── authStore.ts
│   │   ├── lookupStore.ts
│   │   └── batchStore.ts
│   │
│   ├── services/                  # All API calls — no fetch/axios outside this dir
│   │   ├── api.ts                 # Axios instance + interceptors
│   │   ├── scoreService.ts        # /v1/score
│   │   ├── batchService.ts        # /v1/batch
│   │   ├── portfolioService.ts    # /v1/portfolio
│   │   ├── authService.ts         # /auth/login, /auth/refresh
│   │   └── statusService.ts       # /v1/status, /v1/logs
│   │
│   ├── types/                     # TypeScript interfaces and enums
│   │   ├── score.ts
│   │   ├── batch.ts
│   │   ├── portfolio.ts
│   │   ├── auth.ts
│   │   └── api.ts                 # Generic API response wrappers
│   │
│   ├── utils/                     # Pure utility functions
│   │   ├── formatReg.ts           # "UP32AB1234" → "UP32 AB 1234"
│   │   ├── formatCurrency.ts      # 3200 → "₹3,200"
│   │   ├── scoreColor.ts          # score → hex color
│   │   ├── bandFromScore.ts       # 742 → "GOOD"
│   │   └── parseCSV.ts            # CSV validation before batch upload
│   │
│   ├── constants/
│   │   └── scoring.ts             # Band thresholds, TP loading ranges
│   │
│   ├── App.tsx                    # Root component + router
│   └── main.tsx                   # Vite entry point
│
├── .env.example
├── .env                           # ← gitignored
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 4. Component Specifications

### 4.1 `ScoreGauge.tsx`

SVG-based semi-circle gauge rendering a DBS score from 0–1000.

**Props:**
```typescript
interface ScoreGaugeProps {
  score: number;           // 0–1000
  band: ScoreBand;
  size?: number;           // default: 200 (px width)
  animate?: boolean;       // default: true — needle sweep on mount
}
```

**Implementation notes:**
- SVG viewBox: `0 0 200 110`
- Background arc: static grey semi-circle (`stroke-dasharray` technique)
- Score arc: coloured, length proportional to score/1000
- Needle: `<line>` element rotated via `transform: rotate(deg, 100, 100)`
  - Rotation range: -90° (score 0) to +90° (score 1000)
  - Formula: `rotation = (score / 1000 * 180) - 90`
- Score number and band label absolutely positioned over SVG bottom centre
- Animate with CSS `@keyframes` on arc `stroke-dashoffset` and needle rotation on mount
- No external chart library — pure SVG for performance and control

---

### 4.2 `BandBadge.tsx`

```typescript
type ScoreBand = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'HIGH_RISK';

interface BandBadgeProps {
  band: ScoreBand;
  size?: 'sm' | 'md';     // default: 'md'
}
```

**Color map** (Tailwind classes):

| Band | Background | Text |
|---|---|---|
| EXCELLENT | `bg-emerald-100` | `text-emerald-800` |
| GOOD | `bg-blue-100` | `text-blue-800` |
| AVERAGE | `bg-amber-100` | `text-amber-800` |
| POOR | `bg-orange-100` | `text-orange-800` |
| HIGH_RISK | `bg-red-100` | `text-red-800` |

---

### 4.3 `DataTable.tsx`

Generic sortable, paginated table component.

```typescript
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;         // default: 20
  onRowClick?: (row: T) => void;
}
```

Implements client-side sort and pagination for tables under 500 rows. For batch results (up to 5,000 rows), use windowed rendering — see Section 13.

---

### 4.4 `DashboardLayout.tsx`

Wraps all authenticated screens. Renders `<Sidebar />` and `<Topbar />` as persistent chrome, with `<Outlet />` (React Router) as the page content area.

```typescript
// No props — reads auth state from Zustand store internally
// Redirects to /login if unauthenticated
```

---

### 4.5 `BatchProgressCard.tsx`

```typescript
interface BatchProgressCardProps {
  batchId: string;
  total: number;
  processed: number;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  submittedAt: string;      // ISO 8601
  onDownload?: () => void;  // enabled when status === 'complete'
}
```

Progress bar uses CSS `width` transition on a `div`, not a native `<progress>` element, for styling control.

---

## 5. State Management

### 5.1 Zustand Stores

Only truly global, cross-component state lives in Zustand. Server state (API data) is managed by TanStack Query. Local UI state (open/closed modals, input focus) stays in component `useState`.

**`authStore.ts`**
```typescript
interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'analyst' | 'admin';
    insurerId: string;
    insurerName: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthState['user']) => void;
  clearAuth: () => void;
}
```
Token is persisted to `localStorage` on `setAuth` and removed on `clearAuth`. On app init, `main.tsx` reads from `localStorage` to rehydrate.

---

**`lookupStore.ts`**
```typescript
interface LookupState {
  recentQueries: RecentQuery[];   // Last 10, persisted to sessionStorage
  addRecentQuery: (q: RecentQuery) => void;
  clearRecent: () => void;
}
```

---

**`batchStore.ts`**
```typescript
interface BatchState {
  activeBatchId: string | null;
  setActiveBatch: (id: string) => void;
  clearBatch: () => void;
}
```

---

### 5.2 TanStack Query Usage

TanStack Query handles all async server state: fetching, caching, refetching, and error states.

| Query Key | Hook | Stale Time | Refetch |
|---|---|---|---|
| `['score', regNo]` | `useScoreLookup` | 5 min | On reg change |
| `['portfolio', filters]` | `usePortfolioData` | 2 min | On filter change |
| `['batch', id, 'status']` | `useBatchJob` | 0 | Poll every 3s while processing |
| `['api-status']` | `useAPIStatus` | 30s | Auto refetch interval |
| `['api-logs']` | `useAPILogs` | 0 | Auto refetch every 30s |

---

## 6. API Service Layer

### 6.1 Axios Instance (`src/services/api.ts`)

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    if (error.response?.status === 429) {
      // Trigger toast: "API rate limit reached"
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6.2 Service Functions

All service functions return typed promises. They never handle UI state — that is the responsibility of hooks and components.

**`scoreService.ts`**
```typescript
export const fetchScore = async (regNo: string): Promise<ScoreResult> => {
  const { data } = await api.post<ScoreResult>('/v1/score', {
    reg_no: regNo.replace(/\s/g, '').toUpperCase(),
  });
  return data;
};
```

**`batchService.ts`**
```typescript
export const submitBatch = async (file: File): Promise<BatchSubmitResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<BatchSubmitResponse>('/v1/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getBatchStatus = async (batchId: string): Promise<BatchStatus> => {
  const { data } = await api.get<BatchStatus>(`/v1/batch/${batchId}/status`);
  return data;
};

export const downloadBatchResults = async (batchId: string): Promise<Blob> => {
  const { data } = await api.get(`/v1/batch/${batchId}/results`, {
    responseType: 'blob',
  });
  return data;
};
```

---

## 7. Routing

### 7.1 Route Structure

```typescript
// App.tsx
<BrowserRouter>
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />

    {/* Protected — wrapped in DashboardLayout */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/lookup" replace />} />
        <Route path="/lookup" element={<VehicleLookup />} />
        <Route path="/portfolio" element={<PortfolioAnalytics />} />
        <Route path="/batch" element={<BatchProcessing />} />
        <Route path="/api" element={<APIConsole />} />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### 7.2 `ProtectedRoute` Component

```typescript
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

---

## 8. Authentication Flow

```
User enters email + password
        │
        ▼
POST /auth/login
        │
   ┌────┴─────┐
   │          │
  200        401
   │          │
   ▼          ▼
Store JWT   Show error
in Zustand  toast
+ localStorage
   │
   ▼
Redirect → /lookup
   │
   ▼
All API calls include
Authorization: Bearer {token}
   │
   ▼
On 401 response (token expired):
clearAuth() → redirect to /login
```

### 8.1 Token Storage

JWT stored in `localStorage` under key `dbs_auth_token`. On app boot (`main.tsx`), token is read and `setAuth()` called to rehydrate Zustand.

**Security note:** `localStorage` is acceptable for MVP given this is a B2B internal tool. For v2 with higher security requirements, migrate to `httpOnly` cookies with a refresh token mechanism.

### 8.2 Session Expiry

JWT TTL is set server-side (recommended: 8 hours for dashboard sessions). On `401` response from any API call, the interceptor clears auth and redirects to login. No silent refresh in MVP.

---

## 9. Environment & Configuration

### 9.1 `.env.example`

```bash
# API
VITE_API_BASE_URL=https://api.dbs.sii.in

# App
VITE_APP_ENV=development        # development | staging | production
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_ENABLE_SANDBOX_TOGGLE=false
VITE_BATCH_MAX_ROWS=5000

# Dev / debug
VITE_LOG_API_CALLS=true
VITE_MOCK_API=false             # true = use MSW mock service worker
```

### 9.2 Environment-Specific Behaviour

| Variable | development | staging | production |
|---|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | `https://api-staging.dbs.sii.in` | `https://api.dbs.sii.in` |
| `VITE_LOG_API_CALLS` | `true` | `true` | `false` |
| `VITE_MOCK_API` | optional `true` | `false` | `false` |

### 9.3 MSW Mock Service Worker (Development)

When `VITE_MOCK_API=true`, the app boots with MSW intercepting all API calls and returning fixture data. This allows frontend development without a running backend. Mock handlers live in `src/mocks/handlers.ts`.

---

## 10. Data Models & TypeScript Types

### 10.1 `src/types/score.ts`

```typescript
export type ScoreBand = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'HIGH_RISK';
export type THZTag = 'H' | 'M' | 'L';
export type ChallanStatus = 'paid' | 'unpaid' | 'court';
export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface Violation {
  type: string;
  date: string;              // ISO 8601 date string
  location: string;
  thz_tag: THZTag;
  challan_status: ChallanStatus;
  score_impact: number;      // negative integer
  fine_amount_inr?: number;
}

export interface ScoreResult {
  reg_no: string;
  vehicle_type: string;
  dbs_score: number;
  band: ScoreBand;
  violations_36m: number;
  severity_index: number;
  recent_trend: TrendDirection;
  challan_status: string;
  tp_loading_inr: number;
  base_premium_inr?: number;
  discount_rate_pct?: number;
  violations: Violation[];
  queried_at: string;        // ISO 8601 datetime
  response_ms: number;
}

export interface RecentQuery {
  reg_no: string;
  band: ScoreBand;
  score: number;
  queried_at: string;
}
```

---

### 10.2 `src/types/batch.ts`

```typescript
export type BatchStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface BatchSubmitResponse {
  batch_id: string;
  total: number;
  status: BatchStatus;
  estimated_seconds: number;
}

export interface BatchStatusResponse {
  batch_id: string;
  processed: number;
  total: number;
  status: BatchStatus;
  results_url: string | null;
  band_summary?: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    high_risk: number;
  };
}

export interface BatchResultRow {
  reg_no: string;
  vehicle_type: string;
  dbs_score: number;
  band: ScoreBand;
  violations: number;
  tp_loading_inr: number;
}
```

---

### 10.3 `src/types/portfolio.ts`

```typescript
export interface PortfolioKPIs {
  active_policies: number;
  avg_dbs_score: number;
  high_risk_count: number;
  tp_loading_revenue_inr: number;
  kpi_change?: {           // vs previous period
    active_policies_pct: number;
    avg_score_pct: number;
    high_risk_pct: number;
    revenue_pct: number;
  };
}

export interface BandDistribution {
  band: ScoreBand;
  count: number;
  percentage: number;
}

export interface ScoreTrendPoint {
  month: string;           // "2025-04"
  avg_score: number;
  policy_count: number;
}

export interface PortfolioFilters {
  date_from?: string;
  date_to?: string;
  vehicle_types?: string[];
  states?: string[];
  bands?: ScoreBand[];
}
```

---

### 10.4 `src/types/auth.ts`

```typescript
export type UserRole = 'analyst' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  insurer_id: string;
  insurer_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expires_at: string;      // ISO 8601
}
```

---

## 11. Styling System

### 11.1 Approach

Tailwind CSS v3 with a custom theme extending the wireframe's design tokens.

### 11.2 `tailwind.config.ts`

```typescript
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f4f6fb',
        surface: {
          DEFAULT: '#ffffff',
          2: '#f0f3f9',
          3: '#e8edf7',
        },
        border: {
          DEFAULT: 'rgba(0,0,0,0.07)',
          2: 'rgba(0,0,0,0.12)',
        },
        text: {
          DEFAULT: '#0f1929',
          2: '#4a5568',
          3: '#9aa5b8',
        },
        accent: {
          DEFAULT: '#2563eb',
          2: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
};
```

### 11.3 Typography Rules

| Use case | Font | Weight | Size |
|---|---|---|---|
| Page titles, large numbers | Fraunces (serif) | 400 / 600 | 17–38px |
| Body, labels, nav | DM Sans | 300–600 | 11–14px |
| Registration numbers, code, API keys, timestamps | DM Mono | 400–500 | 10–16px |
| Section labels (uppercase) | DM Mono | 400 | 9–11px |

### 11.4 No CSS Modules or Styled Components

All styling via Tailwind utility classes. If a pattern repeats 3+ times, extract it to a component — not a CSS class.

---

## 12. Error Handling Strategy

### 12.1 Error Taxonomy

| Error Type | Source | Handling |
|---|---|---|
| Network timeout | Axios | Toast: "Connection timeout. Check your network." |
| 401 Unauthorized | API | Clear auth, redirect to `/login` |
| 404 Not Found (score lookup) | API | Show inline empty state: "No records found for {reg}" |
| 429 Rate Limited | API | Toast with quota info: "Daily limit reached (5,000/5,000)" |
| 500 Server Error | API | Toast: "Server error. Try again shortly." |
| CSV validation failure | Frontend | Inline error list below upload: row numbers + error types |
| Batch job failed | API | Error state in `BatchProgressCard` with retry CTA |

### 12.2 Toast Notifications

Use a lightweight toast library (`react-hot-toast`) mounted once in `App.tsx`. Service layer triggers toasts via the library's imperative API — not via React state.

```typescript
// In axios response interceptor
import toast from 'react-hot-toast';
if (error.response?.status === 429) {
  toast.error('Daily API quota reached. Resets at midnight.');
}
```

### 12.3 Error Boundaries

React Error Boundary wraps the entire `<DashboardLayout />` to catch unexpected render errors. Renders a generic "Something went wrong" fallback with a reload button. Does not catch async/API errors (those are handled by TanStack Query).

---

## 13. Performance Considerations

### 13.1 Large Table Rendering (Batch Results)

Batch results can contain up to 5,000 rows. Rendering all in DOM simultaneously will cause jank. Solution: **TanStack Virtual** (`@tanstack/react-virtual`) for windowed rendering of the results table. Only ~20 rows are in the DOM at any time regardless of total row count.

### 13.2 Code Splitting

React Router + Vite lazy loading for page-level components:

```typescript
const VehicleLookup = lazy(() => import('./pages/VehicleLookup'));
const PortfolioAnalytics = lazy(() => import('./pages/PortfolioAnalytics'));
const BatchProcessing = lazy(() => import('./pages/BatchProcessing'));
const APIConsole = lazy(() => import('./pages/APIConsole'));
```

Each page chunk loads only when first navigated to. Login page is eagerly loaded (it's the entry point).

### 13.3 Chart Data

Portfolio charts re-render on filter change. Use `useMemo` to derive chart-ready data arrays from raw API responses rather than computing inline in JSX.

### 13.4 ScoreGauge Animation

The gauge needle and arc animate on mount using CSS transitions. Use `will-change: transform` on the needle element and remove it after animation completes to avoid keeping the compositor layer alive.

### 13.5 API Log Auto-Refresh

The API Console log refetches every 30 seconds via TanStack Query `refetchInterval`. This is suspended when the tab/window loses focus (`refetchIntervalInBackground: false`) to avoid unnecessary network traffic.

---

## 14. Testing Strategy

### 14.1 Unit Tests — Vitest

Test pure utility functions and hooks in isolation.

Priority targets:
- `formatReg.ts` — registration number formatting edge cases
- `bandFromScore.ts` — boundary values (299/300, 449/450, etc.)
- `parseCSV.ts` — malformed CSV detection
- `scoreColor.ts` — colour output per band
- `useScoreLookup` — mock API, assert loading/success/error states

```bash
vitest run          # CI
vitest              # watch mode
```

### 14.2 Component Tests — React Testing Library

Test component render and interaction for:
- `ScoreGauge` — renders correct score and colour class
- `BandBadge` — renders correct label and colour per band
- `DataTable` — sort, pagination, empty state
- `Login` — form validation, submit, error display
- `BatchProgressCard` — status transitions

### 14.3 E2E Tests — Playwright (Post-MVP)

Full user flows for v1.1:
- Login → Vehicle Lookup → score displayed
- Batch upload → progress → download results
- API key copy to clipboard

### 14.4 Coverage Targets

| Layer | Target |
|---|---|
| Utils | 90%+ |
| Hooks | 80%+ |
| Components | 70%+ |
| Pages | Integration test only |

---

## 15. Build & Deployment

### 15.1 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "typecheck": "tsc --noEmit"
  }
}
```

### 15.2 CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### 15.3 Deployment (Vercel)

- `main` branch → auto-deploy to `dashboard.dbs.sii.in` (production)
- `staging` branch → auto-deploy to `staging.dashboard.dbs.sii.in`
- Feature branches → preview deployments (URL in PR comments)

Environment variables are set in the Vercel project dashboard, not in repo files.

### 15.4 Build Output

`vite build` outputs to `dist/`. Approximate bundle targets:

| Chunk | Target size |
|---|---|
| `index.html` | < 2 KB |
| Main bundle (gzipped) | < 150 KB |
| Per-page chunk | < 50 KB each |
| Recharts chunk | ~80 KB gzipped |

---

## 16. Git Workflow

### 16.1 Branch Naming

```
main                            ← production; protected, no direct push
staging                         ← pre-release integration
develop                         ← base for all feature work

feature/lookup-score-gauge      ← new features
feature/batch-csv-upload
fix/gauge-animation-flicker     ← bug fixes
chore/eslint-setup              ← tooling, deps
chore/add-msw-mocks
```

### 16.2 Commit Convention (Conventional Commits)

```
feat(lookup): add score gauge SVG animation on result load
fix(batch): correct progress percentage calculation at 100%
chore(deps): upgrade TanStack Query to v5.28
docs: update API contract for batch results endpoint
style(sidebar): fix active nav item alignment
test(utils): add edge cases for bandFromScore
```

Format: `type(scope): description`

Types: `feat`, `fix`, `chore`, `docs`, `style`, `test`, `refactor`, `perf`

### 16.3 PR Checklist

Before requesting review, author confirms:

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] New components have prop types defined
- [ ] No hardcoded API URLs (use `import.meta.env.VITE_API_BASE_URL`)
- [ ] No `.env` or secrets committed
- [ ] PR description links to relevant issue/task

### 16.4 `.gitignore`

```
node_modules/
dist/
.env
.env.local
.env.production
.env.staging
*.local
.DS_Store
coverage/
.vite/
```

---

## 17. Dependency Registry

### 17.1 Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | `^18.3` | UI framework |
| `react-dom` | `^18.3` | DOM renderer |
| `react-router-dom` | `^6.26` | Client-side routing |
| `axios` | `^1.7` | HTTP client |
| `@tanstack/react-query` | `^5.28` | Server state / data fetching |
| `@tanstack/react-virtual` | `^3.5` | Virtualised list/table rendering |
| `zustand` | `^4.5` | Global client state |
| `react-hook-form` | `^7.52` | Form state and validation |
| `recharts` | `^2.12` | Charts (Portfolio Analytics) |
| `lucide-react` | `^0.383` | Icon set |
| `react-hot-toast` | `^2.4` | Toast notifications |
| `papaparse` | `^5.4` | CSV parsing (batch upload) |

### 17.2 Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | `^5.3` | Build tool and dev server |
| `typescript` | `^5.5` | Type safety |
| `@vitejs/plugin-react` | `^4.3` | React fast refresh in Vite |
| `tailwindcss` | `^3.4` | Utility CSS |
| `autoprefixer` | `^10.4` | CSS vendor prefixes |
| `postcss` | `^8.4` | Tailwind processing |
| `vitest` | `^2.0` | Unit test runner |
| `@testing-library/react` | `^16.0` | Component testing |
| `@testing-library/user-event` | `^14.5` | User interaction simulation |
| `msw` | `^2.3` | API mocking (dev + tests) |
| `eslint` | `^8.57` | Linting |
| `eslint-plugin-react-hooks` | `^4.6` | Hooks lint rules |
| `@typescript-eslint/eslint-plugin` | `^7.13` | TS lint rules |
| `prettier` | `^3.3` | Code formatting |

### 17.3 Install Command

```bash
npm create vite@latest dbs-insurer-dashboard -- --template react-ts
cd dbs-insurer-dashboard

npm install react-router-dom axios @tanstack/react-query @tanstack/react-virtual \
  zustand react-hook-form recharts lucide-react react-hot-toast papaparse

npm install -D tailwindcss autoprefixer postcss @tailwindcss/forms \
  vitest @testing-library/react @testing-library/user-event \
  msw @typescript-eslint/eslint-plugin eslint-plugin-react-hooks prettier

npx tailwindcss init -p
```

---

## Appendix A — Score Band Constants

```typescript
// src/constants/scoring.ts

export const BAND_THRESHOLDS = {
  EXCELLENT: { min: 800, max: 1000 },
  GOOD:      { min: 650, max: 799  },
  AVERAGE:   { min: 450, max: 649  },
  POOR:      { min: 300, max: 449  },
  HIGH_RISK: { min: 0,   max: 299  },
} as const;

export const TP_LOADING_RANGES_INR = {
  EXCELLENT: { min: 0,     max: 0      },  // Discount eligible
  GOOD:      { min: 0,     max: 0      },
  AVERAGE:   { min: 1200,  max: 3500   },
  POOR:      { min: 3500,  max: 6000   },
  HIGH_RISK: { min: 6000,  max: 10000  },  // +beyond for extreme scores
} as const;
```

---

## Appendix B — CSV Batch Upload Format

Required column (case-insensitive header):

```csv
reg_no
UP32AB1234
MH04CD5678
DL8CAF9012
```

Optional columns (ignored if absent, included in results if present):

```csv
reg_no,policy_id,vehicle_type
UP32AB1234,POL-001,Private Car
MH04CD5678,POL-002,Two Wheeler
```

Validation rules enforced by `parseCSV.ts` before submission:
- Column `reg_no` must be present
- Each value must match pattern `/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/i`
- Blank rows are skipped silently
- Duplicate reg numbers flagged as warning (not error)
- Max 5,000 data rows (configurable via `VITE_BATCH_MAX_ROWS`)

---

*This document is a living technical reference. All architectural decisions should be recorded here with a brief rationale. When the backend API contract changes, update Section 6 and Section 10 in the same PR as the frontend change.*
