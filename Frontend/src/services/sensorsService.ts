import { sensorsMock } from "@/data/sensors.mock";
import { apiClient } from "@/services/apiClient";

export async function getSensors() {
  return apiClient(sensorsMock);
}
