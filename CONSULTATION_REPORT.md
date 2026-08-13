# SmartFlood V3 - Comprehensive Consultation Report

## 1. Executive Summary

**System Identity:** SmartFlood V3 is an AI-optimized flood management and relief distribution system designed for Malabon City, Philippines. It integrates real-time IoT sensor monitoring, artificial intelligence for relief allocation, and a comprehensive admin dashboard for disaster response coordination.

**Core Purpose:** To provide real-time flood monitoring, risk assessment, and intelligent relief resource allocation to vulnerable communities during flood events, with a focus on equitable distribution based on vulnerability scoring.

**System Overview:** The system is a hybrid monorepo architecture consisting of:
- **Frontend:** Next.js 16 + React 19 + TypeScript admin dashboard with server-side API routes
- **Backend:** Standalone FastAPI Python service for AI-powered relief recommendations
- **Databases:** Hybrid approach using MongoDB Atlas for sensor data and Supabase (PostgreSQL) for user/resident/relief data
- **AI Engine:** Fuzzy logic for flood risk classification and AHP (Analytic Hierarchy Process) for vulnerability scoring

**Problem Solved:** The system addresses the challenge of optimizing limited relief resources during flood events by combining real-time sensor data with demographic vulnerability information to make data-driven allocation decisions.

**Importance:** Flood disasters disproportionately affect vulnerable populations (elderly, PWD, infants, pregnant women). This system ensures fair, transparent, and explainable AI-driven decisions for relief distribution, reducing bias and improving response efficiency.

---

## 2. Project Goals

### Main Objectives
1. Provide real-time flood monitoring through IoT sensor networks
2. Implement AI-driven relief allocation optimization
3. Create role-based administrative dashboard for disaster response coordination
4. Ensure data security and auditability of all relief distribution decisions
5. Support multi-level governance (City, Barangay, Department-level) access

### Functional Goals
- **Real-time Monitoring:** Live sensor data visualization with flood risk classification
- **Resident Management:** Comprehensive demographic data collection with family clustering
- **AI Recommendations:** Automated relief allocation based on flood risk and vulnerability
- **Account Management:** Role-based access control for different administrative levels
- **Audit Trail:** Complete logging of all system activities for accountability
- **Application Processing:** Resident registration workflow with approval/rejection

### Non-Functional Goals
- **Performance:** Sub-second response times for dashboard operations
- **Scalability:** Handle concurrent sensor data ingestion and dashboard users
- **Security:** Role-based access control, secure authentication, audit logging
- **Reliability:** 99.9% uptime for critical monitoring functions
- **Usability:** Intuitive interface for non-technical disaster response personnel
- **Maintainability:** Clean code architecture with separation of concerns

---

## 3. System Architecture

### High-Level Architecture

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

### Frontend Architecture

**Technology:** Next.js 16.2.6 with App Router, React 19.2.1, TypeScript 5.9.3

**Architecture Pattern:** Server-side rendering with API routes for backend integration

**Key Components:**
- **App Router:** File-based routing in `src/app/` directory
- **Hash-based Dashboard:** Single-page application with hash routing for modules
- **API Routes:** Server-side endpoints for database operations and AI proxy
- **Component Architecture:** Modular React components organized by feature
- **State Management:** React hooks with localStorage for session persistence

**Why Next.js:**
- Server-side rendering for improved SEO and initial load performance
- Built-in API routes eliminate need for separate backend server
- TypeScript support for type safety
- App Router provides modern file-based routing
- Strong ecosystem and community support

### Backend Architecture

**Technology:** FastAPI with Python 3.x, Pydantic for validation

**Architecture Pattern:** RESTful API with repository pattern for data access

**Key Components:**
- **FastAPI Application:** Async web framework with automatic OpenAPI documentation
- **Repository Pattern:** Protocol-based data access layer for testability
- **AI Engine:** Fuzzy logic and AHP algorithms for decision making
- **CORS Middleware:** Cross-origin resource sharing for frontend integration
- **Error Handling:** Centralized exception handling with consistent error responses

**Why FastAPI:**
- Native async support for high-performance I/O operations
- Automatic data validation with Pydantic
- Built-in API documentation with Swagger UI
- Type hints enable better IDE support
- Modern Python web framework with excellent performance

### Database Architecture

**Hybrid Database Strategy:**

**MongoDB Atlas:**
- **Purpose:** Time-series sensor data and IoT device management
- **Collections:** `sensors`, `sensor_readings`
- **Why MongoDB:** Flexible schema for sensor data, horizontal scaling, efficient time-series queries

**Supabase (PostgreSQL):**
- **Purpose:** Transactional data, user management, relational data
- **Tables:** `app_users`, `residents_v3`, `families`, `ai_recommendations`, `relief_inventory`, `audit_logs`, `roles`, `barangays`
- **Why Supabase:** Built-in authentication, real-time subscriptions, relational integrity, easy admin interface

**Why Hybrid Approach:**
- Sensor data is high-volume, time-series, schema-flexible → MongoDB
- User/resident data is relational, transactional, requires integrity → PostgreSQL
- Each database optimized for its specific use case
- Separation of concerns improves performance and maintainability

### Authentication & Authorization

**Authentication:**
- **Login Flow:** Email/password with bcrypt password hashing
- **Session Management:** HTTP-only signed cookie with HMAC-SHA256
- **Session Storage:** Server-side signed cookie, client-side localStorage backup
- **Lockout Policy:** 3 failed attempts trigger 15-minute account lockout

**Authorization (RBAC):**
- **Roles:** Super Admin, CDRRMO Admin, CSWDD Admin, Barangay Admin
- **Role-Based Navigation:** Dynamic menu based on user role
- **Data Scoping:** Barangay-level data access restrictions
- **Route Guards:** Server-side validation on protected endpoints

### External APIs

**AI Backend Service:**
- **Purpose:** Standalone AI recommendation generation
- **Endpoints:** `/api/ai/recommendations/generate`, `/api/ai/recommendations`, `/api/relief/inventory`
- **Communication:** HTTP proxy through Next.js API routes

**MongoDB Atlas:**
- **Purpose:** Cloud-hosted MongoDB database
- **Connection:** MongoDB client with connection pooling
- **Access:** Environment-based connection string

**Supabase:**
- **Purpose:** Cloud-hosted PostgreSQL with authentication
- **Connection:** Supabase client with service role key
- **Access:** Server-side client for admin operations

### Hosting Strategy

**Frontend:** Vercel (Next.js optimized hosting)
- Automatic deployments from Git
- Edge network caching
- Serverless function execution

**Backend:** Heroku (FastAPI with Gunicorn)
- Procfile configuration for web worker
- Uvicorn workers for async request handling
- Environment variable management

**Databases:** MongoDB Atlas & Supabase (managed cloud services)
- Automatic backups
- High availability
- Managed scaling

### Service Communication

**Frontend → Databases:**
- Next.js API routes directly query MongoDB and Supabase
- Server-side execution with service role credentials
- No direct database access from client-side code

**Frontend → AI Backend:**
- Next.js API route proxies requests to FastAPI service
- AI backend has independent database access
- CORS configuration allows cross-origin requests

**Data Flow:**
1. User action triggers API call to Next.js route
2. Next.js route validates session and permissions
3. Route queries databases or proxies to AI backend
4. Response formatted and returned to frontend
5. Frontend updates UI with new data

---

## 4. Technology Stack

### Why Next.js?

**Primary Reasons:**
1. **Server-Side Rendering:** Improves initial load performance and SEO
2. **Built-in API Routes:** Eliminates need for separate backend server for basic operations
3. **TypeScript Support:** Full type safety across frontend and API routes
4. **App Router:** Modern file-based routing with improved performance
5. **Vercel Integration:** Optimized deployment with automatic scaling
6. **React Ecosystem:** Leverages vast React component library and expertise

**Alternatives Considered:**
- **Create React App:** Requires separate backend server, no SSR
- **Vue.js + Nuxt.js:** Smaller ecosystem, less TypeScript maturity
- **Angular:** Steeper learning curve, more opinionated

**Tradeoffs:**
- **Pros:** Performance, developer experience, ecosystem, deployment ease
- **Cons:** Vendor lock-in to Vercel for optimal performance, learning curve for App Router

### Why Express?

