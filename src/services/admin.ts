import { api } from './api';
import { Admin, CreateAdminData, UpdateAdminData, AdminsResponse, AdminResponse } from '../types/admin';

export const adminService = {
  getAdmins: async (): Promise<Admin[]> => {
    try {
      const response = await api.get<AdminsResponse>('/users/admins');
      console.log('🔍 Admins response:', response.data);
      const admins = response.data.admins || [];
      console.log('✅ Returning admins:', admins.length);
      return admins;
    } catch (error: any) {
      console.error('❌ Error fetching admins:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
      }
      return [];
    }
  },

  getAdminById: async (id: number): Promise<Admin> => {
    const response = await api.get<AdminResponse>(`/users/admins/${id}`);
    return response.data.admin;
  },

  createAdmin: async (data: CreateAdminData): Promise<Admin> => {
    const response = await api.post<AdminResponse>('/users/admins', data);
    return response.data.admin;
  },

  updateAdmin: async (id: number, data: UpdateAdminData): Promise<Admin> => {
    const response = await api.put<AdminResponse>(`/users/admins/${id}`, data);
    return response.data.admin;
  },

  deleteAdmin: async (id: number): Promise<void> => {
    await api.delete(`/users/admins/${id}`);
  },

  toggleAdminStatus: async (id: number): Promise<Admin> => {
    const response = await api.patch<AdminResponse>(`/users/admins/${id}/toggle-status`);
    return response.data.admin;
  },

  getSuperAdmins: async (): Promise<any[]> => {
    try {
      const response = await api.get<{ super_admins: any[] }>('/users/super-admins');
      return response.data.super_admins || [];
    } catch (error: any) {
      console.error('❌ Error fetching super admins:', error);
      return [];
    }
  },
}; 