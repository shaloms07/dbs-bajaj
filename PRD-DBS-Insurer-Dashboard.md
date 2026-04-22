# Product Requirements Document
## DBS Insurer Dashboard

| Field | Detail |
|---|---|
| **Product** | DBS Insurer Dashboard |
| **Version** | 1.0 — MVP |
| **Status** | Draft |
| **Stack** | React + Vite (Frontend), REST API Backend (TBD) |
| **Last Updated** | March 2026 |

---

## 1. Overview

### 1.1 Product Summary

The DBS (Driver Behaviour Score) Insurer Dashboard is a B2B web application that gives insurance companies a dedicated portal to query, analyse, and act on driver behaviour scores derived from traffic violation data. Insurers use these scores to adjust third-party (TP) premium loadings, assess portfolio risk, and automate high-volume vehicle scoring via API or batch file uploads.

### 1.2 Problem Statement

Insurance underwriters currently have no standardised, real-time data channel to assess driver risk at the point of policy issuance or renewal. They rely on self-declaration by policyholders, which is unreliable. The DBS platform provides a score (0–1000) based on verified traffic violation records, enabling data-driven premium decisions.

### 1.3 Goals

- Allow insurers to query any vehicle's DBS score in real time via registration number
- Provide portfolio-level analytics across an insurer's active book of business
- Enable bulk/batch scoring for renewal processing pipelines
- Expose a REST API for direct system-to-system integration with insurer policy management systems
- Establish a secure, auditable, multi-user platform suitable for B2B enterprise onboarding

### 1.4 Non-Goals (MVP)

- Direct policyholder-facing UI (B2C)
- Claims management or settlement workflows
- Integration with IRDAI filing systems
- Mobile native app
- Multi-language support (English only for MVP)

---

## 2. Users & Roles

### 2.1 Primary User

**Insurer Analyst / Underwriter**
- Looks up individual vehicle scores before policy issuance
- Reviews violation breakdown to justify loading decisions
- Downloads batch results for renewal runs

### 2.2 Secondary User

**Insurer Admin / IT Integration Team**
- Manages API credentials (live + sandbox keys)
- Monitors API call logs, uptime, and SLA metrics
- Configures which users in their organisation have dashboard access

### 2.3 Platform Admin (Internal — DBS Team)

- Manages insurer account onboarding
- Sets API rate limits and quota per insurer
- Reviews platform-wide usage and error rates

---

## 3. Screens & Features

### 3.1 Vehicle Lookup

**Purpose:** Query a single vehicle's DBS score by registration number.

**Fields & Components:**

| Element | Description |
|---|---|
| Registration Number Input | Uppercase monospace input, auto-formats to `XX00 XX 0000` pattern |
| Vehicle Type (display) | Derived from reg — Private Car, Two Wheeler, Goods Vehicle, etc. |
| Fetch Score Button | Calls `POST /v1/score` with `{ reg_no }` |
| Recent Queries List | Last 10 queries for the session, clickable to reload |
| DBS Score Gauge | SVG semi-circle gauge, 0–1000, colour-coded by band |
| Score Band Badge | EXCELLENT / GOOD / AVERAGE / POOR / HIGH RISK |
| Score Breakdown Grid | 4 sub-metrics: Violations (36m), Severity Index, Recent Trend, Challan Status |
| TP Premium Loading Box | Computed loading amount in ₹, with Base Premium and Discount Rate |
| Violations Table | Per-violation rows: type, date, location, THZ tag (H/M/L), challan status, score impact |
| Query Timestamp | Time of API call, response latency |

**Score Bands:**

| Band | Range | TP Loading |
|---|---|---|
| Excellent | 800–1000 | ₹0 (discount eligible) |
| Good | 650–799 | ₹0 |
| Average | 450–649 | +₹1,200–₹3,500 |
| Poor | 300–449 | +₹3,500–₹6,000 |
| High Risk | 0–299 | +₹6,000–₹10,000+ |

**States to handle:**
- Empty state (no query yet)
- Loading state (API in-flight)
- Success state (score result displayed)
- Not Found (registration not in system — 404)
- Error state (API failure — 500/timeout)

---

### 3.2 Portfolio Analytics

**Purpose:** Give the insurer an aggregated view of the risk profile of their entire active policy book.

**KPI Cards (top row):**

| Metric | Description |
|---|---|
| Active Policies | Total vehicles in the insurer's portfolio |
| Avg DBS Score | Mean score across portfolio |
| High Risk Count | Vehicles in Poor + High Risk bands |
| TP Loading Revenue | Total additional premium collected from loadings |

**Charts & Visuals:**

| Chart | Type | Description |
|---|---|---|
| Band Distribution | Horizontal bar or donut | Count by Excellent / Good / Average / Poor / High Risk |
| Score Trend | Line chart | Average portfolio score over last 12 months |
| Renewal Risk Matrix | Table or scatter | Policies due for renewal flagged by band |
| Violation Type Breakdown | Bar chart | Top violation types across portfolio |

**Filters:**
- Date range picker (policy start / renewal date)
- Vehicle type filter (Private Car, Two Wheeler, Goods, Commercial)
- State / RTO filter
- Band filter

