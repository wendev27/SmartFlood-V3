import { fetchEnvelope, fetchJson } from "@/services/apiClient";
import type {
  EmergencyAllocationActionResponse,
  EmergencyNotification,
  EmergencyNotificationListResponse,
  ReliefCampaignActionResponse,
  ReliefCampaignHistoryResponse,
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

export async function verifyReliefDistribution(batchId: string, identifier: string) {
  const response = await fetchEnvelope<ReliefDistributionVerifyResponse>("/api/emergency/distribution/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batchId, identifier }),
  });
  return response as ReliefDistributionVerifyResponse;
}

export async function confirmReliefDistribution(batchId: string, identifier: string, allocationItemId?: string | null) {
  const response = await fetchEnvelope<ReliefDistributionVerifyResponse>("/api/emergency/distribution/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batchId, identifier, allocation_item_id: allocationItemId ?? null }),
  });
  return response as ReliefDistributionVerifyResponse;
}

export async function getReliefDistributionHistory(batchId?: string | null) {
  const query = batchId ? `?batch_id=${encodeURIComponent(batchId)}` : "";
  const data = await fetchJson<ReliefDistributionHistoryResponse>(`/api/emergency/distribution/history${query}`);
  return data.distributions;
}

export async function getReliefCampaignHistory() {
  const data = await fetchJson<ReliefCampaignHistoryResponse>("/api/emergency/campaigns/history");
  return data.campaigns;
}

export async function startReliefCampaign(batchId: string, expiresAt: string) {
  const response = await fetchEnvelope<ReliefCampaignActionResponse>(`/api/emergency/campaigns/${encodeURIComponent(batchId)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expires_at: expiresAt }),
  });
  return response.data ?? null;
}

export async function closeReliefCampaign(batchId: string, closureReason: string) {
  const response = await fetchEnvelope<ReliefCampaignActionResponse>(`/api/emergency/campaigns/${encodeURIComponent(batchId)}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ closure_reason: closureReason }),
  });
  return response.data ?? null;
}
