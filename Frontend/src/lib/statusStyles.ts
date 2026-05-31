export type FloodStatus = "normal" | "alert" | "warning" | "critical" | "no_reading";
export type BadgeTone = "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray";

export function normalizeFloodStatus(status?: unknown, waterLevel?: unknown): FloodStatus {
  const normalized = String(status ?? "").trim().toLowerCase().replace(/_/g, " ");
  if (normalized.includes("severe") || normalized.includes("critical")) return "critical";
  if (normalized.includes("warning")) return "warning";
  if (normalized.includes("alert")) return "alert";
  if (normalized.includes("normal")) return "normal";
  if (normalized.includes("no reading") || normalized.includes("unknown")) return "no_reading";

  const level = Number(waterLevel);
  if (!Number.isFinite(level)) return "no_reading";
  if (level >= 1.2) return "critical";
  if (level >= 0.75) return "warning";
  if (level >= 0.25) return "alert";
  return "normal";
}

export function getFloodStatusLabel(status?: unknown, waterLevel?: unknown) {
  const normalized = normalizeFloodStatus(status, waterLevel);
  if (normalized === "critical") return "Severity";
  if (normalized === "warning") return "Flood Warning";
  if (normalized === "alert") return "Flood Alert";
  if (normalized === "normal") return "Normal";
  return "No reading";
}

export function getFloodStatusClass(status?: unknown, waterLevel?: unknown) {
  return normalizeFloodStatus(status, waterLevel);
}

export function getFloodStatusColor(status?: unknown, waterLevel?: unknown) {
  const normalized = normalizeFloodStatus(status, waterLevel);
  if (normalized === "normal") return "#17a34a";
  if (normalized === "alert") return "#f7bd00";
  if (normalized === "warning") return "#ff7417";
  if (normalized === "critical") return "#ff3347";
  return "#94a3b8";
}

export function getFloodBadgeTone(status?: unknown, waterLevel?: unknown): BadgeTone {
  const normalized = normalizeFloodStatus(status, waterLevel);
  if (normalized === "normal") return "green";
  if (normalized === "alert") return "yellow";
  if (normalized === "warning") return "orange";
  if (normalized === "critical") return "red";
  return "gray";
}
