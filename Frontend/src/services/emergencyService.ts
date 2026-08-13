import { fetchEnvelope, fetchJson } from "@/services/apiClient";
import type {
  EmergencyAllocationActionResponse,
  EmergencyNotification,
  EmergencyNotificationListResponse,
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
