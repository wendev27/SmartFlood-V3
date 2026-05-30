import { applicationFormDefaultsMock, verificationApplicationsMock } from "@/data/verification.mock";
import { apiClient } from "@/services/apiClient";

export async function getVerificationApplications() {
  return apiClient(verificationApplicationsMock);
}

export async function getApplicationFormDefaults() {
  return apiClient(applicationFormDefaultsMock);
}
