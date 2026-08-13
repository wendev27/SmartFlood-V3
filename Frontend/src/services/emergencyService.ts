import { fetchEnvelope, fetchJson } from "@/services/apiClient";
import type {
  EmergencyAllocationActionResponse,
  EmergencyNotification,
  EmergencyNotificationListResponse,
  ReliefDistributionHistoryResponse,
  ReliefDistributionVerifyResponse,
} from "@/types/emergency";

export async function getEmergencyNotifications() {
  const data = await fetchJson<EmergencyNotificationListResponse>("/api/emergency/notifications");
  return data.notifications;
}

export async function markEmergencyNotificationRead(notificationId: string) {
  const response = await fetchEnvelope<EmergencyNotification>(`/api/emergency/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "PATCH",
  });
  return response.data ?? null;
}

export async function acceptEmergencyAllocationItem(itemId: string) {
  const response = await fetchEnvelope<EmergencyAllocationActionResponse>(`/api/emergency/allocation-items/${encodeURIComponent(itemId)}/accept`, {
    method: "POST",
  });
  return response.data ?? null;
}

export async function rejectEmergencyAllocationItem(itemId: string) {
  const response = await fetchEnvelope<EmergencyAllocationActionResponse>(`/api/emergency/allocation-items/${encodeURIComponent(itemId)}/reject`, {
    method: "POST",
  });
  return response.data ?? null;
}

export async function confirmEmergencyAllocationReceipt(itemId: string) {
  const response = await fetchEnvelope<EmergencyAllocationActionResponse>(`/api/emergency/allocation-items/${encodeURIComponent(itemId)}/confirm-receipt`, {
    method: "POST",
  });
  return response.data ?? null;
}

export async function notifyFamilyHeadsForEmergencyAllocation(itemId: string) {
  const response = await fetchEnvelope<EmergencyAllocationActionResponse>(`/api/emergency/allocation-items/${encodeURIComponent(itemId)}/notify-family-heads`, {
    method: "POST",
  });
  return response.data ?? null;
}

export async function verifyReliefDistribution(identifier: string) {
  const response = await fetchEnvelope<ReliefDistributionVerifyResponse>("/api/emergency/distribution/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });
  return response as ReliefDistributionVerifyResponse;
}

export async function confirmReliefDistribution(identifier: string, allocationItemId?: string | null) {
  const response = await fetchEnvelope<ReliefDistributionVerifyResponse>("/api/emergency/distribution/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, allocation_item_id: allocationItemId ?? null }),
  });
  return response as ReliefDistributionVerifyResponse;
}

export async function getReliefDistributionHistory() {
  const data = await fetchJson<ReliefDistributionHistoryResponse>("/api/emergency/distribution/history");
  return data.distributions;
}
