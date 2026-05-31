# SmartFlood Standalone AI Backend

FastAPI service for AI-optimized relief recommendations. It reads sensors and
latest readings from MongoDB, reads family vulnerability records from Supabase,
stores generated recommendations in Supabase, and records best-effort AI audit
events.

## Setup

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `GET /api/ai/recommendations`
- `POST /api/ai/recommendations/generate`
- `GET /api/relief/inventory`
- `POST /api/relief/inventory`

## Generate Recommendations

```bash
curl -X POST http://localhost:8000/api/ai/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "family_food_packs": 100,
    "medicine_kits": 30,
    "relief_goods_individual": 300,
    "audit_actor": {
      "actor_user_id": null,
      "actor_name": "City Admin",
      "actor_role": "City Admin"
    }
  }'
```

Example response:

```json
{
  "success": true,
  "data": [
    {
      "recommendation_id": "generated-uuid",
      "barangay_id": "1",
      "barangay_name": "Barangay Tanong",
      "risk_level": "severity",
      "priority_score": 405.78,
      "affected_families": 12,
      "recommended_family_food_packs": 12,
      "recommended_medicine_kits": 18,
      "recommended_relief_goods_individual": 80,
      "analysis_reason": "Severity flood risk detected at 1.20m with 12 affected families. Relief allocation prioritized based on available inventory.",
      "ahp_breakdown": {
        "weights": {
          "infant": 0.22,
          "elderly": 0.2,
          "pwd": 0.18,
          "pregnant": 0.12,
          "lactating": 0.1,
          "toddler": 0.1,
          "four_ps": 0.08
        },
        "counts": {
          "infant": 4,
          "elderly": 8,
          "pwd": 5,
          "pregnant": 2,
          "lactating": 2,
          "toddler": 5,
          "four_ps": 18
        },
        "contributions": {
          "infant": 0.88,
          "elderly": 1.6,
          "pwd": 0.9,
          "pregnant": 0.24,
          "lactating": 0.2,
          "toddler": 0.5,
          "four_ps": 1.44
        },
        "total_vulnerability_score": 5.76
      },
      "fuzzy_explanation": {
        "water_level_m": 1.2,
        "risk_level": "severity",
        "risk_label": "Severity",
        "confidence": 1.0,
        "memberships": {
          "normal": 0.0,
          "flood_alert": 0.0,
          "flood_warning": 0.0,
          "severity": 1.0
        }
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
  ]
}
```

## Tests

```bash
python3 -m compileall -q app tests
python3 -m unittest discover -s tests -v
```
