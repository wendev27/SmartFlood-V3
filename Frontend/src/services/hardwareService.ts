import { hardwareStatusMock } from "@/data/hardware.mock";
import { apiClient } from "@/services/apiClient";

export async function getHardwareStatus() {
  return apiClient(hardwareStatusMock);
}
