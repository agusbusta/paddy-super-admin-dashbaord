import { api } from './api';
import { Admin, CreateAdminData, UpdateAdminData, AdminsResponse, AdminResponse } from '../types/admin';

export const adminService = {
  getAdmins: async (): Promise<Admin[]> => {
    const response = await api.get<AdminsResponse>('/users/admins');
    return response.data.admins || [];
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
}; 