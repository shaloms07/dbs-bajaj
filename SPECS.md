# Superadmin Portal Specs

## Product Shape

Separate web app for internal users only.  
Recommended stack should stay aligned with the current project:

1. React
2. TypeScript
3. React Router
4. TanStack Query
5. Existing CSS/token approach or shared design tokens extracted from current app

## Design System Alignment

### Typography

1. `DM Sans` for UI text
2. `DM Mono` for metadata, table support text, IDs, audit rows, and technical labels

### Color Tokens

Use these same tokens:

1. `--bg: #f7f8fc`
2. `--surface: #ffffff`
3. `--surface2: #f4f7ff`
4. `--surface3: #e7efff`
5. `--border: rgba(0, 61, 129, 0.1)`
6. `--border2: rgba(0, 61, 129, 0.16)`
7. `--text: #10233f`
8. `--text2: #4d627e`
9. `--text3: #8493a8`
10. `--accent: #005dac`
11. `--accent2: #00478b`
12. `--green: #0b8666`
13. `--amber: #d29b00`
14. `--red: #c92a2a`

### UI Style Rules

1. Sidebar may inherit the same blue gradient family used in the current app.
2. Panels should remain flat, quiet, and operational.
3. Cards should use subtle borders and light shadows.
4. Tables should be dense but readable.
5. Avoid marketing-style hero layouts.

## Route Map

### `/login`

Internal superadmin login page.

### `/dashboard`

Top-level operational overview across all insurers.

### `/insurers`

Tenant directory and account management page.

### `/support-viewer`

Read-only tenant inspection page for issue diagnosis.

### `/admin-ops`

Platform-level admin tools and audit functions.

## Page Specs

### 1. Login Page

#### Components

1. Brand header
2. Login card
3. Username/email input
4. Password input
5. Submit button
6. Error banner
7. Optional MFA placeholder

#### States

1. Idle
2. Submitting
3. Invalid credentials
4. Locked account
5. Success redirect

### 2. Dashboard Page

#### Sections

1. KPI strip
2. Insurer health table
3. Issue summary panel
4. Recent platform events
5. Usage overview chart

#### KPIs

1. Total insurers
2. Active insurers today
3. Total vehicle lookups today
4. API success rate
5. Failed requests
6. Open support alerts

#### Widgets

1. Insurers by status
2. High-error tenants
3. Top usage tenants
4. Recent admin actions

### 3. Insurers Page

#### Table Columns

1. Company name
2. Tenant code
3. Login ID / username
4. Account status
5. Last login
6. Created at
7. Usage snapshot
8. Actions

#### Row Actions

1. View details
2. Edit insurer metadata
3. Reset password
4. Disable / enable account
5. Open support viewer

#### Edit Modal / Drawer

Fields:

1. Company name
2. Username / login ID
3. Status
4. Password reset action
5. Notes

Security requirement:

1. Do not display stored passwords in plain text.
2. Support set/reset password workflows instead.
3. Every credential action must be audited.

### 4. Support Viewer Page

#### Purpose

Allow support/admin users to inspect tenant activity without impersonation by default.

#### Sections

1. Tenant selector
2. Current tenant summary
3. Active user/session summary
4. Current route / screen name
5. Recent API requests
6. Recent errors
7. Recent lookups
8. Client-side event log
9. Optional screenshot/snapshot area if backend support exists

#### Filters

1. Insurer
2. User
3. Time range
4. Error-only toggle

### 5. Admin Operations Page

#### Modules

1. Audit logs
2. Feature flags by insurer
3. Announcement/maintenance banner controls
4. Tenant provisioning actions
5. Read-only environment/config summary

#### Audit Log Columns

1. Timestamp
2. Admin user
3. Action
4. Target insurer
5. Old value / new value summary
6. Result

## Suggested API Surface

These are draft endpoints for the new backend team to confirm.

### Auth

1. `POST /superadmin/auth/login`
2. `POST /superadmin/auth/logout`
3. `POST /superadmin/auth/refresh`

### Dashboard

1. `GET /superadmin/dashboard/summary`
2. `GET /superadmin/dashboard/insurer-health`
3. `GET /superadmin/dashboard/recent-events`

### Insurers

1. `GET /superadmin/insurers`
2. `GET /superadmin/insurers/:insurerId`
3. `PATCH /superadmin/insurers/:insurerId`
4. `POST /superadmin/insurers/:insurerId/reset-password`
5. `POST /superadmin/insurers/:insurerId/disable`
6. `POST /superadmin/insurers/:insurerId/enable`

### Support Viewer

1. `GET /superadmin/support/tenants`
2. `GET /superadmin/support/tenant-session-summary`
3. `GET /superadmin/support/recent-errors`
4. `GET /superadmin/support/recent-api-activity`
5. `GET /superadmin/support/recent-lookups`

### Admin Ops

1. `GET /superadmin/audit-logs`
2. `GET /superadmin/feature-flags`
3. `PATCH /superadmin/feature-flags/:flagId`
4. `POST /superadmin/announcements`
5. `GET /superadmin/system/status`

## Permissions Model

### Roles

1. `superadmin`
2. `support_admin`
3. `ops_admin`

### Basic Access

1. `superadmin`: full access
2. `support_admin`: dashboard, insurers read, support viewer, password reset
3. `ops_admin`: dashboard, admin ops, audit logs, feature flags

## Data / Security Requirements

1. Multi-tenant data must always be scoped intentionally.
2. Credential values must never be returned as plain text after creation.
3. Audit logging is mandatory for:
   - login attempts
   - password resets
   - account status changes
   - feature flag changes
   - admin configuration changes
4. Support viewer must be read-only in v1.
5. Sensitive fields should be masked by default.

## Technical Recommendations

1. Reuse layout patterns from the current app:
   - sidebar nav
   - content shell
   - card/table rhythm
2. Create shared tokens for colors, fonts, spacing, badges, and tables.
3. Use React Query for caching but force fresh fetches on high-signal support screens.
4. Add route guards and session expiry handling similar to the current app.

