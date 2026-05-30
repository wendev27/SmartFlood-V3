export interface SensorReading {
  id: string;
  barangay: string;
  coordinates: string;
  status: "Active" | "Degraded" | "Offline";
  latestReading: string;
  level: "Normal" | "Warning" | "Critical";
}
