# SmartFlood V3 - Complete System Architecture & Developer Guide

## Executive Summary

SmartFlood V3 is an AI-optimized flood management and relief distribution system for Malabon City, Philippines. It combines real-time IoT sensor monitoring, artificial intelligence for relief allocation, and a comprehensive admin dashboard for disaster response coordination.

**System Identity:** A full-stack disaster management platform that integrates IoT sensors, AI-powered decision making, and role-based administrative control for optimizing flood relief distribution.

**Core Purpose:** To provide real-time flood monitoring, risk assessment, and intelligent relief resource allocation to vulnerable communities during flood events.

**Architecture Pattern:** Hybrid monorepo with separate Next.js frontend (admin dashboard + API routes) and standalone FastAPI AI backend.

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome/Edge/Safari)                                │
│  - Role-based admin dashboard                                    │
│  - Real-time sensor monitoring                                   │
│  - AI relief recommendation interface                            │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    FRONTEND LAYER                                 │
│                 Next.js 16 + React 19 + TypeScript                │
├─────────────────────────────────────────────────────────────────┤
│  Frontend/src/app/                                                 │
│  ├── page.tsx (Login)                                             │
│  ├── dashboard/page.tsx (Main Dashboard)                          │
│  └── api/* (Next.js API Routes)                                   │
│      ├── auth/* (Authentication)                                  │
│      ├── sensors/* (Sensor data)                                  │
│      ├── residents/* (Resident management)                        │
│      ├── ai/* (AI recommendations proxy)                          │
│      ├── relief/* (Relief inventory)                              │
│      ├── logs/* (Audit logs)                                      │
│      └── app-users/* (Account management)                         │
│                                                                   │
│  Frontend/src/components/ (React UI)                               │
│  ├── dashboard/* (Dashboard components)                          │
│  ├── sensors/* (Sensor monitoring)                               │
│  ├── relief/* (Relief management)                                 │
│  ├── residents/* (Resident management)                           │
│  ├── verification/* (Application verification)                    │
│  ├── logs/* (Audit logging)                                      │
│  └── layout/* (Navigation & shell)                                │
│                                                                   │
│  Frontend/src/services/ (API client layer)                        │
│  Frontend/src/lib/ (Utilities & clients)                          │
│  Frontend/src/types/ (TypeScript definitions)                     │
└────────────┬──────────────────────────────────┬───────────────────┘
             │                                  │
             │ Supabase Client                  │ MongoDB Client
             │                                  │
┌────────────▼──────────────────────────────────▼───────────────────┐
│                    DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────┤
│  SUPABASE (PostgreSQL)                          MONGODB ATLAS    │
│  ├── app_users (Auth & RBAC)                   ├── sensors        │
│  ├── residents_v3 (Resident records)           ├── sensor_readings│
│  ├── families (Family clusters)                │                  │
│  ├── resident_applications (Pending apps)      │                  │
│  ├── ai_recommendations (AI output)            │                  │
│  ├── relief_inventory (Relief supplies)        │                  │
│  ├── audit_logs (Activity trail)               │                  │
│  ├── roles (RBAC definitions)                  │                  │
│  └── barangays (Location data)                 │                  │
└─────────────────────────────────────────────────────────────────┘
             
             │ (AI Generation Requests)
             │
┌────────────▼──────────────────────────────────────────────────────┐
│                   AI BACKEND LAYER                                  │
│                    FastAPI (Python)                                │
├─────────────────────────────────────────────────────────────────┤
│  Backend/app/                                                      │
│  ├── main.py (FastAPI app & routes)                               │
│  ├── engine.py (AI: Fuzzy logic + AHP)                            │
│  ├── repositories.py (Data access layer)                          │
│  ├── config.py (Environment management)                           │
│  ├── models.py (Pydantic models)                                  │
│  ├── payloads.py (Data transformation)                            │
│  └── audit.py (Audit logging)                                     │
│                                                                   │
│  AI Engine Logic:                                                  │
│  ├── Fuzzy Logic (Water level → Risk classification)              │
│  ├── AHP (Analytic Hierarchy Process)                             │
│  ├── Vulnerability scoring (Family demographics)                  │
│  └── Inventory allocation optimization                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure & Purpose

### Root Directory Structure

```
SmartFlood-V3/
├── Frontend/                    # Next.js admin dashboard & API routes
├── Backend/                     # Standalone FastAPI AI backend
├── docs/                        # Documentation
├── backendfastapi/             # Activity reports & analysis
├── package.json                # Root package configuration
└── README.md                   # Project overview
```

### Frontend Directory (`Frontend/`)

**Purpose:** Next.js 16 admin dashboard with server-side API routes for authentication, data management, and AI proxy functionality.

**Technology Stack:**
- Next.js 16.2.6 (App Router)
- React 19.2.1
- TypeScript 5.9.3
- Supabase JS Client 2.106.2
- MongoDB Node.js Driver 7.2.0
- Leaflet + React-Leaflet (Maps)

#### Key Frontend Subdirectories:

**`Frontend/src/app/`** - Next.js App Router structure
- `page.tsx` - Login page (authentication entry point)
- `dashboard/page.tsx` - Main admin dashboard shell with hash-based routing
- `layout.tsx` - Root layout with global styles
- `globals.css` - Global CSS styles
- `sensor-simulator/page.tsx` - IoT sensor simulation interface

**`Frontend/src/app/api/`** - Server-side API routes
- `auth/` - Authentication endpoints (login, logout, session management)
- `sensors/` - Sensor data endpoints (latest readings, history, snapshots)
- `residents/` - Resident CRUD operations with barangay scoping
- `families/` - Family cluster management
- `resident-applications/` - Registration application workflow
- `ai/` - AI recommendation proxy and history
- `relief/` - Relief inventory management
- `logs/` - Audit log retrieval with role filtering
- `app-users/` - Account management and RBAC
- `health/` - Health check endpoint

**`Frontend/src/components/`** - React UI components organized by feature
- `dashboard/` - Dashboard overview, map panels, system pulse
- `sensors/` - Sensor monitoring panels and tables
- `monitoring/` - Flood monitoring and heatmap visualization
- `relief/` - Relief recommendation and inventory management
- `residents/` - Resident information and family management
- `verification/` - Application verification workflow
- `logs/` - Audit log viewing and account management
- `map/` - Leaflet map components (sensor markers, heatmaps)
- `hardware/` - Hardware control interfaces
- `layout/` - Navigation shell (sidebar, header, app shell)
- `ui/` - Reusable UI components (buttons, modals, tables, cards)

**`Frontend/src/services/`** - API client service layer
- `apiClient.ts` - Base HTTP client with error handling
- `sensorsService.ts` - Sensor data operations
- `residentsService.ts` - Resident management operations
- `reliefService.ts` - Relief inventory and AI operations
- `floodService.ts` - Flood monitoring operations
- `logsService.ts` - Audit log retrieval
- `verificationService.ts` - Application workflow operations
- `dashboardService.ts` - Dashboard data aggregation

**`Frontend/src/lib/`** - Utility libraries and configuration
- `supabaseClient.ts` - Client-side Supabase setup
- `supabaseServer.ts` - Server-side Supabase with service role
- `mongodb.ts` - MongoDB connection helper for API routes
- `authSession.ts` - Authentication session management
- `dashboardViewer.ts` - User authentication and role resolution
- `barangayScope.ts` - Barangay-level access control
- `sensorScope.ts` - Sensor data access filtering
- `auditLogger.ts` - Audit event logging
- `sensorMapping.ts` - Sensor data normalization
- `formatters.ts` - Data formatting utilities
- `statusStyles.ts` - Flood status styling helpers

**`Frontend/src/types/`** - TypeScript type definitions
- `dashboard.ts` - Dashboard data structures
- `sensors.ts` - Sensor data types
- `residents.ts` - Resident and family types
- `relief.ts` - Relief inventory types
- `logs.ts` - Audit log types
- `verification.ts` - Application workflow types
- `supabase-tables.ts` - Supabase table schemas
- `common.ts` - Shared utility types

**`Frontend/src/data/`** - Mock data for development
- `sensors.mock.ts` - Sample sensor data
- `residents.mock.ts` - Sample resident records
- `dashboard.mock.ts` - Dashboard mock data
- Other mock files for various modules

### Backend Directory (`Backend/`)

**Purpose:** Standalone FastAPI backend specialized in AI-optimized relief recommendations using fuzzy logic and AHP (Analytic Hierarchy Process).

**Technology Stack:**
- FastAPI (Python)
- Pydantic (Data validation)
- python-dotenv (Environment management)
- pymongo (MongoDB driver)
- supabase-py (Supabase Python client)

#### Key Backend Files:

**`Backend/app/main.py`** - FastAPI application entry point
- FastAPI app initialization
- CORS middleware configuration
- API route definitions:
  - `GET /health` - Health check
  - `GET /api/ai/recommendations` - List saved recommendations
  - `POST /api/ai/recommendations/generate` - Generate AI recommendations
  - `GET /api/relief/inventory` - List inventory
  - `POST /api/relief/inventory` - Update inventory
- Global exception handlers
- Response formatting and data transformation

**`Backend/app/engine.py`** - AI recommendation engine
- **Fuzzy Logic Implementation:**
  - Water level → Risk classification (normal, flood_alert, flood_warning, severity)
  - Membership functions for risk categories
  - Confidence scoring based on sensor readings
- **AHP (Analytic Hierarchy Process):**
  - Vulnerability weight calculation for family demographics
  - Priority scoring based on risk level + vulnerability + family size
  - Weights: infant (0.22), elderly (0.20), pwd (0.18), pregnant (0.12), lactating (0.10), toddler (0.10), 4Ps (0.08)
- **Inventory Allocation Algorithm:**
  - Priority-based distribution of relief supplies
  - Constraint satisfaction (available inventory vs. calculated needs)
  - Fair allocation across barangays based on vulnerability scores
- **Barangay Data Processing:**
  - Sensor grouping by barangay
  - Family vulnerability aggregation
  - Risk score calculation per barangay

**`Backend/app/repositories.py`** - Data access layer
- **SmartFloodRepository Protocol:** Interface definition for data operations
- **DatabaseRepository Implementation:**
  - MongoDB operations: Sensor snapshots, latest readings
  - Supabase operations: Families, recommendations, inventory, audit logs
  - Data aggregation and transformation
  - Error handling and logging
- **Dependency Injection:** Cached repository instance with environment validation

**`Backend/app/config.py`** - Configuration management
- Environment variable loading using python-dotenv
- Settings dataclass with validation
- Required variables: MONGODB_URI, MONGODB_DB, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- CORS origins configuration
- Cached settings instance for performance

**`Backend/app/models.py`** - Pydantic data models
- Request/response models for API endpoints
- Data validation and serialization
- Type safety for API contracts
- Audit actor models for logging

**`Backend/app/payloads.py`** - Data transformation utilities
- Integer-safe payload processing
- Database payload formatting
- Response data shaping
- Inventory calculation helpers

**`Backend/app/audit.py`** - Audit logging utilities
- Audit event sanitization
- Best-effort error handling for audit failures
- Event structure validation

**`Backend/tests/`** - Unit tests
- `test_engine.py` - AI engine logic tests
- `test_payloads.py` - Data transformation tests
- `test_audit.py` - Audit logging tests

---

## Core System Flows

### 1. Authentication & Authorization Flow

**Purpose:** Secure role-based access to the admin dashboard with session management and account security.

**Flow Diagram:**
```
User (Login Form)
    │
    │ POST /api/auth/login {email, password}
    ▼
Next.js API Route (src/app/api/auth/login/route.ts)
    │
    ├─→ Query Supabase app_users by email
    ├─→ Check account status (active/blocked/locked)
    ├─→ Verify bcrypt password_hash
    ├─→ Handle failed login attempts
    │   └─→ After 3 failures: lock account, set locked_until
    ├─→ On success: reset failed attempts, update last_login_at
    ├─→ Log LOGIN_SUCCESS to audit_logs
    ├─→ Create signed HTTP-only cookie: smartflood_dashboard_session
    └─→ Return sanitized user object
        │
        ▼
Browser
    │
    ├─→ Store user in localStorage: smartflood_session
    ├─→ Store HTTP-only cookie: smartflood_dashboard_session
    └─→ Redirect to /dashboard
        │
        ▼
Dashboard (src/app/dashboard/page.tsx)
    │
    ├─→ Read smartflood_session from localStorage
    ├─→ Normalize user role (super/cdrrmo/cswdd/barangay)
    ├─→ Render role-specific navigation
    └─→ Load authorized modules
```

**Role-Based Access Control (RBAC):**
- **Super Admin:** Full access to all modules, account management, system logs
- **CDRRMO/NDRRMO Officer:** Dashboard, flood monitoring, sensor history, CDRRMO logs
- **CSWDD/City Welfare:** Dashboard, flood monitoring, relief recommendations, resident management, CSWDD logs
- **Barangay Official:** Dashboard, flood monitoring, sensor history (barangay-scoped), resident management (barangay-scoped), verification, barangay logs

**Session Management:**
- Browser storage: `smartflood_session` (sanitized user data)
- HTTP-only cookie: `smartflood_dashboard_session` (signed session token)
- Legacy keys cleared on login: `smartflood:user`, `currentUser`, etc.

**Security Features:**
- Bcrypt password hashing
- Account lockout after 3 failed login attempts
- HTTP-only cookies to prevent XSS
- Role-based server-side route protection
- Barangay-level data scoping for geographic access control

---

### 2. Real-Time Sensor Monitoring Flow

**Purpose:** Monitor IoT water level sensors across Malabon City barangays for real-time flood detection and risk assessment.

**Flow Diagram:**
```
IoT Sensors (Physical Hardware)
    │
    │ MQTT/HTTP → Sensor Readings
    ▼
MongoDB Atlas
    │
    ├─→ sensors collection (sensor metadata)
    │   └─→ _id, sensorId, name, barangay, location coordinates
    │
    └─→ sensor_readings collection (time-series data)
        └─→ sensorId, waterLevelM, createdAt timestamp
            │
            │ GET /api/sensors/latest
            ▼
Next.js API Route (src/app/api/sensors/latest/route.ts)
    │
    ├─→ Connect to MongoDB via mongodb.ts
    ├─→ Query sensors collection
    ├─→ Aggregate latest reading per sensor
    ├─→ Normalize data formats (various coordinate field names)
    ├─→ Apply barangay scoping based on user role
    └─→ Return normalized sensor snapshot
        │
        ▼
Frontend Service (sensorsService.ts)
    │
    └─→ Fetch and cache sensor data
        │
        ▼
React Components
    │
    ├─→ DashboardPanel: Map markers, sensor cards
    ├─→ SensorsPanel: Tabulated sensor list
    ├─→ MapPanel: Leaflet map with sensor clustering
    └─→ MonitoringPanel: Flood risk analysis
```

**Sensor Data Processing:**
- **Coordinate Normalization:** Handles multiple coordinate field formats (location.lat/lng, latitude/longitude, geo.coordinates)
- **Barangay Mapping:** Maps sensor barangay assignments to known barangays (Tanong, Catmon, Potrero)
- **Role-Based Filtering:** 
  - Super Admin & CDRRMO: All sensors
  - Barangay Officials: Only sensors in their assigned barangay
  - CSWDD: Navigation hides sensor module

**Flood Risk Classification:**
- **Normal:** Water level < threshold
- **Flood Alert:** Moderate water level rise
- **Flood Warning:** High water level, potential danger
- **Severity:** Critical flood level, immediate action required

**Real-Time Updates:**
- Polling-based updates (configurable intervals)
- Map marker color coding based on risk level
- Sensor cards with latest readings and timestamps
- Historical data for trend analysis

---

### 3. AI-Powered Relief Recommendation Flow

**Purpose:** Generate intelligent relief allocation recommendations using fuzzy logic for risk assessment and AHP for vulnerability-based prioritization.

**Flow Diagram:**
```
Admin User (ReliefPanel)
    │
    │ Open generation modal
    │ Input: family_food_packs, medicine_kits, relief_goods_individual
    │
    │ POST /api/ai/recommendations/generate
    ▼
Next.js API Route (Frontend proxy)
    │
    │ Optional: Proxy to backend or handle directly
    │ Currently: Direct Supabase operations
    │
    │ POST https://your-backend.herokuapp.com/api/ai/recommendations/generate
    ▼
FastAPI Backend (Backend/app/main.py)
    │
    ├─→ Validate inventory input (total > 0)
    ├─→ Call repository.get_sensor_snapshot() → MongoDB
    ├─→ Call repository.get_families() → Supabase
    ├─→ Call engine.generate_recommendations()
    │   │
    │   ▼
    │ AI Engine (Backend/app/engine.py)
    │   │
    │   ├─→ Group sensors by barangay
    │   ├─→ Group families by barangay
    │   ├─→ For each barangay:
    │   │   ├─→ Calculate water level risk (fuzzy logic)
    │   │   ├─→ Compute family vulnerability score (AHP)
    │   │   ├─→ Calculate priority score
    │   │   └─→ Generate allocation recommendation
    │   ├─→ Apply inventory constraints
    │   ├─→ Optimize allocation across barangays
    │   └─→ Return recommendations with explanations
    │       │
    │       ▼
    ├─→ Save recommendations to Supabase (ai_recommendations table)
    ├─→ Log audit event (AI_RECOMMENDATION_GENERATED)
    └─→ Return recommendations with full analysis
        │
        ▼
Frontend (ReliefPanel)
    │
    ├─→ Display recommendation cards per barangay
    ├─→ Show detailed breakdown:
    │   ├─→ Risk level and fuzzy explanation
    │   ├─→ AHP vulnerability breakdown
    │   ├─→ Priority score
    │   ├─→ Recommended allocation quantities
    │   ├─→ Reasoning steps
    │   └─→ Inventory constraint explanation
    ├─→ Save to allocation history
    └─→ Allow filtering/sorting of recommendations
```

**AI Engine Components:**

**1. Fuzzy Logic Risk Assessment:**
```
Water Level (m) → Risk Classification
- < 0.5m: Normal (membership: 1.0)
- 0.5-1.0m: Flood Alert (membership based on level)
- 1.0-1.5m: Flood Warning (membership based on level)
- > 1.5m: Severity (membership: 1.0)
```

**2. AHP Vulnerability Scoring:**
```
Family Demographics → Vulnerability Score
Weights:
- Infant (0-1 year): 0.22
- Elderly (60+ years): 0.20
- PWD: 0.18
- Pregnant: 0.12
- Lactating: 0.10
- Toddler (1-3 years): 0.10
- 4Ps beneficiary: 0.08

Score = Σ(demographic_count × weight)
```

**3. Priority Score Calculation:**
```
Priority = (Risk Weight × 100) + Vulnerability Score + Total Family Members

Risk Weights:
- Normal: 0
- Flood Alert: 25
- Flood Warning: 50
- Severity: 100
```

**4. Inventory Allocation Algorithm:**
```
For each relief type (food, medicine, goods):
1. Calculate need per barangay (based on vulnerability)
2. Sort barangays by priority score
3. Allocate proportionally to priority and available inventory
4. Ensure minimum allocation for highest priority areas
5. Distribute remaining inventory by need
```

**Output Data Structure:**
```json
{
  "recommendation_id": "uuid",
  "barangay_id": "1",
  "barangay_name": "Barangay Tanong",
  "risk_level": "severity",
  "priority_score": 405.78,
  "affected_families": 12,
  "recommended_family_food_packs": 12,
  "recommended_medicine_kits": 18,
  "recommended_relief_goods_individual": 80,
  "analysis_reason": "Severity flood risk detected at 1.20m...",
  "ahp_breakdown": {
    "weights": {...},
    "counts": {...},
    "contributions": {...},
    "total_vulnerability_score": 5.76
  },
  "fuzzy_explanation": {
    "water_level_m": 1.2,
    "risk_level": "severity",
    "confidence": 1.0,
    "memberships": {...}
  },
  "reasoning_steps": [
    "Sensor reading classified the barangay as Severity risk.",
    "Family vulnerability score was computed using AHP-inspired weights.",
    "Available inventory was distributed based on priority and affected families."
  ]
}
```

---

### 4. Resident & Family Management Flow

**Purpose:** Manage resident records and family clusters with vulnerability tracking for relief targeting and demographic analysis.

**Flow Diagram:**
```
Admin User (ResidentsPanel)
    │
    │ Two scenarios:
    │ 1. Create Family Head (creates new family cluster)
    │ 2. Add Family Member (links to existing family)
    │
    │ POST /api/residents
    ▼
Next.js API Route (src/app/api/residents/route.ts)
    │
    ├─→ Authenticate user via dashboardViewer
    ├─→ Validate role (super/barangay only)
    ├─→ Apply barangay scoping for barangay users
    ├─→ Validate required fields
    │   └─→ last_name, first_name, complete_address, barangay_id, barangay_name
    │
    ├─→ Scenario 1: Family Head Creation
    │   ├─→ Insert resident into residents_v3
    │   ├─→ Create family cluster in families
    │   │   └─→ Set family_head_id and family_head_name
    │   ├─→ Update resident with family_id
    │   ├─→ Calculate vulnerability counts
    │   │   └─→ pwd_count, elderly_count, four_ps_count, etc.
    │   └─→ Log audit events (RESIDENT_CREATED, FAMILY_UPDATED)
    │
    └─→ Scenario 2: Family Member Addition
        ├─→ Validate selected_family_id exists
        ├─→ Ensure family belongs to same barangay
        ├─→ Insert resident with family_id
        ├─→ Update family vulnerability counts
        └─→ Log audit event (RESIDENT_CREATED)
            │
            ▼
Supabase Database
    │
    ├─→ residents_v3 table (individual records)
    │   └─→ resident_id, names, demographics, family_id, status
    │
    └─→ families table (family clusters)
        └─→ family_id, family_head_id, vulnerability counts, location
            │
            ▼
Frontend (ResidentsPanel)
    │
    ├─→ Refresh resident table
    ├─→ Update family cluster display
    ├─→ Show vulnerability counts
    └─→ Enable family-based filtering
```

**Family Cluster Data Structure:**
```json
{
  "family_id": "uuid",
  "family_name": "Last Name Family",
  "family_head_id": "resident_id",
  "family_head_name": "Full Name",
  "barangay_id": 1,
  "barangay_name": "Barangay Tanong",
  "complete_address": "Street address",
  "vulnerability_counts": {
    "pwd_count": 2,
    "elderly_count": 3,
    "four_ps_count": 5,
    "lactating_count": 1,
    "pregnant_count": 1,
    "infant_count": 1,
    "toddler_count": 2,
    "total_family_members": 12
  }
}
```

**Access Control:**
- **Super Admin:** Full CRUD across all barangays
- **CSWDD:** Full CRUD across all barangays
- **Barangay Official:** CRUD only within assigned barangay
- **CDRRMO:** Read-only access (navigation hides module)

**Vulnerability Tracking:**
- Counts are aggregated at family level for AHP calculations
- Individual resident flags contribute to family totals
- Used for AI relief allocation prioritization
- Supports demographic analysis and reporting

---

### 5. Registration Application Verification Flow

**Purpose:** Review and approve resident registration applications from public facing forms, converting them into official resident records.

**Flow Diagram:**
```
Public Registration Form (External)
    │
    │ Submit application data
    │
    │ POST /api/resident-applications (public endpoint)
    ▼
Supabase (resident_applications table)
    │
    └─→ Store with status: "pending"
        │
        │ Admin reviews applications
        ▼
Admin User (VerificationPanel)
    │
    │ GET /api/resident-applications?status=pending
    │ View application cards
    │ Open review modal
    │
    │ PATCH /api/resident-applications/[id]/review
    │ { status: "approved" | "rejected", admin_notes }
    ▼
Next.js API Route (src/app/api/resident-applications/[id]/review/route.ts)
    │
    ├─→ Authenticate and authorize user
    ├─→ Update application status and review fields
    │
    ├─→ If Approved:
    │   ├─→ Scenario 1: Family Head Application
    │   │   ├─→ Create resident in residents_v3
    │   │   ├─→ Create family cluster in families
    │   │   ├─→ Link resident to family
    │   │   └─→ Log audit events
    │   │
    │   └─→ Scenario 2: Family Member Application
    │       ├─→ Validate selected_family_id
    │       ├─→ Create resident with family_id
    │       ├─→ Update family vulnerability counts
    │       └─→ Log audit event
    │
    └─→ If Rejected:
        └─→ Only update review status and notes
            │
            ▼
Supabase Database
    │
    ├─→ resident_applications (updated with review data)
    ├─→ residents_v3 (new resident if approved)
    └─→ families (new/updated family if approved)
        │
        ▼
Frontend (VerificationPanel)
    │
    ├─→ Move application to appropriate tab
    ├─→ Refresh resident/family data
    └─→ Update statistics
```

**Application Data Structure:**
```json
{
  "application_id": "uuid",
  "applicant_info": {
    "last_name": "Dela Cruz",
    "first_name": "Juan",
    "middle_name": "A",
    "age": 35,
    "sex": "Male",
    "contact_number": "09123456789",
    "complete_address": "123 Main St",
    "barangay_id": 1,
    "barangay_name": "Barangay Tanong"
  },
  "is_family_head": true,
  "family_vulnerability": {
    "pwd_count": 1,
    "elderly_count": 2,
    "four_ps_count": 4
  },
  "selected_family_id": null,
  "status": "pending",
  "submitted_at": "2026-07-27T10:00:00Z"
}
```

**Review Process:**
- **Pending:** Applications awaiting review
- **Approved:** Converted to resident records (and family clusters if applicable)
- **Rejected:** Application denied with admin notes

**Access Control:**
- **Super Admin:** Review all applications
- **Barangay Official:** Review applications within assigned barangay only
- **CSWDD/CDRRMO:** Navigation hides module

---

### 6. Audit Logging & System Monitoring Flow

**Purpose:** Maintain comprehensive audit trail of all system activities for accountability, security monitoring, and operational analysis.

**Flow Diagram:**
```
Any System Action
    │
    │ (User action, API call, data change)
    │
    ▼
Event Generator (Various Components)
    │
    ├─→ Authentication events (login, logout, failed attempts)
    ├─→ Resident management (create, update, deactivate)
    ├─→ Family management (create, update, vulnerability changes)
    ├─→ AI recommendations (generation, inventory updates)
    ├─→ Account management (create, update, password changes)
    ├─→ Application reviews (approve, reject)
    └─→ System events (errors, warnings)
        │
        │ Call auditLogger.logAuditEvent()
        ▼
Audit Logger (src/lib/auditLogger.ts)
    │
    ├─→ Structure event data:
    │   ├─→ actor_user_id, actor_name, actor_role
    │   ├─→ action (event type)
    │   ├─→ module (functional area)
    │   ├─→ description (human-readable)
    │   ├─→ target_type, target_id (affected entity)
    │   ├─→ barangay_id, barangay_name (location context)
    │   └─→ timestamp
    │
    ├─→ Sanitize sensitive data
    └─→ Write to Supabase audit_logs table
        │
        ▼
Supabase (audit_logs table)
    │
    └─→ Store structured audit event
        │
        │ Admin views logs
        ▼
Logs Panel (SystemLogs/AuditLogs components)
    │
    ├─→ GET /api/logs?limit=300
    ├─→ Apply role-based filtering:
    │   ├─→ Super Admin: All system logs
    │   ├─→ CDRRMO: CDRRMO-related logs
    │   ├─→ CSWDD: CSWDD-related logs
    │   └─→ Barangay: Barangay-specific logs
    ├─→ Filter by module, action, date range
    ├─→ Search logs
    └─→ View detailed log entries
```

**Audit Event Structure:**
```json
{
  "actor_user_id": "user_id",
  "actor_name": "Admin Name",
  "actor_role": "super",
  "action": "RESIDENT_CREATED",
  "module": "Resident Information",
  "description": "Created resident record for Juan Dela Cruz.",
  "target_type": "resident",
  "target_id": "resident_id",
  "barangay_id": 1,
  "barangay_name": "Barangay Tanong",
  "created_at": "2026-07-27T10:30:00Z"
}
```

**Role-Based Log Access:**
- **Super Admin:** View all system logs across all modules
- **CDRRMO:** View CDRRMO-related logs (flood monitoring, sensors)
- **CSWDD:** View CSWDD-related logs (residents, relief, families)
- **Barangay:** View barangay-specific logs only

**Audit Categories:**
- **Authentication:** LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, ACCOUNT_LOCKED
- **Resident Management:** RESIDENT_CREATED, RESIDENT_UPDATED, RESIDENT_DEACTIVATED
- **Family Management:** FAMILY_CREATED, FAMILY_UPDATED, VULNERABILITY_UPDATED
- **AI Operations:** AI_RECOMMENDATION_GENERATED, INVENTORY_UPDATED
- **Account Management:** ACCOUNT_CREATED, ACCOUNT_UPDATED, PASSWORD_CHANGED
- **Application Review:** APPLICATION_APPROVED, APPLICATION_REJECTED
- **System Events:** ERROR, WARNING, SYSTEM_EVENT

---

## Database Schema

### Supabase (PostgreSQL) Tables

**app_users** - Dashboard authentication and RBAC
```sql
- id (UUID, PK)
- first_name, last_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- mobile_number (VARCHAR)
- address (TEXT)
- profile_image (TEXT)
- barangay (VARCHAR)
- sex (VARCHAR)
- role_id (INTEGER, FK to roles)
- barangay_id (INTEGER, FK to barangays)
- status (VARCHAR: active/blocked/locked)
- password_hash (VARCHAR)
- failed_login_attempts (INTEGER)
- locked_until (TIMESTAMP)
- last_login_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

**roles** - RBAC role definitions
```sql
- role_id (INTEGER, PK)
- role_name (VARCHAR)
- role_description (TEXT)
```

**barangays** - Geographic administrative divisions
```sql
- id (INTEGER, PK)
- barangay_id (INTEGER, UNIQUE)
- name (VARCHAR)
- barangay_name (VARCHAR)
```

**residents_v3** - Approved resident records
```sql
- resident_id (UUID, PK)
- last_name, first_name, middle_name, suffix (VARCHAR)
- age (INTEGER)
- sex (VARCHAR)
- contact_number (VARCHAR)
- complete_address (TEXT)
- street (VARCHAR)
- barangay_id (INTEGER)
- barangay_name (VARCHAR)
- is_family_head (BOOLEAN)
- family_id (UUID, FK to families)
- status (VARCHAR: active/inactive)
- source (VARCHAR: manual/application)
- application_id (UUID, FK to resident_applications)
- created_by (UUID)
- created_at, updated_at (TIMESTAMP)
```

**families** - Family clusters with vulnerability counts
```sql
- family_id (UUID, PK)
- family_name (VARCHAR)
- family_head_id (UUID, FK to residents_v3)
- family_head_name (VARCHAR)
- barangay_id (INTEGER)
- barangay_name (VARCHAR)
- street (VARCHAR)
- complete_address (TEXT)
- pwd_count (INTEGER)
- elderly_count (INTEGER)
- four_ps_count (INTEGER)
- lactating_count (INTEGER)
- pregnant_count (INTEGER)
- infant_count (INTEGER)
- toddler_count (INTEGER)
- total_family_members (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

**resident_applications** - Pending registration applications
```sql
- application_id (UUID, PK)
- [All resident fields]
- is_family_head (BOOLEAN)
- [Family vulnerability count fields]
- selected_family_id (UUID, FK to families)
- family_id (UUID, FK to families)
- status (VARCHAR: pending/approved/rejected)
- admin_review_notes (TEXT)
- reviewed_by (UUID, FK to app_users)
- reviewed_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

**ai_recommendations** - AI-generated relief allocations
```sql
- recommendation_id (UUID, PK)
- barangay_id (INTEGER)
- barangay_name (VARCHAR)
- risk_level (VARCHAR)
- priority_score (DECIMAL)
- affected_families (INTEGER)
- recommended_family_food_packs (INTEGER)
- recommended_medicine_kits (INTEGER)
- recommended_relief_goods_individual (INTEGER)
- analysis_reason (TEXT)
- ahp_breakdown (JSONB)
- fuzzy_explanation (JSONB)
- reasoning_steps (JSONB)
- status (VARCHAR)
- created_by (UUID)
- created_at (TIMESTAMP)
```

**relief_inventory** - Available relief supplies
```sql
- inventory_id (UUID, PK)
- family_food_packs (INTEGER)
- medicine_kits (INTEGER)
- relief_goods_individual (INTEGER)
- updated_by (UUID)
- created_at (TIMESTAMP)
```

**audit_logs** - System audit trail
```sql
- log_id (UUID, PK)
- actor_user_id (UUID)
- actor_name (VARCHAR)
- actor_role (VARCHAR)
- action (VARCHAR)
- module (VARCHAR)
- description (TEXT)
- target_type (VARCHAR)
- target_id (VARCHAR)
- barangay_id (INTEGER)
- barangay_name (VARCHAR)
- created_at (TIMESTAMP)
```

### MongoDB Collections

**sensors** - IoT sensor metadata
```javascript
{
  _id: ObjectId,
  sensorId: String,
  sensor_id: String,
  sensor_id_string: String,
  name: String,
  barangay: String,
  barangayName: String,
  street: String,
  location: {
    lat: Number,
    lng: Number,
    latitude: Number,
    longitude: Number
  },
  geo: {
    type: "Point",
    coordinates: [Number, Number]
  },
  lat: Number,
  lng: Number,
  status: String
}
```

**sensor_readings** - Time-series sensor data
```javascript
{
  _id: ObjectId,
  sensorId: String,
  waterLevelM: Number,
  waterLevel: Number,
  createdAt: Date,
  timestamp: Date
}
```

---

## API Endpoints Reference

### Frontend Next.js API Routes

**Authentication**
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/logout` - User logout and session cleanup

**Sensors**
- `GET /api/sensors/latest` - Get latest sensor readings
- `GET /api/sensors/history` - Get historical sensor data
- `GET /api/sensors/snapshot` - Get current sensor network state

**Residents**
- `GET /api/residents` - List residents (with role/barangay filtering)
- `POST /api/residents` - Create new resident
- `PATCH /api/residents/[id]` - Update resident details
- `GET /api/families` - List family clusters
- `POST /api/families` - Create family cluster

**Applications**
- `GET /api/resident-applications` - List applications (with status filtering)
- `POST /api/resident-applications` - Submit new application
- `PATCH /api/resident-applications/[id]/review` - Approve/reject application

**AI & Relief**
- `GET /api/ai/recommendations` - List saved AI recommendations
- `POST /api/ai/recommendations/generate` - Generate new recommendations (proxy to backend)
- `GET /api/relief/inventory` - Get current inventory
- `POST /api/relief/inventory` - Update inventory

**Logs & Accounts**
- `GET /api/logs` - Get audit logs (with role filtering)
- `GET /api/app-users` - List dashboard accounts
- `POST /api/app-users` - Create new account
- `PATCH /api/app-users/[id]` - Update account details
- `PATCH /api/app-users/[id]/status` - Enable/disable account
- `PATCH /api/app-users/[id]/password` - Change account password

**Health**
- `GET /api/health` - Health check endpoint

### Backend FastAPI Endpoints

**AI Recommendations**
- `GET /api/ai/recommendations` - List saved recommendations from Supabase
- `POST /api/ai/recommendations/generate` - Generate new AI recommendations

**Relief Inventory**
- `GET /api/relief/inventory` - Get current inventory from Supabase
- `POST /api/relief/inventory` - Update inventory in Supabase

**Health**
- `GET /health` - Backend health check

---

## Security & Access Control

### Authentication Mechanisms
- **Password Hashing:** Bcrypt for secure password storage
- **Session Management:** HTTP-only signed cookies + localStorage
- **Account Lockout:** Automatic lock after 3 failed login attempts
- **Session Validation:** Server-side session verification on protected routes

### Role-Based Access Control (RBAC)
| Role | Dashboard | Monitoring | Sensors | Relief | Residents | Verification | Accounts | Logs |
|------|-----------|------------|---------|--------|------------|--------------|----------|------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CDRRMO | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | CDRRMO |
| CSWDD | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | CSWDD |
| Barangay | ✅ | ✅ | ✅ (scoped) | ❌ | ✅ (scoped) | ✅ (scoped) | ❌ | Barangay |

### Geographic Access Control (Barangay Scoping)
- **Barangay Officials:** Restricted to their assigned barangay only
- **Data Filtering:** Server-side filtering on resident, family, and sensor queries
- **Navigation Control:** Role-based menu visibility
- **Log Filtering:** Audit logs filtered by barangay assignment

### Data Protection
- **Environment Variables:** Sensitive configuration in .env files (gitignored)
- **API Keys:** Service role keys separated from anon keys
- **CORS Configuration:** Controlled frontend access
- **Audit Logging:** Comprehensive activity tracking
- **Input Validation:** Pydantic models (backend) and TypeScript types (frontend)

---

## Development & Deployment

### Environment Setup

**Frontend:**
```bash
cd Frontend
npm install
cp .env.example .env.local  # Configure environment variables
npm run dev                  # Development server
npm run build                # Production build
npm start                    # Production server
```

**Backend:**
```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # Configure environment variables
uvicorn app.main:app --reload --port 8000  # Development server
```

### Required Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB=your-database-name
NODE_ENV=development
```

**Backend (.env):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB=your-database-name
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### Deployment Architecture

**Frontend (Vercel):**
- Next.js automatic deployment from Git
- Environment variables configured in Vercel dashboard
- API routes run as serverless functions
- Static assets optimized and CDN-delivered

**Backend (Heroku):**
- FastAPI application deployed as web service
- Process type defined in Procfile
- Environment variables configured in Heroku dashboard
- MongoDB connection via MongoDB Atlas
- Supabase connection via service role key

---

## Key Technical Decisions

### Hybrid Architecture
- **Rationale:** Separates AI compute from dashboard UI, allows independent scaling
- **Benefits:** FastAPI optimized for AI algorithms, Next.js optimized for UI and basic CRUD
- **Trade-offs:** Additional deployment complexity, need for service-to-service communication

### Next.js App Router
- **Rationale:** Modern React framework with built-in API routes and server components
- **Benefits:** Full-stack in one framework, excellent performance, TypeScript support
- **Trade-offs:** Learning curve for team members unfamiliar with Next.js

### MongoDB + Supabase
- **Rationale:** MongoDB for time-series sensor data, Supabase for relational data and auth
- **Benefits:** Right tool for each use case, Supabase provides auth and real-time features
- **Trade-offs:** Two database systems to manage, data synchronization complexity

### Fuzzy Logic + AHP
- **Rationale:** Handles uncertainty in flood risk while providing structured vulnerability assessment
- **Benefits:** Explainable AI, transparent decision-making, domain-appropriate
- **Trade-offs:** Complexity in implementation, requires domain expertise for tuning

### Role-Based + Geographic Access Control
- **Rationale:** Philippine government context requires hierarchical access and geographic boundaries
- **Benefits:** Realistic access patterns, data security by jurisdiction, regulatory compliance
- **Trade-offs:** Implementation complexity, need for consistent scoping across all endpoints

---

## Future Enhancement Opportunities

### Technical Improvements
1. **Testing:** Add comprehensive unit, integration, and E2E tests
2. **CI/CD:** Implement automated testing and deployment pipelines
3. **Monitoring:** Add application performance monitoring and error tracking
4. **Documentation:** API documentation with OpenAPI/Swagger, component docs with Storybook
5. **Security:** Security audit, penetration testing, dependency scanning

### Feature Enhancements
1. **Real-time Updates:** WebSocket integration for live sensor data
2. **Mobile App:** React Native or PWA for field workers
3. **Advanced Analytics:** Historical trend analysis, predictive modeling
4. **Notification System:** SMS/email alerts for flood events
5. **Offline Support:** Service worker for offline dashboard functionality
6. **Export Features:** PDF reports, CSV data exports
7. **Multi-language:** Support for Filipino and other local languages

### AI/ML Enhancements
1. **Predictive Analytics:** Flood prediction using historical data
2. **Optimization Algorithms:** Advanced relief distribution optimization
3. **Image Recognition:** Satellite/aerial image analysis for flood extent
4. **Natural Language Processing:** Automated report generation
5. **Anomaly Detection:** Sensor malfunction detection

---

## Conclusion

SmartFlood V3 represents a comprehensive disaster management solution that combines real-time IoT monitoring, artificial intelligence, and role-based administrative control. The system demonstrates modern software engineering practices with clean architecture, security consciousness, and domain-specific functionality tailored for Philippine disaster response contexts.

The hybrid architecture with separate Next.js frontend and FastAPI backend provides flexibility for independent scaling and development, while the integrated database strategy leverages the strengths of both MongoDB (time-series sensor data) and Supabase (relational data and authentication).

The AI-powered relief recommendation system using fuzzy logic and AHP represents a sophisticated approach to equitable resource allocation, while the comprehensive audit logging and access control ensure accountability and security appropriate for government applications.

This system serves as a strong foundation for disaster management technology and can be extended with additional features, improved monitoring, and enhanced AI capabilities to further support flood response and relief operations in Malabon City and similar vulnerable communities.
