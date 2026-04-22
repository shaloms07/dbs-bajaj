# TODO — DBS Insurer Dashboard
## MVP v1.0

> Feed this file into your IDE (Cursor, Copilot, etc.) as project context.
> Work top-to-bottom. Each phase must be complete before starting the next.
> Check boxes as you go: `- [x]`

---

## Phase 0 — Project Scaffold

- [ ] Run `npm create vite@latest dbs-insurer-dashboard -- --template react-ts`
- [ ] `cd dbs-insurer-dashboard` and open in IDE
- [ ] Delete boilerplate: `src/App.css`, `src/index.css` contents, `src/assets/react.svg`
- [ ] Install production dependencies:
  ```bash
  npm install react-router-dom axios @tanstack/react-query @tanstack/react-virtual \
    zustand react-hook-form recharts lucide-react react-hot-toast papaparse
  ```
- [ ] Install dev dependencies:
  ```bash
  npm install -D tailwindcss autoprefixer postcss @tailwindcss/forms \
    vitest @testing-library/react @testing-library/user-event \
    msw @typescript-eslint/eslint-plugin eslint-plugin-react-hooks prettier
  ```
- [ ] Run `npx tailwindcss init -p` to generate `tailwind.config.ts` and `postcss.config.js`
- [ ] Configure `tailwind.config.ts` — add `content` glob and extend theme with custom colors, fonts (DM Sans, DM Mono, Fraunces) from SPECS §11.2
- [ ] Add Google Fonts link for DM Sans, DM Mono, Fraunces to `index.html`
- [ ] Add Tailwind directives to `src/index.css`: `@tailwind base; @tailwind components; @tailwind utilities;`
- [ ] Set up `tsconfig.json` — enable `strict: true`, `baseUrl: "."`, `paths: { "@/*": ["src/*"] }`
- [ ] Configure path alias in `vite.config.ts` to match tsconfig `@/` alias
- [ ] Create `.env` and `.env.example` — add all variables from SPECS §9.1
- [ ] Add `.env` to `.gitignore` — also add `dist/`, `coverage/`, `.vite/`, `*.local`
- [ ] Set up `.eslintrc.cjs` with `@typescript-eslint` and `react-hooks` plugins
- [ ] Set up `.prettierrc` with `singleQuote: true`, `semi: true`, `tabWidth: 2`
- [ ] Initialise git: `git init`, create `develop` branch, make first commit
- [ ] Create `README.md` with project name, stack, and setup instructions

---

## Phase 1 — Folder Structure

- [ ] Create all directories as defined in SPECS §3:
  - `src/components/ui/`
  - `src/components/layout/`
  - `src/pages/`
  - `src/hooks/`
  - `src/store/`
  - `src/services/`
  - `src/types/`
  - `src/utils/`
  - `src/constants/`
  - `src/mocks/`
- [ ] Create empty placeholder `.ts` / `.tsx` files for every file listed in SPECS §3 (barrel files, index stubs) so imports resolve without errors from day one
- [ ] Verify `npm run dev` boots without TypeScript errors on the empty scaffold

---

## Phase 2 — Types & Constants

- [ ] Create `src/types/score.ts` — define `ScoreBand`, `THZTag`, `ChallanStatus`, `TrendDirection`, `Violation`, `ScoreResult`, `RecentQuery` (SPECS §10.1)
- [ ] Create `src/types/batch.ts` — define `BatchStatus`, `BatchSubmitResponse`, `BatchStatusResponse`, `BatchResultRow` (SPECS §10.2)
- [ ] Create `src/types/portfolio.ts` — define `PortfolioKPIs`, `BandDistribution`, `ScoreTrendPoint`, `PortfolioFilters` (SPECS §10.3)
- [ ] Create `src/types/auth.ts` — define `UserRole`, `User`, `LoginRequest`, `LoginResponse` (SPECS §10.4)
- [ ] Create `src/types/api.ts` — define generic `APIError` shape `{ error: string; message: string }`
- [ ] Create `src/constants/scoring.ts` — add `BAND_THRESHOLDS` and `TP_LOADING_RANGES_INR` objects (SPECS Appendix A)

---

## Phase 3 — Utility Functions

