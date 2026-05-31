"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPanel } from "@/components/dashboard/MapPanel/MapPanel";
import { Badge } from "@/components/ui/Badge/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getFloodBadgeTone, getFloodStatusLabel } from "@/lib/statusStyles";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { getSensors } from "@/services/sensorsService";
import type { DashboardStat } from "@/types/dashboard";
import styles from "./DashboardPanel.module.css";

export function DashboardPanel() {
  const [sensorRows, setSensorRows] = useState<Record<string, unknown>[]>([]);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const rows = await getSensors();
      setSensorRows(rows);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await getSensors();
        if (!cancelled) {
          setSensorRows(rows);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    const interval = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const criticalSensors = useMemo(() => sensorRows.filter((row) =>
    [row.computedStatus, row.risk]
      .some((value) => String(value ?? "").toLowerCase().includes("critical")),
  ), [sensorRows]);

  const simpleStats = useMemo<DashboardStat[]>(() => {
    return [
      {
        label: "Sensor Nodes",
        value: isLoading ? "..." : String(sensorRows.length),
        caption: isLoading ? "Loading sensor network" : "Live sensor nodes",
        tone: "blue",
        captionTone: "info",
      },
      {
        label: "Critical Alerts",
        value: isLoading ? "..." : String(criticalSensors.length),
        caption: showCriticalOnly ? "Showing critical sensors" : "View critical sensors",
        tone: "cyan",
        captionTone: criticalSensors.length > 0 ? "danger" : "success",
      },
    ];
  }, [criticalSensors.length, isLoading, sensorRows.length, showCriticalOnly]);

  function openSensorManagement() {
    window.location.hash = "#sensors";
  }

  function selectDashboardSensor(sensorId: string) {
    setSelectedSensorId(sensorId);
    setShowCriticalOnly(false);
  }

  useEffect(() => {
    if (!selectedSensorId) return;
    if (!sensorRows.some((sensor, index) => sensorKey(sensor, index) === selectedSensorId)) {
      setSelectedSensorId(null);
    }
  }, [selectedSensorId, sensorRows]);

  return (
    <div className={styles.dashboard}>
      <section className={styles.statsGrid} aria-label="Dashboard statistics">
        {simpleStats.map((stat, index) => (
          <StatCard
            isActive={index === 1 && showCriticalOnly}
            key={stat.label}
            onClick={index === 0 ? openSensorManagement : () => setShowCriticalOnly((current) => !current)}
            stat={stat}
          />
        ))}
      </section>
      <section className={styles.mapSection}>
        <MapPanel
          sensors={showCriticalOnly ? criticalSensors : sensorRows}
          isLoading={isLoading}
          error={error}
          onRetry={() => loadDashboard()}
          selectedSensorId={selectedSensorId}
          onSensorSelect={setSelectedSensorId}
          focusZoom={18}
        />
      </section>
      <section className={styles.sensorSection} aria-label="Available sensors">
        <div className={styles.sensorHeader}>
          <div>
            <h3>Available Sensors</h3>
            <p>Live sensor nodes from the monitoring network</p>
          </div>
        </div>
        {error ? <ErrorState title="Unable to Load Sensor Nodes" message={error} retryLabel="Retry" onRetry={() => loadDashboard()} /> : null}
        {isLoading ? <LoadingState message="Loading sensor nodes..." /> : null}
        {!isLoading && !error && sensorRows.length === 0 ? (
          <EmptyState title="No sensor nodes available." description="Sensor cards will appear when live sensor data is available." />
        ) : null}
        {!isLoading && !error && sensorRows.length > 0 ? (
          <div className={styles.sensorScroller}>
            {sensorRows.map((sensor, index) => {
              const key = sensorKey(sensor, index);
              const level = sensorLevel(sensor);
              const status = sensorStatus(sensor);
              return (
                <button
                  className={`${styles.sensorCard} ${level === "Critical" ? styles.criticalSensor : ""} ${selectedSensorId === key ? styles.selectedSensor : ""}`}
                  key={key}
                  type="button"
                  aria-pressed={selectedSensorId === key}
                  onClick={() => selectDashboardSensor(key)}
                >
                  <div className={styles.sensorCardTop}>
                    <strong>{String(sensor.name || sensor.sensorId || sensor.sensor_id || "Unnamed sensor")}</strong>
                    <Badge tone={status === "Active" ? "green" : status === "Inactive" ? "yellow" : "red"}>{status}</Badge>
                  </div>
                  <span>{String(sensor.barangayName ?? sensor.barangay ?? "Unknown barangay")}</span>
                  <div className={styles.sensorMeta}>
                    <span>Reading</span>
                    <b>{formatWater(sensor.waterLevelM)}</b>
                  </div>
                  <div className={styles.sensorMeta}>
                    <span>Flood Level</span>
                    <Badge tone={getFloodBadgeTone(level)}>{level}</Badge>
                  </div>
                  <small>Updated: {formatDateTime(sensor.latestReadingAt ?? sensor.lastSeenAt)}</small>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function sensorKey(sensor: Record<string, unknown>, index: number) {
  return String(sensor.sensorId ?? sensor.sensor_id ?? sensor._id ?? `${sensor.name ?? "sensor"}-${index}`);
}

function sensorStatus(sensor: Record<string, unknown>) {
  const status = String(sensor.status ?? "offline").toLowerCase();
  if (status === "active") return "Active";
  if (status === "inactive" || status === "degraded") return "Inactive";
  return "Offline";
}

function sensorLevel(sensor: Record<string, unknown>) {
  return getFloodStatusLabel(sensor.computedStatus ?? sensor.risk, sensor.waterLevelM);
}

function formatWater(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `${parsed.toFixed(2)}m` : "No reading";
}

function formatDateTime(value: unknown) {
  if (!value) return "No reading";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}
