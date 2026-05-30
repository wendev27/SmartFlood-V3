import { reliefSummaryMock } from "@/data/relief.mock";
import { apiClient } from "@/services/apiClient";

export async function getReliefSummary() {
  return apiClient(reliefSummaryMock);
}
