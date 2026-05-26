# Superadmin Portal TODO

## Phase 0: Discovery

- Confirm whether the superadmin portal will live in a new repo or monorepo sibling app.
- Confirm backend ownership and whether superadmin APIs already exist.
- Confirm whether “view screen” means:
  - route/activity viewer
  - screenshot viewer
  - live session mirroring
  - impersonation mode
- Confirm auth model: username/password only or MFA-ready.
- Confirm whether insurer credentials are editable usernames plus password reset, or raw credentials are currently stored somewhere.

## Phase 1: Product Setup

- Create new app scaffold for `superadmin-portal`.
- Reuse `React + TypeScript + React Router + TanStack Query`.
- Extract shared visual tokens from the existing insurer dashboard.
- Add global layout shell with sidebar and header.
- Add auth store/session handling.

## Phase 2: Visual Foundation

- Set fonts to `DM Sans` and `DM Mono`.
- Add shared CSS tokens matching the current app:
  - background
  - surfaces
  - text colors
  - accent blues
  - success / warning / error colors
- Build reusable UI primitives:
  - cards
  - KPI tiles
  - tables
  - badges
  - form inputs
  - drawers / modals
  - empty states
  - error states

## Phase 3: Authentication

- Build `/login` page.
- Add login form validation.
- Add loading/error states.
- Add protected routes.
- Add logout flow.
- Add session refresh flow.

## Phase 4: Dashboard

- Build `/dashboard` page shell.
- Add KPI row.
- Add insurer health table.
- Add recent platform events panel.
- Add top usage / high-error tenant summary blocks.
- Add loading, empty, and error states.

## Phase 5: Insurers Page

- Build `/insurers` page.
- Add searchable/filterable insurer table.
- Add insurer details view.
- Add edit insurer modal/drawer.
- Add reset password action.
- Add enable/disable account action.
- Add audit trail hook for each sensitive action.

## Phase 6: Support Viewer

- Build `/support-viewer` page.
- Add tenant selector.
- Add active route/session summary.
- Add recent API activity table.
- Add recent error log list.
- Add recent lookup activity panel.
- Add timestamp filters and user filters.

## Phase 7: Admin Ops

- Build `/admin-ops` page.
- Add audit logs table.
- Add feature flag management.
- Add maintenance announcement controls.
- Add system status / health summary.
- Add read-only config/environment block.

## Phase 8: Security / Hardening

- Ensure passwords are never shown in plain text.
- Add role-based permissions.
- Add audit logging across sensitive actions.
- Add masking for sensitive identifiers where needed.
- Add proper empty/error handling for all pages.

## Phase 9: QA

- Test desktop and mobile responsive behavior.
- Test sidebar and table overflow states.
- Test login/session expiry flows.
- Test password reset flow and permission gating.
- Test support viewer filters and tenant scoping.
- Test audit logging coverage.

## Open Questions

- Should superadmin be able to impersonate a tenant user?
- Should there be multiple internal roles on day one?
- Do we need tenant creation in v1 or only management of existing insurers?
- Should support viewer expose screenshots, logs, or both?
- Is there a need for downloadable audit reports?

## Suggested Deliverables

- `PRD.md`
- `SPECS.md`
- `TODO.md`
- wireframes for 5 core pages
- API contract draft
- shared token/style sheet copied from current app