- [ ] `src/utils/formatReg.ts` — function to format `"UP32AB1234"` → `"UP32 AB 1234"` (regex-based, handle edge cases)
- [ ] `src/utils/bandFromScore.ts` — function `(score: number): ScoreBand` using `BAND_THRESHOLDS` constants
- [ ] `src/utils/scoreColor.ts` — function `(band: ScoreBand): string` returning hex color per band
- [ ] `src/utils/formatCurrency.ts` — function `(amount: number): string` returning `"₹3,200"` or `"0"` format
- [ ] `src/utils/parseCSV.ts` — CSV validation function: checks for `reg_no` column, validates each value against regex `/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/i`, flags duplicates, enforces max rows from env var, returns `{ valid: rows[], errors: { row, message }[] }`
- [ ] Write unit tests for all utils in `src/utils/*.test.ts` — cover boundary values especially `bandFromScore` at 299/300, 449/450, 649/650, 799/800 (SPECS §14.1)

---

## Phase 4 — API Service Layer

- [ ] `src/services/api.ts` — create Axios instance with `baseURL` from `import.meta.env.VITE_API_BASE_URL`, 10s timeout (SPECS §6.1)
- [ ] Add request interceptor to `api.ts` — reads token from Zustand `authStore` and attaches `Authorization: Bearer {token}` header
- [ ] Add response interceptor to `api.ts` — handle 401 (clear auth + redirect `/login`), 429 (toast rate limit message), pass other errors through
- [ ] `src/services/authService.ts` — implement `login(req: LoginRequest): Promise<LoginResponse>` calling `POST /auth/login`
- [ ] `src/services/scoreService.ts` — implement `fetchScore(regNo: string): Promise<ScoreResult>` calling `POST /v1/score` with sanitised reg no.
- [ ] `src/services/batchService.ts` — implement `submitBatch`, `getBatchStatus`, `downloadBatchResults` (SPECS §6.2)
- [ ] `src/services/portfolioService.ts` — implement `fetchPortfolioKPIs(filters)` and `fetchPortfolioCharts(filters)` calling portfolio endpoints
- [ ] `src/services/statusService.ts` — implement `fetchAPIStatus(): Promise<APIStatusResponse>` and `fetchAPILogs(): Promise<APILog[]>`

---

## Phase 5 — MSW Mocks (Dev)

- [ ] `src/mocks/handlers.ts` — create MSW request handlers for all endpoints: `POST /auth/login`, `POST /v1/score`, `POST /v1/batch`, `GET /v1/batch/:id/status`, `GET /v1/batch/:id/results`, `GET /v1/status`, `GET /v1/logs`
- [ ] Add fixture data for score lookup — at least 4 vehicles with different bands (Excellent/Good/Average/High Risk) matching wireframe sample data
- [ ] Add fixture for 404 case — one reg no. that returns `{ error: "registration_not_found" }`
- [ ] Add fixture for batch job — returns `queued` initially, transitions to `processing` then `complete` on subsequent polls
- [ ] `src/mocks/browser.ts` — set up MSW browser worker
- [ ] Wire MSW startup into `src/main.tsx` behind `import.meta.env.VITE_MOCK_API === 'true'` guard
- [ ] Set `VITE_MOCK_API=true` in `.env` for local dev; confirm score lookup returns mock data in browser

---

## Phase 6 — Zustand Stores

- [ ] `src/store/authStore.ts` — implement full store: `token`, `user`, `isAuthenticated`, `setAuth`, `clearAuth` with `localStorage` persistence (SPECS §5.1)
- [ ] Add rehydration logic in `src/main.tsx` — on app boot, read `dbs_auth_token` from `localStorage` and call `setAuth` if present and not expired
- [ ] `src/store/lookupStore.ts` — implement `recentQueries` array (max 10), `addRecentQuery`, `clearRecent` with `sessionStorage` persistence (SPECS §5.1)
- [ ] `src/store/batchStore.ts` — implement `activeBatchId`, `setActiveBatch`, `clearBatch` (SPECS §5.1)

---

## Phase 7 — Custom Hooks

