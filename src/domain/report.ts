// Domain types for Reports

export interface AnimalFullReport {
    animal: {
        id: number;
        tag: string;
        breed: string;
        weight: number;
        age: number;
        status: string;
        ownerUsername: string;
        feedLevel: number;
    };
    analytics: {
        averageMilk: number | null;
        totalMilk: number | null;
        lastRecordedWeight: number | null;
        weightGain7Days: number | null;
        weightGain30Days: number | null;
    };
}

export interface StableFullReport {
    stable: {
        id: number;
        name: string;
        location: string;
        capacity: number;
        status: string;
    };
    animals: Array<{
        id: number;
        tag: string;
        breed: string;
        weight: number;
        age: number;
        status: string;
        ownerUsername: string;
        feedLevel: number;
    }>;
    campaigns: Array<{
        id: number;
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        status: string;
        stableId: number;
    }>;
    health: any;
    note?: string;
}
