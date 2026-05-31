"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell/AppShell";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel/DashboardPanel";
import { LogsPanel } from "@/components/logs/LogsPanel/LogsPanel";
import { SystemLogs } from "@/components/logs/SystemLogs/SystemLogs";
import { MonitoringPanel, type MonitoringView } from "@/components/monitoring/MonitoringPanel/MonitoringPanel";
import { ReliefPanel } from "@/components/relief/ReliefPanel/ReliefPanel";
import { SensorsPanel } from "@/components/sensors/SensorsPanel/SensorsPanel";
import { ResidentsPanel } from "@/components/residents/ResidentsPanel/ResidentsPanel";
import { VerificationPanel } from "@/components/verification/VerificationPanel/VerificationPanel";
import type { PageKey } from "@/types/navigation";

const pageKeys: PageKey[] = [
  "dashboard",
  "logs",
  "systemLogs",
  "monitoring",
  "relief",
  "sensors",
  "residents",
  "accounts",
];

function getPageFromHash(hash: string): PageKey {
  const value = hash.replace("#", "");
  if (value === "hardware" || value === "sensor-configuration") return "sensors";
  return pageKeys.includes(value as PageKey) ? (value as PageKey) : "dashboard";
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [monitoringView, setMonitoringView] = useState<MonitoringView>("main");
  const [monitoringResetVersion, setMonitoringResetVersion] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setActivePage(getPageFromHash(window.location.hash));

    const handleHashChange = () => {
      const nextPage = getPageFromHash(window.location.hash);
      setActivePage(nextPage);
      if (nextPage === "monitoring") {
        setMonitoringView("main");
        setMonitoringResetVersion((version) => version + 1);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleNavigate(page: PageKey) {
    setActivePage(page);
    setMonitoringView("main");
    if (page === "monitoring") {
      setMonitoringResetVersion((version) => version + 1);
    }
    setIsMobileNavOpen(false);
    window.history.replaceState(null, "", `#${page}`);
  }

  return (
    <AppShell
      activePage={activePage}
      hideTopbar={activePage === "monitoring" && monitoringView !== "main"}
      isMobileNavOpen={isMobileNavOpen}
      onNavigate={handleNavigate}
      onToggleMobileNav={() => setIsMobileNavOpen((isOpen) => !isOpen)}
    >
      {activePage === "dashboard" ? <DashboardPanel /> : null}
      {activePage === "logs" ? <LogsPanel /> : null}
      {activePage === "systemLogs" ? <SystemLogs /> : null}
      {activePage === "monitoring" ? <MonitoringPanel resetSignal={monitoringResetVersion} onViewChange={setMonitoringView} /> : null}
      {activePage === "relief" ? <ReliefPanel /> : null}
      {activePage === "sensors" ? <SensorsPanel /> : null}
      {activePage === "residents" ? <ResidentsPanel /> : null}
      {activePage === "accounts" ? <VerificationPanel /> : null}
    </AppShell>
  );
}
