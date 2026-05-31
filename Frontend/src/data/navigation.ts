import type { NavItem } from "@/types/navigation";

export const navigationItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "monitoring", label: "Flood Monitoring Module", icon: "droplet" },
  { key: "sensors", label: "Sensor History", icon: "signal" },
  { key: "relief", label: "AI-Optimized Relief Recommendation", icon: "cube" },
  { key: "residents", label: "Resident Information", icon: "users" },
  { key: "accounts", label: "Resident Account Registration Management", icon: "check" },
  { key: "logs", label: "Account Management", icon: "folder" },
  { key: "systemLogs", label: "System Logs", icon: "document" },
];
