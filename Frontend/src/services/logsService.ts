import { accountUsersMock, auditLogsMock } from "@/data/logs.mock";
import { apiClient } from "@/services/apiClient";

export async function getAccountUsers() {
  return apiClient(accountUsersMock);
}

export async function getAuditLogs() {
  return apiClient(auditLogsMock);
}
