import api from '../api';
import {
    MilkProductionRecordRequest,
    MilkProductionRecordResponse,
    MilkSummary,
    WeightRecordRequest,
    WeightRecordResponse,
    WeightSummary,
    AnimalAnalytics
} from '../domain/production';

// ============ MILK PRODUCTION ============

export const createMilkRecord = async (request: MilkProductionRecordRequest, token: string): Promise<MilkProductionRecordResponse> => {
    console.log('[Infrastructure] Creating milk production record:', JSON.stringify(request, null, 2));
    const response = await api.post('/milk', request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Milk record created:', response.data);
    return response.data;
};

export const getAllMilkRecords = async (token: string): Promise<MilkProductionRecordResponse[]> => {
    console.log('[Infrastructure] Fetching all milk production records');
    const response = await api.get('/milk', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Milk records fetched:', response.data);
    return response.data;
};

export const getMilkRecordsByAnimalId = async (animalId: number, token: string): Promise<MilkProductionRecordResponse[]> => {
    console.log(`[Infrastructure] Fetching milk records for animal ID: ${animalId}`);
    const response = await api.get(`/milk/animal/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Milk records fetched:', response.data);
    return response.data;
};

export const getMilkSummaryByAnimalId = async (animalId: number, token: string): Promise<MilkSummary> => {
    console.log(`[Infrastructure] Fetching milk summary for animal ID: ${animalId}`);
    const response = await api.get(`/milk/animal/${animalId}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Milk summary fetched:', response.data);
    return response.data;
};

export const updateMilkRecord = async (id: number, request: MilkProductionRecordRequest, token: string): Promise<MilkProductionRecordResponse> => {
    console.log(`[Infrastructure] Updating milk record ${id}:`, JSON.stringify(request, null, 2));
    const response = await api.put(`/milk/${id}`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Milk record updated:', response.data);
    return response.data;
};

export const deleteMilkRecord = async (id: number, token: string): Promise<void> => {
    console.log(`[Infrastructure] Deleting milk record with ID: ${id}`);
    await api.delete(`/milk/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Milk record deleted successfully');
};

// ============ WEIGHT RECORDS ============

export const createWeightRecord = async (request: WeightRecordRequest, token: string): Promise<WeightRecordResponse> => {
    console.log('[Infrastructure] Creating weight record:', JSON.stringify(request, null, 2));
    const response = await api.post('/weights', request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Weight record created:', response.data);
    return response.data;
};

export const getAllWeightRecords = async (token: string): Promise<WeightRecordResponse[]> => {
    console.log('[Infrastructure] Fetching all weight records');
    const response = await api.get('/weights', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Weight records fetched:', response.data);
    return response.data;
};

export const getWeightRecordsByAnimalId = async (animalId: number, token: string): Promise<WeightRecordResponse[]> => {
    console.log(`[Infrastructure] Fetching weight records for animal ID: ${animalId}`);
    const response = await api.get(`/weights/animal/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Weight records fetched:', response.data);
    return response.data;
};

export const getWeightSummaryByAnimalId = async (animalId: number, token: string): Promise<WeightSummary> => {
    console.log(`[Infrastructure] Fetching weight summary for animal ID: ${animalId}`);
    const response = await api.get(`/weights/animal/${animalId}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Weight summary fetched:', response.data);
    return response.data;
};

export const updateWeightRecord = async (id: number, request: WeightRecordRequest, token: string): Promise<WeightRecordResponse> => {
    console.log(`[Infrastructure] Updating weight record ${id}:`, JSON.stringify(request, null, 2));
    const response = await api.put(`/weights/${id}`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Weight record updated:', response.data);
    return response.data;
};

export const deleteWeightRecord = async (id: number, token: string): Promise<void> => {
    console.log(`[Infrastructure] Deleting weight record with ID: ${id}`);
    await api.delete(`/weights/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Weight record deleted successfully');
};

// ============ ANALYTICS ============

export const getAnimalAnalytics = async (animalId: number, token: string): Promise<AnimalAnalytics> => {
    console.log(`[Infrastructure] Fetching analytics for animal ID: ${animalId}`);
    const response = await api.get(`/analytics/animal/${animalId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Analytics fetched:', response.data);
    return response.data;
};
