export interface EmergencyNotificationAllocationItem {
  item_id: string;
  batch_id: string;
  barangay_id: number;
  barangay_name: string;
  family_food_packs: number;
  individual_relief_goods: number;
  emergency_kits: number;
  barangay_status: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
  receipt_confirmed_at?: string | null;
  created_at?: string | null;
}

export interface EmergencyNotificationBatch {
  batch_id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  created_at?: string | null;
  accepted_at?: string | null;
}

export interface EmergencyNotification {
  notification_id: string;
  type: string;
  target_type: string;
  target_barangay_id: number | null;
  source_type: string | null;
  source_id: string | null;
  title: string;
  message: string;
  status: string;
  read_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  created_at?: string | null;
  allocation_item?: EmergencyNotificationAllocationItem | null;
  batch?: EmergencyNotificationBatch | null;
}

export interface EmergencyNotificationListResponse {
  notifications: EmergencyNotification[];
}

export interface EmergencyAllocationActionResponse {
  notification: EmergencyNotification | null;
  allocation_item: EmergencyNotificationAllocationItem;
  notifications_created?: number;
  eligible_families?: number;
  already_notified?: boolean;
}

export type ReliefDistributionResult =
  | "ELIGIBLE"
  | "ALREADY_RECEIVED"
  | "INVALID_BENEFICIARY"
  | "WRONG_BARANGAY"
  | "ALLOCATION_NOT_READY"
  | "UNAUTHORIZED"
  | "RECEIVED";

export interface ReliefDistributionBeneficiary {
  family_id: string;
  family_name: string;
  family_head_id?: string | null;
  family_head_name?: string | null;
  barangay_id: number;
  barangay_name: string;
  total_family_members: number;
  address?: string | null;
  scanned_resident_name?: string | null;
  vulnerability?: Record<string, number>;
}

export interface ReliefDistributionAllocation {
  item_id: string;
  batch_id: string;
  barangay_id: number;
  barangay_name: string;
  barangay_status: string;
  family_food_packs: number;
  individual_relief_goods: number;
  emergency_kits: number;
  batch?: {
    batch_id: string;
    plan_id?: string;
    plan_name?: string;
    status?: string;
    created_at?: string | null;
  } | null;
}

export interface ReliefDistributionRecord {
  distribution_id: string;
  batch_id: string;
  allocation_item_id: string;
  family_id: string;
  family_head_id?: string | null;
  barangay_id: number;
  status: string;
  verified_by: string;
  verified_at?: string | null;
  created_at?: string | null;
  family_name?: string | null;
  family_head_name?: string | null;
  barangay_name?: string | null;
  total_family_members?: number | null;
  verified_by_name?: string | null;
}

export interface ReliefDistributionVerifyResponse {
  result: ReliefDistributionResult;
  reason?: string | null;
  data?: {
    beneficiary?: ReliefDistributionBeneficiary | null;
    allocation?: ReliefDistributionAllocation | null;
    existing_distribution?: ReliefDistributionRecord | null;
    distribution?: ReliefDistributionRecord | null;
  };
}

export interface ReliefDistributionHistoryResponse {
  distributions: ReliefDistributionRecord[];
}
