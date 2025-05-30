export interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  club_id?: number | null;
  club_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  role: 'admin';
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  club_id?: number | null;
}

export interface UpdateAdminData {
  name: string;
  email: string;
  phone?: string | null;
  club_id?: number | null;
  is_active: boolean;
}

export interface AdminsResponse {
  admins: Admin[];
}

export interface AdminResponse {
  admin: Admin;
} 