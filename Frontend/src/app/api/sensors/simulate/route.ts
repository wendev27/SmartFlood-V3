import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const SIMULATED_SENSOR_IDS = new Set(["SNS-002", "SNS-003"]);
const SIMULATION_MODES = ["no_reading", "normal", "flood_alert", "flood_warning", "severe"] as const;

type SimulationMode = (typeof SIMULATION_MODES)[number];

type SensorSimulation = {
  sensorId: string;
  mode: SimulationMode;
  active: boolean;
};

type ReadingPreset = {
  waterLevelM: number;
  distanceCm: number;
  status: Exclude<SimulationMode, "no_reading">;
};

const READING_PRESETS: Record<Exclude<SimulationMode, "no_reading">, ReadingPreset> = {
  normal: { waterLevelM: 0, distanceCm: 220, status: "normal" },
  flood_alert: { waterLevelM: 0.35, distanceCm: 170, status: "flood_alert" },
  flood_warning: { waterLevelM: 0.9, distanceCm: 110, status: "flood_warning" },
  severe: { waterLevelM: 1.3, distanceCm: 70, status: "severe" },
};

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const simulations = parseSimulations(body);
    const db = await getDb();
    const sensors = db.collection<{ _id: string }>("sensors");
    const readings = db.collection("sensor_readings");

    for (const simulation of simulations) {
      const sensor = await sensors.findOne({ _id: simulation.sensorId });

      if (!sensor) {
        return NextResponse.json(
          { success: false, error: `Sensor ${simulation.sensorId} was not found.` },
          { status: 404 },
        );
      }
    }

    const data = [];

    for (const simulation of simulations) {
      const now = new Date();
      await sensors.updateOne(
        { _id: simulation.sensorId },
        {
          $set: {
            status: simulation.active ? "active" : "inactive",
            lastSeenAt: now,
            updatedAt: now,
          },
        },
      );

      if (!simulation.active) {
        data.push({
          sensorId: simulation.sensorId,
          active: false,
          mode: simulation.mode,
          status: "inactive",
          waterLevelM: null,
        });
        continue;
      }

      if (simulation.mode === "no_reading") {
        await readings.deleteMany({ sensorId: simulation.sensorId });
        data.push({
          sensorId: simulation.sensorId,
          active: true,
          mode: simulation.mode,
          status: "no_reading",
          waterLevelM: null,
        });
        continue;
      }

      const preset = READING_PRESETS[simulation.mode];
      await readings.insertOne({
        sensorId: simulation.sensorId,
        waterLevelM: preset.waterLevelM,
        waterLevel: preset.waterLevelM,
        distanceCm: preset.distanceCm,
        rainfallMm: null,
        batteryPct: null,
        computedStatus: preset.status,
        status: preset.status,
        source: "manual-simulator",
        createdAt: now,
        updatedAt: now,
        __v: 0,
      });
      data.push({
        sensorId: simulation.sensorId,
        active: true,
        mode: simulation.mode,
        status: preset.status,
        waterLevelM: preset.waterLevelM,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sensor simulation applied.",
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to apply sensor simulation.";
    const status = error instanceof SimulationRequestError ? 400 : 500;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}

function parseSimulations(body: unknown): SensorSimulation[] {
  if (!isRecord(body) || !Array.isArray(body.sensors) || body.sensors.length === 0) {
    throw new SimulationRequestError("Request body must include a non-empty sensors array.");
  }

  const seenSensorIds = new Set<string>();

  return body.sensors.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new SimulationRequestError(`Sensor entry at index ${index} must be an object.`);
    }

    const sensorId = typeof entry.sensorId === "string" ? entry.sensorId.trim().toUpperCase() : "";
    if (!SIMULATED_SENSOR_IDS.has(sensorId)) {
      throw new SimulationRequestError(`Sensor ${sensorId || `at index ${index}`} is not supported by this simulator.`);
    }

    if (seenSensorIds.has(sensorId)) {
      throw new SimulationRequestError(`Sensor ${sensorId} was included more than once.`);
    }
    seenSensorIds.add(sensorId);

    if (typeof entry.mode !== "string" || !isSimulationMode(entry.mode)) {
      throw new SimulationRequestError(`Sensor ${sensorId} has an invalid mode.`);
    }

    if (typeof entry.active !== "boolean") {
      throw new SimulationRequestError(`Sensor ${sensorId} must include an active boolean.`);
    }

    return { sensorId, mode: entry.mode, active: entry.active };
  });
}

function isSimulationMode(value: string): value is SimulationMode {
  return SIMULATION_MODES.some((mode) => mode === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

class SimulationRequestError extends Error {}
