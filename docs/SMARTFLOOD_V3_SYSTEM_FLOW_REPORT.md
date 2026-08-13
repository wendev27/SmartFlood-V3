# SmartFlood V3 System Flow Report

## Executive Summary

SmartFlood V3 is split into a Next.js TypeScript frontend/admin dashboard in `Frontend/` and a standalone FastAPI AI backend in `Backend/`. The frontend is the admin-facing application and also owns several Next.js API routes for authentication, RBAC-aware Supabase reads/writes, MongoDB sensor reads, audit logs, and proxying AI generation requests to the deployed backend. The backend is focused on AI-optimized relief recommendations: it reads MongoDB sensor snapshots and Supabase family vulnerability counts, computes fuzzy flood risk and AHP-inspired priority scores, saves allocation rows to Supabase, and logs AI generation events.

The admin dashboard is hash-routed inside `/dashboard` rather than separate Next.js pages for each module. Role-specific navigation is computed on the client, while many server routes also validate the signed dashboard cookie and enforce RBAC or barangay scope. The system currently mixes strong server-side guards on resident/sensor/log routes with weaker or missing route-level RBAC on some account and application routes.

Important terminology note: the backend public AI response uses `Severity` for the highest flood category and normalizes old `critical` values. The current frontend status helper normalizes `critical` to the internal `severity` class, but its user-facing label returns `Severe`, not `Severity`.

## Architecture Diagram

```text
Browser
  |
  | login form, localStorage smartflood_session
  | HTTP-only cookie smartflood_dashboard_session
  v
Frontend / Next.js on Vercel
  |
  | Client modules under src/components/*
  | Services under src/services/*
  | API routes under src/app/api/*
  |
  +--> Supabase
  |      app_users, roles, barangays
  |      residents_v3, families, resident_applications
  |      ai_recommendations, relief_inventory, audit_logs
  |
  +--> MongoDB Atlas
  |      sensors
  |      sensor_readings
  |
  +--> FastAPI AI Backend on Heroku
         POST /api/ai/recommendations/generate
         GET  /api/ai/recommendations
         GET/POST /api/relief/inventory
         |
         +--> MongoDB Atlas sensor snapshot
         +--> Supabase families, ai_recommendations, audit_logs
```

## Project Structure

Root:

- `README.md`: minimal root heading only.
- `package.json`: root package metadata.
- `Frontend/`: Next.js 16 + React 19 + TypeScript admin dashboard and API routes.
- `Backend/`: FastAPI standalone AI backend intended for Heroku.
- `docs/`: documentation folder; this report is the only added file.

Frontend important folders:

- `Frontend/src/app/page.tsx`: login page entry.
- `Frontend/src/app/dashboard/page.tsx`: admin dashboard shell and hash-based module router.
- `Frontend/src/app/api/*`: Next.js API routes for auth, sensors, residents, applications, app users, families, logs, relief inventory, AI recommendation history, AI generation proxy, health, and simulator.
- `Frontend/src/components/*`: module UIs for dashboard, monitoring, sensors, relief, residents, verification, logs, layout, map, and shared UI.
- `Frontend/src/services/*`: client-side API wrappers.
- `Frontend/src/lib/*`: auth/session helpers, Supabase/MongoDB clients, audit helpers, RBAC/barangay scoping, sensor mapping, formatting, and flood status normalization.
- `Frontend/src/data/navigation.ts`: role-based sidebar item definitions.

Backend important folders:

- `Backend/app/main.py`: FastAPI app, routes, CORS, response shaping.
- `Backend/app/engine.py`: fuzzy risk, AHP-inspired scoring, barangay grouping, inventory allocation.
- `Backend/app/repositories.py`: MongoDB and Supabase repository implementation.
- `Backend/app/models.py`: Pydantic request/response models.
- `Backend/app/payloads.py`: integer-safe persistence payload shaping.
- `Backend/app/audit.py`: best-effort audit log sanitization.
- `Backend/app/config.py`: environment loading and validation.
- `Backend/tests/*`: unit tests for audit, payloads, and recommendation engine.

## Frontend Admin Dashboard Flow

### Dashboard

- Purpose: live overview of sensor nodes, severe-alert count, map, and sensor cards.
- Main files: `src/app/dashboard/page.tsx`, `components/dashboard/DashboardPanel/DashboardPanel.tsx`, `components/dashboard/MapPanel/MapPanel.tsx`, `components/map/SensorLeafletMap.tsx`.
- Services/API: `services/sensorsService.ts` calls `GET /api/sensors/latest`.
- Data source: MongoDB `sensors` plus latest `sensor_readings`, normalized by `src/app/api/sensors/latest/route.ts`.
- User actions: view sensor cards, filter severe-only sensors, select a sensor, jump to sensor history.
- Expected output: map markers/cards with sensor name, barangay, status, water level, normalized flood label, and updated timestamp.

### Flood Monitoring Module

