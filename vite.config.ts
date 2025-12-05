import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` (development or production)
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    publicDir: 'public',
    server: {
      // Ajusta el puerto para coincidir con el que estás usando (5174 según el error mostrado)
      port: 5174,
      proxy: {
        '/auth': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/animals': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/stables': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/campaigns': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/health': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/milk': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/weights': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/analytics': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/reports': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        },
        '/assistant': {
          target: env.VITE_API_GATEWAY_URL || 'http://98.92.31.103:8080',
          changeOrigin: true
        }
      }
    }
  };
});