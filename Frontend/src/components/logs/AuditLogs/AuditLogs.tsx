"use client";

import { useEffect, useState } from "react";
import { SmartFloodIcon, type SmartFloodIconName } from "@/components/icons/SmartFloodIcon";
import { cn } from "@/lib/cn";
import { getAuditLogs } from "@/services/logsService";
import type { AuditLog } from "@/types/logs";
import styles from "./AuditLogs.module.css";

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const data = await getAuditLogs();
      if (!cancelled) {
        setLogs(data as AuditLog[]);
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className={styles.card}>
      <div className={styles.logList} aria-label="Audit log events">
        {logs.map((log, index) => (
          <section className={cn(styles.logItem, styles[log.tone])} key={`${log.timestamp}-${log.title}-${index}`}>
            <span className={styles.logIcon}>
              <SmartFloodIcon name={auditIconMap[log.title] ?? "alertLevelUpdate"} size={20} />
            </span>
            <div className={styles.logBody}>
              <div className={styles.logMeta}>
                <strong>{log.title}</strong>
                <span>{log.category}</span>
                <span>{log.department}</span>
              </div>
              <p>{log.description}</p>
              <small>{log.action}</small>
              <div className={styles.trace}>
                <span>{log.timestamp}</span>
                <span>IP: {log.ipAddress}</span>
              </div>
            </div>
            <span className={cn(styles.status, log.status === "Failed" && styles.failed)}>{log.status}</span>
          </section>
        ))}
        {isLoading ? <p className={styles.empty}>Loading audit logs...</p> : null}
        {!isLoading && logs.length === 0 ? <p className={styles.empty}>No audit logs found.</p> : null}
      </div>
    </article>
  );
}

const auditIconMap: Record<AuditLog["title"], SmartFloodIconName> = {
  "Account Updated": "accountUpdated",
  "Alert Level Updated": "alertLevelUpdate",
  "Login Failed": "loginFailed",
  "Login Success": "loginSuccess",
  Logout: "loginSuccess",
  "Resident Added": "residentAdded",
  "Resident Deleted": "residentAdded",
  "Sensor Configured": "sensorConfiguration",
};
