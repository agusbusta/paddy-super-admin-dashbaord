import { api } from './api';

export type PregameTurnStatus = 'PENDING' | 'READY_TO_PLAY' | 'CANCELLED' | 'COMPLETED';

export interface PregameTurn {
  id: number;
  turn_id: number;
  court_id: number;
  selected_court_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: PregameTurnStatus;
  category_restricted: string;
  category_restriction_type?: string;
  organizer_category?: string;
  is_mixed_match: string;
  free_category?: string;
  player1_id?: number;
  player2_id?: number;
  player3_id?: number;
  player4_id?: number;
  player1_side?: string;
  player1_court_position?: string;
  player2_side?: string;
  player2_court_position?: string;
  player3_side?: string;
  player3_court_position?: string;
  player4_side?: string;
  player4_court_position?: string;
  cancellation_message?: string;
  created_at?: string;
  updated_at?: string;
  // Información relacionada (si viene del backend)
  court?: {
    id: number;
    name: string;
    club_id: number;
  };
  club?: {
    id: number;
    name: string;
  };
  player1?: {
    id: number;
    name: string;
    email: string;
  };
  player2?: {
    id: number;
    name: string;
    email: string;
  };
  player3?: {
    id: number;
    name: string;
    email: string;
  };
  player4?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PregameTurnsResponse {
  success?: boolean;
  data?: PregameTurn[];
  total?: number;
}

export interface PregameTurnResponse {
  success?: boolean;
  data?: PregameTurn;
}

export const pregameTurnService = {
  // Nota: El backend actualmente no tiene un endpoint específico para super admin
  // para ver todos los turnos. Esto requeriría crear un nuevo endpoint.
  // Por ahora, podemos intentar usar el endpoint existente o crear uno nuevo.
  
  getTurnById: async (turnId: number): Promise<PregameTurn> => {
    const response = await api.get<PregameTurn>(`/pregame-turns/${turnId}`);
    return response.data;
  },

  // Endpoint para super admins: GET /pregame-turns/all
  getAllTurns: async (params?: {
    skip?: number;
    limit?: number;
    status?: PregameTurnStatus;
  }): Promise<PregameTurn[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    
    const queryString = queryParams.toString();
    const url = `/pregame-turns/all${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{
      success: boolean;
      turns: PregameTurn[];
      total: number;
      skip: number;
      limit: number;
    }>(url);
    
    return response.data.turns;
  },
};

