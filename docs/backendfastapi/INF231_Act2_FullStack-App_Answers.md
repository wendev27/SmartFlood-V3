**INF231 Activity 2 - SmartFlood Frontend Analysis**  
**1) Cover Section**  
**Project Title:** SmartFlood AI-Optimized Relief Recommendation System  
**Teammate Names:** [Add your team names here]  
**GitHub URLs:**  
- Backend: N/A  
- Frontend: https://github.com/wendev27/SmartFlood-V3  
**aikengunay Access:** [Confirm if aikengunay has been invited with Read access to private repo, or N/A if public]  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUpfD6ZYGZDAgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHCoGAe/SKtAAAAAASUVORK5CYII=)  
**2) Frontend Folder Map**  
**Main Frontend Folders and Their Purpose:**  
Frontend/  
 ├── src/                      # Main source code directory  
 │   ├── app/                  # Next.js App Router pages and API routes  
 │   │   ├── api/              # API route handlers (server-side endpoints)  
 │   │   │   ├── ai/           # AI recommendations endpoints  
 │   │   │   ├── app-users/    # Application user management  
 │   │   │   ├── auth/         # Authentication endpoints  
 │   │   │   ├── families/     # Family data management  
 │   │   │   ├── health/       # Health check endpoint  
 │   │   │   ├── logs/         # Audit and system logs  
 │   │   │   ├── relief/       # Relief inventory management  
 │   │   │   ├── resident-applications/ # Resident verification applications  
 │   │   │   ├── residents/    # Resident records management  
 │   │   │   └── sensors/      # Sensor data management  
 │   │   ├── dashboard/        # Main dashboard page  
 │   │   ├── sensor-simulator/ # Sensor simulation interface  
 │   │   ├── layout.tsx        # Root layout component  
 │   │   ├── page.tsx          # Home page  
 │   │   └── globals.css       # Global styles  
 │   ├── components/           # React components organized by feature  
 │   │   ├── dashboard/        # Dashboard-specific components  
 │   │   ├── hardware/         # Hardware control components  
 │   │   ├── icons/             # Custom icons  
 │   │   ├── layout/           # Layout components (sidebar, header)  
 │   │   ├── login/            # Login page components  
 │   │   ├── logs/             # Logging and audit components  
 │   │   ├── map/              # Map visualization components  
 │   │   ├── monitoring/       # Monitoring panel components  
 │   │   ├── navigation/       # Navigation components  
 │   │   ├── relief/           # Relief management components  
 │   │   ├── residents/        # Resident management components  
 │   │   ├── sensors/          # Sensor panel components  
 │   │   ├── ui/               # Reusable UI components  
 │   │   └── verification/     # Verification workflow components  
 │   ├── lib/                  # Utility libraries and helpers  
 │   │   ├── supabaseClient.ts # Client-side Supabase setup  
 │   │   ├── supabaseServer.ts # Server-side Supabase setup  
 │   │   ├── mongodb.ts        # MongoDB connection helper  
 │   │   ├── authSession.ts    # Authentication session management  
 │   │   ├── auditLogger.ts    # Audit logging utilities  
 │   │   ├── barangayScope.ts  # Barangay access control  
 │   │   ├── dashboardViewer.ts # Dashboard user management  
 │   │   ├── sensorMapping.ts  # Sensor data mapping  
 │   │   └── [other utilities] # Various helper functions  
 │   ├── services/             # API service layer  
 │   │   ├── apiClient.ts      # Base API client  
 │   │   ├── dashboardService.ts # Dashboard data service  
 │   │   ├── floodService.ts   # Flood monitoring service  
 │   │   ├── hardwareService.ts # Hardware control service  
 │   │   ├── logsService.ts    # Logs retrieval service  
 │   │   ├── reliefService.ts  # Relief inventory service  
 │   │   ├── residentsService.ts # Resident data service  
 │   │   ├── sensorsService.ts # Sensor data service  
 │   │   └── verificationService.ts # Verification service  
 │   ├── types/                # TypeScript type definitions  
 │   │   ├── common.ts         # Shared types  
 │   │   ├── dashboard.ts      # Dashboard-specific types  
 │   │   ├── hardware.ts       # Hardware-related types  
 │   │   ├── logs.ts           # Logging types  
 │   │   ├── relief.ts         # Relief management types  
 │   │   ├── residents.ts      # Resident data types  
 │   │   ├── sensors.ts        # Sensor data types  
 │   │   ├── supabase-tables.ts # Supabase table schemas  
 │   │   └── verification.ts   # Verification workflow types  
 │   └── data/                 # Mock data for development  
 │       ├── dashboard.mock.ts  
 │       ├── hardware.mock.ts  
 │       ├── logs.mock.ts  
 │       ├── relief.mock.ts  
 │       ├── residents.mock.ts  
 │       ├── sensors.mock.ts  
 │       └── verification.mock.ts  
 ├── .gitignore               # Git ignore rules  
 ├── package.json             # Dependencies and scripts  
 ├── next.config.ts           # Next.js configuration  
 ├── tsconfig.json            # TypeScript configuration  
 ├── index.html               # HTML entry point  
 ├── script.js                # Additional JavaScript  
 ├── styles.css               # Global styles  
 └── README.md                # Frontend documentation  
   
