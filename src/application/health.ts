
import { 
    createHealthRecord, 
    getHealthRecordById, 
    getHealthRecordsByAnimalId, 
    getAllHealthRecords, 
    updateHealthRecord, 
    deleteHealthRecord,
    getHealthPenaltyByAnimalId
} from '../infrastructure/healthService';
import { CreateHealthRecordRequest, UpdateHealthRecordRequest } from '../domain/health';

export const createHealthRecordAction = async (request: CreateHealthRecordRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Creating health record with token');
    return await createHealthRecord(request, token);
};

export const getHealthRecordByIdAction = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching health record by ID');
    return await getHealthRecordById(id, token);
};

export const getHealthRecordsByAnimalIdAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching health records for animal');
    return await getHealthRecordsByAnimalId(animalId, token);
};

export const getAllHealthRecordsAction = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching all health records');
    return await getAllHealthRecords(token);
};

export const updateHealthRecordAction = async (id: number, request: UpdateHealthRecordRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Updating health record');
    return await updateHealthRecord(id, request, token);
};

export const deleteHealthRecordAction = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Deleting health record');
    return await deleteHealthRecord(id, token);
};

export const getHealthPenaltyByAnimalIdAction = async (animalId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Fetching health penalty for animal');
    return await getHealthPenaltyByAnimalId(animalId, token);
};
