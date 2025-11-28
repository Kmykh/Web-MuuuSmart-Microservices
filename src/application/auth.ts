import { loginService, registerService } from '../infrastructure/authService';
import { LoginRequest, RegisterRequest, AuthResponse } from '../domain/auth';

// Application layer functions that orchestrate authentication actions

export async function loginAction(credentials: LoginRequest): Promise<AuthResponse> {
  console.log('⚙️ Ejecutando acción de login en la capa de aplicación');
  const result = await loginService(credentials);
  console.log('✅ Acción de login completada exitosamente');
  return result;
}

export async function registerAction(payload: RegisterRequest): Promise<AuthResponse> {
  console.log('⚙️ Ejecutando acción de registro en la capa de aplicación');
  const result = await registerService(payload);
  console.log('✅ Acción de registro completada exitosamente');
  return result;
}