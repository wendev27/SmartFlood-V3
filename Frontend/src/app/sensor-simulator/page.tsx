"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./SensorSimulator.module.css";

const SENSOR_OPTIONS = [
  { sensorId: "SNS-002", barangay: "Barangay Tañong" },
  { sensorId: "SNS-003", barangay: "Barangay Catmon" },
] as const;

const READING_LEVELS = [
  { value: "no_reading", label: "No Reading" },
  { value: "normal", label: "Normal" },
  { value: "flood_alert", label: "Flood Alert" },
  { value: "flood_warning", label: "Flood Warning" },
  { value: "severe", label: "Severe" },
] as const;

type SensorId = (typeof SENSOR_OPTIONS)[number]["sensorId"];
type SimulationMode = (typeof READING_LEVELS)[number]["value"];
type SensorState = Record<SensorId, { active: boolean; mode: SimulationMode }>;

const INITIAL_STATE: SensorState = {
  "SNS-002": { active: true, mode: "normal" },
  "SNS-003": { active: true, mode: "normal" },
};

export default function SensorSimulatorPage() {
  const [sensorStates, setSensorStates] = useState<SensorState>(INITIAL_STATE);
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  function updateSensor(sensorId: SensorId, update: Partial<SensorState[SensorId]>) {
    setSensorStates((current) => ({
      ...current,
      [sensorId]: { ...current[sensorId], ...update },
    }));
  }

  async function applySimulation() {
    setIsApplying(true);
    setResult(null);

    try {
      const response = await fetch("/api/sensors/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sensors: SENSOR_OPTIONS.map(({ sensorId }) => ({
            sensorId,
            ...sensorStates[sensorId],
          })),
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(readError(payload));
      }

      setResult({ tone: "success", message: "Sensor simulation applied." });
    } catch (error: unknown) {
      setResult({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to apply sensor simulation.",
      });
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Demo Utility</p>
          <h1>SmartFlood Sensor Simulator</h1>
          <p>Quick demo controls for manual sensor readings.</p>
        </header>

        <div className={styles.sensorGrid}>
          {SENSOR_OPTIONS.map(({ sensorId, barangay }) => {
            const state = sensorStates[sensorId];

            return (
              <article className={styles.card} key={sensorId}>
                <div>
                  <p className={styles.sensorId}>{sensorId}</p>
                  <h2>{barangay}</h2>
                </div>

                <label className={styles.field}>
                  <span>Sensor status</span>
                  <select
                    value={state.active ? "active" : "inactive"}
                    onChange={(event) => updateSensor(sensorId, { active: event.target.value === "active" })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Reading level</span>
                  <select
                    value={state.mode}
                    onChange={(event) => updateSensor(sensorId, { mode: event.target.value as SimulationMode })}
                    disabled={!state.active}
                  >
                    {READING_LEVELS.map((level) => (
                      <option value={level.value} key={level.value}>{level.label}</option>
                    ))}
                  </select>
                </label>
              </article>
            );
          })}
        </div>

        {result ? (
          <p className={result.tone === "success" ? styles.success : styles.error} role="status">
            {result.message}
          </p>
        ) : null}

        <div className={styles.actions}>
          <button className={styles.primaryButton} type="button" onClick={applySimulation} disabled={isApplying}>
            {isApplying ? "Applying..." : "Apply Simulation"}
          </button>
          <Link className={styles.secondaryButton} href="/dashboard#sensors">Open Dashboard</Link>
        </div>
      </section>
    </main>
  );
}

function readError(payload: unknown) {
  if (typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return "Unable to apply sensor simulation.";
}
