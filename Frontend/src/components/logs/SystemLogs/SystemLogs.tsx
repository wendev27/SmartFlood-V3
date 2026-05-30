"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { getAuditLogs } from "@/services/logsService";
import type { AuditLog } from "@/types/logs";
import styles from "./SystemLogs.module.css";

export function SystemLogs() {
  const [query, setQuery] = useState("");
  const [logsSource, setLogsSource] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const data = await getAuditLogs();
      if (!cancelled) {
        setLogsSource(data as AuditLog[]);
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return logsSource.slice(0, 6);
    }

    return logsSource.filter((log) =>
      [log.title, log.department, log.action, log.timestamp, log.user, log.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <section className={styles.panel} aria-label="System logs">
      <label className={styles.search}>
        <span className={styles.searchIcon} />
        <input
          type="search"
          placeholder="Search by name, email, or employee ID..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Event</th>
              <th>Department</th>
              <th>Action</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={`${log.timestamp}-${log.title}-${index}`}>
                <td className={styles.event}>{log.title.toUpperCase()}</td>
                <td>{log.department}</td>
                <td>{log.action}</td>
                <td>{log.timestamp}</td>
                <td>
                  <span className={cn(styles.status, log.status === "Failed" && styles.failed)}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {isLoading ? (
              <tr>
                <td className={styles.empty} colSpan={5}>
                  Loading system logs...
                </td>
              </tr>
            ) : null}
            {!isLoading && logs.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={5}>
                  No system logs found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
