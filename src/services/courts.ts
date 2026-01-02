import { api } from './api';

export interface Court {
  id: number;
  name: string;
  description?: string;
  club_id: number;
  surface_type?: string;
  is_indoor: boolean;
  has_lighting: boolean;
  is_available: boolean;
  created_at?: string;
}

export const courtService = {
  getCourts: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Court[]> => {
    try {
      const response = await api.get<Court[]>('/courts/', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ Error fetching courts:', error);
      return [];
    }
  },

  getCourtById: async (id: number): Promise<Court> => {
    const response = await api.get<Court>(`/courts/${id}`);
    return response.data;
  },

  getCourtsByClub: async (clubId: number): Promise<Court[]> => {
    try {
      const allCourts = await courtService.getCourts({ limit: 10000 });
      return allCourts.filter((court) => court.club_id === clubId);
    } catch (error: any) {
      console.error('❌ Error fetching courts by club:', error);
      return [];
    }
  },
};