- [ ] `src/hooks/useAuth.ts` — wraps `authService.login`, calls `authStore.setAuth` on success, returns `{ login, logout, isLoading, error }`
- [ ] `src/hooks/useScoreLookup.ts` — wraps TanStack Query `useQuery` with key `['score', regNo]`, calls `scoreService.fetchScore`, stale time 5 min (SPECS §5.2)
- [ ] `src/hooks/useBatchJob.ts` — wraps TanStack Query `useQuery` with key `['batch', id, 'status']`, polls every 3s while `status === 'processing' | 'queued'`, stops polling on `complete | failed` (SPECS §5.2)
- [ ] `src/hooks/usePortfolioData.ts` — wraps TanStack Query `useQuery` with key `['portfolio', filters]`, stale time 2 min, accepts `PortfolioFilters` param
- [ ] `src/hooks/useAPILogs.ts` — wraps TanStack Query `useQuery` for `/v1/logs`, auto-refetches every 30s, `refetchIntervalInBackground: false`
- [ ] `src/hooks/useAPIStatus.ts` — wraps TanStack Query `useQuery` for `/v1/status`, stale time 30s

---

## Phase 8 — UI Primitives

- [ ] `src/components/ui/Button.tsx` — variants: `primary`, `secondary`, `ghost`, `danger`; sizes: `sm`, `md`; loading spinner state; disabled state
- [ ] `src/components/ui/Input.tsx` — controlled input with `label`, `error`, `hint` props; focus ring using accent color
- [ ] `src/components/ui/Badge.tsx` — generic badge with `color` prop; used by `BandBadge`
- [ ] `src/components/ui/Card.tsx` — white surface card with border, border-radius, padding variants (`sm`, `md`, `lg`)
- [ ] `src/components/ui/Modal.tsx` — accessible modal with backdrop, close on Escape, focus trap; used for key regeneration confirmation
- [ ] `src/components/ui/Toast.tsx` — configure `react-hot-toast` with custom styles matching design tokens; mount `<Toaster />` in `App.tsx`
- [ ] Write component tests for `Button`, `Input`, `Badge` (render + interaction)

---

## Phase 9 — Shared Components

- [ ] `src/components/BandBadge.tsx` — pill badge component using color map from SPECS §4.2; `size` prop `sm | md`; uses `ScoreBand` type
- [ ] `src/components/ScoreGauge.tsx` — SVG semi-circle gauge per SPECS §4.1:
  - [ ] Background grey arc (`stroke-dasharray` technique, viewBox `0 0 200 110`)
  - [ ] Coloured score arc, length = `(score / 1000) * arc_length`
  - [ ] Needle `<line>` rotated via `rotate(deg, 100, 100)`, range -90° to +90°
  - [ ] Score number + band label absolutely positioned at bottom centre
  - [ ] CSS `@keyframes` animation on mount for arc and needle sweep
  - [ ] `will-change: transform` on needle, removed after animation ends
  - [ ] Accepts `score`, `band`, `size`, `animate` props
- [ ] `src/components/StatCard.tsx` — KPI card with `label`, `value`, `change` (± percentage), `changeDirection` (`up | down | neutral`) props
- [ ] `src/components/DataTable.tsx` — generic table per SPECS §4.3: `Column<T>[]` config, client-side sort, pagination (default 20/page), loading skeleton, empty state message, optional `onRowClick`
- [ ] `src/components/ViolationTable.tsx` — extends `DataTable` with violation-specific columns: type + THZ tag pill, date, location, challan status badge, score impact (red negative number)
- [ ] `src/components/APILogRow.tsx` — single log entry: timestamp (monospace), masked reg no., endpoint, response ms, HTTP status badge (200=green, 404=amber, 500=red)
- [ ] `src/components/BatchProgressCard.tsx` — per SPECS §4.5: batch ID, submitted time, total/processed counts, animated progress bar, status pill, download button (enabled only when `complete`)
- [ ] Write component tests for `ScoreGauge` (correct colour class per band), `BandBadge` (label per band), `DataTable` (sort + pagination + empty state)

---

## Phase 10 — Layout Components

- [ ] `src/components/layout/Sidebar.tsx`:
  - [ ] Fixed left sidebar, 220px width, white surface, right border
  - [ ] Logo area: "DBS" with accent-coloured span + "Insurer Portal" subtitle in DM Mono uppercase
  - [ ] Insurer badge below logo: insurer name from `authStore.user.insurerName`
  - [ ] Nav sections: "Main" (Vehicle Lookup, Portfolio Analytics) and "Operations" (Batch Processing, API Console)
  - [ ] Each nav item: icon (Lucide), label, active state (blue bg + accent text), hover state, nav badge (e.g. notification count)
  - [ ] Footer: animated green status dot + "API Connected" label; reads from `useAPIStatus`
  - [ ] Active item driven by current React Router `location.pathname`
