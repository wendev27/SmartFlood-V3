from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .payloads import to_int

KNOWN_BARANGAYS = (
    {"barangay_id": "1", "barangay_name": "Barangay Tanong"},
    {"barangay_id": "2", "barangay_name": "Barangay Catmon"},
    {"barangay_id": "3", "barangay_name": "Barangay Potrero"},
)
BARANGAY_ALIASES = {
    "1": KNOWN_BARANGAYS[0],
    "barangay 1": KNOWN_BARANGAYS[0],
    "barangay tanong": KNOWN_BARANGAYS[0],
    "tanong": KNOWN_BARANGAYS[0],
    "2": KNOWN_BARANGAYS[1],
    "barangay 2": KNOWN_BARANGAYS[1],
    "barangay catmon": KNOWN_BARANGAYS[1],
    "catmon": KNOWN_BARANGAYS[1],
    "3": KNOWN_BARANGAYS[2],
    "barangay 3": KNOWN_BARANGAYS[2],
    "barangay potrero": KNOWN_BARANGAYS[2],
    "potrero": KNOWN_BARANGAYS[2],
}
COUNT_FIELDS = (
    "pwd_count",
    "elderly_count",
    "four_ps_count",
    "lactating_count",
    "pregnant_count",
    "infant_count",
    "toddler_count",
    "total_family_members",
)
AHP_WEIGHTS = {
    "infant": 0.22,
    "elderly": 0.20,
    "pwd": 0.18,
    "pregnant": 0.12,
    "lactating": 0.10,
    "toddler": 0.10,
    "four_ps": 0.08,
}
AHP_COUNT_FIELDS = {
    "infant": "infant_count",
    "elderly": "elderly_count",
    "pwd": "pwd_count",
    "pregnant": "pregnant_count",
    "lactating": "lactating_count",
    "toddler": "toddler_count",
    "four_ps": "four_ps_count",
}


def generate_recommendations(
    sensors: list[dict[str, Any]],
    latest_readings: list[dict[str, Any]],
    families: list[dict[str, Any]],
    inventory: dict[str, int],
) -> list[dict[str, Any]]:
    sensor_groups = _group_sensors(sensors, latest_readings)
    family_groups = _group_families(families)
    scored = sorted(
        (_score_barangay(barangay, sensor_groups, family_groups) for barangay in KNOWN_BARANGAYS),
        key=lambda item: item["priority_score"],
        reverse=True,
    )
    food = allocate_inventory(scored, inventory["family_food_packs"], lambda item: max(1, item["affected_families"]))
    medicine = allocate_inventory(
        scored,
        inventory["medicine_kits"],
        lambda item: max(
            1,
            item["pwd_count"]
            + item["elderly_count"]
            + item["lactating_count"]
            + item["pregnant_count"]
            + item["infant_count"],
        ),
    )
    goods = allocate_inventory(scored, inventory["relief_goods_individual"], lambda item: max(1, item["total_family_members"]))

    recommendations = []
    for item in scored:
        key = item["key"]
        recommendation = {
            name: value
            for name, value in item.items()
            if name not in {"key", "has_sensor_reading"}
        }
        recommendation.update(
            recommended_family_food_packs=food[key],
            recommended_medicine_kits=medicine[key],
            recommended_relief_goods_individual=goods[key],
        )
        recommendation["analysis_reason"] = _analysis_reason(recommendation, item["has_sensor_reading"])
        recommendation["reasoning_steps"] = _reasoning_steps(recommendation)
        recommendations.append(recommendation)
    return recommendations


