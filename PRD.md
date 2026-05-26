# Superadmin Portal PRD

## Overview

Build a separate `Superadmin Portal` above the current insurer dashboard system.  
This portal is for internal operators who manage all insurer tenants using the DBS platform.

The portal should let a superadmin:

1. Sign in securely.
2. View a cross-tenant dashboard for all insurance companies.
3. Manage insurer accounts and credentials.
4. Inspect a tenant's live application state when support issues happen.
5. Handle platform-level admin operations.

The product should feel like the parent control plane for the existing insurer dashboard, not a different brand or design language.

## Goals

1. Give internal admins one place to monitor platform health across all insurers.
2. Reduce turnaround time when an insurer reports login, usage, or application issues.
3. Make tenant administration simple and auditable.
4. Preserve a consistent visual language with the current project.

## Non-Goals

1. Rebuilding the insurer dashboard itself.
2. Adding advanced RBAC beyond a first-pass superadmin/internal-admin model.
3. Implementing direct screen control or remote browser takeover in v1.
4. Creating a customer-facing product.

## Users

### Primary User

Internal superadmin / operations admin.

### Secondary Users

Support staff, platform ops, engineering support, and business operations users with limited internal access.

## Proposed Information Architecture

### 1. Login Page

Purpose:
Secure entry for internal superadmins.

Core elements:

1. Email / username
2. Password
3. Optional MFA placeholder for future support
4. Login error states
5. Branding aligned with current dashboard

### 2. Dashboard Page

Purpose:
Overall view of all insurance companies using the system.

Core content:

1. Total active insurers
2. Total active users / tenants
3. Total lookups today
4. Total API calls today / this month
5. Failed requests / issue alerts
6. Recently active insurers
7. Insurers with elevated failure rates or login issues
8. Quick drill-down into a tenant

### 3. Insurance Companies Page

Purpose:
Manage all insurer tenant accounts.

Core content:

1. Table of insurers
2. Company name
3. Login ID / username
4. Account status
5. Last login
6. API usage summary
7. Action menu

Required actions:

1. View company details
2. Edit login credentials
3. Change / reset password
4. Enable / disable account
5. View tenant-specific usage

Important note:
Plain-text passwords should not be shown in production.  
The UI should support reset/set-password flows, masked values, and audit logging instead of exposing raw passwords.

### 4. Support View / Tenant Screen Viewer

Purpose:
Help internal teams inspect what an insurer user is seeing when they report errors.

V1 recommendation:

1. Provide a `Tenant Session Viewer` page rather than true screen-sharing.
2. Show tenant name, logged-in user, current route/page, recent actions, last API calls, recent errors, and latest lookup context.
3. Show recent browser-side error logs and backend request failures.
4. Include a read-only snapshot timeline if available.

Why this is better for v1:

1. Lower security risk than real remote viewing
2. Easier to build
3. More useful for debugging than just “seeing the screen”

### 5. Admin Operations Page

Purpose:
Handle platform-wide internal controls.

Suggested modules:

1. Audit logs
2. Password reset history
3. Feature flags by insurer
4. Insurer provisioning / activation
5. API health summary
6. Maintenance announcements
7. Environment / configuration viewer for safe read-only metadata

## User Stories

1. As a superadmin, I want to log in securely so that only internal users can access the control plane.
2. As a superadmin, I want to see all insurers in one dashboard so that I can quickly detect issues.
3. As a support admin, I want to reset an insurer login password so that I can restore access quickly.
4. As a support admin, I want to inspect a tenant's recent actions and failures so that I can debug reported issues.
5. As an ops admin, I want to review platform audit logs so that sensitive actions are traceable.

## Success Metrics

1. Time to identify affected insurer after an incident
2. Time to reset access for locked-out tenants
3. Time to diagnose failed lookups or elevated API errors
4. Percentage of admin actions with audit coverage
5. Support resolution time across insurer issues

## UX / Visual Direction

The superadmin portal must visually match the current dashboard family:

1. Primary font: `DM Sans`
2. Mono/support font: `DM Mono`
3. Core palette:
   - Background: `#f7f8fc`
   - Surface: `#ffffff`
   - Accent: `#005dac`
   - Accent dark: `#00478b`
   - Text: `#10233f`
   - Muted text: `#4d627e`, `#8493a8`
   - Success: `#0b8666`
   - Warning: `#d29b00`
   - Error: `#c92a2a`
4. Use the same quiet enterprise aesthetic:
   - clean white surfaces
   - blue-led navigation
   - soft borders
   - compact information density
   - minimal decorative elements

## Risks

1. Exposing raw tenant credentials is a security risk.
2. “View screen” may be interpreted as remote control or live mirroring, which increases compliance and privacy complexity.
3. Multi-tenant data leakage is a high-risk area and must be handled carefully.

## Recommended v1 Scope

Ship these first:

1. Login
2. Dashboard overview
3. Insurer management table
4. Password reset / account edit flow
5. Tenant support viewer based on logs, route state, and recent API activity
6. Admin operations page with audit logs and feature flags

