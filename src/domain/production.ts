// Domain types for Production (Milk and Weight)

export interface MilkProductionRecord {
    id: number;
    animalId: number;
    liters: number;
    date: string; // LocalDate format: YYYY-MM-DD
    createdAt: string; // LocalDateTime ISO format
    updatedAt: string; // LocalDateTime ISO format
}

export interface MilkProductionRecordRequest {
    animalId: number;
    liters: number;
    date: string; // LocalDate format: YYYY-MM-DD
}

export interface MilkProductionRecordResponse extends MilkProductionRecord {}

export interface MilkSummary {
    averageLiters: number | null;
    totalLiters: number | null;
}

export interface WeightRecord {
    id: number;
    animalId: number;
    weightKg: number;
    date: string; // LocalDate format: YYYY-MM-DD
    createdAt: string; // LocalDateTime ISO format
    updatedAt: string; // LocalDateTime ISO format
}

export interface WeightRecordRequest {
    animalId: number;
    weightKg: number;
    date: string; // LocalDate format: YYYY-MM-DD
}

export interface WeightRecordResponse extends WeightRecord {}

export interface WeightSummary {
    lastWeight: number | null;
    gain7Days: number | null;
    gain30Days: number | null;
}

export interface AnimalAnalytics {
    animalId: number;
    averageMilk: number | null;
    totalMilk: number | null;
    lastRecordedWeight: number | null;
    weightGain7Days: number | null;
    weightGain30Days: number | null;
}
