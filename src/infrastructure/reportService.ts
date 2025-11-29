import api from '../api';
import { AnimalFullReport, StableFullReport } from '../domain/report';

export const getAnimalFullReport = async (animalId: number, token: string): Promise<AnimalFullReport> => {
    console.log(`[Infrastructure] Fetching full report for animal ID: ${animalId}`);
    const response = await api.get(`/reports/animal/${animalId}/full`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Animal full report fetched:', response.data);
    return response.data;
};

export const getStableFullReport = async (stableId: number, token: string): Promise<StableFullReport> => {
    console.log(`[Infrastructure] Fetching full report for stable ID: ${stableId}`);
    const response = await api.get(`/reports/stable/${stableId}/full`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] Stable full report fetched:', response.data);
    return response.data;
};
