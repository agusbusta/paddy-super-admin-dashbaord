import { api } from './api';
import { LoginCredentials, AuthResponse, User } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');

    const response = await api.post<{ access_token: string; token_type: string }>('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Guardar el token
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);

    // Obtener perfil del usuario
    const userResponse = await api.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${response.data.access_token}` },
    });

    // Guardar datos del usuario
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data));

    return {
      ...response.data,
      user: userResponse.data,
    };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser: async (): Promise<User> => {
    // Primero intentamos obtener del localStorage
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      return JSON.parse(userStr);
    }

    // Si no está en localStorage, lo solicitamos
    const response = await api.get<User>('/auth/me');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    return response.data;
  },
}; 