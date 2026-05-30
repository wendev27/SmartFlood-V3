export interface ReliefSummary {
  label: string;
  value: string;
  caption: string;
  emphasis?: boolean;
}

export interface ReliefInventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface ReliefRecommendation {
  id: string;
  barangay: string;
  recommendedItems: string;
  analysisReason: string;
  report: string;
}

export interface ReliefAllocationHistory {
  id: string;
  date: string;
  time: string;
  barangay: string;
  familyFoodPacks: number;
  medicineKits: number;
  reliefForIndividual: number;
}
