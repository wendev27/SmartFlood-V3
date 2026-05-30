export type PageKey =
  | "dashboard"
  | "hardware"
  | "logs"
  | "systemLogs"
  | "monitoring"
  | "relief"
  | "sensors"
  | "residents"
  | "accounts";

export interface NavItem {
  key: PageKey;
  label: string;
  icon: "home" | "monitor" | "folder" | "document" | "droplet" | "cube" | "signal" | "users" | "check";
}

export interface PageCopy {
  title: string;
  subtitle: string;
}
