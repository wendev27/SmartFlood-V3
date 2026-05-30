import { residentsMock } from "@/data/residents.mock";
import { apiClient } from "@/services/apiClient";

export async function getResidents() {
  return apiClient(residentsMock);
}
