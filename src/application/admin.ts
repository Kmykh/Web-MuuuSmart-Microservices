// Admin application layer - funciones para obtener datos globales del sistema

import api from '../api';
import { Animal } from '../domain/animal';
import { StableResponse } from '../domain/stable';

export interface UserSubscription {
  username: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  expiresAt: string;
  animalsLimit: number;
  stablesLimit: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAnimals: number;
  totalStables: number;
  newUsersThisMonth: number;
  systemHealth: number;
  animalsByStatus: { status: string; count: number }[];
  topUsers: { username: string; animalsCount: number; stablesCount: number }[];
}

// Obtener todos los animales del sistema (todos los usuarios)
export async function getAllAnimalsGlobalAction(): Promise<Animal[]> {
  console.log('⚙️ [ADMIN] Obteniendo todos los animales del sistema');
  try {
    const response = await api.get('/admin/animals');
    console.log('✅ [ADMIN] Animales globales obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo animales globales:', error);
    throw error;
  }
}

// Obtener todos los establos del sistema (todos los usuarios)
export async function getAllStablesGlobalAction(): Promise<StableResponse[]> {
  console.log('⚙️ [ADMIN] Obteniendo todos los establos del sistema');
  try {
    const response = await api.get('/admin/stables');
    console.log('✅ [ADMIN] Establos globales obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo establos globales:', error);
    throw error;
  }
}

// Obtener estadísticas del sistema
export async function getAdminStatsAction(): Promise<AdminStats> {
  console.log('⚙️ [ADMIN] Obteniendo estadísticas del sistema');
  try {
    const response = await api.get('/admin/stats');
    console.log('✅ [ADMIN] Estadísticas obtenidas');
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    // Datos de ejemplo si falla
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalAnimals: 0,
      totalStables: 0,
      newUsersThisMonth: 0,
      systemHealth: 98,
      animalsByStatus: [],
      topUsers: []
    };
  }
}

// Obtener suscripciones de usuarios
export async function getUserSubscriptionsAction(): Promise<UserSubscription[]> {
  console.log('⚙️ [ADMIN] Obteniendo suscripciones de usuarios');
  try {
    const response = await api.get('/admin/subscriptions');
    console.log('✅ [ADMIN] Suscripciones obtenidas');
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo suscripciones:', error);
    // Datos de ejemplo si falla
    return [];
  }
}
