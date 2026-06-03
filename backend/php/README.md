# Backend — PHP API endpoints

Upload the **contents** of this folder into your server's
`public_html/intranetprotec/` directory so requests like
`https://luccibyey.com.tn/intranetprotec/auth_login.php` resolve.

## Setup

1. Run `schema.sql` once on the MySQL database `luccybcdb`. Safe to re-run; uses
   `CREATE TABLE IF NOT EXISTS` everywhere.
2. Edit `config.php` if you change the JWT secret or DB credentials.
3. Make `uploads/` writable by the PHP user (only required for attachments).

## Endpoints overview

| File | Methods | Purpose |
|------|---------|---------|
| `auth_login.php`           | POST                   | Login → returns JWT + user |
| `auth_signup.php`          | POST                   | Hidden internal signup (creates user) |
| `auth_me.php`              | GET                    | Returns the current authenticated user |
| `auth_logout.php`          | POST                   | Client-side token discard |
| `health.php`               | GET                    | Liveness check |
| `prospects.php`            | GET / POST / PATCH / PUT / DELETE | Leads CRUD + claim / mark_won / mark_lost / **bulk** (assign, status, check, delete) |
| `contracts.php`            | GET / POST / PATCH / PUT / DELETE | Contracts CRUD + billing/premium edits with audit |
| `users.php`                | GET / POST / DELETE    | Users CRUD with aggregated stats |
| `roles.php`                | GET / PUT              | Role-permission matrix |
| `calendar.php`             | GET / POST / PUT / DELETE | Calendar events CRUD |
| `dashboard.php`            | GET                    | Aggregated KPIs |
| `activity.php`             | GET                    | Activity log (per contract / per entity / global) |
| `custom_fields.php`        | GET / POST / PUT / PATCH / DELETE | Per-entity custom fields definitions |
| `custom_field_values.php`  | GET / POST / PUT / PATCH / DELETE | Stored values for custom fields per record |
| `stages.php`               | GET / POST / PUT / PATCH / DELETE | Configurable lead pipeline stages |
| `notifications.php`        | GET / POST / PATCH / DELETE | In-app notifications (unread count, mark all read) |
| `tasks.php`                | GET / POST / PATCH / DELETE | Task assignment with due dates & priorities |
| `attachments.php`          | GET / POST (multipart) / DELETE | File uploads on prospects/contracts |
| `reports.php`              | GET (`?format=csv`)    | Per-agent KPIs, funnel, monthly revenue, sources |

## Auth model

All endpoints (except `auth_login.php`, `auth_signup.php`, `health.php`) require
`Authorization: Bearer <jwt>`. JWT TTL is 12h, signed HS256 with a secret in
`config.php`. RBAC is enforced inside each handler (e.g. only `Administrateur`
or `Manager` can run bulk lead actions or delete users).

## Conventions

- All responses are JSON `{ success: true, ... }` or `{ success: false, message }`.
- Dates are `YYYY-MM-DD`, datetimes are ISO with `Z`.
- Money is stored as `DECIMAL(10,2)` and returned as a number.
- IDs are short prefixed strings (`P-`, `C-`, `U-`, `T-`, `N-`, `F-`, `S-`, `AT-`).
