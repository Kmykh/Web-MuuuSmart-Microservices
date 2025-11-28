
import api from '../api';
import { HealthRecord, CreateHealthRecordRequest, UpdateHealthRecordRequest } from '../domain/health';

export const createHealthRecord = async (request: CreateHealthRecordRequest, token: string): Promise<HealthRecord> => {
    console.log('[Infrastructure] Creating health record:', JSON.stringify(request, null, 2));
    const response = await api.post('/health', request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Health record created:', response.data);
    return response.data;
};

export const getHealthRecordById = async (id: number, token: string): Promise<HealthRecord> => {
    console.log(`[Infrastructure] Fetching health record with ID: ${id}`);
    const response = await api.get(`/health/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Health record fetched:', response.data);
    return response.data;
};

export const getHealthRecordsByAnimalId = async (animalId: number, token: string): Promise<HealthRecord[]> => {
    console.log(`[Infrastructure] Fetching health records for animal ID: ${animalId}`);
    const response = await api.get(`/health/animal/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Health records fetched:', response.data);
    return response.data;
};

export const getAllHealthRecords = async (token: string): Promise<HealthRecord[]> => {
    console.log('[Infrastructure] Fetching all health records');
    const response = await api.get('/health', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] All health records fetched:', response.data);
    return response.data;
};

export const updateHealthRecord = async (id: number, request: UpdateHealthRecordRequest, token: string): Promise<HealthRecord> => {
    console.log(`[Infrastructure] Updating health record ${id}:`, JSON.stringify(request, null, 2));
    const response = await api.put(`/health/${id}`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Health record updated:', response.data);
    return response.data;
};

export const deleteHealthRecord = async (id: number, token: string): Promise<void> => {
    console.log(`[Infrastructure] Deleting health record with ID: ${id}`);
    await api.delete(`/health/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Health record deleted successfully');
};

export const getHealthPenaltyByAnimalId = async (animalId: number, token: string): Promise<number> => {
    console.log(`[Infrastructure] Fetching health penalty for animal ID: ${animalId}`);
    const response = await api.get(`/health/condition/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Health penalty fetched:', response.data);
    return response.data;
};
