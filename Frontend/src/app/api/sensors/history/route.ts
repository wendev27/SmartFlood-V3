import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isValidSensorDocument, normalizeBarangay, resolveSensorCoordinates } from "@/lib/sensorMapping";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const sensorId = searchParams.get("sensorId")?.trim();
    const barangayParam = searchParams.get("barangay")?.trim();
    const barangay = barangayParam ? normalizeBarangay(barangayParam).barangay_name.toLowerCase() : "";
    const db = await getDb();
    const sensors = await db.collection("sensors").find({}).toArray();
    const validSensors = sensors.filter(isValidSensorDocument);
    const sensorMap = new Map<string, (typeof validSensors)[number]>();

    validSensors.forEach((sensor) => {
      sensorMap.set(String(sensor._id), sensor);
      if (sensor.sensorId) sensorMap.set(String(sensor.sensorId), sensor);
      if (sensor.sensor_id) sensorMap.set(String(sensor.sensor_id), sensor);
    });

    const readings = await db.collection("sensor_readings")
      .find(sensorId ? { sensorId } : {})
      .sort({ createdAt: -1 })
      .limit(MAX_LIMIT)
      .toArray();

    const data = readings.flatMap((reading) => {
      const readingSensorId = String(reading.sensorId ?? "");
      const sensor = sensorMap.get(readingSensorId);
      if (!sensor) return [];

      const mappedBarangay = normalizeBarangay(sensor.barangayName ?? sensor.barangay);
      if (barangay && mappedBarangay.barangay_name.toLowerCase() !== barangay) return [];

      const coordinates = resolveSensorCoordinates(sensor);
      const waterLevelM = finiteNumber(reading.waterLevelM ?? reading.waterLevel);

      return [{
        readingId: String(reading._id),
        sensorId: readingSensorId,
        sensorName: String(sensor.name ?? readingSensorId),
        barangay: mappedBarangay.barangay_name,
        barangayName: mappedBarangay.barangay_name,
        street: sensor.street ? String(sensor.street) : "",
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
        waterLevelM,
        waterLevel: waterLevelM,
        distanceCm: finiteNumber(reading.distanceCm),
        rainfallMm: finiteNumber(reading.rainfallMm),
        batteryPct: finiteNumber(reading.batteryPct),
        computedStatus: String(reading.computedStatus ?? reading.status ?? "no_reading"),
        status: String(reading.status ?? reading.computedStatus ?? "no_reading"),
        createdAt: reading.createdAt ?? null,
      }];
    }).slice(0, limit);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function finiteNumber(value: unknown) {
  if (value == null || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
