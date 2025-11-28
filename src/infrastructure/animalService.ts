import api from '../api';
import { Animal, AnimalRequest, AnimalResponse } from '../domain/animal';

// Service functions to interact with the Animal API

/**
 * Create a new animal
 */
export const createAnimalService = async (animalData: AnimalRequest): Promise<AnimalResponse> => {
  console.log('📡 Enviando petición para crear animal...');
  const response = await api.post<AnimalResponse>('/animals', animalData);
  console.log('📨 Animal creado exitosamente:', response.status);
  return response.data;
};

/**
 * Get all animals (user sees their own, admin sees all)
 */
export const getAllAnimalsService = async (): Promise<Animal[]> => {
  console.log('📡 Obteniendo lista de animales...');
  const response = await api.get<Animal[]>('/animals');
  console.log('📨 Animales obtenidos:', response.data.length);
  return response.data;
};

/**
 * Get a specific animal by ID
 */
export const getAnimalByIdService = async (id: number): Promise<Animal> => {
  console.log(`📡 Obteniendo animal con ID ${id}...`);
  const response = await api.get<Animal>(`/animals/${id}`);
  console.log('📨 Animal obtenido:', response.data.tag);
  return response.data;
};

/**
 * Get animals by stable ID
 */
export const getAnimalsByStableService = async (stableId: number): Promise<Animal[]> => {
  console.log(`📡 Obteniendo animales del establo ${stableId}...`);
  const response = await api.get<Animal[]>(`/animals/stable/${stableId}`);
  console.log('📨 Animales del establo obtenidos:', response.data.length);
  return response.data;
};

/**
 * Update an existing animal
 */
export const updateAnimalService = async (id: number, animalData: AnimalRequest): Promise<AnimalResponse> => {
  console.log(`📡 Actualizando animal con ID ${id}...`);
  const response = await api.put<AnimalResponse>(`/animals/${id}`, animalData);
  console.log('📨 Animal actualizado exitosamente');
  return response.data;
};

/**
 * Delete an animal
 */
export const deleteAnimalService = async (id: number): Promise<void> => {
  console.log(`📡 Eliminando animal con ID ${id}...`);
  await api.delete(`/animals/${id}`);
  console.log('📨 Animal eliminado exitosamente');
};
