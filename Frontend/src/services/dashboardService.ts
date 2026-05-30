import { dashboardStatsMock, systemPulseMock } from "@/data/dashboard.mock";
import { apiClient } from "@/services/apiClient";

export async function getDashboardStats() {
  return apiClient(dashboardStatsMock);
}

export async function getSystemPulse() {
  return apiClient(systemPulseMock);
}
