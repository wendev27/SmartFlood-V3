"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPanel } from "@/components/dashboard/MapPanel/MapPanel";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { getSensors } from "@/services/sensorsService";
import type { DashboardStat } from "@/types/dashboard";
import styles from "./DashboardPanel.module.css";

export function DashboardPanel() {
  const [sensorRows, setSensorRows] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const rows = await getSensors();
        if (!cancelled) setSensorRows(rows);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const simpleStats = useMemo<DashboardStat[]>(() => {
    const criticalAlerts = sensorRows.filter((row) =>
      String(row.computedStatus ?? "").toLowerCase().includes("critical"),
    ).length;

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
        value: isLoading ? "..." : String(criticalAlerts),
        caption: "Alert raw baguhin",
        tone: "cyan",
        captionTone: criticalAlerts > 0 ? "danger" : "success",
      },
    ];
  }, [isLoading, sensorRows]);

  return (
    <div className={styles.dashboard}>
      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      <section className={styles.statsGrid} aria-label="Dashboard statistics">
        {simpleStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <section className={styles.mapSection}>
        <MapPanel />
      </section>
    </div>
  );
}
