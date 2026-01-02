import { api } from './api';

export interface PregameTurn {
  id: number;
  turn_id: number;
  court_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'AVAILABLE' | 'PENDING' | 'READY_TO_PLAY' | 'CANCELLED' | 'COMPLETED';
  cancellation_message?: string;
  club_id?: number;
  club_name?: string;
  created_at?: string;
}

export interface PregameTurnFilters {
  skip?: number;
  limit?: number;
  club_id?: number;
  date?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export const pregameTurnService = {
  getPregameTurns: async (filters?: PregameTurnFilters): Promise<PregameTurn[]> => {
    try {
      // Necesitamos crear un endpoint en el backend para super admins
      // Por ahora retornamos array vacío
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching pregame turns:', error);
      return [];
    }
  },

  getCancellationRate: async (startDate?: string, endDate?: string): Promise<{
    total: number;
    cancelled: number;
    rate: number;
  }> => {
    try {
      // Necesitamos crear un endpoint en el backend
      return { total: 0, cancelled: 0, rate: 0 };
    } catch (error: any) {
      console.error('❌ Error fetching cancellation rate:', error);
      return { total: 0, cancelled: 0, rate: 0 };
    }
  },

  getTurnsByDayAndClub: async (startDate?: string, endDate?: string): Promise<Array<{
    date: string;
    club_id: number;
    club_name: string;
    count: number;
  }>> => {
    try {
      // Necesitamos crear un endpoint en el backend
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching turns by day and club:', error);
      return [];
    }
  },
};
