import { api } from './api';

export interface Club {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  is_active?: boolean;
  admin_id?: number;
  admin_name?: string;
  created_at?: string;
  updated_at?: string;
  // Horarios (si vienen del backend)
  schedule?: {
    open: string;
    close: string;
  };
}

export interface ClubCreate {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  description?: string;
  opening_time: string; // Formato "HH:MM:SS" o "HH:MM"
  closing_time: string; // Formato "HH:MM:SS" o "HH:MM"
  turn_duration_minutes?: number; // Default 90
  price_per_turn?: number; // Default 0 (en centavos)
  monday_open?: boolean;
  tuesday_open?: boolean;
  wednesday_open?: boolean;
  thursday_open?: boolean;
  friday_open?: boolean;
  saturday_open?: boolean;
  sunday_open?: boolean;
  courts_count?: number; // Número de canchas a crear (default 1)
  admin_name: string; // Nombre del administrador (se crea automáticamente)
  admin_email: string; // Email del administrador (se crea automáticamente)
}

export interface ClubUpdate {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  is_active?: boolean;
}

export interface ClubsResponse {
  success?: boolean;
  data?: Club[];
}

export interface ClubResponse {
  success?: boolean;
  data?: Club;
}

export const clubService = {
  getClubs: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Club[]> => {
    try {
      const response = await api.get<any>('/clubs/', { params });
      
      // El backend retorna un array directo
      let clubsData: any[] = [];
      if (Array.isArray(response.data)) {
        clubsData = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
        clubsData = response.data.data;
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        return [];
      }
      
      // Mapear los datos del backend al formato esperado por el frontend
      const mappedClubs: Club[] = clubsData.map((club: any) => ({
        id: club.id,
        name: club.name || '',
        address: club.address || '',
        phone: club.phone || null,
        email: club.email || null,
        logo: club.logo || null,
        is_active: club.is_active !== undefined ? club.is_active : true, // Por defecto activo si no se especifica
        admin_id: club.admin_id || null,
        admin_name: club.admin_name || null,
        created_at: club.created_at || null,
        updated_at: club.updated_at || null,
        schedule: club.opening_time && club.closing_time ? {
          open: typeof club.opening_time === 'string' ? club.opening_time : club.opening_time,
          close: typeof club.closing_time === 'string' ? club.closing_time : club.closing_time,
        } : undefined,
      }));
      
      console.log('✅ Mapped clubs:', mappedClubs.length);
      return mappedClubs;
    } catch (error: any) {
      console.error('❌ Error fetching clubs:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
      }
      return [];
    }
  },

  getClubById: async (id: number): Promise<Club> => {
    const response = await api.get<Club>(`/clubs/${id}`);
    return response.data;
  },

  searchClubs: async (query: string, params?: {
    skip?: number;
    limit?: number;
  }): Promise<Club[]> => {
    const response = await api.get<Club[]>('/clubs/search', {
      params: { q: query, ...params },
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  createClub: async (data: ClubCreate): Promise<Club> => {
    const { courts_count, ...clubData } = data;
    const params: any = {};
    if (courts_count) params.courts_count = courts_count;
    const response = await api.post<Club>('/clubs/', clubData, { params });
    return response.data;
  },

  updateClub: async (id: number, data: ClubUpdate): Promise<Club> => {
    const response = await api.put<Club>(`/clubs/${id}`, data);
    return response.data;
  },

  deleteClub: async (id: number): Promise<void> => {
    await api.delete(`/clubs/${id}`);
  },
};

