import { api } from './api';

export interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  phone?: string;
  is_profile_complete: boolean;
  category?: string;
  gender?: string;
  height?: number;
  is_active?: boolean;
  is_admin?: boolean;
  is_super_admin?: boolean;
  club_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdate {
  name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category?: string;
  gender?: string;
  height?: number;
  is_active?: boolean;
  dominant_hand?: string;
  preferred_side?: string;
  preferred_court_type?: string;
  city?: string;
  province?: string;
  level?: string;
}

export interface UsersResponse {
  success?: boolean;
  data?: User[];
}

export interface UserResponse {
  success?: boolean;
  data?: User;
}

export const userService = {
  getUsers: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<User[]> => {
    try {
      const response = await api.get<any>('/users/', { params });
      console.log('🔍 Users response:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('✅ Returning array of users:', response.data.length);
        return response.data;
      }
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
        console.log('✅ Returning wrapped array of users:', response.data.data.length);
        return response.data.data;
      }
      
      console.warn('⚠️ Unexpected users response format');
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
      }
      return [];
    }
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },

  getUserReservations: async (userId: number): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/bookings/', {
        params: { user_id: userId, limit: 1000 },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ Error fetching user reservations:', error);
      return [];
    }
  },
};

