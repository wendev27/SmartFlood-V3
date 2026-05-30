import type { PageCopy, PageKey } from "@/types/navigation";

export const pageCopy: Record<PageKey, PageCopy> = {
  dashboard: {
    title: "Welcome back!",
    subtitle: "Manage your barangay operations efficiently and effectively",
  },
  hardware: {
    title: "Sensor Configuration Management",
    subtitle: "View and manage sensor devices. Arduino Control Panel",
  },
  logs: {
    title: "Account Management",
    subtitle: "Manage user accounts and view system audit logs",
  },
  systemLogs: {
    title: "System Logs",
    subtitle: "Manage user accounts and view system audit logs",
  },
  monitoring: {
    title: "Flood Monitoring Management",
    subtitle: "Manage your barangay operations efficiently and effectively",
  },
  relief: {
    title: "AI-Optimized Relief Recommendation",
    subtitle: "",
  },
  sensors: {
    title: "Sensor History",
    subtitle: "Configure and monitor sensor devices",
  },
  residents: {
    title: "Resident Information",
    subtitle: "",
  },
  accounts: {
    title: "Resident Account Registration Management",
    subtitle: "",
  },
};
