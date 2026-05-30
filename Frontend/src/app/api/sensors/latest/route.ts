import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const sensors = await db.collection("sensors").find({}).toArray();
    const readings = await db.collection("sensor_readings").aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$sensorId",
        doc: { $first: "$$ROOT" }
      }}
    ]).toArray();

    const latestReadingMap = new Map(readings.map((reading) => [String(reading._id), reading.doc]));
    const data = sensors.map(sensor => ({
      sensorId: String(sensor._id),
      name: sensor.name,
      barangay: sensor.barangay,
      barangayName: sensor.barangayName,
      street: sensor.street || null,
      status: sensor.status,
      waterLevelM: latestReadingMap.get(String(sensor._id))?.waterLevelM ?? null,
      distanceCm: latestReadingMap.get(String(sensor._id))?.distanceCm ?? null,
      rainfallMm: latestReadingMap.get(String(sensor._id))?.rainfallMm ?? null,
      batteryPct: latestReadingMap.get(String(sensor._id))?.batteryPct ?? null,
      computedStatus: latestReadingMap.get(String(sensor._id))?.computedStatus ?? null,
      latestReadingAt: latestReadingMap.get(String(sensor._id))?.createdAt ?? null,
      location: sensor.location,
      lastSeenAt: sensor.lastSeenAt,
      latestReading: latestReadingMap.get(String(sensor._id)) || null
    }));

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
