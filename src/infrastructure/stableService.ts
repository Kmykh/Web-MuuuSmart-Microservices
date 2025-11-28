import api from '../api';
import { Stable, CreateStableRequest, StableResponse } from '../domain/stable';

// Service functions to interact with the Stable API

/**
 * Create a new stable
 */
export const createStableService = async (stableData: CreateStableRequest): Promise<StableResponse> => {
  console.log('📡 Enviando petición para crear establo...');
  const response = await api.post<StableResponse>('/stables', stableData);
  console.log('📨 Establo creado exitosamente:', response.status);
  return response.data;
};

/**
 * Get all stables (user sees their own, admin sees all)
 */
export const getAllStablesService = async (): Promise<StableResponse[]> => {
  console.log('📡 Obteniendo lista de establos...');
  const response = await api.get<StableResponse[]>('/stables');
  console.log('📨 Establos obtenidos:', response.data.length);
  return response.data;
};

/**
 * Get a specific stable by ID
 */
export const getStableByIdService = async (id: number): Promise<StableResponse> => {
  console.log(`📡 Obteniendo establo con ID ${id}...`);
  const response = await api.get<StableResponse>(`/stables/${id}`);
  console.log('📨 Establo obtenido:', response.data.name);
  return response.data;
};
