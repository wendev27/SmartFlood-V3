import { NextResponse } from "next/server";
import { auditActorFromBody, logAuditEvent } from "@/lib/auditLogger";
import { getDb } from "@/lib/mongodb";
import { normalizeBarangay } from "@/lib/sensorMapping";
import { supabaseServer } from "@/lib/supabaseServer";

type FamilyTotals = {
  barangay_id: string | null;
  barangay_name: string;
  pwd_count: number;
  elderly_count: number;
  four_ps_count: number;
  lactating_count: number;
  pregnant_count: number;
  infant_count: number;
  toddler_count: number;
  total_family_members: number;
  affected_families: number;
};

type ScoredBarangay = {
  key: string;
  totals: FamilyTotals;
  sensorRisk?: {
    barangay_id: string | null;
    barangay_name: string;
    max_water_level_m: number | null;
    sensor_count: number;
    reading_count: number;
  };
  waterLevelM: number;
  risk_level: string;
  priority_score: number;
};

const knownBarangays = [
  { barangay_id: "1", barangay_name: "Barangay Tanong" },
  { barangay_id: "2", barangay_name: "Barangay Catmon" },
  { barangay_id: "3", barangay_name: "Barangay Potrero" },
];

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function riskFromWaterLevel(waterLevelM: number) {
  if (waterLevelM >= 1.0) return "critical";
  if (waterLevelM >= 0.3) return "warning";
  return "normal";
}

function riskWeight(riskLevel: string) {
  if (riskLevel === "critical") return 3;
  if (riskLevel === "warning") return 2;
  return 1;
}