- Purpose: entry point for alert-level reference, heatmap/current flood analysis, and historical flood records.
- Main file: `components/monitoring/MonitoringPanel/MonitoringPanel.tsx`.
- Services/API: `services/floodService.ts` calls `GET /api/sensors/latest` and `GET /api/sensors/history?limit=100`.
- Data source: MongoDB `sensors` and `sensor_readings`.
- User actions: open Alert Level Management, Flood Heatmap, Flood History; filter history by date/group/barangay/sensor/level/search; review narrative report.
- Expected output: threshold cards, current heatmap, current risk distribution, narrative report, grouped timeline chart, and tabulated flood history.

### Sensor History

- Purpose: view live sensor network in a map plus a tabulated sensor list.
- Main file: `components/sensors/SensorsPanel/SensorsPanel.tsx`.
- Services/API: `services/sensorsService.ts` -> `GET /api/sensors/latest`.
- Data source: MongoDB latest sensor snapshot.
- User actions: filter by sensor ID, barangay, status, and alert level; click a row to focus the map.
- Expected output: table rows with sensor ID, barangay, coordinates, status, latest reading, and flood label.

### AI-Optimized Relief Recommendation

- Purpose: generate and review AI allocation suggestions based on flood risk, family vulnerability, and available relief inventory.
- Main file: `components/relief/ReliefPanel/ReliefPanel.tsx`.
- Services/API: `services/reliefService.ts` calls `GET /api/ai/recommendations`, `POST /api/ai/recommendations/generate`, and has helpers for `/api/relief/inventory`.
- Data source: Supabase `ai_recommendations` for history; FastAPI backend for generation; backend reads MongoDB and Supabase `families`.
- User actions: open generation modal, enter `family_food_packs`, `medicine_kits`, `relief_goods_individual`, generate recommendations, view recommendation details, filter/sort/search allocation history.
- Expected output: current barangay recommendation cards, allocation history, detailed modal with fuzzy explanation, AHP score, reasoning steps, and inventory-constraint explanation when returned.

### Resident Information

- Purpose: manage resident records and family clusters.
- Main file: `components/residents/ResidentsPanel/ResidentsPanel.tsx`.
- Services/API: direct `fetchJson` calls to `GET/POST /api/residents`, `PATCH /api/residents/[id]`, and `GET /api/families`.
- Data source: Supabase `residents_v3` and `families`.
- User actions: search residents/families, add resident, edit resident, create family-head resident, select existing family for non-head residents, view family cluster details.
- Expected output: resident table, family cluster table, resident form, family detail modal, and refreshed resident/family rows after save.

### Resident Account Registration Management

- Purpose: review resident applications and approve/reject them into resident records.
- Main file: `components/verification/VerificationPanel/VerificationPanel.tsx`.
- Services/API: `GET /api/resident-applications`, `PATCH /api/resident-applications/[id]/review`.
- Data source: Supabase `resident_applications`, `residents_v3`, `families`.
- User actions: switch pending/approved/rejected tabs, open review modal, approve or reject an application.
- Expected output: application cards by status; approved family-head applications create a resident and family cluster; approved non-head applications create a resident linked to a selected family; rejected applications only update review fields.

### Account Management

- Purpose: manage dashboard accounts and RBAC settings.
- Main files: `components/logs/LogsPanel/LogsPanel.tsx`, `components/logs/AccountManagement/AccountManagement.tsx`.
- Services/API: `services/logsService.ts` -> `GET /api/app-users`; form actions call `POST /api/app-users`, `PATCH /api/app-users/[id]`, `PATCH /api/app-users/[id]/status`, `PATCH /api/app-users/[id]/password`.
- Data source: Supabase `app_users`, `barangays`.
- User actions: search/filter accounts, create account, preview account, edit account, change password, enable/disable/block/unblock.
- Expected output: account table and account modals; passwords are hashed server-side and not returned.

### Logs

- Purpose: role-scoped audit log visibility.
- Main files: `components/logs/SystemLogs/SystemLogs.tsx`, `components/logs/AuditLogs/AuditLogs.tsx`, `components/logs/LogsPanel/LogsPanel.tsx`.
- Services/API: `services/logsService.ts` -> `GET /api/logs?limit=300`.
- Data source: Supabase `audit_logs`.
- User actions: search logs, filter by module/action, preview log details.
- Expected output: System Logs for Super Admin, Barangay Logs for Barangay Admin, CSWDD Logs for CSWDD Admin, and CDRRMO Logs for CDRRMO Admin.

## Authentication and RBAC

Login flow:

1. `LoginPage.tsx` posts email/password to `POST /api/auth/login`.
2. The route reads `app_users` by email, checks `status`, `locked_until`, `failed_login_attempts`, and bcrypt `password_hash`.
3. Failed login increments `failed_login_attempts`; after 3 failures it sets `locked_until` and `status: blocked`.
4. Successful login resets failed attempts, updates `last_login_at`, logs `LOGIN_SUCCESS`, returns a sanitized user, and sets the signed HTTP-only cookie `smartflood_dashboard_session`.
5. The client stores the sanitized user in localStorage under `smartflood_session`.
6. `/dashboard` reads `smartflood_session`, normalizes the role, and renders role-specific modules.

Logout flow:

