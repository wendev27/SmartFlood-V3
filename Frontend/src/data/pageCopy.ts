import type { PageCopy, PageKey } from "@/types/navigation";

export const pageCopy: Record<PageKey, PageCopy> = {
  dashboard: {
    title: "Welcome back!",
    subtitle: "Manage your barangay operations efficiently and effectively",
  },
  logs: {
    title: "Account Management",
    subtitle: "Manage web dashboard accounts and role-based access.",
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
    subtitle: "View and monitor sensor device readings",
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
