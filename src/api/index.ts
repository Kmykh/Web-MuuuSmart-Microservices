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

export default api;