function inventoryInput(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (body[key] !== undefined) return Math.max(0, Math.floor(toNumber(body[key])));
  }

  return 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const availableFoodPacks = inventoryInput(body, ["family_food_packs", "available_family_food_packs"]);
    const availableMedicineKits = inventoryInput(body, ["medicine_kits", "available_medicine_kits"]);
    const availableReliefGoods = inventoryInput(body, ["relief_goods_individual", "available_relief_goods_individual"]);

    if (availableFoodPacks + availableMedicineKits + availableReliefGoods <= 0) {
      return NextResponse.json(
        { success: false, error: "Please input available relief inventory before generating recommendations." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const sensors = await db.collection("sensors").find({}).toArray();
    const readings = await db.collection("sensor_readings").aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$sensorId", doc: { $first: "$$ROOT" } } },
    ]).toArray();

    const readingMap = new Map(readings.map((reading) => [String(reading._id), reading.doc]));
    const sensorGroups = new Map<string, { barangay_id: string | null; barangay_name: string; max_water_level_m: number | null; sensor_count: number; reading_count: number }>();

    for (const sensor of sensors) {
      const reading = readingMap.get(String(sensor._id));
      const mappedBarangay = normalizeBarangay(sensor.barangayName ?? sensor.barangay);
      if (!mappedBarangay.barangay_id) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Skipping unmapped sensor barangay", sensor.barangayName ?? sensor.barangay ?? sensor._id);
        }
        continue;
      }
      const key = String(mappedBarangay.barangay_id);
      const current = sensorGroups.get(key) ?? {
        barangay_id: String(mappedBarangay.barangay_id),
        barangay_name: mappedBarangay.barangay_name,
        max_water_level_m: null,
        sensor_count: 0,
        reading_count: 0,
      };

      if (reading) {
        current.max_water_level_m = Math.max(current.max_water_level_m ?? 0, toNumber(reading.waterLevelM ?? reading.waterLevel));
        current.reading_count += 1;
      }

      current.sensor_count += 1;
      sensorGroups.set(key, current);
    }

    const { data: families, error: familiesError } = await supabaseServer
      .from("families")
      .select("barangay_id,barangay_name,pwd_count,elderly_count,four_ps_count,lactating_count,pregnant_count,infant_count,toddler_count,total_family_members");

    if (familiesError) {
      return NextResponse.json({ success: false, error: familiesError.message }, { status: 500 });
    }

    const familyGroups = new Map<string, FamilyTotals>();

    const familyRows = (families ?? []) as Array<Record<string, unknown>>;

    for (const family of familyRows) {
      const mappedBarangay = normalizeBarangay(family.barangay_name ?? family.barangay_id);
      if (!mappedBarangay.barangay_id) {
        continue;
      }
      const barangayName = mappedBarangay.barangay_name;
      const key = String(mappedBarangay.barangay_id);
      const current = familyGroups.get(key) ?? {
        barangay_id: String(mappedBarangay.barangay_id),
        barangay_name: barangayName,
        pwd_count: 0,
        elderly_count: 0,
        four_ps_count: 0,
        lactating_count: 0,
        pregnant_count: 0,
        infant_count: 0,
        toddler_count: 0,
        total_family_members: 0,
        affected_families: 0,
      };

      current.pwd_count += toNumber(family.pwd_count);
      current.elderly_count += toNumber(family.elderly_count);
      current.four_ps_count += toNumber(family.four_ps_count);
      current.lactating_count += toNumber(family.lactating_count);
      current.pregnant_count += toNumber(family.pregnant_count);
      current.infant_count += toNumber(family.infant_count);
      current.toddler_count += toNumber(family.toddler_count);
      current.total_family_members += toNumber(family.total_family_members);
      current.affected_families += 1;
      familyGroups.set(key, current);
    }

    const scored = knownBarangays.map((barangay) => {
      const key = barangay.barangay_id;
      const sensorRisk = sensorGroups.get(key);
      const fallbackTotals: FamilyTotals = {
        barangay_id: barangay.barangay_id,
        barangay_name: barangay.barangay_name,
        pwd_count: 0,
        elderly_count: 0,
        four_ps_count: 0,
        lactating_count: 0,
        pregnant_count: 0,
        infant_count: 0,
        toddler_count: 0,
        total_family_members: 0,
        affected_families: 0,
      };
      const totals = familyGroups.get(key) ?? fallbackTotals;
      const waterLevelM = sensorRisk?.max_water_level_m ?? 0;
      const risk_level = sensorRisk && sensorRisk.reading_count === 0 ? "no_reading" : riskFromWaterLevel(waterLevelM);
      const priority_score =
        riskWeight(risk_level) * 100 +
        totals.pwd_count * 12 +
        totals.elderly_count * 8 +
        totals.four_ps_count * 4 +
        totals.lactating_count * 7 +
        totals.pregnant_count * 9 +
        totals.infant_count * 10 +
        totals.toddler_count * 6 +
        totals.total_family_members;

      return { key, totals, sensorRisk, waterLevelM, risk_level, priority_score };
    }).sort((a, b) => b.priority_score - a.priority_score);

    const foodAllocations = allocateInventory(scored, availableFoodPacks, (item) => Math.max(1, item.totals.affected_families));
    const medicineAllocations = allocateInventory(scored, availableMedicineKits, (item) =>
      Math.max(
        1,
        item.totals.pwd_count +
          item.totals.elderly_count +
          item.totals.lactating_count +
          item.totals.pregnant_count +
          item.totals.infant_count,
      ),
    );
    const goodsAllocations = allocateInventory(scored, availableReliefGoods, (item) => Math.max(1, item.totals.total_family_members));

    const recommendations = scored.map((item) => {
      const recommended_family_food_packs = foodAllocations.get(item.key) ?? 0;
      const recommended_medicine_kits = medicineAllocations.get(item.key) ?? 0;
      const recommended_relief_goods_individual = goodsAllocations.get(item.key) ?? 0;

      const noSensorReading = !item.sensorRisk || item.sensorRisk.reading_count === 0;
      const noFamilyData = item.totals.affected_families === 0;
      const hasAllocation = recommended_family_food_packs + recommended_medicine_kits + recommended_relief_goods_individual > 0;
      const baseReason = noSensorReading
        ? `No latest sensor reading available. Based on ${item.totals.affected_families} affected ${item.totals.affected_families === 1 ? "family record" : "family records"}.`
        : `${riskLabel(item.risk_level)} flood risk detected at ${item.waterLevelM.toFixed(2)}m with ${item.totals.affected_families} affected ${item.totals.affected_families === 1 ? "family" : "families"}.`;
      const allocationReason = hasAllocation
        ? "Relief allocation prioritized based on available inventory."
        : noFamilyData
          ? "No family vulnerability data is currently available for this barangay."
          : "Current inventory was insufficient for this barangay after higher-priority allocation.";

      return {
        barangay_id: item.totals.barangay_id,
        barangay_name: item.totals.barangay_name,
        risk_level: item.risk_level,
        water_level_m: item.waterLevelM,
        priority_score: item.priority_score,
        affected_families: item.totals.affected_families,
        total_family_members: item.totals.total_family_members,
        pwd_count: item.totals.pwd_count,
        elderly_count: item.totals.elderly_count,
        four_ps_count: item.totals.four_ps_count,
        lactating_count: item.totals.lactating_count,
        pregnant_count: item.totals.pregnant_count,
        infant_count: item.totals.infant_count,
        toddler_count: item.totals.toddler_count,
        recommended_family_food_packs,
        recommended_medicine_kits,
        recommended_relief_goods_individual,
        analysis_reason: `${baseReason} ${allocationReason}`,
      };
    });

    if (recommendations.length > 0) {
      const rowsToSave = recommendations.map((recommendation) => ({
        barangay_id: recommendation.barangay_id,
        barangay_name: recommendation.barangay_name,
        risk_level: recommendation.risk_level,
        priority_score: recommendation.priority_score,
        recommended_family_food_packs: recommendation.recommended_family_food_packs,
        recommended_medicine_kits: recommendation.recommended_medicine_kits,
        recommended_relief_goods_individual: recommendation.recommended_relief_goods_individual,
        analysis_reason: recommendation.analysis_reason,
      }));
      const { data: savedRows, error: saveError } = await supabaseServer
        .from("ai_recommendations")
        .insert(rowsToSave)
        .select("recommendation_id,barangay_id,barangay_name,risk_level,priority_score,recommended_family_food_packs,recommended_medicine_kits,recommended_relief_goods_individual,analysis_reason,created_at");

      if (saveError) {
        return NextResponse.json({ success: false, error: saveError.message }, { status: 500 });
      }

      const bodyActor = auditActorFromBody(body);
      await logAuditEvent({
        ...bodyActor,
        action: "AI_RECOMMENDATION_GENERATED",
        module: "AI-Optimized Relief Recommendation",
        description: `Generated relief recommendations using current available inventory for ${(savedRows ?? recommendations).length} barangays.`,
        target_type: "ai_recommendation_batch",
        target_id: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, data: savedRows ?? recommendations });
    }

    await logAuditEvent({
      ...auditActorFromBody(body),
      action: "AI_RECOMMENDATION_GENERATED",
      module: "AI-Optimized Relief Recommendation",
      description: "Generated relief recommendations using current available inventory for 0 barangays.",
      target_type: "ai_recommendation_batch",
      target_id: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: recommendations });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