- `POST /api/auth/logout` reads the signed cookie, fetches the `app_users` row, logs `LOGOUT`, and clears `smartflood_dashboard_session`.
- Client session clearing is handled by `clearStoredSession()` when called by UI logic. It removes `smartflood_session` and legacy keys.

Session keys:

- Browser storage key: `smartflood_session`.
- HTTP-only cookie: `smartflood_dashboard_session`.
- Legacy keys cleared: `smartflood:user`, `smartfloodUser`, `smartflood:userProfile`, `smartflood_user`, `currentUser`, `user`, `authUser`, `session`.

Role mapping:

| role_id | Backend/app mapping | Dashboard normalized role                   | User-facing labels in code                                         |
| ------: | ------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
|       1 | `SUPER_ADMIN`       | `super`                                     | `Super Admin`                                                      |
|       2 | `NDRRMO_OFFICER`    | `cdrrmo` if role text matches CDRRMO/NDRRMO | `NDRRMO Officer`, sometimes requested/documented as `CDRRMO Admin` |
|       3 | `CITY_WELFARE`      | `cswdd`                                     | `City Welfare`, `CSWDD Admin`                                      |
|       4 | `BARANGAY_OFFICIAL` | `barangay`                                  | `Barangay Official`, `Barangay Admin`                              |

Sidebar/module access:

| Module                                   | Super Admin | CDRRMO/NDRRMO | CSWDD/City Welfare | Barangay Admin |
| ---------------------------------------- | ----------: | ------------: | -----------------: | -------------: |
| Dashboard                                |         Yes |           Yes |                Yes |            Yes |
| Flood Monitoring Module                  |         Yes |           Yes |                Yes |            Yes |
| Sensor History                           |         Yes |           Yes |                 No |            Yes |
| AI-Optimized Relief Recommendation       |         Yes |            No |                Yes |             No |
| Resident Information                     |         Yes |            No |                Yes |            Yes |
| Resident Account Registration Management |         Yes |            No |                 No |            Yes |
| Account Management                       |         Yes |            No |                 No |             No |
| System/Role Logs                         |         Yes |   CDRRMO Logs |         CSWDD Logs |  Barangay Logs |

Barangay scoping:

- `barangayScope.ts` compares `barangay_id` first, then normalized barangay names.
- Known barangays are hardcoded as IDs 1-3: Tanong, Catmon, Potrero.
- `sensorScope.ts` gives Super Admin and CDRRMO/NDRRMO all sensors. Barangay officials see only same-barangay sensors. Other roles currently receive all sensors if they can reach the sensor call, but navigation hides sensors from CSWDD.
- Resident and family routes apply server-side barangay filtering for Barangay users.
- Logs are server-filtered by `filterLogsForViewer()` and then filtered again in `SystemLogs.tsx`.

## Supabase Database Flow

