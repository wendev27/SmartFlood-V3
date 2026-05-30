import { dashboardStatsMock } from "@/data/dashboard.mock";
import { MapPanel } from "@/components/dashboard/MapPanel/MapPanel";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import styles from "./DashboardPanel.module.css";

export function DashboardPanel() {
  const simpleStats = dashboardStatsMock
    .filter((stat) => stat.label === "Network Nodes" || stat.label === "Critical Alerts")
    .map((stat) => {
      if (stat.label === "Network Nodes") {
        return { ...stat, label: "Sensor Nodes" };
      }

      return { ...stat, caption: "Alert raw baguhin" };
    });

  return (
    <div className={styles.dashboard}>
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
