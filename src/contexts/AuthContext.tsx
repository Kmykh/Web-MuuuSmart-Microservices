import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAction, registerAction } from '../application/auth';
import { LoginRequest, RegisterRequest } from '../domain/auth';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: (reason?: 'manual' | 'expired') => void;
  sessionExpiredReason: 'expired' | null;
  clearSessionExpiredReason: () => void;
  showWelcomeNotification: boolean;
  clearWelcomeNotification: () => void;
  isNewUser: boolean;
  clearNewUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoading: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (_payload: LoginRequest) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  register: async (_payload: RegisterRequest) => {},
  logout: () => {},
  sessionExpiredReason: null,
  clearSessionExpiredReason: () => {},
  showWelcomeNotification: false,
  clearWelcomeNotification: () => {},
  isNewUser: false,
  clearNewUser: () => {}
});

// Helper para decodificar JWT y obtener exp
const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convertir a ms
  } catch {
    return null;
  }
};

// Helper para verificar si el token está expirado
const isTokenExpired = (token: string): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  return Date.now() >= exp;
};

// Inicializar token desde localStorage de forma síncrona
// NO marcamos sessionExpiredReason aquí porque es la carga inicial
const getInitialToken = (): string | null => {
  const storedToken = localStorage.getItem('token');
  if (storedToken && !isTokenExpired(storedToken)) {
    return storedToken;
  }
  if (storedToken) {
    localStorage.removeItem('token'); // Limpiar token expirado silenciosamente
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializar token de forma síncrona para evitar flash
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoading, setIsLoading] = useState(false);
  // sessionExpiredReason solo se activa cuando expira DURANTE la sesión activa
  const [sessionExpiredReason, setSessionExpiredReason] = useState<'expired' | null>(null);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback((reason: 'manual' | 'expired' = 'manual') => {
    console.log(`🚪 Cerrando sesión... Razón: ${reason}`);
    setToken(null);
    localStorage.removeItem('token');
    
    if (reason === 'expired') {
      setSessionExpiredReason('expired');
      console.log('⏰ Sesión expirada, redirigiendo a login...');
    }
    
    navigate('/login', { replace: true });
    console.log('✅ Sesión cerrada, token eliminado');
  }, [navigate]);

  // Verificar token periódicamente y configurar listeners
  useEffect(() => {
    if (token) {
      console.log('🔐 Token válido encontrado');
      
      // Configurar verificación periódica cada 30 segundos
      const checkExpiration = () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken && isTokenExpired(currentToken)) {
          logout('expired');
        }
      };
      
      const intervalId = setInterval(checkExpiration, 30000);
      
      // También verificar cuando la pestaña vuelve a tener foco
      const handleFocus = () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken && isTokenExpired(currentToken)) {
          logout('expired');
        }
      };
      
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [token, logout]);

  // Interceptar errores 401/403 globalmente
  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      console.log('🚫 Error de autorización detectado:', event.detail);
      logout('expired');
    };
    
    window.addEventListener('auth:unauthorized' as any, handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized' as any, handleUnauthorized);
  }, [logout]);

  const login = async (payload: LoginRequest) => {
    console.log('🔑 Iniciando proceso de login...');
    const response = await loginAction(payload);
    console.log('✅ Login exitoso, token recibido');
    
    // Verificar que el token no esté ya expirado
    if (isTokenExpired(response.token)) {
      throw new Error('El token recibido ya está expirado');
    }
    
    setToken(response.token);
    localStorage.setItem('token', response.token);
    setShowWelcomeNotification(true); // Mostrar notificación de seguridad
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
    setIsNewUser(true); // Marcar como nuevo usuario para mostrar onboarding
    console.log('💾 Token guardado en localStorage');
    console.log('🚀 Redirigiendo a dashboard...');
    navigate('/dashboard');
  };

  const clearSessionExpiredReason = () => setSessionExpiredReason(null);
  const clearWelcomeNotification = () => setShowWelcomeNotification(false);
  const clearNewUser = () => setIsNewUser(false);

  return (
    <AuthContext.Provider value={{ 
      token, 
      isLoading,
      login, 
      register, 
      logout, 
      sessionExpiredReason, 
      clearSessionExpiredReason,
      showWelcomeNotification,
      clearWelcomeNotification,
      isNewUser,
      clearNewUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);