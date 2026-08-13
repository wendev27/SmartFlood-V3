# SmartFlood HITL + ILP Backend Explanation

This README explains how the current SmartFlood AI backend combines
Human-in-the-Loop (HITL) review with Integer Linear Programming (ILP) relief
allocation.

SmartFlood is a decision-support system. The backend can generate optimized
allocation plans, but the system does not treat those plans as final government
decisions until a human administrator accepts one.

## 1. Main Idea

SmartFlood uses three layers:

```text
Flood and family data
        |
        v
Fuzzy risk + AHP-inspired vulnerability scoring
        |
        v
ILP allocation plans
        |
        v
Human review, accept, or decline
```

The AI backend answers this question:

> Given current flood risk, vulnerability data, and limited relief inventory,
> how many whole relief items should each barangay receive without exceeding
> supply or demand?

The human administrator answers the final operational question:

> Is this plan appropriate to record and use, considering local context,
> field conditions, and official responsibility?

## 2. Key Source Files

| Concern                                    | File                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| FastAPI generate and approve endpoints     | `Backend/app/main.py`                                        |
| Fuzzy risk, AHP scoring, barangay grouping | `Backend/app/engine.py`                                      |
| ILP model, variables, constraints, solver  | `Backend/app/ilp.py`                                         |
| Request and inventory validation           | `Backend/app/models.py`                                      |
| Save payload conversion                    | `Backend/app/payloads.py`                                    |
| Frontend review UI                         | `Frontend/src/components/relief/ReliefPanel/ReliefPanel.tsx` |
| Frontend approval API proxy                | `Frontend/src/app/api/ai/recommendations/approve/route.ts`   |

## 3. Human-in-the-Loop Flow

### Step 1: Human Inputs Inventory

The administrator opens the relief panel and enters available inventory:

- `family_food_packs`
- `medicine_kits`
- `relief_goods_individual`

The backend validates that inventory values are non-negative integers. At least
one inventory value must be greater than zero before generation is allowed.

### Step 2: Backend Generates Draft Plans

The frontend calls:

```text
POST /api/ai/recommendations/generate
```

The backend:

1. Reads sensor data from MongoDB.
2. Reads family and vulnerability data from Supabase.
3. Computes flood risk using fuzzy logic.
4. Computes vulnerability using fixed AHP-inspired weights.
5. Runs ILP allocation for three strategy profiles.
6. Returns draft plans to the frontend.

Important: generation logs an audit event, but it does not save allocation
history rows as final recommendations.

### Step 3: Human Reviews Strategy Options

The frontend displays three plans:

- Severity First
- Vulnerability First
- Balanced

The administrator can switch between plans, inspect barangay allocations, view
analysis details, then either accept or decline the recommendation.

### Step 4: Human Accepts or Declines

If the administrator accepts a plan, the frontend calls:

```text
POST /api/ai/recommendations/approve
```

Only the accepted plan is saved to Supabase recommendation history.

If the administrator declines, the frontend clears the generated plans and does
not call the approval endpoint. No allocation history row is saved.

## 4. Why HITL Matters

HITL is important because the ILP result is only optimal under the data and
rules provided to it. The backend cannot know every real-world condition, such
as blocked roads, duplicate reports, recent evacuations, damaged stock, or
official policy changes.

The AI provides:

- Consistent calculation.
- Transparent scoring.
- Integer allocation under constraints.
- Multiple policy-oriented strategy options.

The human provides:

- Final approval.
- Local knowledge.
- Accountability.
- Judgment when data is missing or outdated.

## 5. ILP Implementation Summary

The ILP is implemented in:

```text
Backend/app/ilp.py
```

The backend uses PuLP:

```python
from pulp import LpInteger, LpMaximize, LpProblem, LpStatus, LpVariable, PULP_CBC_CMD, lpSum, value
```

The solver used is CBC through:

```python
PULP_CBC_CMD(msg=False)
```

The optimization is created in `_solve_resource_allocation()`.

For each resource category, the backend creates one separate ILP problem:

- Family Food Packs
- Individual Relief Goods
- Emergency Kits

Resources are optimized independently, but they use the same barangay priority
coefficients for a selected profile.

## 6. Decision Variables

For barangay `i`, the ILP uses integer decision variables:

```text
x_food_i  = number of family food packs allocated to barangay i
x_goods_i = number of individual relief goods allocated to barangay i
x_kit_i   = number of emergency kits allocated to barangay i
```

In code, variables are created as:

```python
LpVariable(
    f"x_{category_id}_{item['key']}",
    lowBound=0,
    upBound=demands[item["key"]],
    cat=LpInteger,
)
```

This means every allocation must be:

- An integer.
- At least zero.
- Not greater than that barangay's demand ceiling.

## 7. Demand Formulas

Demand ceilings come from grouped family data in `Backend/app/engine.py`.

### Family Food Packs

```text
demand_food_i = affected_families_i
```

Meaning: one food pack demand unit per family record in the barangay.

### Individual Relief Goods

```text
demand_goods_i = total_family_members_i
```

Meaning: one individual relief goods demand unit per recorded family member.

### Emergency Kits

```text
demand_kit_i =
  pwd_count_i
  + elderly_count_i
  + lactating_count_i
  + pregnant_count_i
  + infant_count_i
```

Meaning: emergency kit demand is based on selected vulnerable demographic
counts.

