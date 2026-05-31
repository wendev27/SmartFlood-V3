"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logLabelForRole, normalizeUserRole } from "@/lib/authSession";
import { getAuditLogs } from "@/services/logsService";
import type { AuditLog } from "@/types/logs";
import styles from "./SystemLogs.module.css";

const cswddModules = new Set([
  "Resident Information",
  "Resident Account Registration Management",
  "AI-Optimized Relief Recommendation",
]);

const cdrrmoModules = new Set([
  "Flood Monitoring Module",
  "Sensor History",
  "Authentication",
]);

export function SystemLogs() {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [logsSource, setLogsSource] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getCurrentUser();
  const role = normalizeUserRole(user) ?? "barangay";
  const title = logLabelForRole(role);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getAuditLogs();
        if (!cancelled) setLogsSource(data as unknown as AuditLog[]);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load logs.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleScopedLogs = useMemo(() => scopeLogsByRole(logsSource, role, user?.barangay_id ?? null), [logsSource, role, user?.barangay_id]);
  const moduleOptions = useMemo(() => unique(roleScopedLogs.map((log) => log.module ?? "")), [roleScopedLogs]);
  const actionOptions = useMemo(() => unique(roleScopedLogs.map((log) => log.action)), [roleScopedLogs]);

  const logs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return roleScopedLogs.filter((log) => {
      const matchesQuery = !normalizedQuery || [
        log.actor_name,
        log.actor_role,
        log.action,
        log.module,
        log.description,
        log.barangay_name,
        log.created_at,
      ].join(" ").toLowerCase().includes(normalizedQuery);
      return matchesQuery
        && (!moduleFilter || log.module === moduleFilter)
        && (!actionFilter || log.action === actionFilter);
    });
  }, [actionFilter, moduleFilter, query, roleScopedLogs]);

  return (
    <section className={styles.panel} aria-label={title}>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search logs by actor, action, module, or barangay..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} aria-label="Module">
          <option value="">All Modules</option>
          {moduleOptions.map((module) => <option key={module} value={module}>{module}</option>)}
        </select>
        <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} aria-label="Action">
          <option value="">All Actions</option>
          {actionOptions.map((action) => <option key={action} value={action}>{action}</option>)}
        </select>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>Barangay</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id ?? `${log.created_at}-${log.action}`}>
                <td>{formatDateTime(log.created_at ?? "")}</td>
                <td>{log.actor_name || "-"}</td>
                <td>{log.actor_role || "-"}</td>
                <td><span className={styles.action}>{log.action}</span></td>
                <td>{log.module ?? "-"}</td>
                <td>{log.description || "-"}</td>
                <td>{log.barangay_name || "-"}</td>
              </tr>
            ))}
            {isLoading ? (
              <tr>
                <td className={styles.empty} colSpan={7}>Loading logs...</td>
              </tr>
            ) : null}
            {!isLoading && logs.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={7}>No logs found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function scopeLogsByRole(logs: AuditLog[], role: string, barangayId: number | null | undefined) {
  if (role === "super") return logs;
  if (role === "barangay") return logs.filter((log) => !barangayId || Number(log.barangay_id) === Number(barangayId) || log.actor_role === "Barangay Admin" || log.actor_role === "Barangay Official");
  if (role === "cswdd") return logs.filter((log) => cswddModules.has(log.module ?? "") || log.actor_role === "CSWDD Admin");
  if (role === "cdrrmo") return logs.filter((log) => cdrrmoModules.has(log.module ?? "") || log.actor_role === "CDRRMO Admin");
  return logs;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