- [ ] `src/components/layout/Topbar.tsx`:
  - [ ] Sticky top bar, 56px height, white surface, bottom border, shadow
  - [ ] Page title (changes per route) — Fraunces serif font
  - [ ] Right side: daily quota stat pill (calls used / limit) from `useAPIStatus`
  - [ ] Right side: user name + logout button
- [ ] `src/components/layout/DashboardLayout.tsx`:
  - [ ] Renders `<Sidebar />` + `<Topbar />` + `<main>` with `margin-left: 220px`
  - [ ] Wraps content area with React Error Boundary (SPECS §12.3)
  - [ ] `<Outlet />` renders active page inside content area
  - [ ] Mounts `<Toaster />` for toast notifications

---

## Phase 11 — Routing & Auth Guard

- [ ] `src/App.tsx` — set up `BrowserRouter` with route tree from SPECS §7.1; wrap page components in `React.lazy()` + `<Suspense>` for code splitting
- [ ] `src/components/ProtectedRoute.tsx` — reads `isAuthenticated` from `authStore`; redirects to `/login` if false; renders `<Outlet />` if true (SPECS §7.2)
- [ ] Set up `<QueryClientProvider>` wrapping the entire app in `App.tsx` with a `QueryClient` instance
- [ ] Verify navigation between all 4 dashboard routes works — Lookup, Portfolio, Batch, API Console
- [ ] Verify unauthenticated user hitting `/lookup` is redirected to `/login`
- [ ] Verify authenticated user hitting `/login` is redirected to `/lookup`

---

## Phase 12 — Login Page

- [ ] `src/pages/Login.tsx`:
  - [ ] Centered card layout, DBS logo/wordmark, "Insurer Portal" label
  - [ ] Email field (type `email`, required, validation)
  - [ ] Password field (type `password`, required, min 8 chars)
  - [ ] Submit button with loading spinner state (uses `useAuth` hook)
  - [ ] Error toast on 401 (invalid credentials)
  - [ ] On success: store token via `authStore.setAuth`, redirect to `/lookup`
  - [ ] Use `react-hook-form` for form state and validation
- [ ] Write component test: form validation, submit disabled while loading, error display on failed login

---

## Phase 13 — Vehicle Lookup Page

- [ ] `src/pages/VehicleLookup.tsx` — two-column layout (380px input panel left, result panel right)
- [ ] **Input panel (left card):**
  - [ ] Registration number input: DM Mono font, uppercase transform, auto-formats on blur using `formatReg` util
  - [ ] "Fetch Score" button — triggers `useScoreLookup` with current input value
  - [ ] Recent Queries section (below divider): renders last 10 from `lookupStore.recentQueries`; each item is clickable and populates the input + triggers lookup
  - [ ] Sample vehicles quick-load buttons (MH31AB1234, UP32CD5678, DL8CAF9012, KA01MN3456) for dev/demo
- [ ] **Result panel (right):**
  - [ ] Empty state: placeholder illustration + "Enter a registration number to begin" text
  - [ ] Loading state: skeleton loaders for gauge area and metric cards
  - [ ] **Score result card** (on success):
    - [ ] Vehicle reg number (large, DM Mono)
    - [ ] Vehicle type + query timestamp
    - [ ] `<ScoreGauge />` component with score and band
    - [ ] Score breakdown grid (2×2): Violations (36m), Severity Index, Recent Trend, Challan Status
    - [ ] TP Premium Loading box: base premium, loading amount (₹), discount rate — styled with green gradient bg
  - [ ] **Violations table** (below score card): `<ViolationTable />` with all violation rows
  - [ ] 404 state: inline message "No records found for {reg}" with suggestion to verify registration
  - [ ] On successful lookup: call `lookupStore.addRecentQuery` with result data
- [ ] Write component test: empty state renders, result renders with mock data, 404 state renders

---

## Phase 14 — Portfolio Analytics Page

- [ ] `src/pages/PortfolioAnalytics.tsx`
- [ ] **Filter bar** (top):
  - [ ] Date range picker (date-from, date-to inputs)
  - [ ] Vehicle type multi-select filter (Private Car, Two Wheeler, Goods Vehicle, Commercial)
  - [ ] State / RTO filter (dropdown)
  - [ ] Band filter (multi-select: Excellent, Good, Average, Poor, High Risk)
  - [ ] "Apply Filters" button — updates `PortfolioFilters` state passed to `usePortfolioData`
  - [ ] "Clear" button — resets all filters
