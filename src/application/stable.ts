import {
  createStableService,
  getAllStablesService,
  getStableByIdService
} from '../infrastructure/stableService';
import { CreateStableRequest, StableResponse } from '../domain/stable';

// Application layer functions that orchestrate stable actions

export async function createStableAction(stableData: CreateStableRequest): Promise<StableResponse> {
  console.log('⚙️ Ejecutando acción de crear establo en la capa de aplicación');
  const result = await createStableService(stableData);
  console.log('✅ Establo creado exitosamente en la aplicación');
  return result;
}

export async function getAllStablesAction(): Promise<StableResponse[]> {
  console.log('⚙️ Ejecutando acción de obtener todos los establos');
  const result = await getAllStablesService();
  console.log('✅ Lista de establos obtenida exitosamente');
  return result;
}

export async function getStableByIdAction(id: number): Promise<StableResponse> {
  console.log('⚙️ Ejecutando acción de obtener establo por ID');
  const result = await getStableByIdService(id);
  console.log('✅ Establo obtenido exitosamente');
  return result;
}
