import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Saltar la advertencia de ngrok
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔑 Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.warn(`⚠️ No token found for request: ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, error.response?.status, error.response?.data);
    
    // Solo redirigir a login si no estamos en una página que requiera autenticación
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // No redirigir si ya estamos en login o si es una llamada desde el dashboard
      if (currentPath !== '/login' && !currentPath.includes('/dashboard')) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
); 