function allocateInventory(scored: ScoredBarangay[], available: number, needFor: (item: ScoredBarangay) => number) {
  const allocations = new Map<string, number>(scored.map((item) => [item.key, 0]));
  if (available <= 0 || scored.length === 0) return allocations;

  const needs = new Map(scored.map((item) => [item.key, Math.max(0, Math.floor(needFor(item)))]));
  const totalPriority = scored.reduce((sum, item) => sum + item.priority_score, 0) || 1;
  let remaining = available;

  for (const item of scored) {
    const need = needs.get(item.key) ?? 0;
    if (need <= 0) continue;
    const share = Math.floor((available * item.priority_score) / totalPriority);
    const allocation = Math.min(share, need, remaining);
    allocations.set(item.key, allocation);
    remaining -= allocation;
  }

  const top = scored[0];
  if (top && remaining > 0 && (allocations.get(top.key) ?? 0) === 0 && (needs.get(top.key) ?? 0) > 0) {
    allocations.set(top.key, 1);
    remaining -= 1;
  }

  while (remaining > 0) {
    let distributed = false;
    for (const item of scored) {
      const current = allocations.get(item.key) ?? 0;
      const need = needs.get(item.key) ?? 0;
      if (current >= need) continue;

      allocations.set(item.key, current + 1);
      remaining -= 1;
      distributed = true;
      if (remaining === 0) break;
    }

    if (!distributed) break;
  }

  return allocations;
}

function riskLabel(riskLevel: string) {
  if (riskLevel === "critical") return "Severity";
  if (riskLevel === "warning") return "Flood warning";
  if (riskLevel === "no_reading") return "No reading";
  return "Normal";
}