**API Owner:** [Add name if changed since Act 1, otherwise same as Act 1]  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSdYxZ4/mJjEsxE8W8GbCFuCLTOzVXsAAPzFuVZ3dXw9AQDgtesBxPEF3bv7x0IAAAAASUVORK5CYII=)  
**3) .env.example**  
**Note:** A .env.example file has been created for the Frontend directory to document required environment variables.  
**Required Environment Variables:**  
# Supabase Configuration  
 NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  
 NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here  
 SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  
   
 # MongoDB Configuration  
 MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database  
 MONGODB_DB=your-database-name  
   
 # Next.js Configuration  
 NODE_ENV=development  
   
**Status:** ✅ .env.example has been created in the Frontend directory with placeholder values only.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3OQQmAUBBAwSeILbyYdDP8jAaxgjcRZhLMNjNntQIA4C/uvTqq6+sJAADvPS2NA0FrXqf/AAAAAElFTkSuQmCC)  
**4) Proof .env is not in Git**  
**Root .gitignore Snippet:**  
# dependencies  
 node_modules/  
 .next/  
 out/  
 dist/  
 build/  
   
 # env files  
 .env  
 .env.local  
 .env.*.local  
   
 # logs  
 npm-debug.log*  
 yarn-debug.log*  
 yarn-error.log*  
 pnpm-debug.log*  
   
 # OS/editor  
 .DS_Store  
 .vscode/  
 Backend/.env  
   
**Frontend .gitignore Snippet:**  
.next  
 node_modules  
 out  
 dist  
 *.log  
   
**Git Check-Ignore Verification:**  
$ git check-ignore -v Frontend/.env.local  
 .gitignore:10:.env.localFrontend/.env.local  
   
**Status:** ✅ .env.local is properly ignored by Git at the root level. The Frontend inherits this configuration from the root .gitignore.  
**Frontend-specific .git status:** The Frontend directory has its own .gitignore but relies on the root .gitignore for environment file protection.  
**Secret Commit History:** [No secrets were committed - environment files were never in the repository]  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhYMMAKlD4OzrxgQU2QtIq6DIzR3UFAMBf3Gu1VefXEwAAXtsfSqADWz4G/HUAAAAASUVORK5CYII=)  
**5) One API Action - Create Resident Record**  
**What it does:**  
The POST /api/residents endpoint creates new resident records in the system. It:  
1. Authenticates and authorizes the dashboard viewer (super admin, CSWDD, or barangay level)  
2. Validates required fields (name, address, barangay assignment)  
3. Handles two scenarios: creating a family head (which also creates a family cluster) or adding a family member  
4. Applies barangay-level access control (barangay users can only create residents in their assigned barangay)  
5. Creates resident records in Supabase  
6. Creates/updates family clusters with vulnerability counts  
7. Logs audit events for traceability  
8. Returns the created resident and family data  
**File Paths in Order:**  
src/app/api/residents/route.ts → src/lib/supabaseServer.ts → src/lib/dashboardViewer.ts → src/lib/barangayScope.ts → src/lib/auditLogger.ts  
   
