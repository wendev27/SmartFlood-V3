import { fetchJson } from "@/services/apiClient";

export async function getSensors() {
  return fetchJson<Record<string, unknown>[]>("/api/sensors/latest");
}
