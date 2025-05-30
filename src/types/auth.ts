export interface User {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  phone?: string | null;
  created_at: string;
  overall_rating?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
} 