**Detailed Flow:**  
1. **src/app/api/residents/route.ts** (Lines 28-147): POST() endpoint receives request  
2. **src/lib/dashboardViewer.ts**: getDashboardViewer() authenticates the user  
3. **src/lib/dashboardViewer.ts**: dashboardViewerRole() determines user permissions  
4. **src/lib/barangayScope.ts**: assignedBarangayForUser() applies barangay-level access control  
5. **src/lib/supabaseServer.ts**: supabaseServer provides database access  
6. **src/app/api/residents/route.ts**: Database operations (insert resident, create/update family)  
7. **src/lib/auditLogger.ts**: logAuditEvent() records the action  
8. **src/lib/residentPayload.ts**: Helper functions for data formatting  
**Which file loads environment variables:**  
**src/lib/supabaseServer.ts** and  **src/lib/mongodb.ts** load environment variables:  
**supabaseServer.ts** (Lines 5-12):  
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;  
 const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  
   
 if (!supabaseUrl)  
   throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in environment');  
 if (!supabaseServiceRoleKey)  
   throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment');  
   
**mongodb.ts** (Lines 8-10):  
const uri = process.env.MONGODB_URI;  
   
 if (!uri) throw new Error('Missing MONGODB_URI in environment');  
   
**Note:** Next.js automatically loads environment variables from .env.local at build time for server-side code.  
**What changed this week:**  
**Already split; no extract needed this week.**  
The Next.js frontend was already properly structured following Next.js App Router conventions with clear separation of concerns:  
- **app/api/**: API route handlers organized by feature domain  
- **components/**: React components organized by feature area  
- **lib/**: Utility libraries and configuration  
- **services/**: API service layer for data operations  
- **types/**: TypeScript type definitions  
- **data/**: Mock data for development  
The architecture follows Next.js best practices with:  
- Server-side and client-side separation  
- Feature-based component organization  
- Clear API route structure  
- Environment variable management through Next.js built-in support  
- Proper access control and security layers  
No refactoring was needed as the codebase was already properly organized following modern Next.js patterns.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EjtY9fewnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzWAM6QQXRdAAAAABJRU5ErkJggg==)  
**Additional Notes**  
**Technology Stack:**  
- **Framework**: Next.js 16.2.6 (App Router)  
- **Language**: TypeScript  
- **UI Library**: React 19.2.1  
- **Database Clients**:  
  - Supabase (@supabase/supabase-js v2.106.2)  
  - MongoDB (mongodb v7.2.0)  
- **Mapping**: Leaflet + React-Leaflet  
- **Authentication**: Custom implementation with bcryptjs  
**Next.js App Router Architecture:**  
The frontend uses Next.js App Router which provides:  
- **File-based routing**: Automatic route generation from file structure  
- **Server components**: Built-in server-side rendering  
- **API routes**: Server-side endpoints in app/api/ directory  
- **Environment variables**: Built-in support for .env.local  
**Security Measures:**  
- ✅ .env.local properly ignored in root .gitignore  
- ✅ .env.example created with placeholder values  
- ✅ Role-based access control (super, cswdd, barangay)  
- ✅ Barangay-level data scoping  
- ✅ Audit logging for all critical operations  
- ✅ Server-side environment variable access  
**API Organization:**  
The frontend implements its own API routes that serve as:  
1. **Server-side endpoints** for direct database access  
2. **Business logic layer** for data validation and access control  
3. **Integration layer** between Next.js frontend and databases  
**Recommended Improvements:**  
1. ✅ **Created .env.example** in Frontend directory with placeholder values  
2. **Add environment variable validation** at startup  
3. **Consider moving shared business logic** to a shared library if backend grows  
4. **Document API routes** in a central location  
**Frontend vs Backend Architecture:**  
- **Backend (FastAPI)**: Standalone API service with clear controller/repository/engine separation  
- **Frontend (Next.js)**: Full-stack application with embedded API routes following Next.js conventions  
- **Integration**: Frontend can call its own API routes or the standalone FastAPI backend depending on the feature  