These are hard-coded planning rules in the current backend. They should be
validated with CSWDD or the relevant disaster-response office before being
treated as official policy.

## 8. Priority Coefficients

Before ILP runs, each barangay receives a priority coefficient.

The backend computes:

```text
severity_component = risk_weight x 100
vulnerability_component = AHP vulnerability score + total family members
```

Risk weights are:

```text
severity       = 4
flood_warning  = 3
flood_alert    = 2
normal/no data = 1
```

The profile-specific coefficient is:

```text
priority_i =
  severity_component_i x severity_weight
  + vulnerability_component_i x vulnerability_weight
```

This is implemented in `_profile_priority()` in `Backend/app/ilp.py`.

## 9. Objective Function

For each resource category, the ILP maximizes total weighted allocation:

```text
Maximize Z = sum(priority_i x_i)
```

Where:

- `priority_i` is the profile-specific barangay priority coefficient.
- `x_i` is the integer allocation for one resource category.

In code:

```python
problem += lpSum(coefficients[item["key"]] * variables[item["key"]] for item in scored)
```

The objective favors allocating scarce resources to barangays with higher
combined flood severity and vulnerability priority.

## 10. Constraints

### Supply Constraint

```text
sum(x_i) <= effective_supply
```

In code:

```python
problem += lpSum(variables.values()) <= effective_supply
```

`effective_supply` is the smallest of:

- available inventory,
- total demand,
- profile coverage target demand.

### Demand Ceiling Constraint

```text
0 <= x_i <= demand_i
```

The upper bound is set directly on each variable:

```python
upBound=demands[item["key"]]
```

### Integer Constraint

```text
x_i is an integer
```

In code:

```python
cat=LpInteger
```

### Non-Negativity Constraint

```text
x_i >= 0
```

In code:

```python
lowBound=0
```

### Equity Floor

Not implemented as a mathematical constraint.

The backend response explicitly states that no hard-coded equity floor rule was
found. This means the ILP does not guarantee every barangay receives a minimum
allocation.

## 11. Three ILP Profiles

The backend returns three genuinely different optimization profiles because
they change both priority weights and coverage targets.

| Profile             | Severity Weight | Vulnerability Weight | Coverage Behavior                                                         |
| ------------------- | --------------: | -------------------: | ------------------------------------------------------------------------- |
| Severity First      |             2.5 |                  0.7 | Prioritizes flood severity; targets full emergency-kit demand             |
| Vulnerability First |             0.7 |                  2.5 | Prioritizes demographic vulnerability; targets higher food/goods coverage |
| Balanced            |             1.0 |                  1.0 | Equal severity and vulnerability weighting; balanced coverage targets     |

Coverage targets:

```text
Severity First:
  food = 0.55
  individual goods = 0.45
  emergency kits = 1.00

Vulnerability First:
  food = 0.90
  individual goods = 0.90
  emergency kits = 0.55

Balanced:
  food = 0.75
  individual goods = 0.75
  emergency kits = 0.75
```

These profiles are not just labels. They can produce different allocations,
especially when inventory is enough to allow profile coverage targets to matter.

## 12. AHP + Fuzzy to ILP Data Flow

```text
MongoDB sensors and sensor_readings
        |
        v
Maximum water level per barangay
        |
        v
Fuzzy flood classification
        |
        v
Risk weight
        |
        v
Supabase families table
        |
        v
Grouped vulnerability counts per barangay
        |
        v
AHP-inspired vulnerability score
        |
        v
Profile-specific priority coefficient
        |
        v
ILP objective coefficient
        |
        v
Integer resource allocation
        |
        v
Draft plans for human review
        |
        v
Human-approved plan saved to history
```

## 13. Example

Assume two barangays:

| Barangay | Risk          | AHP Score | Members | Families | Emergency Demand |
| -------- | ------------- | --------: | ------: | -------: | ---------------: |
| A        | severity      |         8 |      30 |       10 |                6 |
| B        | flood_warning |        12 |      50 |       15 |               10 |

For the Balanced profile:

```text
priority_A = (4 x 100 x 1.0) + ((8 + 30) x 1.0) = 438
priority_B = (3 x 100 x 1.0) + ((12 + 50) x 1.0) = 362
```

If there are 10 family food packs, the food ILP is:

```text
Maximize 438x_A + 362x_B

Subject to:
  x_A + x_B <= effective_supply
  0 <= x_A <= 10
  0 <= x_B <= 15
  x_A, x_B are integers
```

Because Barangay A has the higher coefficient, the solver will favor Barangay A
first until its demand ceiling or the effective supply limit is reached.

## 14. Important Limitations

- The AHP weights are fixed values, not recalculated from pairwise comparison
  matrices.
- The fuzzy thresholds are hard-coded rules, not learned from historical flood
  outcomes.
- Demand formulas are current implementation assumptions and need domain
  validation.
- No equity-floor constraint is implemented.
- ILP does not plan routes, delivery timing, vehicle capacity, or warehouse
  dispatch.
- Generated plans are draft recommendations until a human accepts one.

## 15. Short Defense Explanation

SmartFlood uses HITL + ILP because relief allocation is both mathematical and
human-accountable. ILP gives the system a defensible way to allocate whole relief
items under limited inventory and demand ceilings. HITL keeps the final decision
with an administrator, so the system remains a decision-support tool rather than
an automatic authority.
