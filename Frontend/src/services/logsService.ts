import { fetchJson } from "@/services/apiClient";

export async function getAccountUsers() {
  return fetchJson<Record<string, unknown>[]>("/api/app-users");
}

export async function getAuditLogs() {
  return Promise.resolve([]);
}