| Table                   | Purpose                                                       | Main columns used                                                                                                                                                                                                                                                                       | API routes                                                                                                                                     | Relationships/CRUD                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app_users`             | Dashboard/admin accounts and auth source                      | `id`, `first_name`, `last_name`, `email`, `mobile_number`, `address`, `profile_image`, `barangay`, `sex`, `role_id`, `barangay_id`, `status`, `password_hash`, `failed_login_attempts`, `locked_until`, `last_login_at`, timestamps                                                     | `/api/auth/login`, `/api/auth/logout`, `/api/app-users*`, `dashboardViewer.ts`                                                                 | Role is represented by `role_id`; optional `barangay_id` scopes Barangay users. Create/update/status/password actions write this table.                                               |
| `roles`                 | Conceptual RBAC lookup                                        | Not directly queried by current code; role IDs are hardcoded in `appUserMapping.ts` and login route                                                                                                                                                                                     | None in current inspected code                                                                                                                 | Risk: app behavior can drift from DB `roles` if table labels change.                                                                                                                  |
| `barangays`             | Barangay name lookup for app users                            | `id`, `barangay_id`, `name`, `barangay_name`                                                                                                                                                                                                                                            | `/api/app-users`                                                                                                                               | Used to resolve `barangay_name` for account rows. Several other flows use hardcoded barangay maps.                                                                                    |
| `residents_v3`          | Approved/live resident records                                | `resident_id`, names, `age`, `sex`, `contact_number`, `complete_address`, `street`, `barangay_id`, `barangay_name`, `is_family_head`, `family_id`, `status`, `source`, `application_id`, `created_by`, timestamps                                                                       | `/api/residents`, `/api/residents/[id]`, `/api/resident-applications/[id]/review`                                                              | Family heads are linked to a newly created `families` row; non-head residents require `family_id`. Delete is soft-deactivate via `status: inactive`.                                  |
| `families`              | Family clusters and family-level vulnerability counts for AHP | `family_id`, `family_name`, `family_head_id`, `family_head_name`, `barangay_id`, `barangay_name`, `street`, `complete_address`, `pwd_count`, `elderly_count`, `four_ps_count`, `lactating_count`, `pregnant_count`, `infant_count`, `toddler_count`, `total_family_members`, timestamps | `/api/families`, `/api/residents`, `/api/residents/[id]`, `/api/resident-applications/[id]/review`, Backend `/api/ai/recommendations/generate` | Created when a family-head resident/application is approved or manually added. AHP uses these family-level counts, not individual resident flags.                                     |
| `resident_applications` | Pending/approved/rejected registration applications           | `application_id`, resident fields, `is_family_head`, family fields/counts, `selected_family_id`, `family_id`, `status`, `admin_review_notes`, `reviewed_by`, `reviewed_at`, timestamps                                                                                                  | `/api/resident-applications`, `/api/resident-applications/[id]/review`                                                                         | Approval creates `residents_v3`; family-head approval also creates `families`; rejection only updates review status fields.                                                           |
| `ai_recommendations`    | Saved AI allocation output/history                            | `recommendation_id`, `barangay_id`, `barangay_name`, `risk_level`, `priority_score`, `affected_families`, allocation columns, `analysis_reason`, `created_at`                                                                                                                           | Frontend `/api/ai/recommendations`; Backend list/generate routes                                                                               | Backend saves generated rows. Current persistence payload does not include `ahp_breakdown`, `fuzzy_explanation`, or `reasoning_steps`, even though generation responses include them. |
| `relief_inventory`      | Available inventory snapshots if used                         | `family_food_packs`, `medicine_kits`, `relief_goods_individual`, `updated_by`, `created_at`, `inventory_id` or `id`                                                                                                                                                                     | Frontend `/api/relief/inventory`; Backend `/api/relief/inventory`                                                                              | Current Relief UI generates from modal input and does not require saved inventory first. Inventory endpoints still exist and audit updates.                                           |
| `audit_logs`            | Activity/audit trail                                          | `actor_user_id`, `actor_name`, `actor_role`, `action`, `module`, `description`, `target_type`, `target_id`, `barangay_id`, `barangay_name`, `created_at`                                                                                                                                | `/api/logs`, `auditLogger.ts`, Backend `repositories.py`                                                                                       | Written by auth, account, resident, application, inventory, and AI generation flows. Read with role filtering.                                                                        |

## MongoDB Sensor Flow

Database name:

- `MONGODB_DB` is required by both frontend Next.js API routes and backend FastAPI. The example backend env names `CapstoneDatabase`, but production should use the value configured in Vercel/Heroku.

Collections:

- `sensors`: sensor metadata.
- `sensor_readings`: reading history.

`sensors` structure used by the app:

- IDs: `_id`, `sensorId`, `sensor_id`, `sensor_id_string`.
- Labels/location: `name`, `barangay`, `barangayName`, `street`.
- Coordinates: `location.lat/lng`, `location.latitude/longitude`, `geo.coordinates`, root `lat/lng`, root `latitude/longitude`.
- Status/timing: `status`, `lastSeenAt`, `updatedAt`.

`sensor_readings` structure used by the app:

- Sensor link: `sensorId`, `sensor_id`, `sensor_id_string`, nested `sensor._id`, or `_id` as fallback.
- Readings: `waterLevelM`, `waterLevel`, `distanceCm`, `rainfallMm`, `batteryPct`.
- Status: `computedStatus`, `status`.
- Timing: `createdAt`, `updatedAt`.

Latest readings:

- Frontend route `GET /api/sensors/latest` reads all valid `sensors`, aggregates `sensor_readings` by latest `createdAt` per `sensorId`, maps sensor metadata plus latest reading into a normalized response, and filters by viewer scope.
- Backend `DatabaseRepository.get_sensor_snapshot()` performs a similar latest-reading aggregate for AI generation.

History:

- `GET /api/sensors/history` reads valid sensors, builds aliases for each, reads all `sensor_readings` sorted descending, matches readings to in-scope sensors, optionally filters by `sensorId` or `barangay`, and caps results per sensor.

Barangay mapping:

- Frontend `sensorMapping.ts` maps IDs and names for Barangay Tañong/Tanong, Catmon, and Potrero.
- Backend `engine.py` contains its own `KNOWN_BARANGAYS` and `BARANGAY_ALIASES`, currently using Tanong, Catmon, and Potrero.
- Duplicate mapping logic exists between frontend and backend.

Severity/flood status:

- Frontend `statusStyles.ts` classifies by water level: `<0.25m Normal`, `>=0.25m Flood Alert`, `>=0.75m Flood Warning`, `>=1.2m severity`.
- It normalizes text containing `critical`, `severe`, or `severity` to internal `severity`.
- Current frontend label for `severity` is `Severe`; backend public label is `Severity`.
- `No reading` is used when water level/status is missing or unknown.

## Resident and Family Logic

Manual Add Resident:

- UI opens the resident modal from `ResidentsPanel`.
- Super Admin can choose barangay; Barangay users are locked to their assigned barangay.
- Required fields include names, age, sex, mobile number, address, barangay, and family setting.
- If `is_family_head` is true, the API creates a `residents_v3` row, creates a `families` row with vulnerability counts, updates the family with `family_head_id/family_head_name`, then updates the resident with `family_id`.
- If `is_family_head` is false, the user must select an existing family cluster. The API validates that the selected family belongs to the same barangay before creating the resident.

Edit Resident:

- `PATCH /api/residents/[id]` permits Super Admin and Barangay users.
- Barangay users can only edit same-barangay residents.
- Allowed resident fields are whitelisted.
- If the edited resident is a family head and has a family, the route also updates the corresponding `families` row and vulnerability counts.

Family Head logic:

- Family-head records own the family-level vulnerability counts.
- Family name defaults to `<last_name> Family` for manual add or application-provided `family_name` for application approval.
- Family head link is established by updating both `families.family_head_id` and `residents_v3.family_id`.

Non-family-head logic:

- Non-head residents cannot be submitted without `selected_family_id` or `family_id`.
- The selected family must match the resident barangay.
- Non-head residents do not update family vulnerability counts.

Family Cluster behavior:

- `GET /api/families` lists family clusters and allows search/barangay filters.
- Barangay users receive only same-barangay clusters.
- UI can open a family detail modal showing counts and connected residents.

Vulnerability count storage:

- Counts are stored on `families`: `pwd_count`, `elderly_count`, `four_ps_count`, `lactating_count`, `pregnant_count`, `infant_count`, `toddler_count`, `total_family_members`.
- AHP uses family-level counts because the backend groups `families` by barangay and sums those count columns. It does not scan individual residents for vulnerability flags.

Application approve/reject:

- `PATCH /api/resident-applications/[id]/review` accepts `action: approved` or `rejected`.
- Rejected applications update `status`, `admin_review_notes`, `reviewed_by`, and `reviewed_at`.
- Approved family-head applications create resident + family + cross-links, then update application review fields.
- Approved non-family-head applications require a family ID and create a linked resident, then update application review fields.

## AI Recommendation Flow

### Frontend / Next.js

- UI file: `components/relief/ReliefPanel/ReliefPanel.tsx`.
- Service file: `services/reliefService.ts`.
- History route: `GET /api/ai/recommendations`.
- Generation route: `POST /api/ai/recommendations/generate`.
- The generate modal collects available inventory: `family_food_packs`, `medicine_kits`, `relief_goods_individual`.
- `withAuditActor()` injects `audit_actor` from the browser session: `actor_user_id`, `actor_name`, `actor_role`, `barangay_id`, `barangay_name`.
- The Next.js generate route validates that at least one inventory value is greater than zero, then proxies to `${AI_BACKEND_URL}/api/ai/recommendations/generate`, falling back to `NEXT_PUBLIC_AI_BACKEND_URL` if present.
- After generation, the UI fetches history again and updates current cards plus allocation history.

### Backend / FastAPI

- Main file: `Backend/app/main.py`.
- Engine file: `Backend/app/engine.py`.
- Repository file: `Backend/app/repositories.py`.
- Deployed URL is supplied to the frontend as `AI_BACKEND_URL`.
- Route: `POST /api/ai/recommendations/generate`.

Backend generation steps:

1. Validate inventory total is greater than zero.
2. Read MongoDB `sensors` and latest grouped `sensor_readings`.
3. Read Supabase `families` with barangay and vulnerability count fields.
4. Group sensors/readings by known barangays.
5. Group family counts by barangay.
6. Compute fuzzy flood risk from water level.
7. Compute AHP-inspired vulnerability score from family count weights.
8. Compute `priority_score = risk_weight * 100 + vulnerability_score + total_family_members`.
9. Allocate food packs, medicine kits, and individual goods using inventory-constrained priority distribution.
10. Save recommendations to Supabase `ai_recommendations`.
11. Log `AI_RECOMMENDATION_GENERATED` to `audit_logs`.
12. Return generated rows merged with saved row IDs/timestamps.

Fuzzy logic:

- Normal below alert threshold.
- Flood Alert starts around `0.25m`.
- Flood Warning starts around `0.75m`.
- Severity starts around `1.2m`.
- Response includes memberships, risk label, confidence, and water level.

AHP-inspired weights:

| Factor    | Weight |
| --------- | -----: |
| infant    |   0.22 |
| elderly   |   0.20 |
| pwd       |   0.18 |
| pregnant  |   0.12 |
| lactating |   0.10 |
| toddler   |   0.10 |
| four_ps   |   0.08 |

Current generation response fields:

- `risk_level`
- `ahp_breakdown`
- `fuzzy_explanation`
- `reasoning_steps`
- plus recommendation ID, barangay, priority score, affected families, allocations, analysis reason, status, creator, and timestamp.

Persistence limitation:

- `payloads.recommendation_rows_to_save()` currently saves core allocation fields only. It does not persist `ahp_breakdown`, `fuzzy_explanation`, or `reasoning_steps`.
- Frontend `GET /api/ai/recommendations` also selects only core allocation fields. Detailed AI explanation is therefore strongest immediately after generation, not necessarily in historical rows.

## Audit Logging Flow

Table:

- `audit_logs` stores actor, action, module, description, target, barangay, and timestamp fields.

Common logged actions:

- Authentication: `LOGIN_FAILED`, `LOGIN_DENIED`, `LOGIN_BLOCKED`, `LOGIN_SUCCESS`, `LOGOUT`.
- Account management: `ACCOUNT_CREATED`, `ACCOUNT_UPDATED`, `ACCOUNT_STATUS_CHANGED`, `ACCOUNT_PASSWORD_CHANGED`.
- Resident information: `RESIDENT_CREATED`, `RESIDENT_UPDATED`, `RESIDENT_DEACTIVATED`, `FAMILY_UPDATED`.
- Applications: `APPLICATION_SUBMITTED`, `APPLICATION_APPROVED`, `APPLICATION_REJECTED`.
- Relief inventory: `RELIEF_INVENTORY_UPDATED`.
- AI generation: `AI_RECOMMENDATION_GENERATED`.

Logging implementation:

- Frontend routes use `logAuditEvent()` in `src/lib/auditLogger.ts`.
- Client-side action bodies use `withAuditActor()` to attach actor metadata.
- Backend uses `log_audit_event_safely()` and repository insertion into `audit_logs`.

Role-based log filtering:

- `GET /api/logs` requires a valid dashboard viewer cookie, reads up to 500 recent audit rows, applies query filters, then calls `filterLogsForViewer()`.
- Super Admin sees all logs.
- Barangay users see same-barangay logs, except authentication logs are limited to their own.
- CSWDD users see own logs, CSWDD/City Welfare actor logs, or CSWDD scoped logs.
- CDRRMO/NDRRMO users see own logs, disaster/CDRRMO scoped logs, and modules like flood monitoring, heatmap, flood history, and sensor history.
- `SystemLogs.tsx` additionally filters logs client-side using the same helper.

## API Route Map

Frontend Next.js routes:

| Route                                    | Method       | Purpose                                   | Data source                                                                |
| ---------------------------------------- | ------------ | ----------------------------------------- | -------------------------------------------------------------------------- |
| `/api/health`                            | GET          | Health response                           | None                                                                       |
| `/api/auth/login`                        | POST         | Login, bcrypt check, cookie, audit        | Supabase `app_users`, `audit_logs`                                         |
| `/api/auth/logout`                       | POST         | Logout audit and cookie clear             | Supabase `app_users`, `audit_logs`                                         |
| `/api/sensors/latest`                    | GET          | Latest sensor snapshot                    | MongoDB `sensors`, `sensor_readings`                                       |
| `/api/sensors/history`                   | GET          | Sensor reading history                    | MongoDB `sensors`, `sensor_readings`                                       |
| `/api/sensors/simulate`                  | POST         | Manual simulator for `SNS-002`, `SNS-003` | MongoDB `sensors`, `sensor_readings`                                       |
| `/api/residents`                         | GET/POST     | List/create residents                     | Supabase `residents_v3`, `families`, `audit_logs`                          |
| `/api/residents/[id]`                    | PATCH/DELETE | Update/soft-delete resident               | Supabase `residents_v3`, `families`, `audit_logs`                          |
| `/api/families`                          | GET          | List family clusters                      | Supabase `families`                                                        |
| `/api/resident-applications`             | GET/POST     | List/submit applications                  | Supabase `resident_applications`, `audit_logs`                             |
| `/api/resident-applications/[id]/review` | PATCH        | Approve/reject application                | Supabase `resident_applications`, `residents_v3`, `families`, `audit_logs` |
| `/api/app-users`                         | GET/POST     | List/create dashboard accounts            | Supabase `app_users`, `barangays`, `audit_logs`                            |
| `/api/app-users/[id]`                    | PATCH        | Update account fields                     | Supabase `app_users`, `audit_logs`                                         |
| `/api/app-users/[id]/status`             | PATCH        | Enable/disable/block account              | Supabase `app_users`, `audit_logs`                                         |
| `/api/app-users/[id]/password`           | PATCH        | Change account password                   | Supabase `app_users`, `audit_logs`                                         |
| `/api/logs`                              | GET/POST     | Read or write audit logs                  | Supabase `audit_logs`                                                      |
| `/api/relief/inventory`                  | GET/POST     | Inventory snapshots                       | Supabase `relief_inventory`, `audit_logs`                                  |
| `/api/ai/recommendations`                | GET          | AI allocation history                     | Supabase `ai_recommendations`                                              |
| `/api/ai/recommendations/generate`       | POST         | Proxy generation to Heroku backend        | FastAPI backend                                                            |

Backend FastAPI routes:

| Route                              | Method | Purpose                                      |
| ---------------------------------- | ------ | -------------------------------------------- |
| `/health`                          | GET    | Backend health                               |
| `/api/ai/recommendations`          | GET    | List saved recommendations from Supabase     |
| `/api/ai/recommendations/generate` | POST   | Generate, save, and audit AI recommendations |
| `/api/relief/inventory`            | GET    | List saved inventory snapshots               |
| `/api/relief/inventory`            | POST   | Save inventory snapshot and audit            |

## Environment Variables

Frontend/Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`: required by server and browser Supabase clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: required by `supabaseClient.ts` if the browser client is used.
- `SUPABASE_SERVICE_ROLE_KEY`: required only on server-side Next.js API routes. Never expose to client components.
- `SMARTFLOOD_SESSION_SECRET`: recommended for signing `smartflood_dashboard_session`; if absent, `SUPABASE_SERVICE_ROLE_KEY` is used as fallback.
- `MONGODB_URI`: required by Next.js sensor API routes.
- `MONGODB_DB`: required by Next.js sensor API routes.
- `AI_BACKEND_URL`: preferred Heroku backend base URL, without trailing slash.
- `NEXT_PUBLIC_AI_BACKEND_URL`: fallback currently supported by the proxy, but server-only `AI_BACKEND_URL` is safer.