- [ ] **KPI cards row** (4 cards using `<StatCard />`):
  - [ ] Active Policies (with ± change vs previous period)
  - [ ] Avg DBS Score (with ± change)
  - [ ] High Risk Count (with ± change)
  - [ ] TP Loading Revenue ₹ (with ± change)
- [ ] **Charts section:**
  - [ ] Band Distribution chart — horizontal bar chart using Recharts `BarChart`; one bar per band, colour-coded
  - [ ] Score Trend chart — line chart using Recharts `LineChart`; x-axis = months, y-axis = avg score; last 12 months
  - [ ] Derive chart data arrays using `useMemo` from raw API response (SPECS §13.3)
- [ ] **Renewal Risk Table** — `<DataTable />` showing policies due for renewal, sorted by band (High Risk first); columns: reg no., vehicle type, band, score, renewal date, TP loading
- [ ] Export button — triggers `portfolioService` export call, downloads CSV
- [ ] Loading skeleton for all 4 KPI cards and both charts
- [ ] Empty state when filters return zero results

---

## Phase 15 — Batch Processing Page

- [ ] `src/pages/BatchProcessing.tsx`
- [ ] **Upload section (card):**
  - [ ] Drag-and-drop zone: accepts `.csv` files only, visual drag-over state (blue border)
  - [ ] "Browse Files" fallback button opens native file picker
  - [ ] On file select: run `parseCSV` util for client-side validation before any API call
  - [ ] Show validation errors inline below dropzone: "Row 14: Invalid format — KA01MN" etc.
  - [ ] Show valid row count and any warnings (duplicates)
  - [ ] "Submit Batch" button — disabled if validation errors exist; shows row count "Submit 1,428 vehicles"
  - [ ] On submit: call `batchService.submitBatch`, store returned `batch_id` in `batchStore`, trigger `useBatchJob` polling hook
- [ ] **Batch Status card** (`<BatchProgressCard />`):
  - [ ] Hidden until a batch is submitted
  - [ ] Shows batch ID, submitted timestamp, total vehicles, processed count
  - [ ] Animated progress bar (CSS width transition)
  - [ ] Status pill: Queued (grey) → Processing (blue) → Complete (green) / Failed (red)
  - [ ] "Download Results" button enabled when `status === 'complete'`; calls `batchService.downloadBatchResults`, triggers browser file download
- [ ] **Results summary bar** — band count pills (Excellent: 589, Good: 402, etc.) visible after complete
- [ ] **Results table** — `<DataTable />` with TanStack Virtual windowing for up to 5,000 rows (SPECS §13.1); columns: Reg No., Vehicle Type, DBS Score, Band (uses `<BandBadge />`), Violations, TP Loading
- [ ] "Export CSV" button above results table
- [ ] Failed batch state: error message + "Retry" button that re-submits the same file

---

## Phase 16 — API Console Page

- [ ] `src/pages/APIConsole.tsx` — two-column layout (credentials left, call log right)
- [ ] **API Credentials card (left):**
  - [ ] Live API Key row: masked value (`dbs_live_xxx••••••••xyz`), eye toggle to reveal, copy-to-clipboard button (Lucide `Copy` icon, shows "Copied!" confirmation for 2s)
  - [ ] Sandbox API Key row: same pattern
  - [ ] "Regenerate Key" button → opens `<Modal />` with confirmation warning "This will invalidate your existing key immediately. Are you sure?" → on confirm, call regenerate endpoint
  - [ ] Endpoint reference block (monospace code box): `POST` URL, `Authorization` header format, sample JSON body — read-only display
- [ ] **SLA Metrics card (left, below credentials):**
  - [ ] Three metric cells: Uptime (30d) %, Avg Response ms, Calls Today
  - [ ] Data from `useAPIStatus` hook — auto-refreshes every 30s
  - [ ] Loading skeleton while fetching
- [ ] **Recent API Call Log (right card):**
  - [ ] Column headers: TIME, REG NO., ENDPOINT, RESP (ms), STATUS
  - [ ] Renders last 50 calls using `useAPILogs` (auto-refreshes every 30s, paused when tab is backgrounded)
  - [ ] Each row via `<APILogRow />`: timestamp (DM Mono), masked reg, endpoint, latency, HTTP status badge
  - [ ] Status badge: 200 → green, 404 → amber, 500 → red
  - [ ] "Live" indicator dot (animated pulse) in card header when auto-refresh is active

