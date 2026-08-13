**INF231 Activity 2 - SmartFlood FastAPI Backend Analysis**  
**1) Cover Section**  
**Project Title:** SmartFlood AI-Optimized Relief Recommendation System  
**Teammate Names:** [Add your team names here]  
**GitHub URLs:**  
- Backend: https://github.com/wendev27/SmartFlood-V3  
- Frontend: N/A  
**aikengunay Access:** [Confirm if aikengunay has been invited with Read access to private repo, or N/A if public]  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUpfD6ZYGZDAgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHCoGAe/SKtAAAAAASUVORK5CYII=)  
**2) Backend Folder Map**  
**Main Backend Folders and Their Purpose:**  
Backend/  
 ├── app/                      # Main application code directory  
 │   ├── main.py              # FastAPI application with all API endpoints  
 │   ├── config.py            # Configuration management and environment variable loading  
 │   ├── repositories.py     # Database access layer (MongoDB & Supabase operations)  
 │   ├── engine.py            # AI recommendation logic (AHP, fuzzy logic, inventory allocation)  
 │   ├── models.py            # Pydantic data models for request/response validation  
 │   ├── payloads.py          # Utility functions for request/response payload processing  
 │   ├── audit.py             # Audit logging functionality  
 │   └── __init__.py          # Python package initialization  
 ├── tests/                    # Unit tests directory  
 │   ├── test_payloads.py     # Tests for payload utilities  
 │   ├── test_engine.py       # Tests for AI engine logic  
 │   └── test_audit.py        # Tests for audit logging  
 ├── .env.example             # Environment variables template (placeholder values only)  
 ├── .gitignore               # Git ignore rules to prevent committing sensitive files  
 ├── requirements.txt         # Python dependencies  
 ├── README.md                # Backend documentation and setup instructions  
 ├── Procfile                 # Heroku/deployment configuration  
 └── .gitkeep                 # Git directory placeholder  
   
**API Owner:** [Add name if changed since Act 1, otherwise same as Act 1]  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**3) .env.example**  
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=YourApp  
 MONGODB_DB=your-database-name  
 # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=YourApp  
 SUPABASE_URL=https://your-project.supabase.co  
   
 SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  
   
   
   
 CORS_ORIGINS=http://localhost:3000  
   
**Note:** This file contains placeholder values only. Real secrets should never be committed to the repository.  
**Security Fix Applied:** Original .env.example contained real credentials which have been replaced with placeholder values for security.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALUlEQVR4nO3OQQ0AIAwEsAMlSJ0UrOFkGngRklZBR1WtJDsAAPzizNcDAADuNcKwAyU+nb+5AAAAAElFTkSuQmCC)  
**4) Proof .env is not in Git**  
**.gitignore Snippet:**  
__pycache__/  
 *.py[cod]  
 .env  
 .pytest_cache/  
 .venv/  
   
**Git Check-Ignore Verification:**  
$ git check-ignore -v .env  
 Backend/.gitignore:3:.envBackend/.env  
   
**Status:** ✅ .env is properly ignored by Git and will not be committed to the repository.  
**Secret Commit History:** Real credentials were found in .env.example and have been replaced with placeholder values. Password rotation recommended.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**5) One API Action - Generate AI Recommendations**  
**What it does:**  
The POST /api/ai/recommendations/generate endpoint generates AI-optimized relief recommendations for flood-affected barangays. It:  
1. Takes available relief inventory as input (food packs, medicine kits, relief goods)  
2. Fetches current sensor readings from MongoDB  
3. Retrieves family vulnerability data from Supabase  
4. Applies AHP (Analytic Hierarchy Process) and fuzzy logic to calculate risk scores  
5. Allocates available inventory based on priority and vulnerability  
6. Saves recommendations to Supabase  
7. Logs an audit event for traceability  
**File Paths in Order:**  
app/main.py → app/repositories.py → app/engine.py → app/config.py  
   
**Detailed Flow:**  
1. **app/main.py** (Lines 43-67): create_recommendations() endpoint receives request  
2. **app/config.py** (Lines 9, 49-51): Loads environment variables via load_dotenv() and get_settings()  
3. **app/repositories.py** (Lines 48-60): get_sensor_snapshot() and get_families() fetch data from MongoDB and Supabase  
4. **app/engine.py** (Lines 57-101): generate_recommendations() applies AI logic (AHP, fuzzy logic, inventory allocation)  
5. **app/repositories.py** (Lines 66-67): save_recommendations() stores results in Supabase  
6. **app/audit.py**: Audit event is logged for the action  
**Which file loads environment variables:**  
**app/config.py** loads environment variables using python-dotenv:  
- Line 7: from dotenv import load_dotenv  
- Line 9: load_dotenv() - This loads the .env file  
- Lines 22-32: Environment variables are read using os.getenv()  
**What changed this week:**  
**Already split; no extract needed this week.**  
The FastAPI backend was already properly structured with clear separation of concerns:  
- **main.py**: API endpoints and routing  
- **config.py**: Configuration and environment management  
- **repositories.py**: Database access layer  
- **engine.py**: Business logic and AI algorithms  
- **models.py**: Data models and validation  
- **payloads.py**: Request/response utilities  
- **audit.py**: Audit logging functionality  
The architecture follows clean architecture principles with each module having a single, well-defined responsibility. No refactoring was needed as the codebase was already properly organized.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCj7fFjsymJHAjAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrsexNkF4H1/HJoAAAAASUVORK5CYII=)  
**Additional Notes**  
**Technology Stack:**  
- **Framework**: FastAPI (Python)  
- **Databases**: MongoDB (sensor data), Supabase (family data, recommendations, audit logs)  
- **Configuration**: python-dotenv for environment variable management  
- **Deployment**: Heroku (Procfile included)  
**Security Measures:**  
- ✅ .env file in .gitignore  
- ✅ .env.example with placeholder values only  
- ✅ Service role keys properly separated from public keys  
- ✅ CORS configuration for controlled frontend access  
- ✅ Audit logging for all critical actions  
**API Endpoints:**  
- GET /health - Health check  
- GET /api/ai/recommendations - List saved recommendations  
- POST /api/ai/recommendations/generate - Generate new recommendations  
- GET /api/relief/inventory - List current inventory  
- POST /api/relief/inventory - Update inventory  
