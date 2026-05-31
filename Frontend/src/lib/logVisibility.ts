export type LogRole = "super" | "cswdd" | "cdrrmo" | "barangay";

export type LogViewer = {
  id?: string | null;
  role_id?: number | null;
  role_name?: string | null;
  role_label?: string | null;
  barangay_id?: number | null;
  barangay_name?: string | null;
  barangay?: string | null;
};

export type ScopedAuditLog = {
  actor_user_id?: string | null;
  actor_role?: string | null;
  action?: string | null;
  module?: string | null;
  description?: string | null;
  barangay_id?: number | null;
  barangay_name?: string | null;
};

const cswddModules = [
  "ai-optimized relief recommendation",
  "resident information",
  "resident account registration management",
];

const cdrrmoModules = [
  "flood monitoring",
  "flood heatmap",
  "flood history",
  "sensor history",
];

export function normalizeLogRole(viewer: LogViewer | null | undefined): LogRole | null {
  if (!viewer) return null;

  const roleId = viewer.role_id == null ? "" : String(viewer.role_id);
  const roleText = normalizeText(`${viewer.role_name ?? ""} ${viewer.role_label ?? ""}`);

  if (roleId === "1" || roleText.includes("super")) return "super";
  if (roleId === "2" || /(cdrrmo|ndrrmo|officer|disaster)/.test(roleText)) return "cdrrmo";
  if (roleId === "3" || /(cswdd|city welfare|welfare)/.test(roleText)) return "cswdd";
  if (roleId === "4" || roleText.includes("barangay")) return "barangay";
  return null;
}

export function filterLogsForViewer<T extends ScopedAuditLog>(logs: T[], viewer: LogViewer | null | undefined): T[] {
  const role = normalizeLogRole(viewer);
  if (!viewer || !role) return [];
  if (role === "super") return logs;

  return logs.filter((log) => canViewLog(log, viewer, role));
}

function canViewLog(log: ScopedAuditLog, viewer: LogViewer, role: Exclude<LogRole, "super">) {
  if (isAuthenticationLog(log)) return isOwnLog(log, viewer);
  if (role === "barangay") return matchesBarangay(log, viewer);

  const searchable = normalizeText(`${log.module ?? ""} ${log.actor_role ?? ""} ${log.action ?? ""} ${log.description ?? ""}`);
  if (role === "cswdd") {
    return cswddModules.some((module) => searchable.includes(module))
      || /(cswdd|city welfare|welfare)/.test(searchable);
  }

  return cdrrmoModules.some((module) => searchable.includes(module))
    || /(cdrrmo|ndrrmo|disaster)/.test(searchable);
}

function isAuthenticationLog(log: ScopedAuditLog) {
  return normalizeText(log.module).includes("authentication");
}

function isOwnLog(log: ScopedAuditLog, viewer: LogViewer) {
  return Boolean(viewer.id) && String(log.actor_user_id ?? "") === String(viewer.id);
}

function matchesBarangay(log: ScopedAuditLog, viewer: LogViewer) {
  const viewerBarangayId = viewer.barangay_id == null ? "" : String(viewer.barangay_id);
  const logBarangayId = log.barangay_id == null ? "" : String(log.barangay_id);
  if (viewerBarangayId && viewerBarangayId === logBarangayId) return true;

  const viewerBarangayName = normalizeText(viewer.barangay_name ?? viewer.barangay);
  const logBarangayName = normalizeText(log.barangay_name);
  return Boolean(viewerBarangayName) && viewerBarangayName === logBarangayName;
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}