---

## Phase 17 — Error Handling & Edge Cases

- [ ] Implement React Error Boundary in `src/components/ErrorBoundary.tsx` — fallback UI with "Something went wrong" message and "Reload" button (SPECS §12.3)
- [ ] Wrap `<DashboardLayout />` with `<ErrorBoundary />` in `App.tsx`
- [ ] Verify all 5 error types show correct UI per SPECS §12.1:
  - [ ] Network timeout → toast
  - [ ] 401 → redirect to login
  - [ ] 404 on score lookup → inline not-found state (not a toast)
  - [ ] 429 → toast with quota message
  - [ ] 500 → toast with retry suggestion
- [ ] CSV validation errors show as inline list (not toast) below upload zone
- [ ] Batch job `failed` state shows error card (not toast) with retry CTA

---

## Phase 18 — Polish & Accessibility

- [ ] Verify all interactive elements are keyboard-navigable (Tab, Enter, Space, Escape)
- [ ] Add `aria-label` to all icon-only buttons (copy, eye toggle, close modal)
- [ ] Add `role="status"` and `aria-live="polite"` to score result panel for screen readers
- [ ] Add `aria-busy="true"` to loading states
- [ ] Ensure colour contrast meets WCAG 2.1 AA for all text/background combos (especially band badges)
- [ ] Add `<title>` updates per route (e.g. "Vehicle Lookup — DBS Insurer Portal")
- [ ] Test all pages at 1280px, 1440px, and 1920px widths — fix any overflow or layout breaks
- [ ] Verify `ScoreGauge` animation is skipped when `prefers-reduced-motion` is set
- [ ] Confirm sidebar status dot pulse animation also respects `prefers-reduced-motion`

---

## Phase 19 — Testing Pass

- [ ] Run `npm run test` — all unit tests pass
- [ ] Run `npm run typecheck` — zero TypeScript errors
- [ ] Run `npm run lint` — zero ESLint errors
- [ ] Manually test full Vehicle Lookup flow with mock data (empty → loading → result → recent query)
- [ ] Manually test 404 flow (use fixture reg no. that returns not-found)
- [ ] Manually test Batch upload: valid CSV → submit → progress poll → complete → download
- [ ] Manually test Batch upload: invalid CSV → validation errors shown, submit blocked
- [ ] Manually test Login: wrong credentials → error; correct credentials → dashboard
- [ ] Manually test 401 mid-session: clear token in localStorage while on dashboard → next API call redirects to login
- [ ] Manually test API Console: copy key button, SLA refresh, log auto-refresh

---

## Phase 20 — Build & Deploy

- [ ] Run `npm run build` — confirm zero errors, inspect `dist/` output
- [ ] Check gzipped bundle sizes — main bundle target < 150KB, per-page chunks < 50KB (SPECS §15.4)
- [ ] Run `npm run preview` — test production build locally at `localhost:4173`
- [ ] Create `.github/workflows/ci.yml` — typecheck, lint, test, build steps (SPECS §15.2)
- [ ] Push `develop` branch to GitHub — confirm CI pipeline runs and passes
- [ ] Connect repo to Vercel — configure env vars for `staging` environment
- [ ] Deploy to staging — smoke test all 4 pages against staging API
- [ ] Merge `develop` → `staging` → `main`
- [ ] Confirm production deploy at `dashboard.dbs.sii.in`

---

## Backlog — Post-MVP (Do Not Start Yet)

- [ ] User management page (invite teammates, assign analyst/admin roles)
- [ ] Score trend chart on vehicle lookup (12-month history line chart)
- [ ] Portfolio renewal risk cohort export
- [ ] Webhook configuration UI for batch completion events
- [ ] Sandbox / Live environment switcher toggle in topbar
- [ ] Silent JWT refresh (refresh token flow)
- [ ] Playwright E2E tests for critical user flows
- [ ] Mobile-responsive layout pass
- [ ] SSO / SAML login integration
- [ ] Score explainability PDF export per vehicle
- [ ] Multi-insurer admin portal (internal DBS team use)

---

> **Reminder:** Never commit `.env`. Always branch from `develop`. PR format: `[SCREEN] description`. See `SPECS-DBS-Insurer-Dashboard.md` §16 for full git conventions.