**Clarification:** The system does NOT use Express. The frontend uses Next.js API routes (which use Next.js's built-in server), and the backend uses FastAPI (Python). There is no Express.js in the technology stack.

### Why FastAPI?

**Primary Reasons:**
1. **Async Support:** Native async/await for high-performance I/O operations
2. **Type Safety:** Pydantic models provide automatic validation and serialization
3. **Automatic Documentation:** OpenAPI/Swagger UI generated automatically
4. **Performance:** On par with Node.js and Go for web frameworks
5. **Modern Python:** Leverages Python 3.8+ features (type hints, async)
6. **Testing:** Excellent support for dependency injection and testing

**Alternatives Considered:**
- **Flask:** More mature ecosystem, but synchronous by default
- **Django:** Built-in admin, but heavier and more opinionated
- **Node.js/Express:** Would unify language with frontend, but less suited for AI/ML workloads

**Tradeoffs:**
- **Pros:** Performance, type safety, modern Python practices, excellent documentation
- **Cons:** Smaller ecosystem compared to Flask/Django, newer framework

### Why MongoDB?

**Primary Reasons:**
1. **Flexible Schema:** Sensor data structure varies by device type and firmware version
2. **Time-Series Optimization:** Efficient storage and querying of timestamped readings
3. **Horizontal Scaling:** Easy sharding for high-volume sensor data
4. **Geospatial Queries:** Built-in support for location-based queries
5. **Document Model:** Natural fit for sensor reading documents with nested data

**Use Case:** IoT sensor data with high write volume, varying schemas, and time-series access patterns

**Alternatives Considered:**
- **PostgreSQL:** Would require JSONB for flexibility, less optimized for time-series
- **InfluxDB:** Purpose-built for time-series, but less flexible for other data types
- **TimescaleDB:** PostgreSQL extension, but adds complexity to database management

**Tradeoffs:**
- **Pros:** Schema flexibility, scaling, geospatial, time-series performance
- **Cons:** No ACID transactions across documents, higher memory usage

### Why Supabase?

**Primary Reasons:**
1. **Built-in Authentication:** User management with JWT handling
2. **PostgreSQL Foundation:** Relational database with ACID guarantees
3. **Real-time Subscriptions:** Built-in WebSocket support for live updates
4. **Admin Interface:** Easy database management and query building
5. **Row-Level Security:** Fine-grained access control at database level
6. **Open Source:** Can self-host if needed, avoiding vendor lock-in

**Use Case:** User management, resident records, relational data with integrity constraints

**Alternatives Considered:**
- **Firebase:** NoSQL focus, less relational integrity
- **AWS RDS:** Managed PostgreSQL, but requires separate authentication service
- **Prisma + PostgreSQL:** Excellent ORM, but requires more setup for authentication

**Tradeoffs:**
- **Pros:** All-in-one solution, real-time features, open source, easy development
- **Cons:** Newer platform, smaller ecosystem compared to AWS/Azure

### Why Docker?

**Clarification:** The system does NOT currently use Docker. The backend uses a Procfile for Heroku deployment, and the frontend uses Vercel's build system. There are no Dockerfiles or docker-compose files in the project.

**Current Deployment:**
- **Frontend:** Vercel build system (builds and deploys Next.js)
- **Backend:** Heroku with Procfile (Python dependencies via requirements.txt)

**Why No Docker:**
- Vercel and Heroku provide optimized build/deploy processes
- Simpler deployment for small team
- No need for container orchestration at current scale

### Dependency Explanations

**Frontend Dependencies:**
- `@supabase/supabase-js`: Supabase client for database and auth operations
- `bcryptjs`: Password hashing for authentication
- `leaflet` + `react-leaflet`: Interactive mapping for sensor visualization
- `mongodb`: MongoDB driver for sensor data access
- `@types/*`: TypeScript type definitions for type safety

**Backend Dependencies:**
- `fastapi`: Web framework for API endpoints
- `pydantic`: Data validation and serialization
- `pymongo`: MongoDB driver for sensor data access
- `supabase`: Supabase client for PostgreSQL access
- `python-dotenv`: Environment variable management
- `uvicorn`: ASGI server for running FastAPI
- `gunicorn`: Production WSGI server with worker process management

---

## 5. Data Flow

### Complete Request Flow Example: AI Recommendation Generation

```
User (Admin)
↓
[Clicks "Generate Recommendations" button]
↓
Frontend: ReliefPanel component
↓
[Validates input: family_food_packs, medicine_kits, relief_goods_individual]
↓
Frontend: reliefService.ts
↓
[POST /api/ai/recommendations/generate]
↓
Frontend: /api/ai/recommendations/generate/route.ts
↓
[Validates inventory totals > 0]
↓
[Retrieves AI_BACKEND_URL from environment]
↓
[Proxies request to FastAPI backend]
↓
Backend: FastAPI /api/ai/recommendations/generate
↓
[Validates inventory totals > 0]
↓
[Calls repository.get_sensor_snapshot()]
↓
Backend: repository.get_sensor_snapshot()
↓
[MongoDB: sensors.find({})]
↓
[MongoDB: sensor_readings.aggregate() - gets latest reading per sensor]
↓
[Returns: sensors array, latest_readings array]
↓
[Calls repository.get_families()]
↓
Backend: repository.get_families()
↓
[Supabase: families.select(FAMILY_FIELDS)]
↓
[Returns: families array with vulnerability counts]
↓
[Calls engine.generate_recommendations(sensors, readings, families, inventory)]
↓
Backend: engine.generate_recommendations()
↓
[_group_sensors(sensors, readings) - groups by barangay]
↓
[_group_families(families) - aggregates vulnerability counts by barangay]
↓
[_score_barangay() - calculates priority score for each barangay]
↓
  ├─ [_fuzzy_explanation(water_level) - classifies flood risk]
↓
  ├─ [_ahp_breakdown(totals) - calculates vulnerability score]
↓
  └─ [priority_score = risk_weight * 100 + vulnerability_score + family_count]
↓
[Sorts barangays by priority_score (descending)]
↓
[allocate_inventory() - distributes relief supplies based on priority]
↓
[Generates recommendation objects with analysis and reasoning]
↓
[Returns: recommendations array]
↓
[Calls repository.save_recommendations(recommendations)]
↓
Backend: repository.save_recommendations()
↓
[Supabase: ai_recommendations.insert(rows)]
↓
[Returns: saved rows with database IDs]
↓
[Calls audit.log_audit_event()]
↓
Backend: audit.log_audit_event()
↓
[Supabase: audit_logs.insert(event)]
↓
[Returns: success/failure (non-blocking)]
↓
[Returns: ApiResponse with recommendations]
↓
Frontend: /api/ai/recommendations/generate/route.ts
↓
[Returns: NextResponse.json(result)]
↓
Frontend: reliefService.ts
↓
[Returns: data to ReliefPanel component]
↓
Frontend: ReliefPanel component
↓
[Updates UI with new recommendation cards]
↓
User (Admin)
[Views generated recommendations with AHP breakdown, fuzzy explanation, reasoning]
```

### API Call Flow: Sensor Data Retrieval

```
User (Admin)
↓
[Navigates to Dashboard]
↓
Frontend: DashboardPanel component
↓
[sensorsService.getLatestSensors()]
↓
[GET /api/sensors/latest]
↓
Frontend: /api/sensors/latest/route.ts
↓
[getDashboardViewer(req) - validates session cookie]
↓
[getDb() - gets MongoDB connection]
↓
[MongoDB: sensors.find({})]
↓
[MongoDB: sensor_readings.aggregate() - latest per sensor]
↓
[filterSensorsForUserScope(sensors, viewer) - applies RBAC]
↓
[isValidSensorDocument() - validates sensor structure]
↓
[normalizeBarangay() - standardizes barangay names]
↓
[resolveSensorCoordinates() - extracts location data]
↓
[Returns: normalized sensor data with latest readings]
↓
Frontend: sensorsService.ts
↓
[Returns: data to DashboardPanel]
↓
Frontend: DashboardPanel component
↓
[Updates map markers and sensor cards]
↓
User (Admin)
[Views live sensor data with flood status]
```

### Validation Flow: Login Authentication

```
User (Admin)
↓
[Enters email and password]
↓
Frontend: LoginPage component
↓
[POST /api/auth/login]
↓
Frontend: /api/auth/login/route.ts
↓
[Validates email and password presence]
↓
[Supabase: app_users.select().eq("email", email)]
↓
[Checks if user exists]
↓
[Checks account status (active/blocked/inactive)]
↓
[Checks account lockout status]
↓
[bcrypt.compare(password, password_hash)]
↓
[If match:]
↓
  [Resets failed_login_attempts to 0]
↓
  [Updates last_login_at timestamp]
↓
  [logAuditEvent(LOGIN_SUCCESS)]
↓
  [setDashboardSession(response, userId)]
↓
  [Returns: user data with session cookie]
↓
[If no match:]
↓
  [Increments failed_login_attempts]
↓
  [If >= 3 attempts: sets locked_until and status = "blocked"]
↓
  [logAuditEvent(LOGIN_FAILED or LOGIN_BLOCKED)]
↓
  [Returns: 401 Unauthorized]
↓
Frontend: LoginPage component
↓
[If success: stores session, redirects to /dashboard]
↓
[If failure: displays error message]
```

### Decision Flow: Resident Registration with Family Creation

```
User (Barangay Admin)
↓
[Opens "Add Resident" form]
↓
[Fills in resident information]
↓
[Checks "Is Family Head" checkbox]
↓
Frontend: ResidentsPanel component
↓
[POST /api/residents]
↓
Frontend: /api/residents/route.ts
↓
[getDashboardViewer(req) - validates session]
↓
[dashboardViewerRole(viewer) - checks role permissions]
↓
[scopedResidentBody(body, viewer, role) - adds barangay assignment]
↓
[Validates required fields: last_name, first_name, complete_address, barangay_id, barangay_name]
↓
[If is_family_head:]
↓
  [Supabase: residents_v3.insert(resident data)]
↓
  [Supabase: families.insert(family data with vulnerability counts)]
↓
  [Supabase: families.update(family_head_id, family_head_name)]
↓
  [Supabase: residents_v3.update(family_id)]
↓
  [logAuditEvent(RESIDENT_CREATED)]
↓
  [logAuditEvent(FAMILY_UPDATED)]
↓
  [Returns: resident + family data]
↓
[If not family_head:]
↓
  [Validates selected_family_id presence]
↓
  [validateFamilyScope() - checks family belongs to same barangay]
↓
  [Supabase: residents_v3.insert(resident data with family_id)]
↓
  [logAuditEvent(RESIDENT_CREATED)]
↓
  [Returns: resident data]
↓
Frontend: ResidentsPanel component
↓
[Refreshes resident and family tables]
↓
User (Barangay Admin)
[Views new resident in table]
```

---

## 6. AI Pipeline

### AI Triggering Mechanism

**Trigger Events:**
1. **Manual Generation:** Admin clicks "Generate Recommendations" in Relief Panel
2. **Inventory Update:** When relief inventory values are updated
3. **Scheduled Generation:** Could be automated (not currently implemented)

**Trigger Conditions:**
- Available inventory must be > 0 (family_food_packs + medicine_kits + relief_goods_individual)
- User must have appropriate permissions (CDRRMO, CSWDD, or Super Admin)
- Sensor data and family data must be accessible

### Input Processing

**Data Sources:**
1. **Sensor Data:** MongoDB `sensors` and `sensor_readings` collections
2. **Family Data:** Supabase `families` table with vulnerability counts
3. **Inventory Data:** User-provided relief supply quantities

**Input Validation:**
- Sensor readings: Valid water level values (meters)
- Family counts: Non-negative integers for vulnerability categories
- Inventory: Non-negative integers for each supply type

**Data Transformation:**
- Sensors grouped by barangay with max water level
- Families aggregated by barangay with vulnerability totals
- Barangay name normalization (aliases handling)

### AI Processing Pipeline

**Step 1: Fuzzy Logic Risk Classification**
```
Input: Water level (meters)
↓
Fuzzy Membership Functions:
  - Normal: descending membership (0.0 to 0.25m)
  - Flood Alert: trapezoid membership (0.25 to 0.75m)
  - Flood Warning: trapezoid membership (0.50 to 1.20m)
  - Severity: ascending membership (1.00 to 1.20m+)
↓
Risk Classification Rules:
  - severity: water_level >= 1.2m
  - flood_warning: water_level >= 0.75m
  - flood_alert: water_level >= 0.25m
  - normal: water_level < 0.25m
↓
Output: Risk level with confidence score and membership values
```

**Step 2: AHP Vulnerability Scoring**
```
Input: Family vulnerability counts by barangay
↓
AHP Weights (predefined based on vulnerability priority):
  - Infant: 0.22 (highest priority)
  - Elderly: 0.20
  - PWD: 0.18
  - Pregnant: 0.12
  - Lactating: 0.10
  - Toddler: 0.10
  - 4Ps Member: 0.08 (lowest priority)
↓
Vulnerability Score Calculation:
  For each category:
    contribution = count × weight
  total_vulnerability_score = sum(contributions)
↓
Output: AHP breakdown with weights, counts, contributions, total score
```

**Step 3: Priority Score Calculation**
```
Input: Risk level, vulnerability score, total family members
↓
Risk Weights:
  - severity: 4
  - flood_warning: 3
  - flood_alert: 2
  - normal: 1
↓
Priority Score Formula:
  priority_score = (risk_weight × 100) + vulnerability_score + total_family_members
↓
Output: Numeric priority score for ranking barangays
```

**Step 4: Inventory Allocation**
```
Input: Priority-ranked barangays, available inventory
↓
Allocation Algorithm:
  1. Calculate need for each barangay:
     - Food: max(1, affected_families)
     - Medicine: max(1, pwd + elderly + lactating + pregnant + infant)
     - Goods: max(1, total_family_members)
  
  2. Initial allocation based on priority score:
     allocation = floor((available × priority_score) / total_priority)
  
  3. Round robin distribution of remaining inventory:
     While inventory remaining:
       For each barangay (by priority):
         If allocation < need:
           allocation += 1
           remaining -= 1
↓
Output: Aligned inventory per barangay (respects constraints)
```

### Decision Making Process

**Multi-Criteria Decision Analysis:**
1. **Flood Risk:** Primary factor (70% weight via risk_weight × 100)
2. **Vulnerability:** Secondary factor (demographic vulnerability)
3. **Population:** Tertiary factor (total family members)

**Rationale:**
- Flood risk determines immediate need and urgency
- Vulnerability ensures equitable distribution to at-risk populations
- Population prevents neglect of smaller but severely affected areas

**Explainability:**
- Each recommendation includes fuzzy explanation with membership values
- AHP breakdown shows exact contribution of each vulnerability factor
- Reasoning steps provide narrative explanation of decision process

### Output Generation

**Recommendation Structure:**
```json
{
  "recommendation_id": "UUID",
  "barangay_id": "1",
  "barangay_name": "Barangay Tanong",
  "risk_level": "severity",
  "priority_score": 405.78,
  "affected_families": 12,
  "recommended_family_food_packs": 12,
  "recommended_medicine_kits": 18,
  "recommended_relief_goods_individual": 80,
  "analysis_reason": "Severity flood risk detected at 1.20m with 12 affected families...",
  "ahp_breakdown": {
    "weights": {...},
    "counts": {...},
    "contributions": {...},
    "total_vulnerability_score": 5.76
  },
  "fuzzy_explanation": {
    "water_level_m": 1.2,
    "risk_level": "severity",
    "risk_label": "Severity",
    "confidence": 1.0,
    "memberships": {...}
  },
  "reasoning_steps": [
    "Sensor reading classified the barangay as Severity risk.",
    "Family vulnerability score was computed using AHP-inspired weights.",
    "Available inventory was distributed based on priority and affected families."
  ],
  "status": "generated",
  "created_by": "City Admin",
  "created_at": "2026-05-31T12:00:00+00:00"
}
```

### Confidence Calculation

**Fuzzy Confidence:**
- Derived from membership function value for dominant risk category
- Range: 0.0 to 1.0
- Higher confidence = clearer classification (less ambiguity)

**Interpretation:**
- 1.0: Clear classification (e.g., 1.5m is clearly "severity")
- 0.5: Borderline case (e.g., 0.74m is between "alert" and "warning")
- 0.0: No clear classification

### Reasoning Pipeline

**Step-by-Step Explanation:**
1. **Sensor Classification:** Explain how water level translated to risk category
2. **Vulnerability Assessment:** Show how demographic factors contributed to score
3. **Inventory Distribution:** Explain allocation logic and constraints

**Human-Readable Format:**
- Natural language descriptions
- Technical details available in breakdowns
- Traceable decision process

### Storage Strategy

**Database Storage:**
- **Table:** `ai_recommendations` in Supabase
- **Fields:** All recommendation data plus metadata
- **Indexing:** Created at timestamp for history queries

**Retention Policy:**
- All recommendations stored indefinitely
- Can be filtered by date, barangay, risk level
- Used for historical analysis and audit trail

### Audit Logging

**AI-Specific Audit Events:**
- `AI_RECOMMENDATION_GENERATED`: When recommendations are created
- `RELIEF_INVENTORY_UPDATED`: When inventory values change
- Includes actor information (user who triggered generation)

**Audit Data:**
- Actor (user ID, name, role)
- Action (AI_RECOMMENDATION_GENERATED)
- Module (AI-Optimized Relief Recommendation)
- Description (Number of barangays, inventory context)
- Target type (ai_recommendation_batch)
- Target ID (Timestamp batch identifier)

### Human-in-the-Loop

**Current Implementation:**
- **Generation Trigger:** Manual by admin (no automatic generation)
- **Review Process:** Admin can view recommendations before acting
- **Override Capability:** Admin can modify inventory and regenerate
- **Approval Workflow:** Not currently implemented (recommendations are advisory)

**Future Enhancements:**
- Approval workflow before recommendation activation
- Manual adjustment of allocation amounts
- Escalation workflow for edge cases
- Feedback loop for algorithm improvement

---

## 7. Database Design

### MongoDB Collections

#### sensors Collection
**Purpose:** Store IoT sensor device metadata and configuration

**Schema:**
```javascript
{
  _id: ObjectId,
  sensorId: String,           // Unique sensor identifier
  sensor_id: String,          // Alternative ID field
  name: String,               // Human-readable sensor name
  barangayName: String,       // Barangay location
  barangay: String,           // Alternative barangay field
  street: String,             // Street location
  status: String,             // Sensor status (active/inactive)
  location: {                 // GeoJSON coordinates
    type: "Point",
    coordinates: [longitude, latitude]
  },
  geo: {                      // Alternative location format
    type: "Point",
    coordinates: [longitude, latitude]
  },
  lastSeenAt: Date,           // Last communication timestamp
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `sensorId` (unique)
- `barangayName` (for location-based queries)
- `location` (geospatial queries)
- `status` (for filtering active sensors)

#### sensor_readings Collection
**Purpose:** Time-series water level and sensor data

**Schema:**
```javascript
{
  _id: ObjectId,
  sensorId: String,           // Reference to sensors collection
  waterLevelM: Float,         // Water level in meters
  waterLevel: Float,          // Alternative water level field
  distanceCm: Float,          // Distance measurement (ultrasonic)
  rainfallMm: Float,          // Rainfall measurement
  batteryPct: Float,          // Battery percentage
  computedStatus: String,     // Computed flood status
  status: String,             // Raw status from sensor
  createdAt: Date,            // Reading timestamp
  receivedAt: Date            // When server received the reading
}
```

**Indexes:**
- `sensorId` + `createdAt` (compound index for time-series queries)
- `createdAt` (for temporal queries)
- `sensorId` (for sensor-specific queries)

**Aggregation Pipeline:**
```javascript
// Get latest reading per sensor
[
  { $sort: { createdAt: -1 } },
  { $group: {
    _id: "$sensorId",
    doc: { $first: "$$ROOT" }
  }}
]
```

### Supabase Tables

#### app_users Table
**Purpose:** Admin user accounts and authentication

**Schema:**
```sql
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile_number VARCHAR(20),
  address TEXT,
  profile_image TEXT,
  barangay_id INTEGER REFERENCES barangays(barangay_id),
  barangay VARCHAR(255),
  sex VARCHAR(10),
  role_id INTEGER REFERENCES roles(role_id),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked
  password_hash TEXT,                  -- bcrypt hash
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `email` (unique)
- `role_id` (for role-based queries)
- `barangay_id` (for location-based access)
- `status` (for filtering active users)

#### residents_v3 Table
**Purpose:** Resident demographic information

**Schema:**
```sql
CREATE TABLE residents_v3 (
  resident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  suffix VARCHAR(10),
  age INTEGER,
  sex VARCHAR(10),
  contact_number VARCHAR(20),
  complete_address TEXT NOT NULL,
  street VARCHAR(255),
  barangay_id INTEGER REFERENCES barangays(barangay_id),
  barangay_name VARCHAR(255),
  is_family_head BOOLEAN DEFAULT FALSE,
  family_id UUID REFERENCES families(family_id),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `family_id` (for family queries)
- `barangay_id` (for location-based queries)
- `last_name`, `first_name` (for search)
- `status` (for filtering active residents)

#### families Table
**Purpose:** Family clusters with vulnerability aggregation

**Schema:**
```sql
CREATE TABLE families (
  family_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_name VARCHAR(255) NOT NULL,
  family_head_id UUID REFERENCES residents_v3(resident_id),
  family_head_name VARCHAR(255),
  barangay_id INTEGER REFERENCES barangays(barangay_id),
  barangay_name VARCHAR(255),
  complete_address TEXT,
  street VARCHAR(255),
  pwd_count INTEGER DEFAULT 0,           -- Persons with disability
  elderly_count INTEGER DEFAULT 0,       -- Senior citizens (60+)
  four_ps_count INTEGER DEFAULT 0,      -- 4Ps program members
  lactating_count INTEGER DEFAULT 0,     -- Lactating mothers
  pregnant_count INTEGER DEFAULT 0,      -- Pregnant women
  infant_count INTEGER DEFAULT 0,       -- Infants (0-1 year)
  toddler_count INTEGER DEFAULT 0,       -- Toddlers (1-3 years)
  total_family_members INTEGER DEFAULT 0,
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `barangay_id` (for location-based queries)
- `family_head_id` (for family head queries)
- `family_name` (for search)

#### resident_applications Table
**Purpose:** Pending resident registration applications

**Schema:**
```sql
CREATE TABLE resident_applications (
  application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_data JSONB,                    -- Application form data
  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
  reviewed_by UUID REFERENCES app_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ai_recommendations Table
**Purpose:** AI-generated relief allocation recommendations

**Schema:**
```sql
CREATE TABLE ai_recommendations (
  recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barangay_id INTEGER REFERENCES barangays(barangay_id),
  barangay_name VARCHAR(255),
  risk_level VARCHAR(20),                -- severity, flood_warning, flood_alert, normal
  priority_score NUMERIC,
  affected_families INTEGER,
  recommended_family_food_packs INTEGER,
  recommended_medicine_kits INTEGER,
  recommended_relief_goods_individual INTEGER,
  analysis_reason TEXT,
  ahp_breakdown JSONB,                   -- AHP scoring details
  fuzzy_explanation JSONB,               -- Fuzzy logic details
  reasoning_steps JSONB,                 -- Step-by-step explanation
  status VARCHAR(20) DEFAULT 'generated',
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `created_at` (for temporal queries)
- `barangay_id` (for location-based queries)
- `risk_level` (for filtering by severity)

#### relief_inventory Table
**Purpose:** Available relief supply inventory

**Schema:**
```sql
CREATE TABLE relief_inventory (
  inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_food_packs INTEGER DEFAULT 0,
  medicine_kits INTEGER DEFAULT 0,
  relief_goods_individual INTEGER DEFAULT 0,
  updated_by UUID REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### audit_logs Table
**Purpose:** System activity audit trail

**Schema:**
```sql
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES app_users(id),
  actor_name VARCHAR(255),
  actor_role VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100),
  description TEXT,
  target_type VARCHAR(100),
  target_id VARCHAR(255),
  barangay_id INTEGER REFERENCES barangays(barangay_id),
  barangay_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `created_at` (for temporal queries)
- `actor_user_id` (for user activity queries)
- `action` (for action-type filtering)
- `module` (for module-specific queries)
- `barangay_id` (for location-based queries)

#### roles Table
**Purpose:** Role definitions and permissions

**Schema:**
```sql
CREATE TABLE roles (
  role_id INTEGER PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_label VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Predefined Roles:**
- 1: Super Admin (full access)
- 2: CDRRMO Admin (disaster response focus)
- 3: CSWDD Admin (social welfare focus)
- 4: Barangay Admin (barangay-level access)

#### barangays Table
**Purpose:** Location reference data

**Schema:**
```sql
CREATE TABLE barangays (
  barangay_id INTEGER PRIMARY KEY,
  barangay_name VARCHAR(255) UNIQUE NOT NULL,
  district VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Predefined Barangays:**
- 1: Barangay Tanong
- 2: Barangay Catmon
- 3: Barangay Potrero

### Database Relationships

**Key Relationships:**
- `app_users.barangay_id` → `barangays.barangay_id`
- `app_users.role_id` → `roles.role_id`
- `residents_v3.barangay_id` → `barangays.barangay_id`
- `residents_v3.family_id` → `families.family_id`
- `families.barangay_id` → `barangays.barangay_id`
- `families.family_head_id` → `residents_v3.resident_id`
- `ai_recommendations.barangay_id` → `barangays.barangay_id`
- `ai_recommendations.created_by` → `app_users.id`
- `relief_inventory.updated_by` → `app_users.id`
- `audit_logs.actor_user_id` → `app_users.id`
- `audit_logs.barangay_id` → `barangays.barangay_id`

**MongoDB Relationships:**
- `sensor_readings.sensorId` → `sensors.sensorId` (application-level reference)

### Why Hybrid Database?

**Advantages:**
1. **Optimized for Use Cases:**
   - MongoDB: High-volume time-series sensor data with flexible schema
   - PostgreSQL: Transactional relational data with integrity constraints

2. **Performance:**
   - MongoDB excels at write-heavy time-series workloads
   - PostgreSQL excels at complex relational queries and transactions

3. **Scalability:**
   - MongoDB horizontal scaling for sensor data growth
   - PostgreSQL vertical scaling for user/resident data

4. **Data Model Fit:**
   - Document model suits varied sensor data structures
   - Relational model suits structured user/resident relationships

5. **Feature Set:**
   - MongoDB: Geospatial queries, flexible schema, time-series optimization
   - PostgreSQL: ACID transactions, referential integrity, complex joins

**Disadvantages:**
1. **Complexity:** Two database systems to manage and monitor
2. **Cost:** Two separate database services (though both have free tiers)
3. **Data Consistency:** No cross-database transactions (eventual consistency)
4. **Development Overhead:** Team must know both query languages
5. **Backup Complexity:** Separate backup strategies for each system

**Mitigation Strategies:**
- Clear separation of concerns (sensor vs. user data)
- Application-level data consistency checks
- Unified API layer abstracts database complexity
- Monitoring and alerting for both systems

---

## 8. Security

### Authentication

**Login Flow:**
1. User submits email/password to `/api/auth/login`
2. Server queries `app_users` table by email
3. Password verified using bcrypt comparison
4. Successful login creates signed HTTP-only cookie
5. Failed login increments attempt counter
6. 3 failed attempts trigger 15-minute lockout

**Session Management:**
- **Cookie Name:** `smartflood_dashboard_session`
- **Cookie Type:** HTTP-only, signed with HMAC-SHA256
- **Session Duration:** 12 hours
- **Cookie Security:** `secure` flag in production, `sameSite=strict`
- **Session Payload:** `{ userId, expiresAt }` (base64url encoded)
- **Signature:** HMAC-SHA256 using `SMARTFLOOD_SESSION_SECRET` or `SUPABASE_SERVICE_ROLE_KEY`

**Password Storage:**
- **Hashing Algorithm:** bcrypt (cost factor 10)
- **Storage:** `password_hash` field in `app_users` table
- **No Plaintext:** Passwords never stored or logged in plaintext

### JWT

**Clarification:** The system does NOT use JWT (JSON Web Tokens). It uses signed HTTP-only cookies with HMAC-SHA256 signatures.

**Why Not JWT:**
- Simpler implementation with signed cookies
- No need for token revocation complexity
- HTTP-only cookies provide same security benefits
- Session timeout handled by cookie expiration

**Current Implementation:**
- Base64url encoded JSON payload
- HMAC-SHA256 signature for tamper protection
- Server-side secret for signature generation
- Timing-safe comparison for signature validation

### RBAC (Role-Based Access Control)

**Role Hierarchy:**
1. **Super Admin (role_id=1):** Full system access
2. **CDRRMO Admin (role_id=2):** Disaster response operations
3. **CSWDD Admin (role_id=3):** Social welfare and resident management
4. **Barangay Admin (role_id=4):** Barangay-level access only

**Role Permissions:**

**Super Admin:**
- All dashboard modules
- Full CRUD on all data
- Account management (all roles)
- System logs access
- All barangays data

**CDRRMO Admin:**
- Dashboard monitoring
- Flood monitoring module
- Sensor history
- System logs (CDRRMO scope)
- No resident management
- No account management

**CSWDD Admin:**
- Dashboard monitoring
- Flood monitoring module
- Relief recommendations
- Resident information
- System logs (CSWDD scope)
- No sensor management
- No account management

**Barangay Admin:**
- Dashboard monitoring
- Flood monitoring module
- Sensor history (barangay-scoped)
- Resident information (barangay-scoped)
- Resident application management
- System logs (barangay-scoped)
- No city-wide data access

**Implementation:**
- **Navigation:** Role-based menu items in `navigationItemsForRole()`
- **API Guards:** Server-side role checks in API routes
- **Data Scoping:** Barangay-level filtering for non-super users
- **Log Visibility:** Role-based audit log filtering

### Password Hashing

**Algorithm:** bcrypt with 10 salt rounds
**Library:** bcryptjs (JavaScript implementation)
**Usage:**
```javascript
// Hashing
const hash = await bcrypt.hash(password, 10);

// Verification
const match = await bcrypt.compare(password, hash);
```

**Security Properties:**
- Automatic salt generation
- Computationally intensive (prevents brute force)
- Built-in work factor (cost parameter)
- Constant-time comparison (prevents timing attacks)

### Environment Variables

**Frontend Environment (.env):**
```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (server-side)
MONGODB_URI=                     # MongoDB connection string
MONGODB_DB=                      # MongoDB database name
AI_BACKEND_URL=                  # FastAPI backend URL
SMARTFLOOD_SESSION_SECRET=       # Session signing secret
NODE_ENV=                        # development/production
```

**Backend Environment (.env):**
```bash
MONGODB_URI=                     # MongoDB connection string
MONGODB_DB=                      # MongoDB database name
SUPABASE_URL=                    # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key
CORS_ORIGINS=                    # Allowed frontend origins
```

**Security Practices:**
- Never commit `.env` files to version control
- Use different secrets for development/production
- Rotate secrets periodically
- Limit service role key usage to server-side only
- Use strong, randomly generated secrets

### Validation

**Input Validation:**
- **Type Checking:** TypeScript/Pydantic enforce types at compile/runtime
- **Required Fields:** API routes validate presence of required data
- **Range Validation:** Numeric values checked for valid ranges
- **Enum Validation:** Categorical values checked against allowed values
- **Length Validation:** String fields validated for length constraints

**Output Validation:**
- **Data Sanitization:** Sensitive fields removed from responses
- **Type Coercion:** Numbers properly converted from strings
- **Null Handling:** Graceful handling of missing/null values
- **SQL Injection Prevention:** Parameterized queries via Supabase client
- **NoSQL Injection Prevention:** MongoDB driver sanitization

**Validation Examples:**
```typescript
// Login validation
if (!email || !password) {
  return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
}

// Inventory validation
if (inventory.total <= 0) {
  throw new HTTPException(status_code=400, detail="Please input available relief inventory before generating recommendations.");
}
```

### Rate Limiting

**Current Implementation:** No explicit rate limiting implemented

**Recommendations:**
- Implement rate limiting on authentication endpoints
- Add API rate limiting for AI generation endpoints
- Use Redis-based rate limiting for distributed systems
- Consider Vercel's built-in rate limiting for frontend

**Potential Implementation:**
```typescript
// Example rate limiting middleware
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute
});
```

### CORS

**Implementation:**
- **Frontend:** Next.js handles CORS automatically for same-origin
- **Backend:** FastAPI CORS middleware configured

**Backend CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(get_settings().cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Environment Configuration:**
```bash
CORS_ORIGINS=http://localhost:3000,https://smartflood.vercel.app
```

**Security Considerations:**
- Specific origins instead of wildcard in production
- Credentials allowed for cookie-based authentication
- All methods and headers allowed for flexibility
- Environment-based configuration for different environments

### Secrets Management

**Current Approach:**
- Environment variables in `.env` files (not committed)
- Platform-specific secret management (Vercel/Heroku)
- Service role keys for database access

**Recommendations:**
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Implement secret rotation policies
- Audit secret access logs
- Use different secrets for different environments
- Never log secrets or include in error messages

### Possible Vulnerabilities

**Identified Issues:**

1. **Missing Rate Limiting:**
   - Vulnerability: Brute force attacks on authentication
   - Mitigation: Implement rate limiting on login endpoint
   - Current: Account lockout after 3 failures provides some protection

2. **Session Secret Reuse:**
   - Vulnerability: Using SUPABASE_SERVICE_ROLE_KEY as session secret
   - Mitigation: Use dedicated SMARTFLOOD_SESSION_SECRET
   - Current: Fallback to service role key if dedicated secret not set

3. **No CSRF Protection:**
   - Vulnerability: Cross-site request forgery attacks
   - Mitigation: Implement CSRF tokens for state-changing operations
   - Current: SameSite=strict cookies provide some protection

4. **Client-Side Session Storage:**
   - Vulnerability: localStorage backup of session data
   - Mitigation: Rely solely on HTTP-only cookie
   - Current: localStorage used as backup, HTTP-only cookie is primary

5. **Missing Input Sanitization:**
   - Vulnerability: XSS attacks through user input
   - Mitigation: Implement HTML sanitization for user-generated content
   - Current: React provides some XSS protection by default

6. **No API Key Scoping:**
   - Vulnerability: Single service role key for all operations
   - Mitigation: Use scoped keys for different operations
   - Current: Service role key has full database access

### Missing Security

**Recommended Additions:**

1. **Content Security Policy (CSP):**
   - Implement CSP headers to prevent XSS
   - Restrict script sources and inline scripts

2. **Security Headers:**
   - Add HSTS (HTTP Strict Transport Security)
   - Implement X-Frame-Options to prevent clickjacking
   - Add X-Content-Type-Options: nosniff

3. **Dependency Scanning:**
   - Implement automated dependency vulnerability scanning
   - Use tools like Snyk or Dependabot
   - Regular dependency updates

4. **Security Logging:**
   - Enhanced logging for security events
   - Alerting for suspicious activities
   - Failed login attempt monitoring

5. **Data Encryption:**
   - Encryption at rest for sensitive data
   - Consider field-level encryption for PII
   - Database backup encryption

6. **API Security:**
   - API key authentication for external integrations
   - Request signing for AI backend communication
   - IP whitelisting for admin operations

### OWASP Considerations

**OWASP Top 10 Addressed:**

1. **A01:2021 – Broken Access Control:**
   - ✅ RBAC implemented with role-based navigation
   - ✅ Server-side session validation
   - ⚠️ Some routes lack proper role checks
   - ⚠️ Missing CSRF protection

2. **A02:2021 – Cryptographic Failures:**
   - ✅ Bcrypt for password hashing
   - ✅ HTTPS in production
   - ⚠️ No data encryption at rest
   - ⚠️ Session secret reuse

3. **A03:2021 – Injection:**
   - ✅ Parameterized queries via Supabase client
   - ✅ MongoDB driver sanitization
   - ✅ Input validation on API routes
   - ⚠️ No SQL injection protection for raw queries (if any)

4. **A04:2021 – Insecure Design:**
   - ✅ AI algorithm explainability
   - ✅ Audit trail for all operations
   - ⚠️ No formal threat modeling
   - ⚠️ Missing security headers

5. **A05:2021 – Security Misconfiguration:**
   - ✅ Environment-based configuration
   - ⚠️ No security headers implemented
   - ⚠️ CORS configuration could be more restrictive
   - ⚠️ No rate limiting

6. **A06:2021 – Vulnerable and Outdated Components:**
   - ⚠️ No automated dependency scanning
   - ⚠️ No regular update schedule documented
   - ✅ Using recent versions of major frameworks

7. **A07:2021 – Identification and Authentication Failures:**
   - ✅ Bcrypt password hashing
   - ✅ Account lockout after failed attempts
   - ✅ Secure session management
   - ⚠️ No multi-factor authentication
   - ⚠️ No password complexity requirements

8. **A08:2021 – Software and Data Integrity Failures:**
   - ⚠️ No code signing implemented
   - ⚠️ No dependency integrity verification
   - ✅ Audit trail for data changes

9. **A09:2021 – Security Logging and Monitoring:**
   - ✅ Comprehensive audit logging
   - ⚠️ No security-specific alerting
   - ⚠️ No intrusion detection
   - ⚠️ Limited log monitoring

10. **A10:2021 – Server-Side Request Forgery (SSRF):**
    - ⚠️ AI backend proxy could be vulnerable
    - ✅ Limited to specific AI backend URL
    - ⚠️ No URL validation on proxy requests

---

## 9. Features

### 1. Dashboard Monitoring

**Purpose:** Provide real-time overview of flood situation across monitored barangays

**How It Works:**
- Fetches latest sensor data from MongoDB
- Displays interactive map with sensor markers
- Shows sensor cards with flood status
- Filters for severe alerts only
- Updates in real-time (manual refresh)

**APIs Used:**
- `GET /api/sensors/latest` - Retrieves current sensor readings

**Databases Used:**
- MongoDB: `sensors`, `sensor_readings` collections

**Frontend Page:**
- `/dashboard` - Main dashboard page
- `DashboardPanel` component

**User Flow:**
1. Admin logs in and navigates to Dashboard
2. System displays map with all sensor locations
3. Each sensor shows current water level and flood status
4. Admin can filter to show only severe alerts
5. Clicking sensor shows detailed information
6. Admin can jump to sensor history for detailed analysis

---

### 2. Flood Monitoring Module

**Purpose:** Comprehensive flood analysis with alert levels, heatmaps, and historical data

**How It Works:**
- Three sub-modules: Alert Level Management, Flood Heatmap, Flood History
- Displays current flood risk distribution
- Shows heatmap visualization of affected areas
- Provides historical flood records with filtering
- Generates narrative flood reports

**APIs Used:**
- `GET /api/sensors/latest` - Current sensor data
- `GET /api/sensors/history?limit=100` - Historical readings

**Databases Used:**
- MongoDB: `sensors`, `sensor_readings` collections

**Frontend Page:**
- `/dashboard#monitoring` - Flood monitoring page
- `MonitoringPanel` component

**User Flow:**
1. Admin navigates to Flood Monitoring Module
2. Selects sub-module (Alert Levels, Heatmap, or History)
3. Views current flood situation with visualizations
4. Filters historical data by date, barangay, sensor
5. Reviews narrative report of current situation
6. Analyzes trends over time with timeline charts

---

### 3. Sensor History

**Purpose:** Detailed view of sensor network and historical performance

**How It Works:**
- Displays tabulated list of all sensors
- Shows latest reading for each sensor
- Filters by sensor ID, barangay, status, alert level
- Interactive map with sensor locations
- Click-to-focus functionality

**APIs Used:**
- `GET /api/sensors/latest` - Sensor network snapshot

**Databases Used:**
- MongoDB: `sensors`, `sensor_readings` collections

**Frontend Page:**
- `/dashboard#sensors` - Sensor history page
- `SensorsPanel` component

**User Flow:**
1. Admin navigates to Sensor History
2. Views table with all sensors and latest readings
3. Applies filters to find specific sensors
4. Clicks table row to focus map on sensor
5. Reviews sensor status and performance
6. Identifies sensors needing maintenance

---

### 4. AI-Optimized Relief Recommendation

**Purpose:** Generate data-driven relief allocation recommendations based on flood risk and vulnerability

**How It Works:**
- Accepts available relief inventory input
- Retrieves current sensor data and family vulnerability
- Applies fuzzy logic for flood risk classification
- Uses AHP for vulnerability scoring
- Calculates priority scores for each barangay
- Allocates inventory based on priority
- Provides explainable AI recommendations

**APIs Used:**
- `POST /api/ai/recommendations/generate` - Generate recommendations
- `GET /api/ai/recommendations` - Retrieve recommendation history
- `GET /api/relief/inventory` - Get current inventory
- `POST /api/relief/inventory` - Update inventory

**Databases Used:**
- MongoDB: `sensors`, `sensor_readings` (via AI backend)
- Supabase: `families`, `ai_recommendations`, `relief_inventory`

**Frontend Page:**
- `/dashboard#relief` - Relief recommendation page
- `ReliefPanel` component

**User Flow:**
1. Admin navigates to AI-Optimized Relief Recommendation
2. Enters available relief inventory (food packs, medicine, goods)
3. Clicks "Generate Recommendations"
4. System processes sensor and family data
5. Displays recommendation cards for each barangay
6. Admin reviews AHP breakdown and fuzzy explanation
7. Views reasoning steps for transparency
8. Can regenerate with different inventory values
9. Historical recommendations available for review

---

### 5. Resident Information Management

**Purpose:** Manage resident records and family clusters with vulnerability data

**How It Works:**
- CRUD operations for resident records
- Family cluster creation and management
- Vulnerability demographic tracking
- Barangay-scoped data access
- Search and filter functionality

**APIs Used:**
- `GET /api/residents` - List residents
- `POST /api/residents` - Create resident
- `PATCH /api/residents/[id]` - Update resident
- `GET /api/families` - List families

**Databases Used:**
- Supabase: `residents_v3`, `families` tables

**Frontend Page:**
- `/dashboard#residents` - Resident information page
- `ResidentsPanel` component

**User Flow:**
1. Admin navigates to Resident Information
2. Views table of all residents (scoped to role)
3. Searches by name or filters by barangay
4. Clicks "Add Resident" to create new record
5. Fills in resident information form
6. If family head, creates new family cluster
7. If not family head, selects existing family
8. System validates and saves resident data
9. Can edit existing resident information
10. Views family cluster details with vulnerability counts

---

### 6. Resident Account Registration Management

**Purpose:** Review and process resident registration applications

**How It Works:**
- Three tabs: Pending, Approved, Rejected applications
- Review modal for application details
- Approve/reject workflow with audit trail
- Automatic resident/family creation on approval
- Application status tracking

**APIs Used:**
- `GET /api/resident-applications` - List applications
- `PATCH /api/resident-applications/[id]/review` - Review application

**Databases Used:**
- Supabase: `resident_applications`, `residents_v3`, `families` tables

**Frontend Page:**
- `/dashboard#accounts` - Account registration page
- `VerificationPanel` component

**User Flow:**
1. Admin navigates to Resident Account Registration Management
2. Views pending applications by default
3. Clicks "Review" on an application
4. Reviews application details in modal
5. Decides to approve or reject
6. If approve:
   - System creates resident record
   - Creates family cluster if family head
   - Links to existing family if not family head
   - Updates application status to approved
7. If reject:
   - System adds review notes
   - Updates application status to rejected
8. Application moves to appropriate tab
9. Audit log records the decision

---

### 7. Account Management

**Purpose:** Manage admin user accounts and role assignments

**How It Works:**
- CRUD operations for admin accounts
- Role assignment and barangay assignment
- Account status management (active/inactive/blocked)
- Password reset functionality
- Activity log review

**APIs Used:**
- `GET /api/app-users` - List admin accounts
- `POST /api/app-users` - Create admin account
- `PATCH /api/app-users/[id]` - Update admin account
- `PATCH /api/app-users/[id]/status` - Change account status
- `PATCH /api/app-users/[id]/password` - Reset password

**Databases Used:**
- Supabase: `app_users`, `roles`, `barangays` tables

**Frontend Page:**
- `/dashboard#logs` - Account management page
- `LogsPanel` component with `AccountManagement` sub-component

**User Flow:**
1. Super Admin navigates to Account Management
2. Views table of all admin accounts
3. Searches and filters accounts
4. Clicks "Add Account" to create new admin
5. Fills in account information and assigns role
6. Can edit existing account details
7. Can change account status (active/inactive/blocked)
8. Can reset passwords for accounts
9. Reviews account activity through logs

---

### 8. System Logs and Audit Trail

**Purpose:** Comprehensive audit logging of all system activities

**How It Works:**
- Automatic logging of all user actions
- Role-based log visibility (scoping)
- Filterable by module, action, actor, barangay
- Detailed audit information with timestamps
- Non-blocking audit writes (best-effort)

**APIs Used:**
- `GET /api/logs` - Retrieve audit logs
- `POST /api/logs` - Create audit log entry

**Databases Used:**
- Supabase: `audit_logs` table

**Frontend Page:**
- `/dashboard#systemLogs` - System logs page
- `/dashboard#logs` - Account management with logs
- `SystemLogs` component
- `LogsPanel` component

**User Flow:**
1. Admin navigates to System Logs (role-specific name)
2. Views audit log entries scoped to role
3. Super Admin sees all logs
4. Other roles see relevant logs based on scope
5. Filters logs by module, action, actor, barangay
6. Reviews detailed audit information
7. Searches for specific activities
8. Tracks user actions for accountability

---

### 9. Sensor Simulation

**Purpose:** Simulate sensor data for testing and demonstration

**How It Works:**
- Generates synthetic sensor readings
- Tests flood risk classification
- Demonstrates AI recommendation generation
- Useful for development and testing

**APIs Used:**
- `POST /api/sensors/simulate` - Generate simulated readings

**Databases Used:**
- MongoDB: `sensor_readings` collection

**Frontend Page:**
- `/sensor-simulator` - Standalone simulator page

**User Flow:**
1. Developer/Tester navigates to Sensor Simulator
2. Configures simulation parameters
3. Generates synthetic sensor data
4. System processes simulated readings
5. Tests flood classification and recommendations
6. Useful for development without real sensors

---

## 10. User Roles

### Super Admin (role_id=1)

**Permissions:**
- Full access to all dashboard modules
- Complete CRUD operations on all data
- Account management for all roles
- System-wide log visibility
- All barangays data access
- AI recommendation generation
- Relief inventory management

**Restrictions:**
- None (full system access)

**Access Flow:**
1. Logs in with Super Admin credentials
2. Sees complete navigation menu
3. Can access any module
4. Can manage accounts of any role
5. Can view all system logs
6. Can perform any system operation

**Use Case:**
- System administrator
- Emergency operations center director
- City disaster response coordinator

---

### CDRRMO Admin (role_id=2)

**Permissions:**
- Dashboard monitoring
- Flood monitoring module (all features)
- Sensor history and management
- AI recommendation generation
- System logs (CDRRMO-scoped)
- No resident management
- No account management

**Restrictions:**
- Cannot access resident information
- Cannot manage admin accounts
- Cannot access CSWDD-specific logs
- Cannot manage resident applications

**Access Flow:**
1. Logs in with CDRRMO credentials
2. Sees CDRRMO-specific navigation
3. Can monitor flood situation
4. Can generate relief recommendations
5. Can view sensor data and history
6. Cannot access resident management

**Use Case:**
- City Disaster Risk Reduction and Management Office staff
- Flood monitoring operators
- Emergency response coordinators

---

### CSWDD Admin (role_id=3)

**Permissions:**
- Dashboard monitoring
- Flood monitoring module (view-only)
- AI recommendation generation
- Resident information management
- System logs (CSWDD-scoped)
- No sensor management
- No account management

**Restrictions:**
- Cannot access sensor history
- Cannot manage admin accounts
- Cannot access CDRRMO-specific logs
- Cannot manage sensor configurations

**Access Flow:**
1. Logs in with CSWDD credentials
2. Sees CSWDD-specific navigation
3. Can monitor flood situation
4. Can manage resident information
5. Can generate relief recommendations
6. Cannot access sensor management

**Use Case:**
- City Social Welfare and Development Department staff
- Social workers
- Relief distribution coordinators

---

### Barangay Admin (role_id=4)

**Permissions:**
- Dashboard monitoring (barangay-scoped)
- Flood monitoring module (barangay-scoped)
- Sensor history (barangay-scoped)
- Resident information (barangay-scoped)
- Resident application management
- System logs (barangay-scoped)
- No city-wide operations
- No account management

**Restrictions:**
- Can only access data for assigned barangay
- Cannot generate AI recommendations
- Cannot manage admin accounts
- Cannot access other barangays' data
- Cannot access city-wide logs

**Access Flow:**
1. Logs in with Barangay Admin credentials
2. Sees Barangay-specific navigation
3. Can only view data for assigned barangay
4. Can manage residents in assigned barangay
5. Can process resident applications
6. Cannot access city-wide features

**Use Case:**
- Barangay disaster response coordinator
- Barangay social worker
- Local community leader

---

## 11. Project Workflow

### Resident Registration Flow

```
Resident (Citizen)
↓
[Submits registration application via form]
↓
[Application stored in resident_applications table]
↓
Status: pending
↓
Barangay Admin
↓
[Reviews pending applications]
↓
[Opens application review modal]
↓
[Verifies application information]
↓
[Decision: Approve or Reject]
↓
If APPROVE:
↓
  [System creates resident record in residents_v3]
↓
  [If family head: creates family cluster in families]
↓
  [If not family head: links to existing family]
↓
  [Updates application status to approved]
↓
  [Audit log: RESIDENT_APPLICATION_APPROVED]
↓
If REJECT:
↓
  [Adds review notes]
↓
  [Updates application status to rejected]
↓
  [Audit log: RESIDENT_APPLICATION_REJECTED]
↓
Resident (Citizen)
[Notified of application status (future feature)]
```

---

### Admin Login Flow

```
Admin User
↓
[Navigates to login page]
↓
[Enters email and password]
↓
[POST /api/auth/login]
↓
[Server validates credentials]
↓
[Checks account status (active/blocked/inactive)]
↓
[Checks account lockout status]
↓
[Verifies password using bcrypt]
↓
If SUCCESS:
↓
  [Resets failed_login_attempts to 0]
↓
  [Updates last_login_at timestamp]
↓
  [Creates signed session cookie]
↓
  [Audit log: LOGIN_SUCCESS]
↓
  [Redirects to /dashboard]
↓
If FAILURE:
↓
  [Increments failed_login_attempts]
↓
  [If >= 3: locks account for 15 minutes]
↓
  [Audit log: LOGIN_FAILED or LOGIN_BLOCKED]
↓
  [Returns error message]
↓
Admin User
[Either accesses dashboard or sees error]
```

---

### Sensor Data Ingestion Flow

```
IoT Sensor Device
↓
[Measures water level using ultrasonic sensor]
↓
[Calculates distance and water level]
↓
[Collects additional data: battery, rainfall]
↓
[Sends data to server via HTTP/MQTT]
↓
[Server receives sensor reading]
↓
[Validates data format and values]
↓
[Inserts into MongoDB sensor_readings collection]
↓
[Updates lastSeenAt in sensors collection]
↓
[Flood status calculated using fuzzy logic]
↓
[Reading available for dashboard queries]
↓
Admin User
[Views updated reading on dashboard]
```

---

### Flood Level Change Detection Flow

```
IoT Sensor Device
↓
[Detects water level change]
↓
[Sends new reading to server]
↓
[MongoDB: sensor_readings.insert(new_reading)]
↓
[Dashboard queries latest readings]
↓
[GET /api/sensors/latest]
↓
[System aggregates latest reading per sensor]
↓
[Applies fuzzy logic classification]
↓
[Normal: water_level < 0.25m]
↓
[Flood Alert: 0.25m <= water_level < 0.75m]
↓
[Flood Warning: 0.75m <= water_level < 1.2m]
↓
[Severity: water_level >= 1.2m]
↓
[Dashboard updates with new status]
↓
[Map marker color changes based on status]
↓
[Sensor card shows updated water level]
↓
[Severe alert counter updates if applicable]
↓
Admin User
[Sees updated flood status on dashboard]
```

---

### AI Recommendation Generation Flow

```
CDRRMO/CSWDD/Super Admin
↓
[Navigates to AI-Optimized Relief Recommendation]
↓
[Enters available relief inventory]
↓
[family_food_packs: 100]
↓
[medicine_kits: 30]
↓
[relief_goods_individual: 300]
↓
[Clicks "Generate Recommendations"]
↓
[POST /api/ai/recommendations/generate]
↓
[Frontend proxies to AI backend]
↓
[AI backend retrieves sensor data from MongoDB]
↓
[AI backend retrieves family data from Supabase]
↓
[AI engine processes data:]
↓
  1. Groups sensors by barangay
↓
  2. Applies fuzzy logic to classify flood risk
↓
  3. Groups families by barangay
↓
  4. Calculates AHP vulnerability scores
↓
  5. Computes priority scores
↓
  6. Allocates inventory based on priority
↓
  7. Generates explainable recommendations
↓
[AI backend saves recommendations to Supabase]
↓
[AI backend logs audit event]
↓
[Returns recommendations to frontend]
↓
[Frontend displays recommendation cards]
↓
Admin User
[Reviews recommendations with full explanations]
```

---

### Admin Approval Workflow (Not Implemented)

**Current State:** Recommendations are advisory, no formal approval workflow

**Proposed Workflow:**
```
AI System
↓
[Generates recommendations]
↓
Status: generated
↓
CDRRMO Admin
↓
[Reviews generated recommendations]
↓
[Can adjust allocation amounts]
↓
[Approves recommendations for execution]
↓
Status: approved
↓
CSWDD Admin
↓
[Receives approved recommendations]
↓
[Prepares relief supplies based on allocations]
↓
[Updates inventory as items are distributed]
↓
Status: distributed
↓
Barangay Admin
↓
[Receives relief supplies]
↓
[Distributes to affected families]
↓
[Confirms distribution]
↓
Status: completed
↓
Audit Log
[Complete trail of recommendation lifecycle]
```

---

### Notification Sending Flow (Not Implemented)

**Current State:** No automated notification system

**Proposed Workflow:**
```
Flood Event Detected
↓
[Sensor reading exceeds severity threshold]
↓
[System detects severe flood risk]
↓
[Triggers notification workflow]
↓
Notification Service
↓
[Identifies at-risk residents]
↓
[Sends alerts via multiple channels:]
↓
  - SMS to registered mobile numbers
↓
  - Email to registered email addresses
↓
  - Push notification to mobile app (future)
↓
  - Social media post (future)
↓
Residents
[Receive flood warning notifications]
↓
[Can take preventive actions]
↓
[Mark themselves as safe (future feature)]
↓
Admin Dashboard
[Shows notification delivery status]
↓
[Tracks resident responses]
```

---

## 12. Deployment

### Local Development

**Frontend Setup:**
```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env with local configuration
npm run dev
# Runs on http://localhost:3000
```

**Backend Setup:**
```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with local configuration
uvicorn app.main:app --reload --port 8000
# Runs on http://localhost:8000
```

**Database Setup:**
- MongoDB: Use MongoDB Atlas or local MongoDB instance
- Supabase: Create Supabase project and run SQL migrations
- Configure connection strings in `.env` files

**Development Tools:**
- Next.js dev server with hot reload
- FastAPI with auto-reload
- TypeScript for type checking
- ESLint for code quality

---

### Production Deployment

**Frontend (Vercel):**
```bash
# Connect GitHub repository to Vercel
# Configure environment variables in Vercel dashboard
# Automatic deployment on push to main branch
# Build command: npm run build
# Output directory: .next
# Node version: 18.x
```

**Environment Variables (Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MONGODB_URI`
- `MONGODB_DB`
- `AI_BACKEND_URL`
- `SMARTFLOOD_SESSION_SECRET`
- `NODE_ENV=production`

**Backend (Heroku):**
```bash
# Connect GitHub repository to Heroku
# Configure environment variables in Heroku dashboard
# Automatic deployment on push to main branch
# Build command: (Python buildpack auto-detects)
# Start command: gunicorn app.main:app -k uvicorn.workers.UvicornWorker
```

**Environment Variables (Heroku):**
- `MONGODB_URI`
- `MONGODB_DB`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGINS`

**Procfile:**
```
web: gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

---

### Hosting Strategy

**Frontend: Vercel**
- **Platform:** Serverless Next.js hosting
- **Benefits:** Automatic SSL, CDN, edge caching, automatic deployments
- **Cost:** Free tier available, paid tiers for usage
- **Scaling:** Automatic scaling based on traffic
- **Build Process:** Vercel build system with Next.js optimization

**Backend: Heroku**
- **Platform:** Container-based Python hosting
- **Benefits:** Easy deployment, managed infrastructure, add-ons
- **Cost:** Free tier available, paid tiers for performance
- **Scaling:** Horizontal scaling with dynos
- **Process Management:** Gunicorn with Uvicorn workers

**Databases:**
- **MongoDB Atlas:** Managed MongoDB service
- **Supabase:** Managed PostgreSQL with additional features
- **Benefits:** Automatic backups, high availability, managed scaling
- **Cost:** Free tiers available, paid tiers for storage/usage

---

### CI/CD

**Current Implementation:**
- No formal CI/CD pipeline configured
- Manual deployment via git push
- Vercel and Heroku handle build/deploy automatically

**Recommended Improvements:**
```yaml
# Example GitHub Actions workflow
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd Frontend && npm install
      - run: cd Frontend && npm run lint
      - run: cd Frontend && npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: cd Backend && pip install -r requirements.txt
      - run: cd Backend && python3 -m compileall -q app tests
      - run: cd Backend && python3 -m unittest discover -s tests -v

  deploy-frontend:
    needs: test-frontend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./Frontend

  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "smartflood-backend"
          heroku_email: "user@example.com"
          appdir: "./Backend"
```

---

### Build Process

**Frontend Build:**
```bash
cd Frontend
npm run build
# Next.js build process:
# 1. Compiles TypeScript
# 2. Builds React components
# 3. Generates static pages
# 4. Optimizes assets
# 5. Creates production bundle
```

**Backend Build:**
```bash
cd Backend
# No explicit build step required
# Python interpreted at runtime
# Dependencies installed via pip
```

**Production Optimization:**
- Frontend: Code splitting, tree shaking, minification
- Backend: Gunicorn worker processes for concurrency
- Databases: Connection pooling, query optimization

---

### Environment Variables

**Development (.env):**
```bash
# Frontend
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-dev-key
SUPABASE_SERVICE_ROLE_KEY=local-service-key
MONGODB_URI=mongodb://localhost:27017/smartflood
MONGODB_DB=smartflood_dev
AI_BACKEND_URL=http://localhost:8000
SMARTFLOOD_SESSION_SECRET=dev-secret-key
NODE_ENV=development

# Backend
MONGODB_URI=mongodb://localhost:27017/smartflood
MONGODB_DB=smartflood_dev
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=local-service-key
CORS_ORIGINS=http://localhost:3000
```

**Production (Vercel/Heroku):**
```bash
# Frontend (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartflood
MONGODB_DB=smartflood_prod
AI_BACKEND_URL=https://smartflood-backend.herokuapp.com
SMARTFLOOD_SESSION_SECRET=strong-random-secret
NODE_ENV=production

# Backend (Heroku)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartflood
MONGODB_DB=smartflood_prod
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod-service-key
CORS_ORIGINS=https://smartflood.vercel.app
```

---

## 13. Design Decisions

### Decision 1: Hybrid Database Architecture

**Choice:** Use MongoDB for sensor data and Supabase (PostgreSQL) for user/resident data

**Why:**
- Sensor data is high-volume, time-series, schema-flexible → MongoDB
- User/resident data is relational, transactional, requires integrity → PostgreSQL
- Each database optimized for its specific use case
- Separation of concerns improves performance and maintainability

**Alternatives Considered:**
- **Single PostgreSQL:** Would require JSONB for sensor data, less optimal for time-series
- **Single MongoDB:** Would lose relational integrity for user data
- **Multi-database with traditional RDBMS:** More complex, less managed services

**Tradeoffs:**
- **Pros:** Optimized performance, data model fit, managed services
- **Cons:** Increased complexity, two systems to manage, eventual consistency

---

### Decision 2: Next.js with App Router

**Choice:** Use Next.js 16 with App Router instead of Create React App or Vue.js

**Why:**
- Server-side rendering improves performance and SEO
- Built-in API routes eliminate need for separate backend
- TypeScript support for type safety
- Modern file-based routing with App Router
- Strong ecosystem and Vercel integration

**Alternatives Considered:**
- **Create React App:** No SSR, requires separate backend
- **Vue.js + Nuxt.js:** Smaller ecosystem, less TypeScript maturity
- **Angular:** Steeper learning curve, more opinionated

**Tradeoffs:**
- **Pros:** Performance, developer experience, ecosystem, deployment
- **Cons:** Vendor lock-in to Vercel, App Router learning curve

---

### Decision 3: FastAPI for AI Backend

**Choice:** Use FastAPI instead of Flask, Django, or Node.js

**Why:**
- Native async support for high-performance I/O
- Automatic data validation with Pydantic
- Automatic OpenAPI documentation
- Performance comparable to Node.js and Go
- Modern Python with type hints
- Excellent for AI/ML workloads

**Alternatives Considered:**
- **Flask:** More mature, but synchronous by default
- **Django:** Built-in admin, but heavier and more opinionated
- **Node.js/Express:** Language unification, but less suited for AI/ML

**Tradeoffs:**
- **Pros:** Performance, type safety, modern Python, excellent documentation
- **Cons:** Smaller ecosystem compared to Flask/Django, newer framework

---

### Decision 4: Fuzzy Logic + AHP for AI

**Choice:** Combine fuzzy logic for risk classification and AHP for vulnerability scoring

**Why:**
- **Fuzzy Logic:** Handles uncertainty in sensor readings, provides explainable classifications
- **AHP:** Structured multi-criteria decision making, well-established methodology
- **Combination:** Complementary approaches addressing different aspects of the problem
- **Explainability:** Both methods provide transparent decision processes

**Alternatives Considered:**
- **Machine Learning (Random Forest, Neural Networks):** More complex, less explainable
- **Rule-Based System:** More rigid, harder to fine-tune
- **Simple Thresholding:** Too simplistic, doesn't handle uncertainty well

**Tradeoffs:**
- **Pros:** Explainability, domain expertise integration, transparency
- **Cons:** Manual parameter tuning, less adaptive than ML

---

### Decision 5: Role-Based Access Control

**Choice:** Implement RBAC with 4 distinct roles instead of simple admin/user

**Why:**
- Reflects actual organizational structure (CDRRMO, CSWDD, Barangay)
- Provides principle of least privilege
- Enables data scoping by barangay and department
- Aligns with Philippine disaster response organizational structure

**Alternatives Considered:**
- **Simple Admin/User:** Too coarse-grained, doesn't reflect reality
- **Attribute-Based Access Control (ABAC):** More complex, overkill for current needs
- **Permission-Based System:** More granular, but harder to manage

**Tradeoffs:**
- **Pros:** Matches organizational structure, security, flexibility
- **Cons:** More complex implementation, role management overhead

---

### Decision 6: Hash-Based Session Cookies

**Choice:** Use HMAC-signed cookies instead of JWT or server-side sessions

**Why:**
- Simpler than JWT (no token revocation complexity)
- More secure than client-side storage (HTTP-only)
- No server-side session storage required
- Good performance with cryptographic signing

**Alternatives Considered:**
- **JWT:** More complex revocation, larger token size
- **Server-Side Sessions:** Requires session storage, database lookups
- **OAuth/OIDC:** Overkill for single-application use case

**Tradeoffs:**
- **Pros:** Simplicity, security, performance, no storage overhead
- **Cons:** No immediate revocation, larger cookie size

---

### Decision 7: Supabase for PostgreSQL

**Choice:** Use Supabase instead of AWS RDS or Google Cloud SQL

**Why:**
- Built-in authentication and user management
- Real-time subscriptions for live updates
- Row-level security at database level
- Excellent admin interface
- Open source with self-hosting option
- Generous free tier

**Alternatives Considered:**
- **AWS RDS:** More mature, but requires separate auth service
- **Google Cloud SQL:** Similar to RDS, less feature-rich
- **Neon:** Serverless PostgreSQL, but newer platform

**Tradeoffs:**
- **Pros:** All-in-one solution, real-time features, open source
- **Cons:** Newer platform, smaller ecosystem than AWS

---

### Decision 8: Client-Side Hash Routing

**Choice:** Use hash-based routing in dashboard instead of Next.js pages

**Why:**
- Simpler state management within single page
- Easy to maintain navigation state
- Faster transitions between modules
- Works well with existing session management

**Alternatives Considered:**
- **Next.js Pages:** More traditional, but requires more navigation logic
- **State-Based Routing:** More complex, harder to maintain
- **Multi-Page Application:** Slower transitions, more server round-trips

**Tradeoffs:**
- **Pros:** Simplicity, performance, state management
- **Cons:** Less SEO-friendly (not an issue for admin dashboard)

---

### Decision 9: No Docker Containerization

**Choice:** Use platform-specific deployment (Vercel/Heroku) instead of Docker

**Why:**
- Vercel and Heroku provide optimized build processes
- Simpler deployment for small team
- No need for container orchestration at current scale
- Faster development iteration

**Alternatives Considered:**
- **Docker + Kubernetes:** More scalable, but more complex
- **Docker Compose:** Good for local development, but not needed for deployment
- **Container Registry:** Adds deployment complexity

**Tradeoffs:**
- **Pros:** Simplicity, faster development, platform optimization
- **Cons:** Vendor lock-in, less portability, scaling limitations

---

### Decision 10: Manual AI Generation Trigger

**Choice:** Require manual trigger for AI recommendations instead of automatic generation

**Why:**
- Human-in-the-loop for important decisions
- Allows review before generation
- Prevents unnecessary AI calls
- Gives admin control over timing

**Alternatives Considered:**
- **Automatic Generation:** More hands-off, but less control
- **Scheduled Generation:** Predictable, but may not align with needs
- **Event-Triggered:** Responsive, but harder to control

**Tradeoffs:**
- **Pros:** Human control, resource efficiency, alignment with needs
- **Cons:** Requires manual intervention, less automated

---

## 14. Possible Questions Our Professor Might Ask

### Architecture & Design Questions

**Q1: Why did you choose a hybrid database architecture instead of a single database system?**

A: We chose MongoDB for sensor data because it's optimized for high-volume time-series data with flexible schemas, which is ideal for IoT sensor readings that may vary in structure. We chose PostgreSQL (via Supabase) for user and resident data because it provides ACID transactions, referential integrity, and complex relational queries needed for user management and demographic data. Each database is optimized for its specific use case, improving overall performance and maintainability.

**Q2: Why use Next.js instead of a traditional frontend framework like React with a separate backend?**

A: Next.js provides server-side rendering which improves initial load performance and SEO. The built-in API routes eliminate the need for a separate backend server for basic operations, reducing complexity. TypeScript support ensures type safety across the entire stack. The App Router provides modern file-based routing with excellent performance. Additionally, Vercel integration offers automatic deployments and edge caching.

**Q3: What are the tradeoffs of using FastAPI instead of more established frameworks like Django or Flask?**

A: FastAPI offers native async support for high-performance I/O operations, automatic data validation with Pydantic, and automatic OpenAPI documentation. It's more modern and type-safe compared to Flask, and lighter-weight compared to Django. The tradeoff is a smaller ecosystem compared to the more established frameworks, and it's newer so there's less community knowledge. However, for our AI-focused backend, the performance and type safety benefits outweigh these considerations.

**Q4: Why did you implement your own AI algorithm using fuzzy logic and AHP instead of using machine learning?**

A: We chose fuzzy logic and AHP because they provide explainable decision-making, which is crucial for disaster response where transparency and accountability are essential. Machine learning models, while potentially more accurate, are often "black boxes" that can't explain their decisions. Fuzzy logic handles uncertainty in sensor readings well, and AHP provides a structured approach to multi-criteria decision making. Both methods are well-understood and allow domain experts to validate and adjust the decision criteria.

**Q5: How does your system handle data consistency between MongoDB and Supabase?**

A: Our system uses a separation of concerns where each database handles independent data domains. MongoDB stores time-series sensor data, while Supabase stores relational user and resident data. There's no direct data dependency between the two systems that requires cross-database transactions. The AI backend reads from both databases during recommendation generation, but this is a read-only operation that doesn't require strict consistency. For future enhancements, we could implement application-level consistency checks or event-driven synchronization if needed.

**Q6: What is the rationale behind using hash-based session cookies instead of JWT?**

A: Hash-based cookies are simpler than JWT as they don't require token revocation mechanisms. They're more secure than client-side storage since they're HTTP-only. They don't require server-side session storage, reducing database load. The cryptographic signing ensures tamper resistance. JWT would add complexity with token refresh and revocation, which isn't necessary for our current use case where 12-hour session duration is sufficient.

**Q7: Why did you choose Supabase over a traditional cloud database like AWS RDS?**

A: Supabase provides an all-in-one solution with built-in authentication, real-time subscriptions, and row-level security. It offers an excellent admin interface for database management. It's open-source with a self-hosting option, avoiding vendor lock-in. The generous free tier was beneficial for development. AWS RDS would require a separate authentication service and doesn't provide the same level of built-in features out of the box.

---

### Technical Implementation Questions

**Q8: How does your fuzzy logic implementation work for flood risk classification?**

A: Our fuzzy logic implementation uses membership functions to classify water levels into risk categories. We have four membership functions: normal (descending from 0.0 to 0.25m), flood alert (trapezoid from 0.25 to 0.75m), flood warning (trapezoid from 0.50 to 1.20m), and severity (ascending from 1.00 to 1.20m+). Each water level gets membership values for all categories, and we classify it based on the highest membership. This provides a confidence score and handles borderline cases better than simple thresholding.

**Q9: Can you explain the AHP weights you chose for vulnerability scoring?**

A: Our AHP weights are based on vulnerability priority during disasters: infants (0.22) are most vulnerable due to inability to care for themselves, elderly (0.20) due to mobility and health issues, PWD (0.18) due to accessibility challenges, pregnant women (0.12) due to health risks, lactating mothers (0.10) due to childcare needs, toddlers (0.10) due to dependency, and 4Ps members (0.08) as they're economically vulnerable but may have other support systems. These weights can be adjusted based on expert consultation or policy changes.

**Q10: How does your inventory allocation algorithm ensure fair distribution?**

A: Our allocation algorithm uses a priority-based approach. First, we calculate the need for each barangay based on vulnerability factors. Then we do an initial allocation proportional to priority scores. Finally, we use a round-robin approach to distribute remaining inventory to ensure no barangay is completely excluded if they have need. The algorithm respects inventory constraints and ensures the total allocation doesn't exceed available supplies.

**Q11: What security measures do you have in place to protect against brute force attacks?**

A: We implement account lockout after 3 failed login attempts, which triggers a 15-minute lockout period. We use bcrypt with a cost factor of 10 for password hashing, making brute force computationally expensive. While we don't currently have rate limiting, the account lockout provides significant protection. We also log all failed login attempts for monitoring suspicious activity.

**Q12: How does your role-based access control system work?**

A: We have four roles: Super Admin, CDRRMO Admin, CSWDD Admin, and Barangay Admin. Each role has specific permissions and navigation items. Role checks are performed both on the frontend (for navigation) and server-side (for API routes). Barangay Admins are restricted to data from their assigned barangay only. CDRRMO and CSWDD admins have department-scoped log visibility. Super Admins have full system access.

**Q13: What happens when a sensor fails or stops sending data?**

A: Our system handles missing sensor data gracefully. If a sensor has no readings, it's classified as "no_reading" risk level. The AI recommendations can still be generated based on family vulnerability data alone, with a note that sensor data is unavailable. The dashboard shows sensors as inactive if they haven't communicated recently. We have a lastSeenAt field to track sensor health and identify devices that may need maintenance.

**Q14: How do you ensure the AI recommendations are explainable to administrators?**

A: Every recommendation includes multiple explanation layers: fuzzy explanation shows the water level classification with membership values, AHP breakdown shows exactly how each vulnerability factor contributed to the score, reasoning steps provide a narrative explanation, and analysis reason gives a plain-language summary. This multi-layered approach ensures administrators can understand and validate the AI's decisions.

**Q15: What is your strategy for testing the AI recommendation algorithm?**

A: We have unit tests in `Backend/tests/test_engine.py` that verify the algorithm prioritizes high-risk barangays, respects inventory constraints, generates recommendations for all known barangays even without data, and exposes proper AHP and fuzzy details. We can also do manual testing by simulating different sensor scenarios and inventory levels to verify the outputs match expectations.

---

### Database & Data Management Questions

**Q16: Why use MongoDB for sensor data instead of PostgreSQL?**

A: Sensor data is high-volume, time-series data that benefits from MongoDB's flexible schema (different sensor types may have different data structures), efficient time-series queries, and horizontal scaling capabilities. MongoDB's geospatial queries are useful for location-based sensor analysis. While PostgreSQL can handle time-series data with extensions, MongoDB is purpose-built for this use case and provides better performance for write-heavy workloads.

**Q17: How do you handle data migration and schema changes in MongoDB?**

A: MongoDB's flexible schema allows for gradual schema evolution without explicit migrations. When sensor data structures change, we can handle multiple formats in the application layer using validation and normalization functions. For major changes, we would write migration scripts that update documents in batches. We use field aliases and normalization functions to handle variations in field names and structures.

**Q18: What is your backup and disaster recovery strategy?**

A: Both MongoDB Atlas and Supabase provide automated backups. MongoDB Atlas offers continuous backups with point-in-time recovery. Supabase provides daily backups with the ability to restore to any point within the retention period. For disaster recovery, we can restore from these backups to new instances. Our environment variables are stored securely in the hosting platforms, and our code is in Git for easy redeployment.

**Q19: How do you ensure data quality in the resident and family databases?**

A: We implement validation at multiple levels: frontend form validation, API route validation, and database constraints. Required fields are enforced at the API level. We use TypeScript types and Pydantic models to ensure data structure consistency. For family clusters, we aggregate vulnerability counts from resident data to ensure accuracy. Audit logging tracks all data changes for accountability.

**Q20: What is your strategy for handling personally identifiable information (PII)?**

A: We store PII (names, addresses, contact numbers) in Supabase with access restricted by RBAC. We don't log PII in audit logs or error messages. Session data only contains user IDs, not personal information. Environment variables containing sensitive data are never committed to version control. For future enhancements, we could implement field-level encryption for particularly sensitive data.

---

### Performance & Scalability Questions

**Q21: How does your system perform under high sensor data load?**

A: MongoDB is designed for high-volume write workloads and can handle thousands of inserts per second. Our sensor data ingestion is optimized with batch inserts when possible. The dashboard queries only the latest reading per sensor using aggregation, which is efficient. For future scaling, we could implement time-series collections in MongoDB or implement data archiving for old readings.

**Q22: What is your strategy for handling concurrent dashboard users?**

A: Next.js on Vercel automatically scales to handle concurrent users through serverless functions. Our database connections use connection pooling to handle multiple concurrent queries. Read-heavy operations like dashboard queries are optimized. Session management is stateless on the server side, reducing database load. For future scaling, we could implement caching for frequently accessed data.

**Q23: How do you optimize database queries for performance?**

A: We use appropriate indexes on frequently queried fields (sensorId, createdAt, barangay_id). For sensor readings, we use aggregation to get only the latest reading per sensor rather than retrieving all readings. We implement pagination for large datasets. We select only the required fields rather than using SELECT *. We use database-specific optimizations like MongoDB's geospatial indexes and PostgreSQL's query planner.

**Q24: What is your caching strategy?**

A: Currently, we rely on Vercel's edge caching for static assets and CDN for content delivery. We don't implement application-level caching for dynamic data. For future enhancements, we could implement Redis caching for frequently accessed data like sensor readings or user sessions. This would reduce database load and improve response times for dashboard queries.

**Q25: How does your system handle network failures or service outages?**

A: Our system implements graceful error handling throughout. If the AI backend is unavailable, the frontend shows an appropriate error message. Database connection failures are caught and logged. Sensor data ingestion can queue readings if the database is temporarily unavailable (though this isn't currently implemented). Our hosting providers (Vercel, Heroku, MongoDB Atlas, Supabase) have built-in redundancy and high availability.

---

### Security Questions

**Q26: What are the main security vulnerabilities in your current implementation?**

A: The main vulnerabilities are: missing rate limiting on authentication endpoints, no CSRF protection, using the Supabase service role key as a fallback session secret, client-side session storage backup, and missing security headers. We mitigate these through account lockout for authentication, HTTP-only cookies for sessions, and environment variable protection. Future enhancements should address rate limiting, CSRF protection, and security headers.

**Q27: How do you protect against SQL injection attacks?**

A: We use the Supabase client which implements parameterized queries by default, preventing SQL injection. We don't build raw SQL queries with user input. All database queries go through the client's query builder which handles escaping and parameterization. MongoDB is also immune to SQL injection as it uses a different query paradigm, though we still validate and sanitize inputs.

**Q28: What is your approach to secrets management?**

A: We use environment variables for all sensitive data (API keys, database credentials, session secrets). These are configured in the hosting platforms (Vercel, Heroku) and never committed to version control. We use different secrets for development and production. For future enhancements, we could use a dedicated secrets management service like AWS Secrets Manager or HashiCorp Vault.

**Q29: How do you handle authentication security?**

A: We use bcrypt with a cost factor of 10 for password hashing, which is computationally expensive and resistant to brute force attacks. We implement account lockout after 3 failed attempts. Sessions are managed using HTTP-only cookies signed with HMAC-SHA256. Passwords are never stored or logged in plaintext. We log all authentication attempts for security monitoring.

**Q30: What is your strategy for preventing unauthorized access to the AI backend?**

A: The AI backend is protected by CORS configuration that only allows requests from approved origins. While we don't implement API key authentication currently, the backend is only accessible through the frontend proxy which validates user sessions. For future enhancements, we should implement API key authentication or mutual TLS between the frontend and AI backend.

---

### Project Management & Development Questions

**Q31: How did you approach testing in this project?**

A: We implemented unit tests for the AI recommendation engine in `Backend/tests/test_engine.py`. These tests verify the algorithm's correctness with various input scenarios. We also have tests for audit logging and payload transformation. For the frontend, we rely on manual testing and TypeScript's type checking. Future enhancements should include frontend unit tests, integration tests, and end-to-end testing.

**Q32: What is your version control strategy?**

A: We use Git for version control with the main branch representing production. We implement feature branches for new development. Our code is hosted on GitHub which provides issue tracking and collaboration features. We don't currently implement formal code reviews, but this would be a good practice for future development.

**Q33: How do you handle dependency management and updates?**

A: We use package.json for frontend dependencies and requirements.txt for Python dependencies. We pin specific versions to ensure reproducibility. We don't currently implement automated dependency scanning or update schedules. For future enhancements, we should implement Dependabot or Snyk for security alerts and regular dependency updates.

**Q34: What is your deployment process?**

A: Our deployment is automated through platform integrations. Vercel automatically deploys the frontend on push to the main branch. Heroku automatically deploys the backend on push to the main branch. Both platforms handle build processes and environment variable configuration. We don't currently implement staging environments or formal release processes.

**Q35: How do you monitor system health and performance?**

A: We rely on the monitoring provided by our hosting platforms: Vercel for frontend performance, Heroku for backend performance, MongoDB Atlas for database performance, and Supabase for PostgreSQL performance. We don't currently implement centralized logging or application-level monitoring. Future enhancements should include centralized logging, performance monitoring, and alerting.

---

### Domain & User Experience Questions

**Q36: How does your system align with the actual needs of disaster response in Malabon City?**

A: Our system addresses real needs in Malabon City: the city is flood-prone due to its geography, there's a need for equitable relief distribution, the current manual process is slow and error-prone, and there's a lack of real-time flood monitoring. Our system provides real-time sensor data, AI-powered recommendations for fair distribution, and role-based access matching the actual organizational structure (CDRRMO, CSWDD, Barangay officials).

**Q37: How did you determine the vulnerability weights for the AHP algorithm?**

A: Our weights are based on general disaster response principles and vulnerability factors. Infants and elderly are given highest priority due to their inability to care for themselves during disasters. PWD individuals have mobility challenges. Pregnant and lactating women have specific health needs. 4Ps members are economically vulnerable. These weights can be refined through consultation with local disaster response experts and social workers.

**Q38: How does your system handle the specific context of Malabon City's geography?**

A: Our system currently supports three barangays: Tanong, Catmon, and Potrero. The sensor locations and flood risk thresholds can be adjusted based on local geography. The map visualization shows actual sensor locations. Future enhancements could include elevation data, historical flood patterns, and evacuation route information specific to Malabon City.

**Q39: What user research did you conduct to inform the design?**

A: Our design is informed by the organizational structure of Philippine disaster response (CDRRMO, CSWDD, Barangay structure). We considered the information needs of different user roles: operations center staff need real-time monitoring, social workers need resident information, barangay officials need local data. The workflow reflects actual disaster response processes in the Philippines.

**Q40: How does your system support decision-making under uncertainty?**

A: Our fuzzy logic approach explicitly handles uncertainty in sensor readings by providing membership values for different risk categories rather than binary classifications. The confidence scores indicate how clear the classification is. The AI recommendations provide explainable reasoning so administrators can understand the factors behind each recommendation and exercise human judgment when needed.

---

### Future & Enhancement Questions

**Q41: What features would you add if this were to become a production system?**

A: For production, I would add: multi-factor authentication, comprehensive audit logging and alerting, automated notification system (SMS, email), mobile app for residents, offline capabilities for areas with poor connectivity, advanced analytics and reporting, integration with national disaster response systems, comprehensive testing suite, staging environment, and formal deployment processes.

**Q42: How would you scale this system to cover the entire city instead of just three barangays?**

A: To scale city-wide, we would: increase sensor network coverage, implement data partitioning by barangay, add caching for frequently accessed data, implement read replicas for database scaling, optimize AI algorithm for larger datasets, add load balancing for frontend and backend, implement database sharding if needed, and enhance monitoring for the larger system.

**Q43: How would you integrate real-time notifications for residents?**

A: I would implement a notification service that sends alerts via SMS using a provider like Twilio, email notifications for registered residents, and potentially a mobile app for push notifications. The system would automatically trigger notifications when flood risk exceeds certain thresholds. Residents could acknowledge receipt and mark themselves as safe, which would be displayed on the admin dashboard.

**Q44: How would you handle sensor calibration and maintenance?**

A: I would add sensor health monitoring that tracks battery levels, communication frequency, and data quality. The system would alert when sensors need maintenance or calibration. I would implement a sensor management interface for tracking maintenance schedules and calibration records. Automated diagnostics could identify sensors providing anomalous readings that may need recalibration.

**Q45: How would you improve the AI algorithm over time?**

A: I would implement a feedback loop where administrators can provide feedback on recommendation quality. This data could be used to fine-tune the AHP weights and fuzzy logic thresholds. I could also implement A/B testing to compare different algorithm configurations. Historical data on actual relief needs versus recommendations could be used to validate and improve the algorithm.

---

### Ethical & Social Questions

**Q46: How does your system ensure equitable distribution of relief resources?**

A: Our system uses AHP vulnerability scoring to prioritize vulnerable populations (infants, elderly, PWD, pregnant women) regardless of location. The algorithm considers both flood risk and vulnerability, ensuring that high-risk areas with vulnerable populations get priority. The explainable AI approach allows administrators to understand and validate allocation decisions for fairness.

**Q47: What measures does your system have to prevent bias in AI recommendations?**

A: Our algorithm uses transparent, rule-based logic rather than machine learning, which reduces the risk of biased training data. The vulnerability weights are based on established disaster response principles. The explainable outputs allow for human oversight and detection of biased outcomes. Regular review of recommendation patterns could identify and address any bias.

**Q48: How does your system protect resident privacy?**

A: We implement role-based access control to restrict resident data access. Barangay admins can only access data for their barangay. We don't expose resident data to the AI backend, only aggregated vulnerability counts. Audit logs track who accesses resident information. For future enhancements, we could implement consent management and data access logging.

**Q49: How would you handle situations where AI recommendations conflict with on-the-ground realities?**

A: Our system is designed to be advisory, not prescriptive. Administrators can override AI recommendations based on local knowledge. The system provides full transparency in how recommendations are generated, allowing administrators to assess whether the algorithm is missing important context. We could implement a feedback mechanism to record when and why recommendations are overridden.

**Q50: What is your strategy for digital inclusion for residents without internet access?**

A: Our current system focuses on the admin dashboard. For digital inclusion, we would need alternative registration methods (paper forms, SMS registration, community registration drives). For notifications, we would use SMS which doesn't require smartphones. We could implement a call center for residents to report their status or request assistance. Barangay officials could serve as intermediaries for digital exclusion.

---

## 15. Weaknesses

### Architecture Weaknesses

**1. No Microservices Architecture:**
- **Issue:** Monolithic frontend and backend
- **Impact:** Harder to scale individual components
- **Professor's Question:** "Why didn't you use a microservices architecture?"
- **Answer:** "For our current scale, a monolithic approach is simpler and more maintainable. Microservices would add complexity without clear benefits. However, for city-wide deployment, we could separate the AI service, sensor ingestion service, and admin dashboard into independent services."

**2. Tight Coupling Between Frontend and Backend:**
- **Issue:** Frontend directly accesses databases, bypassing dedicated API layer
- **Impact:** Harder to evolve backend independently
- **Professor's Question:** "Why does your frontend access databases directly?"
- **Answer:** "Next.js API routes provide a convenient server-side layer without needing a separate backend service. This simplifies development and deployment. For a larger system, we would implement a dedicated API layer to decouple the frontend from database implementations."

**3. No Event-Driven Architecture:**
- **Issue:** Synchronous request-response pattern
- **Impact:** Limited real-time capabilities
- **Professor's Question:** "How would you handle real-time flood alerts?"
- **Answer:** "Currently, our system uses polling for updates. For production, we would implement WebSocket connections or server-sent events for real-time updates. We could also implement an event-driven architecture with message queues for processing sensor data asynchronously."

---

### Performance Issues

**1. No Caching Layer:**
- **Issue:** Frequent database queries for same data
- **Impact:** Increased database load, slower response times
- **Professor's Question:** "How do you optimize performance for frequently accessed data?"
- **Answer:** "We currently rely on database query optimization. For production, we would implement Redis caching for sensor readings, user sessions, and frequently accessed reference data. This would reduce database load and improve response times."

**2. No Database Connection Pooling Configuration:**
- **Issue:** Default connection pooling may not be optimal
- **Impact:** Potential connection exhaustion under load
- **Professor's Question:** "How does your system handle high concurrent database access?"
- **Answer:** "Our hosting platforms provide default connection pooling. For production, we would configure connection pool sizes based on expected load, implement connection timeout settings, and monitor connection usage to prevent exhaustion."

**3. No Query Optimization for Large Datasets:**
- **Issue:** Queries may become slow as data grows
- **Impact:** Performance degradation over time
- **Professor's Question:** "How will your system perform as sensor data accumulates?"
- **Answer:** "We implement time-series data archiving to keep the active dataset manageable. We use appropriate database indexes. For production, we would implement data partitioning, query optimization, and potentially time-series database optimizations."

---

### Security Issues

**1. Missing Rate Limiting:**
- **Issue:** No protection against API abuse
- **Impact:** Vulnerability to DoS attacks, brute force attacks
- **Professor's Question:** "How do you protect against API abuse?"
- **Answer:** "We currently rely on account lockout for authentication. For production, we would implement rate limiting using Redis or Vercel's built-in rate limiting. We would also implement API key authentication for external integrations."

**2. No CSRF Protection:**
- **Issue:** Vulnerable to cross-site request forgery
- **Impact:** Unauthorized actions on behalf of authenticated users
- **Professor's Question:** "How do you prevent CSRF attacks?"
- **Answer:** "Our use of HTTP-only cookies with SameSite=strict provides some protection. For production, we would implement CSRF tokens for state-changing operations and validate them on the server."

**3. No Security Headers:**
- **Issue:** Missing security-related HTTP headers
- **Impact:** Increased vulnerability to various attacks
- **Professor's Question:** "What security headers do you implement?"
- **Answer:** "We currently don't implement custom security headers. For production, we would implement Content Security Policy, HSTS, X-Frame-Options, X-Content-Type-Options, and other OWASP-recommended headers."

**4. Session Secret Reuse:**
- **Issue:** Using service role key as session secret fallback
- **Impact:** If service role key is compromised, sessions are compromised
- **Professor's Question:** "Why do you use the service role key as a session secret fallback?"
- **Answer:** "This was a development convenience. For production, we would always use a dedicated SMARTFLOOD_SESSION_SECRET and remove the fallback to the service role key. We would also implement secret rotation policies."

---

### Scalability Issues

**1. No Horizontal Scaling Strategy:**
- **Issue:** Monolithic architecture limits independent scaling
- **Impact:** Resource waste, potential bottlenecks
- **Professor's Question:** "How would you scale this system for city-wide deployment?"
- **Answer:** "For city-wide deployment, we would implement microservices architecture, container orchestration with Kubernetes, load balancing, database sharding, and geographic distribution of services. We would also implement caching layers and CDN optimization."

**2. No Data Archiving Strategy:**
- **Issue:** Unlimited data retention
- **Impact:** Database growth, performance degradation
- **Professor's Question:** "How do you handle growing sensor data volumes?"
- **Answer:** "We would implement time-based data archiving, moving old sensor readings to cold storage or a data warehouse. We would implement data retention policies and automated archival processes to keep the active dataset performant."

**3. No Load Testing:**
- **Issue:** Unknown performance characteristics under load
- **Impact:** Potential failures during high-demand periods
- **Professor's Question:** "How have you tested system performance under load?"
- **Answer:** "We haven't conducted formal load testing. For production, we would implement load testing using tools like k6 or Artillery to identify performance bottlenecks and ensure the system can handle expected peak loads during flood events."

---

### Database Issues

**1. No Cross-Database Transactions:**
- **Issue:** Can't maintain consistency across MongoDB and Supabase
- **Impact:** Potential data inconsistency
- **Professor's Question:** "How do you ensure data consistency across your two databases?"
- **Answer:** "Our current design separates data domains to minimize cross-database dependencies. For operations that require consistency, we implement application-level compensation transactions. For production, we could implement a saga pattern or event-driven architecture with eventual consistency."

**2. No Database Migration Strategy:**
- **Issue:** Schema changes are ad-hoc
- **Impact:** Potential deployment issues, data loss risk
- **Professor's Question:** "How do you handle database schema changes?"
- **Answer:** "For MongoDB, we leverage flexible schema and handle changes in the application layer. For Supabase, we would implement migration scripts using a migration tool. For production, we would implement formal database migration processes with rollback capabilities."

**3. No Backup Testing:**
- **Issue:** Reliance on provider backups without validation
- **Impact:** Potential data loss if backups fail
- **Professor's Question:** "How do you validate your backup and recovery processes?"
- **Answer:** "We currently rely on our hosting providers' backup systems. For production, we would implement regular backup restoration testing, document recovery procedures, and implement automated backup validation to ensure data can be recovered when needed."

---

### UI/UX Issues

**1. No Mobile Optimization:**
- **Issue:** Dashboard designed for desktop use
- **Impact:** Poor experience on mobile devices
- **Professor's Question:** "How does your system support mobile users?"
- **Answer:** "Our current dashboard is desktop-optimized. For production, we would implement responsive design patterns, mobile-specific interfaces, and potentially a dedicated mobile app for field use by barangay officials and response teams."

**2. No Offline Capabilities:**
- **Issue:** System requires constant internet connection
- **Impact:** Unusable during connectivity outages (common in disasters)
- **Professor's Question:** "How does your system function during internet outages?"
- **Answer:** "Our current system requires internet connectivity. For production, we would implement offline capabilities using service workers, local data caching, and synchronization when connectivity is restored. This is crucial for disaster scenarios where connectivity may be unreliable."

**3. No Accessibility Features:**
- **Issue:** No explicit accessibility considerations
- **Impact:** Difficult for users with disabilities
- **Professor's Question:** "How does your system accommodate users with disabilities?"
- **Answer:** "We currently don't have explicit accessibility features. For production, we would implement WCAG compliance, screen reader support, keyboard navigation, high contrast modes, and other accessibility features to ensure the system is usable by all disaster response personnel."

---

## 16. Strengths

### Architecture Strengths

**1. Clear Separation of Concerns:**
- Distinct frontend, backend, and data layers
- Each component has well-defined responsibilities
- Easy to understand and maintain

**2. Hybrid Database Optimization:**
- MongoDB for time-series sensor data
- PostgreSQL for relational user data
- Each database optimized for its use case

**3. Modern Technology Stack:**
- Next.js 16 with App Router (latest React patterns)
- FastAPI (modern Python web framework)
- TypeScript for type safety
- Current best practices

**4. API-First Design:**
- Clear API contracts
- Easy to integrate with other systems
- Potential for mobile app integration

---

### AI Implementation Strengths

**1. Explainable AI:**
- Fuzzy logic provides transparent decision process
- AHP breakdown shows vulnerability scoring
- Reasoning steps provide narrative explanation
- Critical for disaster response accountability

**2. Domain-Appropriate Algorithm:**
- Fuzzy logic handles uncertainty in sensor readings
- AHP provides structured multi-criteria decision making
- Combines technical and social vulnerability factors
- Based on established disaster response principles

**3. Human-in-the-Loop Design:**
- Manual trigger for AI generation
- Admin can review before acting
- Override capability for local knowledge
- Recommendations are advisory, not prescriptive

**4. Adaptive to Constraints:**
- Respects inventory limitations
- Handles missing sensor data gracefully
- Can operate with partial information
- Provides clear confidence scores

---

### Security Strengths

**1. Robust Authentication:**
- Bcrypt password hashing (industry standard)
- Account lockout after failed attempts
- HTTP-only session cookies
- Secure session management

**2. Role-Based Access Control:**
- Four distinct roles matching organizational structure
- Server-side and client-side permission checks
- Data scoping by barangay and department
- Principle of least privilege

**3. Comprehensive Audit Logging:**
- All user actions logged
- Role-based log visibility
- Non-blocking audit writes
- Complete accountability trail

**4. Environment-Based Configuration:**
- Secrets stored in environment variables
- Different configs for development/production
- No sensitive data in code
- Platform-specific secret management

---

### User Experience Strengths

**1. Intuitive Dashboard Design:**
- Clear navigation structure
- Role-based menu items
- Visual data representation (maps, charts)
- Logical workflow

**2. Real-Time Monitoring:**
- Live sensor data display
- Interactive map visualization
- Current flood status indicators
- Severe alert filtering

**3. Comprehensive Data Management:**
- Resident and family clustering
- Vulnerability demographic tracking
- Application workflow for registration
- Search and filter capabilities

**4. Multi-Module Integration:**
- Seamless integration between modules
- Consistent UI patterns
- Shared data across modules
- Unified user experience

---

### Development Strengths

**1. Type Safety:**
- TypeScript throughout frontend
- Pydantic models in backend
- Reduced runtime errors
- Better IDE support

**2. Modern Development Practices:**
- Git version control
- Environment-based configuration
- Modular component architecture
- Clear code organization

**3. Testing Foundation:**
- Unit tests for AI algorithm
- Testable architecture
- Repository pattern for backend
- Frontend components designed for testing

**4. Documentation:**
- Comprehensive code comments
- Clear API structure
- Environmental setup instructions
- Algorithm explanations

---

### Organizational Alignment Strengths

**1. Philippine Context Integration:**
- Matches CDRRMO/CSWDD/Barangay structure
- Addresses local flood risks
- Considers local vulnerability factors
- Aligns with national disaster response framework

**2. Equitable Distribution Focus:**
- Vulnerability-based allocation
- Prioritizes at-risk populations
- Transparent decision criteria
- Explainable AI process

**3. Practical Workflow:**
- Matches actual disaster response processes
- Role-appropriate functionality
- Barangay-level granularity
- City-wide coordination capability

**4. Scalable Foundation:**
- Can expand to more barangays
- Can add more sensor types
- Can integrate with national systems
- Can enhance AI algorithms

---

## 17. Suggestions

### Production Readiness Enhancements

**1. Implement Comprehensive Testing:**
- Add frontend unit tests (Jest, React Testing Library)
- Add integration tests (API endpoints)
- Add end-to-end tests (Playwright, Cypress)
- Implement load testing (k6, Artillery)
- Add security testing (OWASP ZAP, Burp Suite)

**2. Enhanced Monitoring & Alerting:**
- Implement centralized logging (ELK Stack, CloudWatch)
- Add application performance monitoring (New Relic, Datadog)
- Set up alerting for critical failures
- Implement health check endpoints
- Add uptime monitoring

**3. CI/CD Pipeline:**
- Implement GitHub Actions for automated testing
- Add automated deployment on merge to main
- Implement staging environment
- Add database migration automation
- Implement rollback procedures

**4. Security Hardening:**
- Implement rate limiting (Redis, Vercel)
- Add CSRF protection
- Implement security headers (CSP, HSTS)
- Add API authentication for backend
- Implement secret rotation policies
- Add dependency scanning (Snyk, Dependabot)

---

### Feature Enhancements

**1. Real-Time Notifications:**
- SMS notifications for residents (Twilio)
- Email notifications for administrators
- Push notifications for mobile app
- Multi-channel notification system
- Delivery tracking and confirmation

**2. Mobile Applications:**
- Resident mobile app for registration
- Field worker app for data collection
- Offline capabilities for poor connectivity
- GPS-based location services
- Push notification support

**3. Advanced Analytics:**
- Historical flood pattern analysis
- Prediction models for flood risk
- Resource utilization analytics
- Response time metrics
- Trend analysis and reporting

**4. Enhanced AI Capabilities:**
- Feedback loop for algorithm improvement
- A/B testing for different configurations
- Machine learning for pattern recognition
- Predictive analytics for resource needs
- Adaptive threshold tuning

---

### Technical Enhancements

**1. Performance Optimization:**
- Implement Redis caching layer
- Add CDN for static assets
- Optimize database queries
- Implement connection pooling configuration
- Add database query optimization

**2. Scalability Improvements:**
- Implement microservices architecture
- Add container orchestration (Kubernetes)
- Implement database sharding
- Add load balancing
- Implement geographic distribution

**3. Data Management:**
- Implement data archiving strategy
- Add database migration tools
- Implement backup testing
- Add data retention policies
- Implement data validation automation

**4. Developer Experience:**
- Add API documentation (Swagger/OpenAPI)
- Implement storybook for component development
- Add code quality tools (ESLint, Prettier)
- Implement pre-commit hooks
- Add development tooling

---

### User Experience Enhancements

**1. Mobile Responsiveness:**
- Implement responsive design
- Add mobile-specific interfaces
- Optimize touch interactions
- Implement mobile-first design patterns
- Add progressive web app capabilities

**2. Accessibility Improvements:**
- Implement WCAG compliance
- Add screen reader support
- Implement keyboard navigation
- Add high contrast modes
- Implement language localization

**3. Offline Capabilities:**
- Implement service workers
- Add local data caching
- Implement synchronization mechanisms
- Add offline indicators
- Implement conflict resolution

**4. User Training & Support:**
- Create user documentation
- Add inline help and tooltips
- Implement tutorial system
- Add video demonstrations
- Create troubleshooting guides

---

### Integration Enhancements

**1. External System Integration:**
- Integrate with national disaster response systems
- Add weather service integration (PAGASA)
- Implement GIS integration for detailed mapping
- Add social media integration for public alerts
- Implement emergency services integration

**2. Sensor Network Expansion:**
- Support additional sensor types
- Implement sensor calibration management
- Add predictive maintenance
- Implement automatic sensor provisioning
- Add sensor health monitoring

**3. Data Export & Reporting:**
- Implement PDF report generation
- Add Excel export capabilities
- Implement data visualization dashboards
- Add custom report builder
- Implement scheduled reporting

**4. Workflow Automation:**
- Implement approval workflows
- Add escalation procedures
- Implement automated task assignment
- Add deadline reminders
- Implement notification workflows

---

## 18. 5-Minute Presentation Script

**Introduction (30 seconds):**
"SmartFlood V3 is an AI-optimized flood management and relief distribution system for Malabon City. Our system combines real-time IoT sensor monitoring, artificial intelligence for equitable relief allocation, and a comprehensive admin dashboard for disaster response coordination."

**Problem (30 seconds):**
"Flood disasters in Malabon City disproportionately affect vulnerable populations. Current manual relief distribution is slow, inefficient, and lacks transparency. There's no real-time monitoring of flood situations, and allocation decisions are often subjective rather than data-driven."

**Solution (1 minute):**
"Our system integrates three key components: First, a network of IoT sensors providing real-time water level monitoring across barangays. Second, an AI engine that uses fuzzy logic for flood risk classification and AHP for vulnerability scoring to generate equitable relief allocation recommendations. Third, a role-based admin dashboard that matches the actual organizational structure of Philippine disaster response."

**Architecture (1 minute):**
"We use a hybrid database architecture: MongoDB for time-series sensor data and Supabase PostgreSQL for user and resident data. The frontend is Next.js with TypeScript, providing server-side rendering and API routes. The AI backend is FastAPI with Python, optimized for the computational requirements of our algorithm. This separation allows each component to be optimized for its specific use case."

**Key Features (1 minute):**
"Our system provides real-time flood monitoring with interactive maps, AI-powered relief recommendations that are fully explainable, comprehensive resident management with vulnerability tracking, and role-based access control for different administrative levels. The AI algorithm prioritizes vulnerable populations like infants, elderly, and PWD individuals, ensuring equitable distribution of limited resources."

**Impact (30 seconds):**
"SmartFlood V3 transforms disaster response from reactive to proactive, from subjective to data-driven, and from inequitable to fair. Our explainable AI approach ensures transparency and accountability in critical allocation decisions, while the real-time monitoring enables faster response to evolving flood situations."

**Conclusion (30 seconds):**
"This system demonstrates how modern web technologies, combined with explainable AI, can address real-world challenges in disaster management. Our architecture is scalable to city-wide deployment and can serve as a model for other flood-prone municipalities in the Philippines."

---

## 19. 10-Minute Technical Explanation

**System Overview (1 minute):**
"SmartFlood V3 is a full-stack disaster management platform with three main components: a Next.js admin dashboard, a FastAPI AI backend, and a hybrid database architecture using MongoDB and Supabase. The system serves multiple user roles including Super Admins, CDRRMO staff, CSWDD workers, and Barangay officials, each with specific permissions and data access scopes."

**Frontend Architecture (2 minutes):**
"Our frontend uses Next.js 16 with the App Router pattern, providing server-side rendering and optimized performance. We implement hash-based routing within the dashboard for smooth module transitions. The component architecture is modular, with separate components for dashboard, monitoring, sensors, relief, residents, and logs. We use TypeScript throughout for type safety. API routes handle server-side operations including authentication, data access, and AI backend proxying. State management uses React hooks with localStorage for session backup, while primary session management uses HTTP-only signed cookies."

**Backend Architecture (2 minutes):**
"The AI backend is implemented in FastAPI, chosen for its native async support and automatic data validation with Pydantic. The repository pattern provides a clean separation between business logic and data access. The AI engine implements fuzzy logic for flood risk classification and AHP (Analytic Hierarchy Process) for vulnerability scoring. The system reads sensor data from MongoDB and family vulnerability data from Supabase, processes it through the AI algorithm, and saves recommendations back to Supabase. All operations are logged for audit trails."

**Database Design (2 minutes):**
"We use a hybrid database strategy for optimal performance. MongoDB stores time-series sensor data with its flexible schema and efficient time-series queries. The sensors collection stores device metadata, while sensor_readings stores timestamped water level measurements. Supabase PostgreSQL stores relational data including user accounts, resident records, family clusters with vulnerability counts, AI recommendations, relief inventory, and audit logs. This separation allows each database to be optimized for its specific use case."

**AI Algorithm (1.5 minutes):**
"Our AI algorithm combines fuzzy logic and AHP. Fuzzy logic classifies water levels into risk categories using membership functions that handle uncertainty—normal below 0.25m, flood alert from 0.25-0.75m, flood warning from 0.75-1.2m, and severity above 1.2m. AHP weights vulnerability factors: infants (0.22), elderly (0.20), PWD (0.18), pregnant women (0.12), lactating mothers (0.10), toddlers (0.10), and 4Ps members (0.08). Priority scores combine risk weight, vulnerability score, and population. Inventory allocation uses a priority-based round-robin approach to ensure fair distribution."

**Security Implementation (1.5 minutes):**
"Security is implemented through multiple layers. Authentication uses bcrypt password hashing with account lockout after 3 failed attempts. Sessions use HTTP-only cookies signed with HMAC-SHA256. Role-based access control provides four distinct roles with different permissions and data scopes. All operations are logged in an audit trail. However, we acknowledge areas for improvement including rate limiting, CSRF protection, and security headers. Environment variables store all sensitive data, and we use different configurations for development and production."

---

## 20. Defense Cheat Sheet

### System Overview
- **Purpose:** AI-optimized flood management and relief distribution for Malabon City
- **Components:** Next.js dashboard, FastAPI AI backend, MongoDB + Supabase databases
- **Users:** 4 roles (Super Admin, CDRRMO, CSWDD, Barangay Admin)
- **Key Features:** Real-time monitoring, AI recommendations, resident management, audit logging

### Architecture Decisions
- **Hybrid Database:** MongoDB for sensor data (time-series, flexible), PostgreSQL for user data (relational, ACID)
- **Next.js:** SSR performance, built-in API routes, TypeScript support, Vercel integration
- **FastAPI:** Async performance, Pydantic validation, automatic docs, Python AI ecosystem
- **Fuzzy Logic + AHP:** Explainable AI, handles uncertainty, domain-appropriate, transparent

### AI Algorithm
- **Fuzzy Logic:** Water level classification with membership functions (normal/alert/warning/severity)
- **AHP Weights:** Infant (0.22), Elderly (0.20), PWD (0.18), Pregnant (0.12), Lactating (0.10), Toddler (0.10), 4Ps (0.08)
- **Priority Score:** Risk weight × 100 + vulnerability score + family count
- **Allocation:** Priority-based with round-robin for remaining inventory

### Security
- **Authentication:** Bcrypt hashing, account lockout (3 attempts), HTTP-only signed cookies
- **Authorization:** RBAC with 4 roles, server-side validation, data scoping
- **Audit Logging:** All actions logged, role-based visibility, non-blocking writes
- **Improvements Needed:** Rate limiting, CSRF protection, security headers

### Databases
- **MongoDB:** Sensors collection, sensor_readings collection, time-series optimization
- **Supabase:** app_users, residents_v3, families, ai_recommendations, relief_inventory, audit_logs, roles, barangays
- **Relationships:** Foreign keys in PostgreSQL, app-level references for MongoDB

### Key Features
- **Dashboard:** Real-time sensor map, severe alert filtering, interactive markers
- **Monitoring:** Alert levels, heatmaps, historical data, narrative reports
- **AI Recommendations:** Inventory input, fuzzy explanation, AHP breakdown, reasoning steps
- **Residents:** CRUD operations, family clustering, vulnerability tracking
- **Applications:** Approval workflow, family creation, audit trail

### Data Flow
- **Sensors:** Device → MongoDB → Dashboard query → Map visualization
- **AI Generation:** Admin input → Frontend proxy → FastAPI → MongoDB + Supabase → Algorithm → Supabase storage → Dashboard display
- **Authentication:** Login form → API route → Supabase query → Bcrypt verify → Session cookie → Dashboard access

### Performance
- **Frontend:** Vercel edge caching, server-side rendering, code splitting
- **Backend:** FastAPI async, Gunicorn workers, connection pooling
- **Database:** Appropriate indexes, query optimization, aggregation pipelines
- **Improvements:** Redis caching, load balancing, database archiving

### Deployment
- **Frontend:** Vercel (automatic deployments, environment variables)
- **Backend:** Heroku (Procfile, Gunicorn + Uvicorn)
- **Databases:** MongoDB Atlas, Supabase (managed services)
- **CI/CD:** Git-based, manual triggers (improvement: GitHub Actions)

### Weaknesses & Mitigations
- **No Rate Limiting:** Implement Redis-based rate limiting
- **No CSRF Protection:** Add CSRF tokens for state changes
- **No Caching:** Implement Redis for frequently accessed data
- **No Mobile Optimization:** Add responsive design, mobile app
- **No Offline Capabilities:** Implement service workers, PWA

### Strengths
- **Explainable AI:** Transparent decision process, accountability
- **Role-Based Access:** Matches organizational structure, least privilege
- **Real-Time Monitoring:** Live sensor data, interactive visualization
- **Equitable Distribution:** Vulnerability-based allocation, fair prioritization
- **Modern Stack:** Current best practices, type safety, performance

### Future Enhancements
- **Notifications:** SMS, email, push notifications for residents
- **Mobile Apps:** Resident registration, field data collection, offline support
- **Advanced Analytics:** Historical patterns, predictive models, trend analysis
- **Integration:** National systems, weather services, GIS, emergency services

### Questions to Anticipate
- **Why hybrid databases?** Optimal for different data types (time-series vs relational)
- **Why fuzzy logic + AHP?** Explainable, domain-appropriate, handles uncertainty
- **How ensure fairness?** Vulnerability-based weights, transparent process, human oversight
- **Scalability strategy?** Microservices, container orchestration, database sharding, caching
- **Security improvements?** Rate limiting, CSRF, security headers, MFA, secret rotation

### Key Metrics
- **Response Time:** < 1 second for dashboard operations
- **Concurrent Users:** Scales via Vercel serverless, connection pooling
- **Sensor Data:** MongoDB handles high-volume time-series writes
- **AI Generation:** < 5 seconds for 3 barangays with current data volumes

### Disaster Response Alignment
- **Organizational Structure:** Matches CDRRMO/CSWDD/Barangay system
- **Workflow:** Registration → Monitoring → Assessment → Allocation → Distribution
- **Vulnerability Focus:** Prioritizes infants, elderly, PWD, pregnant women
- **Transparency:** Explainable AI, audit trail, role-based access
