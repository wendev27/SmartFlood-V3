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
