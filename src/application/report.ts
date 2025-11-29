import { getAnimalFullReport, getStableFullReport } from '../infrastructure/reportService';

export const getAnimalFullReportAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching animal full report');
    return await getAnimalFullReport(animalId, token);
};

export const getStableFullReportAction = async (stableId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching stable full report');
    return await getStableFullReport(stableId, token);
};
