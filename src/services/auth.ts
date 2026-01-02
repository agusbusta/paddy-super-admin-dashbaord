import { api } from './api';
import { LoginCredentials, AuthResponse, User } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');

    const response = await api.post<{ access_token: string; token_type: string; user: any }>('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Guardar el token
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);

    // El backend ya retorna el user en la respuesta del login
    let userData: User;
    if (response.data.user) {
      userData = {
        id: parseInt(response.data.user.id),
        email: response.data.user.email,
        name: response.data.user.name || '',
        role: response.data.user.is_super_admin ? 'super_admin' : (response.data.user.is_admin ? 'admin' : 'user'),
        phone: response.data.user.phoneNumber || null,
        created_at: response.data.user.createdAt || new Date().toISOString(),
      };
    } else {
      // Si no viene en el login, obtener del endpoint /me
      const userResponse = await api.get<{ success: boolean; user: any }>('/auth/me');
      const backendUser = userResponse.data.user;
      userData = {
        id: parseInt(backendUser.id),
        email: backendUser.email,
        name: backendUser.name || '',
        role: backendUser.is_super_admin ? 'super_admin' : (backendUser.is_admin ? 'admin' : 'user'),
        phone: backendUser.phoneNumber || null,
        created_at: backendUser.createdAt || new Date().toISOString(),
      };
    }

    // Guardar datos del usuario
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: userData,
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
    const response = await api.get<{ success: boolean; user: any }>('/auth/me');
    const backendUser = response.data.user;
    const userData: User = {
      id: parseInt(backendUser.id),
      email: backendUser.email,
      name: backendUser.name || '',
      role: backendUser.is_super_admin ? 'super_admin' : (backendUser.is_admin ? 'admin' : 'user'),
      phone: backendUser.phoneNumber || null,
      created_at: backendUser.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    return userData;
  },
}; 