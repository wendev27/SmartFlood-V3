import { sensorsMock } from "@/data/sensors.mock";
import { MapPanel } from "@/components/dashboard/MapPanel/MapPanel";
import { Badge } from "@/components/ui/Badge/Badge";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import styles from "./SensorsPanel.module.css";

export function SensorsPanel() {
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
        <DataTable headers={["Sensor ID", "Barangay", "Coordinates", "Status", "Latest Reading", "Level"]}>
          {sensorsMock.map((sensor) => (
            <tr key={sensor.id}>
              <td>{sensor.id}</td>
              <td>{sensor.barangay}</td>
              <td>{sensor.coordinates}</td>
              <td><Badge tone={sensor.status === "Active" ? "green" : sensor.status === "Degraded" ? "yellow" : "red"}>{sensor.status}</Badge></td>
              <td>{sensor.latestReading}</td>
              <td><Badge tone={sensor.level === "Normal" ? "green" : sensor.level === "Warning" ? "yellow" : "red"}>{sensor.level}</Badge></td>
            </tr>
          ))}
        </DataTable>
      </article>
    </section>
  );
}
