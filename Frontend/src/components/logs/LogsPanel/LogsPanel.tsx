"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { AccountManagement } from "@/components/logs/AccountManagement/AccountManagement";
import { AuditLogs } from "@/components/logs/AuditLogs/AuditLogs";
import styles from "./LogsPanel.module.css";

type LogsTab = "users" | "audit";

export function LogsPanel() {
  const [activeTab, setActiveTab] = useState<LogsTab>("users");

  return (
    <section className={styles.panel} aria-label="Account management and audit logs">
      <Tabs
        ariaLabel="Account sections"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "users", label: "User Accounts", icon: <span className={styles.usersIcon} /> },
          { key: "audit", label: "Audit Logs", icon: <span className={styles.clockIcon} /> },
        ]}
      />
      <div className={styles.content}>{activeTab === "users" ? <AccountManagement /> : <AuditLogs />}</div>
    </section>
  );
}
