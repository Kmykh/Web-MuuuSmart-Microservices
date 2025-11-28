import {
  createAnimalService,
  getAllAnimalsService,
  getAnimalByIdService,
  getAnimalsByStableService,
  updateAnimalService,
  deleteAnimalService
} from '../infrastructure/animalService';
import { Animal, AnimalRequest, AnimalResponse } from '../domain/animal';

// Application layer functions that orchestrate animal actions

export async function createAnimalAction(animalData: AnimalRequest): Promise<AnimalResponse> {
  console.log('⚙️ Ejecutando acción de crear animal en la capa de aplicación');
  const result = await createAnimalService(animalData);
  console.log('✅ Animal creado exitosamente en la aplicación');
  return result;
}

export async function getAllAnimalsAction(): Promise<Animal[]> {
  console.log('⚙️ Ejecutando acción de obtener todos los animales');
  const result = await getAllAnimalsService();
  console.log('✅ Lista de animales obtenida exitosamente');
  return result;
}

export async function getAnimalByIdAction(id: number): Promise<Animal> {
  console.log('⚙️ Ejecutando acción de obtener animal por ID');
  const result = await getAnimalByIdService(id);
  console.log('✅ Animal obtenido exitosamente');
  return result;
}

export async function getAnimalsByStableAction(stableId: number): Promise<Animal[]> {
  console.log('⚙️ Ejecutando acción de obtener animales por establo');
  const result = await getAnimalsByStableService(stableId);
  console.log('✅ Animales del establo obtenidos exitosamente');
  return result;
}

export async function updateAnimalAction(id: number, animalData: AnimalRequest): Promise<AnimalResponse> {
  console.log('⚙️ Ejecutando acción de actualizar animal');
  const result = await updateAnimalService(id, animalData);
  console.log('✅ Animal actualizado exitosamente en la aplicación');
  return result;
}

export async function deleteAnimalAction(id: number): Promise<void> {
  console.log('⚙️ Ejecutando acción de eliminar animal');
  await deleteAnimalService(id);
  console.log('✅ Animal eliminado exitosamente de la aplicación');
}
