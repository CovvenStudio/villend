# User Story — Global Feature Flags (Kill Switches)

## Story

**As a** platform administrator,  
**I want to** enable or disable individual product modules globally,  
**So that** I can respond to incidents, perform maintenance, or roll back features without deploying new code.

---

## Background

The platform exposes a set of global feature flags (kill switches) managed via the admin panel. Each flag controls the visibility and accessibility of a specific module for **all agencies and users simultaneously**.

### Flags catalogue

| Key | Module controlled |
|---|---|
| `dashboard.module_enabled` | Dashboard |
| `properties.module_enabled` | Properties |
| `appointments.module_enabled` | Appointments |
| `agents.management_enabled` | Agents |
| `screening.module_enabled` | Screening (Triagem) — entire module |
| `screening.edit_enabled` | Screening — edit permission only |
| `scoring.module_enabled` | Scoring / Qualification |
| `settings.module_enabled` | Settings |
| `billing.module_enabled` | Billing |
| `public_page.custom_branding_enabled` | Public page custom branding |

---

## Acceptance Criteria

### AC1 — Admin can view all flags
- [ ] Authenticated admin navigates to **Feature Flags** page in the admin panel.
- [ ] All 10 flags listed above are visible with their current state (Enabled / Disabled).
- [ ] Each row shows: key, friendly label, state badge, reason, last updated by, last updated at.

### AC2 — Admin can toggle a flag
- [ ] Admin clicks **Disable** on an enabled flag → state changes to Disabled immediately.
- [ ] Admin clicks **Enable** on a disabled flag → state changes to Enabled immediately.
- [ ] Admin can optionally fill in a reason before toggling; it is persisted and shown in the table.
- [ ] If no reason is provided, a sensible default is used automatically.

### AC3 — Disabled module hides from the sidebar menu (frontend)
- [ ] When a module flag is **OFF**, the corresponding menu item disappears for all users.
- [ ] When re-enabled, the menu item reappears without requiring logout/login.

### AC4 — Disabled module blocks the route (frontend)
- [ ] When a user navigates directly to a disabled route (e.g. `/appointments`), they are redirected away.
- [ ] If at least one other module is enabled, the user is redirected to the first accessible route.
- [ ] If **all** modules are disabled, the user is redirected to `/system-unavailable`.

### AC5 — `/system-unavailable` page
- [ ] Page shows an informative message: "System temporarily unavailable".
- [ ] **Try again** button refreshes the flags; if any module becomes enabled, user is redirected automatically.
- [ ] **Sign out** button is shown and logs the user out correctly.
- [ ] Page is accessible without authentication (no redirect loop to `/login`).

### AC6 — Post-login respects flags
- [ ] After login with a single agency, user lands on the **first enabled module**, not always `/dashboard`.
- [ ] If all modules are OFF at login time, user lands on `/system-unavailable`.
- [ ] After selecting an agency on the agency-select screen, same logic applies.

### AC7 — Backend returns 503 for disabled modules
- [ ] API call to a disabled module endpoint returns HTTP **503** with `{ "message": "... temporarily unavailable." }`.
- [ ] Applies to: Properties, Appointments, Agents, Settings, Scoring, Dashboard, Billing, Screening (edit endpoints).
- [ ] Public endpoints (property page, visit booking) are **not** affected by authenticated module flags.

### AC8 — `screening.edit_enabled` is separate from `screening.module_enabled`
- [ ] `screening.module_enabled = OFF` → Triagem menu item hidden, route `/screening` blocked.
- [ ] `screening.module_enabled = ON` + `screening.edit_enabled = OFF` → Triagem is accessible but all fields are **read-only**; save buttons are hidden.
- [ ] `screening.module_enabled = ON` + `screening.edit_enabled = ON` → full edit access (respecting role: AGENT is always read-only regardless).

### AC9 — Flag state refreshes automatically
- [ ] Flags are re-fetched every **30 seconds** while the app is open.
- [ ] Flags are re-fetched when the browser tab regains **focus**.
- [ ] No page reload required for changes to take effect within the refresh interval.

### AC10 — Seeding on startup
- [ ] On backend startup, any **missing** flags are seeded with `enabled = true` (fail-open default).
- [ ] Legacy key `dashboard.insights_enabled` is automatically migrated to `dashboard.module_enabled`.
- [ ] Retired key `leads.module_enabled` is automatically deleted from the database.

---

## Out of Scope

- Per-agency flag overrides (flags are global only).
- Flag scheduling (timed enable/disable).
- Audit log of flag changes (beyond the `updatedBy` / `reason` fields already stored).

---

## Test Scenarios (Happy + Edge paths)

| # | Scenario | Expected result |
|---|---|---|
| T1 | Disable `dashboard.module_enabled` → open app | Lands on `/properties` (or next enabled module) |
| T2 | Disable all modules → log in | Lands on `/system-unavailable` |
| T3 | On `/system-unavailable`, re-enable any module → click Try again | Auto-redirected to that module |
| T4 | Disable `appointments.module_enabled` → call `GET /api/agencies/{id}/appointments` | Returns 503 |
| T5 | Disable `screening.module_enabled` → navigate to `/screening` | Redirected away |
| T6 | Disable `screening.edit_enabled` only → navigate to `/screening` | Page loads in read-only mode |
| T7 | Admin toggles flag with a reason → check table | Reason and updatedBy are displayed |
| T8 | Disable flag in admin → wait 30 s (or switch tabs) | Menu item disappears automatically |
| T9 | Restart backend with a new flag key not yet in DB | Flag is seeded as enabled |
| T10 | AGENT role + `screening.edit_enabled = ON` | Still read-only (role overrides flag) |
