export interface ReliefSummary {
  label: string;
  value: string;
  caption: string;
  emphasis?: boolean;
}

export interface ReliefInventoryItem {
  inventory_id?: string;
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface ReliefRecommendation {
  recommendation_id?: string;
  id: string;
  barangay_name?: string;
  barangay: string;
  recommendedItems: string;
  analysisReason: string;
  report: string;
}

export interface ReliefAllocationHistory {
  recommendation_id?: string;
  id: string;
  barangay_name?: string;
  date: string;
  time: string;
  barangay: string;
  familyFoodPacks: number;
  medicineKits: number;
  reliefForIndividual: number;
}
