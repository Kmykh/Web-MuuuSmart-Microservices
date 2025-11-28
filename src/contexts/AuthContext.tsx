import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAction, registerAction } from '../application/auth';
import { LoginRequest, RegisterRequest } from '../domain/auth';

interface AuthContextType {
  token: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (_payload: LoginRequest) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  register: async (_payload: RegisterRequest) => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('🔐 Token encontrado en localStorage');
      setToken(storedToken);
    } else {
      console.log('ℹ️ No hay token almacenado');
    }
  }, []);

  const login = async (payload: LoginRequest) => {
    console.log('🔑 Iniciando proceso de login...');
    const response = await loginAction(payload);
    console.log('✅ Login exitoso, token recibido');
    setToken(response.token);
    localStorage.setItem('token', response.token);
    console.log('💾 Token guardado en localStorage');
    console.log('🚀 Redirigiendo a dashboard...');
    navigate('/dashboard');
  };

  const register = async (payload: RegisterRequest) => {
    console.log('📝 Iniciando proceso de registro...');
    const response = await registerAction(payload);
    console.log('✅ Registro exitoso, token recibido');
    setToken(response.token);
    localStorage.setItem('token', response.token);
    console.log('💾 Token guardado en localStorage');
    console.log('🚀 Redirigiendo a dashboard...');
    navigate('/dashboard');
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    setToken(null);
    localStorage.removeItem('token');
    console.log('✅ Sesión cerrada, token eliminado');
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);