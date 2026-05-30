"use client";

import { useEffect, useState } from "react";
import { MapPanel } from "@/components/dashboard/MapPanel/MapPanel";
import { Badge } from "@/components/ui/Badge/Badge";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import { getSensors } from "@/services/sensorsService";
import styles from "./SensorsPanel.module.css";

type SensorRow = {
  sensor_id: string;
  barangay: string;
  coordinates: string;
  status: "Active" | "Degraded" | "Offline";
  latestReading: string;
  level: "Normal" | "Warning" | "Critical";
};

export function SensorsPanel() {
  const [sensors, setSensors] = useState<SensorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getSensors();
        if (!cancelled) setSensors(data.map(mapSensor));
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load sensors.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.panel} aria-label="Sensor history">
      <MapPanel variant="wide" />
      <article className={styles.tableCard}>
        <h3>View Tabulated Sensor History</h3>
        <div className={styles.toolbar}>
          <input type="search" placeholder="Search Sensor ID" aria-label="Search Sensor ID" />
          <select aria-label="Barangay"><option>All Barangays</option></select>
          <select aria-label="Sensor status"><option>Any Status</option></select>
          <select aria-label="Alert level"><option>Any Level</option></select>
          <button type="button">X</button>
        </div>
        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        <DataTable headers={["Sensor ID", "Barangay", "Coordinates", "Status", "Latest Reading", "Level"]}>
          {sensors.map((sensor, index) => (
            <tr key={sensor.sensor_id ?? `sensor-${index}`}>
              <td>{sensor.sensor_id}</td>
              <td>{sensor.barangay}</td>
              <td>{sensor.coordinates}</td>
              <td><Badge tone={sensor.status === "Active" ? "green" : sensor.status === "Degraded" ? "yellow" : "red"}>{sensor.status}</Badge></td>
              <td>{sensor.latestReading}</td>
              <td><Badge tone={sensor.level === "Normal" ? "green" : sensor.level === "Warning" ? "yellow" : "red"}>{sensor.level}</Badge></td>
            </tr>
          ))}
          {isLoading ? (
            <tr>
              <td colSpan={6}>Loading sensors...</td>
            </tr>
          ) : null}
          {!isLoading && sensors.length === 0 ? (
            <tr>
              <td colSpan={6}>No sensor readings found.</td>
            </tr>
          ) : null}
        </DataTable>
      </article>
    </section>
  );
}

function mapSensor(row: Record<string, unknown>): SensorRow {
  const waterLevel = row.waterLevelM == null ? null : Number(row.waterLevelM);
  const computedStatus = String(row.computedStatus ?? "").toLowerCase();
  const rawStatus = String(row.status ?? "Offline");

  return {
    sensor_id: String(row.sensorId ?? row.sensor_id ?? ""),
    barangay: String(row.barangayName ?? row.barangay ?? ""),
    coordinates: formatCoordinates(row.location),
    status: rawStatus === "Active" || rawStatus === "Degraded" ? rawStatus : "Offline",
    latestReading: waterLevel == null ? "No reading" : `${waterLevel.toFixed(2)}m`,
    level: computedStatus.includes("critical") ? "Critical" : computedStatus.includes("warning") ? "Warning" : "Normal",
  };
}

function formatCoordinates(location: unknown) {
  if (!location || typeof location !== "object") return "N/A";
  const coordinates = location as { lat?: unknown; lng?: unknown; latitude?: unknown; longitude?: unknown };
  const lat = coordinates.lat ?? coordinates.latitude;
  const lng = coordinates.lng ?? coordinates.longitude;
  return lat != null && lng != null ? `${lat}, ${lng}` : "N/A";
}
