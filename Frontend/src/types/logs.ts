export interface AccountUser {
  name: string;
  department: "CDRRMO" | "Barangay" | "CSWDD";
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface AuditLog {
  title: string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  category: string;
  department: "CDRRMO" | "Barangay" | "CSWDD" | "Resident" | "System" | "Sensor" | "Authentication";
  status: "Success" | "Failed";
  tone: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  ipAddress: string;
}
