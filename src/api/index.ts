import axios from 'axios';

// Create an axios instance with baseURL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || ''
});

// Attach token to requests when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // Si el servidor responde 401 o 403, el token expiró o es inválido
      // Solo activar si hay un token guardado (significa que el usuario estaba autenticado)
      if ((status === 401 || status === 403) && localStorage.getItem('token')) {
        console.log('🚫 Error de autenticación detectado:', status);
        
        // Limpiar token del localStorage
        localStorage.removeItem('token');
        
        // Disparar evento personalizado para que AuthContext lo maneje
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { 
          detail: { status, message: 'Sesión expirada o no autorizada' } 
        }));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;