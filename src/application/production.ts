import {
    createMilkRecord,
    getAllMilkRecords,
    getMilkRecordsByAnimalId,
    getMilkSummaryByAnimalId,
    updateMilkRecord,
    deleteMilkRecord,
    createWeightRecord,
    getAllWeightRecords,
    getWeightRecordsByAnimalId,
    getWeightSummaryByAnimalId,
    updateWeightRecord,
    deleteWeightRecord,
    getAnimalAnalytics
} from '../infrastructure/productionService';
import { 
    MilkProductionRecordRequest, 
    WeightRecordRequest 
} from '../domain/production';

// ============ MILK PRODUCTION ACTIONS ============

export const createMilkRecordAction = async (request: MilkProductionRecordRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Creating milk record with token');
    return await createMilkRecord(request, token);
};

export const getAllMilkRecordsAction = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching all milk records');
    return await getAllMilkRecords(token);
};

export const getMilkRecordsByAnimalIdAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching milk records for animal');
    return await getMilkRecordsByAnimalId(animalId, token);
};

export const getMilkSummaryByAnimalIdAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching milk summary for animal');
    return await getMilkSummaryByAnimalId(animalId, token);
};

export const updateMilkRecordAction = async (id: number, request: MilkProductionRecordRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Updating milk record');
    return await updateMilkRecord(id, request, token);
};

export const deleteMilkRecordAction = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Deleting milk record');
    return await deleteMilkRecord(id, token);
};

// ============ WEIGHT RECORD ACTIONS ============

export const createWeightRecordAction = async (request: WeightRecordRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Creating weight record with token');
    return await createWeightRecord(request, token);
};

export const getAllWeightRecordsAction = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching all weight records');
    return await getAllWeightRecords(token);
};

export const getWeightRecordsByAnimalIdAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching weight records for animal');
    return await getWeightRecordsByAnimalId(animalId, token);
};

export const getWeightSummaryByAnimalIdAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching weight summary for animal');
    return await getWeightSummaryByAnimalId(animalId, token);
};

export const updateWeightRecordAction = async (id: number, request: WeightRecordRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Updating weight record');
    return await updateWeightRecord(id, request, token);
};

export const deleteWeightRecordAction = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Deleting weight record');
    return await deleteWeightRecord(id, token);
};

// ============ ANALYTICS ACTIONS ============

export const getAnimalAnalyticsAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching animal analytics');
    return await getAnimalAnalytics(animalId, token);
};
