# SmartFlood V3 AI Logic

This document explains how SmartFlood V3 justifies and implements its AI-assisted
relief recommendation logic.

SmartFlood is an explainable decision-support system, not a trained predictive
machine-learning model. It uses explicit flood thresholds, fixed vulnerability
weights, and mathematical optimization to produce recommendations that a human
administrator reviews before saving.

## Objective

Given current sensor readings, family vulnerability data, and available relief
inventory, the system recommends whole relief units for known barangays while
respecting supply and demand limits.

The returned recommendation includes risk memberships, vulnerability counts and
weights, priority scores, allocations, demand ceilings, solver status, and
reasoning steps.

## Pipeline

```text
MongoDB sensor data + Supabase family data
                  |
                  v
       Barangay grouping and normalization
                  |
                  v
        Fuzzy flood-risk classification
                  |
                  v
        AHP-inspired vulnerability score
                  |
                  v
       Strategy-specific priority score
                  |
                  v
          ILP allocation per resource
                  |
                  v
       Three draft strategy alternatives
                  |
                  v
       Human accepts or declines one plan
                  |
                  v
          Save only the accepted plan
```

Implementation locations:

| Concern | File |
| --- | --- |
| API endpoints and response shaping | [Backend/app/main.py](../Backend/app/main.py) |
| Grouping, fuzzy logic, and vulnerability scoring | [Backend/app/engine.py](../Backend/app/engine.py) |
| ILP model and PuLP/CBC solver | [Backend/app/ilp.py](../Backend/app/ilp.py) |
| Persistence payload validation | [Backend/app/payloads.py](../Backend/app/payloads.py) |
| Frontend review and approval flow | [Frontend/src/components/relief/ReliefPanel/ReliefPanel.tsx](../Frontend/src/components/relief/ReliefPanel/ReliefPanel.tsx) |

## 1. Fuzzy Flood-Risk Logic

The backend classifies water levels using explicit thresholds:

| Water level | Risk |
| ---: | --- |
| `< 0.25m` | `normal` |
| `0.25m` to `< 0.75m` | `flood_alert` |
| `0.75m` to `< 1.20m` | `flood_warning` |
| `>= 1.20m` | `severity` |

The implementation uses membership functions:

- Descending membership for normal conditions.
- Trapezoidal membership for flood alert and flood warning.
- Ascending membership for severity.

This is useful because a water level near a boundary can partially belong to
more than one category. The API returns the membership values and confidence,
so the label is inspectable instead of being a hidden boolean decision.

If no latest sensor reading exists, the backend returns `no_reading` and
explains that no reading was available. It does not invent a sensor value.

The thresholds are configured business rules. They are not learned from a
historical training dataset and should be reviewed when official alert policy
changes.

## 2. AHP-Inspired Vulnerability Logic

Family records are grouped by barangay. The current dimensions and weights are:

| Factor | Weight |
| --- | ---: |
| Infant | 0.22 |
| Elderly | 0.20 |
| PWD | 0.18 |
| Pregnant | 0.12 |
| Lactating | 0.10 |
| Toddler | 0.10 |
| 4Ps | 0.08 |

For each factor:

```text
contribution = count x weight
vulnerability score = sum of all contributions
```

The API returns counts, weights, contributions, and the total score. This makes
the decision traceable.

It is called AHP-inspired because the current implementation uses fixed domain
weights and a transparent weighted sum. It does not implement pairwise
comparisons or an AHP consistency-ratio calculation.

## 3. Priority Score

The optimizer needs one coefficient per barangay. The backend combines flood
severity and vulnerability:

```text
severity component = risk weight x 100
vulnerability component = AHP score + total family members

profile priority =
  severity component x profile severity weight
  + vulnerability component x profile vulnerability weight
```

Risk weights are:

```text
severity       = 4
flood_warning  = 3
flood_alert    = 2
normal/no data = 1
```

These are allocation priorities for the current run, not probabilities or
future flood predictions.

## 4. Integer Linear Programming

ILP is used because relief items must be allocated as whole units. For each
barangay and resource, the model creates integer variables:

```text
x_food_i  = food packs assigned to barangay i
x_goods_i = individual goods assigned to barangay i
x_kit_i   = emergency kits assigned to barangay i
```

For each resource, the model maximizes:

```text
sum(priority_i x_i)
```

Subject to:

```text
sum(x_i) <= effective available supply
0 <= x_i <= demand ceiling_i
x_i is an integer
```

The implementation uses PuLP with the CBC solver. It rejects a non-optimal
solver status and validates the result after solving.

Demand ceilings are derived from existing data:

- Food packs cannot exceed affected family records.
- Individual goods cannot exceed total family members.
- Emergency kits cannot exceed the sum of PWD, elderly, lactating, pregnant,
  and infant counts.

The optimizer therefore cannot create fractional, negative, above-supply, or
above-demand allocations.

## 5. Strategy Profiles

Three separate ILP plans are returned:

| Strategy | Severity weight | Vulnerability weight | Coverage emphasis |
| --- | ---: | ---: | --- |
| Severity First | 2.5 | 0.7 | Higher emergency-kit coverage |
| Vulnerability First | 0.7 | 2.5 | Higher food and individual-goods coverage |
| Balanced | 1.0 | 1.0 | Even coverage across resources |

Coverage targets limit how much defensible demand each strategy attempts to
cover. They never allow allocations above available inventory or demand. This
helps the alternatives remain meaningfully different when inventory is abundant.

## 6. Human Review and Persistence

Generation returns draft plans:

```text
POST /api/ai/recommendations/generate
```

The frontend lets the administrator switch strategies, inspect each barangay,
accept the selected strategy, or decline the draft.

Only approval writes allocation history:

```text
POST /api/ai/recommendations/approve
```

The accepted allocations are converted by `recommendation_rows_to_save()` and
saved to Supabase. Declining clears the draft and does not call the approval
endpoint.

This is important because an optimization result is only optimal under the
provided data, weights, definitions, and constraints. Human review remains
responsible for operational judgment.

## Why the Logic Is Justifiable

1. Fuzzy logic represents gradual transitions around flood thresholds.
2. The weighted vulnerability score makes demographic priorities explicit.
3. ILP guarantees whole-unit allocations under stated constraints.
4. Separate strategy profiles expose different policy priorities.
5. The API returns intermediate calculations for auditing and explanation.
6. Human approval prevents drafts from becoming official allocation history.

## Limitations

- Thresholds and weights are configured rules, not learned from validated
  historical data.
- The known barangay mapping currently covers Tanong, Catmon, and Potrero.
- No hard-coded equity floor guarantees a minimum allocation for every barangay.
- The optimizer does not plan delivery routes, timing, warehouse movement, or
  actual stock consumption.
- Missing demographic data should trigger review, not be interpreted as no
  vulnerability.
- A generated plan remains a draft until explicitly accepted.

## Verification

Backend tests cover fuzzy/AHP output, integer allocation, supply limits, demand
ceilings, zero and negative inventory, distinct strategy profiles, and the
generate/approve persistence boundary.

```bash
cd Backend
.venv/bin/python -m compileall -q app tests
.venv/bin/python -m unittest discover -s tests -v
```

The frontend build verifies strategy review, approval routing, and typed response
handling:

```bash
cd Frontend
npm run build
```