Backend/Heroku:

- `MONGODB_URI`: MongoDB Atlas connection string.
- `MONGODB_DB`: database name.
- `SUPABASE_URL`: Supabase project URL. Backend also accepts `NEXT_PUBLIC_SUPABASE_URL` fallback.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for backend reads/writes.
- `CORS_ORIGINS`: comma-separated frontend origins, defaulting to `http://localhost:3000`.

Security notes:

- `.env.local` and `.env` must not be committed.
- Service role keys must never be exposed to client components or `NEXT_PUBLIC_*` variables.
- The inspected `Backend/.env.example` contains real-looking MongoDB/Supabase values and should be treated as a credential exposure risk. It should be rotated and replaced with placeholders.

## Deployment Flow

Frontend on Vercel:

1. Deploy `Frontend/` as the Next.js app.
2. Configure Supabase, MongoDB, session secret, and `AI_BACKEND_URL` in Vercel environment variables.
3. The browser calls Next.js routes on Vercel; those routes use service credentials server-side.
4. AI generation calls go from Vercel Next.js route to Heroku FastAPI route.

AI backend on Heroku:

1. Deploy `Backend/` with `Procfile`.
2. Configure `MONGODB_URI`, `MONGODB_DB`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGINS` as Heroku config vars.
3. Verify health at `/health`.
4. Verify logs with:

```bash
heroku logs --tail -a smartflood-ai-backend
```

## Severity Terminology

Requested user-facing labels:

- Normal
- Flood Alert
- Flood Warning
- Severity
- No reading

Current observed behavior:

- Backend public response maps `severity` to `Severity`.
- Backend replaces `critical` text with `Severity/severity`.
- Frontend internal class is `severity`.
- Frontend `getFloodStatusLabel()` currently returns `Severe`, and multiple UI strings/options also show `Severe`.
- Backend/database may still contain old `critical` values; frontend normalizes those into `severity`.

## Known Limitations and Risks

- Some route-level RBAC is incomplete. App-user and resident-application API routes do not consistently call `getDashboardViewer()` before sensitive operations.
- Some scoping is duplicated client-side and server-side. Client-side filtering should not be relied on as a security boundary.
- `roles` table is not currently queried; role labels are hardcoded in frontend helper files and login logic.
- Barangay mappings are duplicated and hardcoded in frontend, backend, and account/resident UI.
- The frontend and backend both implement sensor/latest reading logic, increasing drift risk.
- AI generation returns detailed explanation fields, but saved recommendation rows and frontend historical reads currently keep only core fields.
- `relief_inventory` endpoints exist, but the active recommendation UI generates from modal input rather than necessarily using saved inventory state.
- Current UI terminology still uses `Severe` in several places instead of requested `Severity`.
- Backend `.env.example` appears to contain real credentials and should be remediated immediately.
- MongoDB simulator route writes directly to `sensor_readings` for demo sensors and should not be exposed broadly in production.
- Account lockout sets `status: blocked`; unblocking through Account Management resets failed attempts when status becomes active.
- The system depends on demo barangay IDs 1-3 and may need a broader dynamic barangay source for production scale.

## Testing Checklist

- Login succeeds for active accounts and creates both `smartflood_session` and `smartflood_dashboard_session`.
- Invalid passwords increment failed attempts and block after three failures.
- Logout clears the signed cookie and writes `LOGOUT`.
- Sidebar modules match the RBAC matrix for each role.
- Barangay Admin sees only assigned-barangay residents, families, sensors, and logs.
- Dashboard and Sensor History load latest MongoDB sensor data and refresh every 5 seconds.
- Flood History returns expected records, date filters, grouping, and severity labels.
- Resident add/edit creates or updates family clusters correctly for family heads.
- Non-family-head resident cannot save without a same-barangay family.
- Application approval creates the correct `residents_v3` and `families` rows.
- Account create/edit/status/password actions write audit logs and never expose password hashes.
- AI generation fails cleanly with zero inventory.
- AI generation succeeds when `AI_BACKEND_URL` is set and backend env vars are valid.
- AI generation creates `ai_recommendations` rows and writes `AI_RECOMMENDATION_GENERATED`.
- System Logs filter correctly for Super Admin, CSWDD, CDRRMO/NDRRMO, and Barangay users.
- Vercel env vars and Heroku config vars are set separately and no service role key reaches client code.

## Suggested Future Improvements

- Add server-side RBAC guards to every sensitive API route, especially app-user and application review routes.
- Replace hardcoded role and barangay maps with database-driven lookups and shared validation.
- Persist `ahp_breakdown`, `fuzzy_explanation`, and `reasoning_steps` in `ai_recommendations`, then select them in history routes.
- Normalize all user-facing highest-risk labels to `Severity` across frontend options, cards, legends, reports, and modals.
- Consolidate MongoDB sensor normalization into a shared package or mirrored contract tests to prevent frontend/backend drift.
- Remove real credentials from example env files, rotate exposed keys, and add placeholder-only `.env.example` files.
- Add API integration tests for RBAC and barangay scoping.
- Add deployment smoke tests for Vercel-to-Heroku AI proxy behavior.
- Add audit coverage for sensor simulator changes or restrict the simulator to non-production deployments.
- Treat Reinforcement Learning as a V4 enhancement: use historical flood outcomes, actual relief distribution success, evacuation demand, and inventory depletion patterns to learn allocation policies after enough validated operational data exists.

## Files Inspected

Frontend:

- `Frontend/package.json`
- `Frontend/src/app/page.tsx`
- `Frontend/src/app/dashboard/page.tsx`
- `Frontend/src/app/api/auth/login/route.ts`
- `Frontend/src/app/api/auth/logout/route.ts`
- `Frontend/src/app/api/logs/route.ts`
- `Frontend/src/app/api/sensors/latest/route.ts`
- `Frontend/src/app/api/sensors/history/route.ts`
- `Frontend/src/app/api/sensors/simulate/route.ts`
- `Frontend/src/app/api/residents/route.ts`
- `Frontend/src/app/api/residents/[id]/route.ts`
- `Frontend/src/app/api/families/route.ts`
- `Frontend/src/app/api/resident-applications/route.ts`
- `Frontend/src/app/api/resident-applications/[id]/review/route.ts`
- `Frontend/src/app/api/app-users/route.ts`
- `Frontend/src/app/api/app-users/[id]/route.ts`
- `Frontend/src/app/api/app-users/[id]/status/route.ts`
- `Frontend/src/app/api/app-users/[id]/password/route.ts`
- `Frontend/src/app/api/ai/recommendations/route.ts`
- `Frontend/src/app/api/ai/recommendations/generate/route.ts`
- `Frontend/src/app/api/relief/inventory/route.ts`
- `Frontend/src/app/api/health/route.ts`
- `Frontend/src/components/login/LoginPage/LoginPage.tsx`
- `Frontend/src/components/layout/AppShell/AppShell.tsx`
- `Frontend/src/components/layout/Sidebar/Sidebar.tsx`
- `Frontend/src/components/layout/Topbar/Topbar.tsx`
- `Frontend/src/components/dashboard/DashboardPanel/DashboardPanel.tsx`
- `Frontend/src/components/monitoring/MonitoringPanel/MonitoringPanel.tsx`
- `Frontend/src/components/sensors/SensorsPanel/SensorsPanel.tsx`
- `Frontend/src/components/relief/ReliefPanel/ReliefPanel.tsx`
- `Frontend/src/components/residents/ResidentsPanel/ResidentsPanel.tsx`
- `Frontend/src/components/verification/VerificationPanel/VerificationPanel.tsx`
- `Frontend/src/components/logs/LogsPanel/LogsPanel.tsx`
- `Frontend/src/components/logs/AccountManagement/AccountManagement.tsx`
- `Frontend/src/components/logs/AuditLogs/AuditLogs.tsx`
- `Frontend/src/components/logs/SystemLogs/SystemLogs.tsx`
- `Frontend/src/data/navigation.ts`
- `Frontend/src/data/pageCopy.ts`
- `Frontend/src/services/*`
- `Frontend/src/lib/authSession.ts`
- `Frontend/src/lib/dashboardSession.ts`
- `Frontend/src/lib/dashboardViewer.ts`
- `Frontend/src/lib/supabaseServer.ts`
- `Frontend/src/lib/supabaseClient.ts`
- `Frontend/src/lib/mongodb.ts`
- `Frontend/src/lib/auditClient.ts`
- `Frontend/src/lib/auditLogger.ts`
- `Frontend/src/lib/logVisibility.ts`
- `Frontend/src/lib/barangayScope.ts`
- `Frontend/src/lib/sensorScope.ts`
- `Frontend/src/lib/sensorMapping.ts`
- `Frontend/src/lib/statusStyles.ts`
- `Frontend/src/lib/residentPayload.ts`
- `Frontend/src/lib/appUserMapping.ts`
- `Frontend/src/types/navigation.ts`

Backend:

- `Backend/README.md`
- `Backend/.env.example`
- `Backend/requirements.txt`
- `Backend/Procfile`
- `Backend/app/main.py`
- `Backend/app/engine.py`
- `Backend/app/repositories.py`
- `Backend/app/models.py`
- `Backend/app/payloads.py`
- `Backend/app/audit.py`
- `Backend/app/config.py`
- `Backend/tests/test_audit.py`
- `Backend/tests/test_engine.py`
- `Backend/tests/test_payloads.py`

Root/docs:

- `README.md`
- `package.json`
- `docs/.gitkeep`
