import { api } from './api';

export interface NotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  sent_count: number;
  failed_count: number;
}

export interface BroadcastHistoryItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: {
    from_admin?: string;
    admin_name?: string;
    category?: string;
    only_active_users?: boolean;
    target_users_count?: number;
    users_with_tokens?: number;
    sent_count?: number;
    failed_count?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface BroadcastNotificationRequest extends NotificationRequest {
  category?: string;
  only_active_users?: boolean;
}

export interface BroadcastHistoryFilters {
  skip?: number;
  limit?: number;
  category?: string;
  start_date?: string;
  end_date?: string;
  admin_id?: number;
}

export const notificationService = {
  sendBroadcast: async (data: BroadcastNotificationRequest): Promise<NotificationResponse> => {
    const { category, only_active_users = true, ...notification } = data;
    const params: any = {};
    
    if (category) {
      params.category = category;
    }
    if (only_active_users !== undefined) {
      params.only_active_users = only_active_users;
    }

    const response = await api.post<NotificationResponse>(
      '/notifications/send-broadcast',
      notification,
      { params }
    );
    return response.data;
  },

  sendToUser: async (userId: number, notification: NotificationRequest): Promise<NotificationResponse> => {
    const response = await api.post<NotificationResponse>(
      `/notifications/send-to-user/${userId}`,
      notification
    );
    return response.data;
  },

  getBroadcastHistory: async (params?: BroadcastHistoryFilters): Promise<BroadcastHistoryItem[]> => {
    const response = await api.get<BroadcastHistoryItem[]>(
      '/notifications/broadcast-history',
      { params }
    );
    return response.data;
  },
};