def allocate_inventory(
    scored: list[dict[str, Any]], available: int, need_for: Callable[[dict[str, Any]], int]
) -> dict[str, int]:
    available = max(0, to_int(available))
    allocations = {item["key"]: 0 for item in scored}
    if available <= 0 or not scored:
        return allocations
    needs = {item["key"]: max(0, to_int(need_for(item))) for item in scored}
    total_priority = sum(item["priority_score"] for item in scored) or 1
    remaining = available
    for item in scored:
        key = item["key"]
        allocation = min(int((available * item["priority_score"]) // total_priority), needs[key], remaining)
        allocations[key] = allocation
        remaining -= allocation
    top = scored[0]
    if remaining > 0 and allocations[top["key"]] == 0 and needs[top["key"]] > 0:
        allocations[top["key"]] = 1
        remaining -= 1
    while remaining > 0:
        distributed = False
        for item in scored:
            key = item["key"]
            if allocations[key] >= needs[key]:
                continue
            allocations[key] += 1
            remaining -= 1
            distributed = True
            if remaining == 0:
                break
        if not distributed:
            break
    return allocations


def _group_sensors(sensors: list[dict[str, Any]], latest_readings: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    reading_map = {str(row.get("_id")): row.get("doc", row) for row in latest_readings}
    groups: dict[str, dict[str, Any]] = {}
    for sensor in sensors:
        barangay = normalize_barangay(sensor.get("barangayName", sensor.get("barangay")))
        if not barangay:
            continue
        key = barangay["barangay_id"]
        group = groups.setdefault(key, {"max_water_level_m": None, "reading_count": 0})
        reading = reading_map.get(str(sensor.get("_id")))
        if reading:
            water_level = _number(reading.get("waterLevelM", reading.get("waterLevel")))
            group["max_water_level_m"] = max(group["max_water_level_m"] or 0, water_level)
            group["reading_count"] += 1
    return groups


def _group_families(families: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    groups: dict[str, dict[str, Any]] = {}
    for family in families:
        barangay = normalize_barangay(family.get("barangay_name", family.get("barangay_id")))
        if not barangay:
            continue
        key = barangay["barangay_id"]
        group = groups.setdefault(key, {field: 0 for field in COUNT_FIELDS} | {"affected_families": 0})
        for field in COUNT_FIELDS:
            group[field] += _number(family.get(field))
        group["affected_families"] += 1
    return groups


def _score_barangay(
    barangay: dict[str, str], sensor_groups: dict[str, dict[str, Any]], family_groups: dict[str, dict[str, Any]]
) -> dict[str, Any]:
    key = barangay["barangay_id"]
    sensor = sensor_groups.get(key)
    totals = family_groups.get(key, {field: 0 for field in COUNT_FIELDS} | {"affected_families": 0})
    water_level = sensor["max_water_level_m"] if sensor and sensor["max_water_level_m"] is not None else 0
    fuzzy_explanation = _fuzzy_explanation(water_level)
    risk_level = "no_reading" if sensor and sensor["reading_count"] == 0 else fuzzy_explanation["risk_level"]
    ahp_breakdown = _ahp_breakdown(totals)
    priority_score = round(
        _risk_weight(risk_level) * 100 + ahp_breakdown["total_vulnerability_score"] + totals["total_family_members"],
        4,
    )
    return {
        "key": key,
        "barangay_id": key,
        "barangay_name": barangay["barangay_name"],
        "risk_level": risk_level,
        "water_level_m": water_level,
        "priority_score": priority_score,
        "ahp_breakdown": ahp_breakdown,
        "fuzzy_explanation": fuzzy_explanation,
        **totals,
        "has_sensor_reading": bool(sensor and sensor["reading_count"]),
    }


def _analysis_reason(item: dict[str, Any], has_sensor_reading: bool) -> str:
    families = item["affected_families"]
    if has_sensor_reading:
        family_label = "family" if families == 1 else "families"
        base = f"{_risk_label(item['risk_level'])} flood risk detected at {item['water_level_m']:.2f}m with {families} affected {family_label}."
    else:
        family_label = "family record" if families == 1 else "family records"
        base = f"No latest sensor reading available. Based on {families} affected {family_label}."
    total_allocated = (
        item["recommended_family_food_packs"]
        + item["recommended_medicine_kits"]
        + item["recommended_relief_goods_individual"]
    )
    if total_allocated:
        allocation = "Relief allocation prioritized based on available inventory."
    elif families == 0:
        allocation = "No family vulnerability data is currently available for this barangay."
    else:
        allocation = "Current inventory was insufficient for this barangay after higher-priority allocation."
    return f"{base} {allocation}"


def normalize_barangay(value: Any) -> dict[str, str] | None:
    return BARANGAY_ALIASES.get(str(value or "").strip().lower())


def _number(value: Any) -> int | float:
    try:
        number = float(value or 0)
        return int(number) if number.is_integer() else number
    except (TypeError, ValueError):
        return 0


def _risk_from_water_level(water_level: int | float) -> str:
    if water_level >= 1.2:
        return "severity"
    if water_level >= 0.75:
        return "flood_warning"
    if water_level >= 0.25:
        return "flood_alert"
    return "normal"


def _risk_weight(risk_level: str) -> int:
    return {"severity": 4, "flood_warning": 3, "flood_alert": 2}.get(risk_level, 1)


def _risk_label(risk_level: str) -> str:
    return {
        "severity": "Severity",
        "flood_warning": "Flood warning",
        "flood_alert": "Flood alert",
        "no_reading": "No reading",
    }.get(risk_level, "Normal")


def _ahp_breakdown(totals: dict[str, Any]) -> dict[str, Any]:
    counts = {name: _number(totals.get(field)) for name, field in AHP_COUNT_FIELDS.items()}
    contributions = {name: round(counts[name] * weight, 4) for name, weight in AHP_WEIGHTS.items()}
    return {
        "weights": AHP_WEIGHTS.copy(),
        "counts": counts,
        "contributions": contributions,
        "total_vulnerability_score": round(sum(contributions.values()), 4),
    }


def _fuzzy_explanation(water_level: int | float) -> dict[str, Any]:
    memberships = {
        "normal": _descending_membership(water_level, 0.25, 0.50),
        "flood_alert": _trapezoid_membership(water_level, 0.25, 0.25, 0.50, 0.75),
        "flood_warning": _trapezoid_membership(water_level, 0.50, 0.75, 1.00, 1.20),
        "severity": _ascending_membership(water_level, 1.00, 1.20),
    }
    risk_level = _risk_from_water_level(water_level)
    return {
        "water_level_m": water_level,
        "risk_level": risk_level,
        "risk_label": _risk_label(risk_level),
        "confidence": memberships[risk_level],
        "memberships": memberships,
    }


def _reasoning_steps(item: dict[str, Any]) -> list[str]:
    return [
        f"Sensor reading classified the barangay as {_risk_label(item['risk_level'])} risk.",
        "Family vulnerability score was computed using AHP-inspired weights.",
        "Available inventory was distributed based on priority and affected families.",
    ]


def _descending_membership(value: int | float, full_until: float, zero_at: float) -> float:
    if value <= full_until:
        return 1.0
    if value >= zero_at:
        return 0.0
    return round((zero_at - value) / (zero_at - full_until), 4)


def _ascending_membership(value: int | float, zero_until: float, full_at: float) -> float:
    if value <= zero_until:
        return 0.0
    if value >= full_at:
        return 1.0
    return round((value - zero_until) / (full_at - zero_until), 4)


def _trapezoid_membership(value: int | float, start: float, full_from: float, full_until: float, end: float) -> float:
    if value < start or value > end:
        return 0.0
    if full_from <= value <= full_until:
        return 1.0
    if value < full_from:
        return round((value - start) / (full_from - start), 4)
    return round((end - value) / (end - full_until), 4)
