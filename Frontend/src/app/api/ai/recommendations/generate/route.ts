import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
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

function inventoryQuantity(row: Record<string, unknown> | null, keys: string[]) {
  if (!row) return 0;

  for (const key of keys) {
    if (row[key] !== undefined) return toNumber(row[key]);
  }

  return 0;
}

export async function POST() {
  try {
    const db = await getDb();
    const sensors = await db.collection("sensors").find({}).toArray();
    const readings = await db.collection("sensor_readings").aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$sensorId", doc: { $first: "$$ROOT" } } },
    ]).toArray();

    const readingMap = new Map(readings.map((reading) => [String(reading._id), reading.doc]));
    const sensorGroups = new Map<string, { barangay_id: string | null; barangay_name: string; max_water_level_m: number; sensor_count: number }>();

    for (const sensor of sensors) {
      const reading = readingMap.get(String(sensor._id));
      const barangayName = String(sensor.barangayName ?? sensor.barangay ?? "Unknown");
      const key = String(sensor.barangay ?? barangayName);
      const current = sensorGroups.get(key) ?? {
        barangay_id: sensor.barangay ?? null,
        barangay_name: barangayName,
        max_water_level_m: 0,
        sensor_count: 0,
      };

      current.max_water_level_m = Math.max(current.max_water_level_m, toNumber(reading?.waterLevelM));
      current.sensor_count += 1;
      sensorGroups.set(key, current);
    }

    const { data: families, error: familiesError } = await supabaseServer.from("families").select("*");

    if (familiesError) {
      return NextResponse.json({ success: false, error: familiesError.message }, { status: 500 });
    }

    const familyGroups = new Map<string, FamilyTotals>();

    const familyRows = (families ?? []) as Array<Record<string, unknown>>;

    for (const family of familyRows) {
      const barangayName = String(family.barangay_name ?? family.barangay ?? "Unknown");
      const key = String(family.barangay_id ?? barangayName);
      const current = familyGroups.get(key) ?? {
        barangay_id: family.barangay_id ? String(family.barangay_id) : null,
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

    const { data: inventoryRows, error: inventoryError } = await supabaseServer
      .from("relief_inventory")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (inventoryError) {
      return NextResponse.json({ success: false, error: inventoryError.message }, { status: 500 });
    }

    const inventory = ((inventoryRows as Array<Record<string, unknown>> | null)?.[0] ?? null) as Record<string, unknown> | null;
    const availableFoodPacks = inventoryQuantity(inventory, ["family_food_packs", "food_packs", "recommended_family_food_packs"]);
    const availableMedicineKits = inventoryQuantity(inventory, ["medicine_kits", "medical_kits", "recommended_medicine_kits"]);
    const availableReliefGoods = inventoryQuantity(inventory, ["relief_goods_individual", "individual_relief_goods", "recommended_relief_goods_individual"]);
    const familyEntries = Array.from(familyGroups.entries());

    const scored = familyEntries.map(([key, totals]) => {
      const sensorRisk = sensorGroups.get(key) ?? sensorGroups.get(totals.barangay_name);
      const waterLevelM = sensorRisk?.max_water_level_m ?? 0;
      const risk_level = riskFromWaterLevel(waterLevelM);
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

    const totalPriority = scored.reduce((sum, item) => sum + item.priority_score, 0) || 1;
    const recommendations = scored.map((item) => {
      const share = item.priority_score / totalPriority;
      const recommended_family_food_packs = Math.min(
        item.totals.affected_families,
        Math.round(availableFoodPacks * share),
      );
      const vulnerableMedicalNeed =
        item.totals.pwd_count +
        item.totals.elderly_count +
        item.totals.lactating_count +
        item.totals.pregnant_count +
        item.totals.infant_count;
      const recommended_medicine_kits = Math.min(vulnerableMedicalNeed, Math.round(availableMedicineKits * share));
      const recommended_relief_goods_individual = Math.min(
        item.totals.total_family_members,
        Math.round(availableReliefGoods * share),
      );

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
        analysis_reason: `${item.risk_level} flood risk at ${item.waterLevelM.toFixed(2)}m with ${item.totals.affected_families} affected families and priority score ${item.priority_score}.`,
      };
    });

    if (recommendations.length > 0) {
      const { error: saveError } = await supabaseServer.from("ai_recommendations").insert(recommendations);

      if (saveError) {
        return NextResponse.json({ success: false, error: saveError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: recommendations });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