**Export:**
- Export portfolio summary as CSV
- Export filtered cohort for bulk re-scoring

---

### 3.3 Batch Processing

**Purpose:** Upload a list of registration numbers and receive DBS scores for all vehicles in bulk — for renewal processing pipelines.

**Upload Flow:**

| Step | Detail |
|---|---|
| 1. Upload CSV | Drag-and-drop or file picker. Required column: `reg_no`. Optional: `policy_id`, `vehicle_type`. Max 5,000 rows per batch |
| 2. Validation | Frontend validates CSV structure, flags malformed rows before submission |
| 3. Submit Batch | Calls `POST /v1/batch` with file or array payload |
| 4. Progress Tracking | Real-time progress bar (polling or WebSocket). Shows processed / total count |
| 5. Results Table | Displays reg no., vehicle type, DBS score, band, violation count, TP loading per row |
| 6. Export | Download results as CSV with all fields |

**Batch Status Card:**

| Field | Description |
|---|---|
| Batch ID | Unique identifier for the job (monospace) |
| Submitted | Timestamp |
| Total Vehicles | Row count from uploaded file |
| Processed | Live counter |
| Status | Queued / Processing / Complete / Failed |
| Completion % | Progress bar |

**Results Summary Bar:**
- Excellent count, Good count, Average count, Poor count, High Risk count — shown as coloured pill badges

**Results Table Columns:**
- Registration No.
- Vehicle Type
- DBS Score
- Band
- Violations (count)
- TP Loading (₹)

---

### 3.4 API Console

**Purpose:** Allow the insurer's technical team to manage API credentials and monitor live API usage.

**API Credentials Panel:**

| Field | Description |
|---|---|
| Live API Key | Masked display (`dbs_live_xxx••••••••xyz`), copy-to-clipboard button |
| Sandbox API Key | Masked display, copy-to-clipboard button |
| Regenerate Key | Confirmation modal before regenerating — irreversible action |
| Endpoint Reference | Inline code block showing base URL, auth header, and sample body |

**Endpoint Reference (display only in MVP):**
```
POST https://api.dbs.sii.in/v1/score
Authorization: Bearer {api_key}
Body: { "reg_no": "UP32AB1234" }
```

**SLA Metrics (live-refreshing):**

| Metric | Description |
|---|---|
| Uptime (30d) | Percentage — fetched from status endpoint |
| Avg Response Time | Rolling average in ms |
| API Calls Today | Counter for current calendar day |

**Recent API Call Log:**

| Column | Description |
|---|---|
| Timestamp | HH:MM:SS |
| Reg No. | Masked (last 4 digits hidden) |
| Endpoint | `/v1/score` or `/v1/batch` |
| Response Time (ms) | Latency per call |
| HTTP Status | 200 (green), 404 (amber), 500 (red) |

Log shows the last 50 calls, paginated or virtualized. Auto-refreshes every 30 seconds.

---

## 4. Navigation & Layout

### 4.1 Sidebar

Fixed left sidebar (220px width) present on all screens.

| Section | Nav Items |
|---|---|
| Main | Vehicle Lookup, Portfolio Analytics |
| Operations | Batch Processing, API Console |
| Footer | API status dot (live/degraded/down), insurer name badge |

### 4.2 Topbar

Sticky top bar per screen showing:
- Page title (changes on nav)
- Contextual stats (e.g. "Daily Queries Used: 847 / 5,000")
- User avatar / account menu (MVP: name + logout only)

### 4.3 Tab System

Vehicle Lookup and Portfolio screens use an internal tab bar for sub-views where applicable (e.g. Score Details / Violation History on lookup result).

---

## 5. API Contracts

### 5.1 Single Score Lookup

```
POST /v1/score
Authorization: Bearer {api_key}

Request:
{
  "reg_no": "UP32AB1234"
}

Response 200:
{
  "reg_no": "UP32AB1234",
  "vehicle_type": "Private Car",
  "dbs_score": 742,
  "band": "GOOD",
  "violations_36m": 2,
  "severity_index": 1.4,
  "recent_trend": "improving",
  "challan_status": "1 unpaid",
  "tp_loading_inr": 0,
  "violations": [
    {
      "type": "Signal Jump",
      "date": "2024-08-14",
      "location": "Lucknow",
      "thz_tag": "H",
      "challan_status": "paid",
      "score_impact": -45
    }
  ],
  "queried_at": "2026-03-17T11:48:32Z",
  "response_ms": 112
}

Response 404:
{
  "error": "registration_not_found",
  "message": "No records found for UP32AB1234"
}
```

### 5.2 Batch Scoring

```
POST /v1/batch
Authorization: Bearer {api_key}
Content-Type: multipart/form-data

Request: CSV file upload (field: "file")

Response 202:
{
  "batch_id": "batch_20260317_8af3k",
  "total": 1428,
  "status": "queued",
  "estimated_seconds": 45
}

GET /v1/batch/{batch_id}/status
Response 200:
{
  "batch_id": "batch_20260317_8af3k",
  "processed": 1241,
  "total": 1428,
  "status": "processing",
  "results_url": null
}

GET /v1/batch/{batch_id}/results
Response 200: CSV file download
```

