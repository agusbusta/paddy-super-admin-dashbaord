import { api } from './api';

export interface MatchPlayer {
  id: number;
  name: string;
  email: string;
  gender?: string;
}

export interface Match {
  id: number;
  court_id: number;
  court_name?: string;
  club_id?: number;
  club_name?: string;
  start_time: string;
  end_time: string;
  status: string;
  score?: string;
  created_at: string;
  creator_id: number;
  creator_name?: string;
  creator_email?: string;
  players: MatchPlayer[];
}

export interface MatchFilters {
  skip?: number;
  limit?: number;
  status?: string;
  club_id?: number;
  start_date?: string;
  end_date?: string;
}

export const matchService = {
  getMatches: async (filters?: MatchFilters): Promise<Match[]> => {
    try {
      const response = await api.get<Match[]>('/matches/', { params: filters });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ Error fetching matches:', error);
      return [];
    }
  },

  getMatchById: async (id: number): Promise<Match> => {
    const response = await api.get<Match>(`/matches/${id}`);
    return response.data;
  },
};
