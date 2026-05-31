import { fetchJson } from "@/services/apiClient";
import { withAuditActor } from "@/lib/auditClient";

export async function getReliefSummary() {
  return Promise.resolve([]);
}

export async function getReliefRecommendations() {
  return fetchJson<Record<string, unknown>[]>("/api/ai/recommendations");
}

export async function getReliefInventory() {
  return fetchJson<Record<string, unknown>[]>("/api/relief/inventory");
}

export async function saveReliefInventory(payload: Record<string, unknown>) {
  return fetchJson<Record<string, unknown>>("/api/relief/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withAuditActor(payload)),
  });
}

export async function generateReliefRecommendations(payload: Record<string, number>) {
  return fetchJson<Record<string, unknown>[]>("/api/ai/recommendations/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withAuditActor(payload)),
  });
}
