
export interface HealthRecord {
    id: number;
    animalId: number;
    diagnosis: string;
    treatment: string;
    vaccine: string;
    date: string; // ISO format: YYYY-MM-DD
    penalty: number;
    notes: string;
    ownerUsername: string;
}

export interface CreateHealthRecordRequest {
    animalId: number;
    diagnosis: string;
    treatment: string;
    vaccine: string;
    date: string;
    penalty: number;
    notes: string;
}

export interface UpdateHealthRecordRequest {
    diagnosis: string;
    treatment: string;
    vaccine: string;
    date: string;
    penalty: number;
    notes: string;
}

export interface HealthRecordResponse extends HealthRecord {}
