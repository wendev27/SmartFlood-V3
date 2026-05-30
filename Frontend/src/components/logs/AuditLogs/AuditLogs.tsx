import { auditLogsMock } from "@/data/logs.mock";
import { SmartFloodIcon, type SmartFloodIconName } from "@/components/icons/SmartFloodIcon";
import { cn } from "@/lib/cn";
import type { AuditLog } from "@/types/logs";
import styles from "./AuditLogs.module.css";

export function AuditLogs() {
  return (
    <article className={styles.card}>
      <div className={styles.logList} aria-label="Audit log events">
        {auditLogsMock.map((log) => (
          <section className={cn(styles.logItem, styles[log.tone])} key={`${log.timestamp}-${log.title}`}>
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