### 5.3 SLA / Status

```
GET /v1/status
Response 200:
{
  "uptime_30d_pct": 99.98,
  "avg_response_ms": 124,
  "calls_today": 847,
  "api_status": "operational"
}
```

---

## 6. Authentication & Security

| Concern | Approach |
|---|---|
| Auth method | JWT-based session login (email + password for MVP). SSO/SAML in v2. |
| API key storage | Keys stored server-side, hashed. Only shown once on generation. |
| Key masking | Frontend always masks key body — reveal on explicit toggle only |
| HTTPS | All endpoints TLS only |
| Rate limiting | Per-API-key quota (configurable per insurer account) |
| Reg no. masking in logs | Last 4 characters of reg no. hidden in UI log display |
| Data residency | India — all data stored within IN region |

---

## 7. Data & State Management

### Frontend State (React)

| State Slice | Contents |
|---|---|
| `auth` | JWT token, user info, insurer ID |
| `lookup` | Input value, loading flag, result, error, recent queries list |
| `portfolio` | KPI data, chart data, active filters |
| `batch` | Upload status, batch job ID, progress, results |
| `apiConsole` | Credentials (masked), SLA data, call log, refresh timer |

### API Service Layer (`src/services/api.js`)

All fetch calls centralised here. Handles:
- Base URL from `VITE_API_BASE_URL` env variable
- Auth header injection
- Global error handling (401 → redirect to login, 429 → rate limit toast)
- Request/response logging in dev mode

---

## 8. Environment Variables

```
# .env.example
VITE_API_BASE_URL=https://api.dbs.sii.in
VITE_APP_ENV=development        # development | staging | production
VITE_LOG_API_CALLS=true
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Score lookup response time | < 200ms P95 (API) |
| Batch processing throughput | 1,000 vehicles/min minimum |
| Dashboard initial load (FCP) | < 1.5s on 4G |
| API uptime SLA | 99.9% monthly |
| Concurrent insurer sessions | 500+ without degradation |
| Accessibility | WCAG 2.1 AA for key flows |
| Browser support | Chrome, Edge, Firefox — latest 2 versions |

---

## 10. MVP Scope vs. Future Roadmap

### MVP (v1.0) — In Scope

- [x] Vehicle Lookup with score gauge + violation table
- [x] Portfolio Analytics with KPI cards and band distribution chart
- [x] Batch Processing (CSV upload, progress, results, export)
- [x] API Console (credentials, SLA, call log)
- [x] JWT auth (login / logout)
- [x] Sidebar navigation + topbar
- [x] React + Vite project scaffold with component structure
- [x] `.env`-based config for API base URL

### v1.1 — Near-term

- [ ] Insurer admin: user management (invite teammates, assign roles)
- [ ] Score trend chart on vehicle lookup (12-month history)
- [ ] Portfolio renewal risk cohort — download flagged vehicles
- [ ] Webhook configuration for batch completion notifications
- [ ] Sandbox mode toggle (live vs test environment switcher)

### v2.0 — Future

- [ ] SSO / SAML login for enterprise insurers
- [ ] Multi-insurer admin portal (DBS internal use)
- [ ] Score explainability report — PDF export per vehicle
- [ ] Policy management system integration templates (Majesco, Mphasis, etc.)
- [ ] Mobile-responsive layout
- [ ] Real-time WebSocket log stream on API Console

---

## 11. Git & Collaboration Guidelines

### Branch Strategy

```
main              ← production-ready only
staging           ← pre-release integration branch
develop           ← active development base

feature/*         ← new features (e.g. feature/batch-upload)
fix/*             ← bug fixes (e.g. fix/gauge-animation)
chore/*           ← tooling, deps, config (e.g. chore/eslint-setup)
```

### PR Rules

- All PRs merge into `develop`, never directly to `main`
- Minimum 1 reviewer approval required
- PR title format: `[SCREEN] Short description` (e.g. `[Lookup] Add error state for 404 response`)
- Link to relevant task/issue in PR description

### What NOT to Commit

```
# .gitignore must include:
.env
.env.local
.env.production
node_modules/
dist/
```

Use `.env.example` with placeholder values for onboarding new devs.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What is the source of violation data — Vahan, NCRB, state RTO APIs, or a proprietary aggregator? | Backend team | Open |
| 2 | Is the TP loading formula fixed by IRDAI regulation or configurable per insurer? | Product / Legal | Open |
| 3 | What is the max CSV batch size — 5,000 rows or higher? | Backend team | Open |
| 4 | Will the call log need to be exportable / auditable for compliance? | Compliance | Open |
| 5 | Do insurers need sub-account isolation (e.g. branch-level vs company-level)? | Product | Open |
| 6 | What is the agreed API rate limit per insurer for MVP? | Platform team | Open |

---

*This PRD is a living document. Update the Status field and version number with each revision. All major scope changes require re-sign-off from product and engineering leads.*
