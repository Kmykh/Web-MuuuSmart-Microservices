import api from '../api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../domain/auth';

// Service functions to interact with the authentication API

export const loginService = async (credentials: LoginRequest): Promise<AuthResponse> => {
  console.log('📡 Enviando petición de login al servidor...');
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  console.log('📨 Respuesta recibida del servidor:', response.status);
  return response.data;
};

export const registerService = async (payload: RegisterRequest): Promise<AuthResponse> => {
  console.log('📡 Enviando petición de registro al servidor...');
  const response = await api.post<AuthResponse>('/auth/register', payload);
  console.log('📨 Respuesta recibida del servidor:', response.status);
  return response.data;
};