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

export interface BroadcastNotificationRequest extends NotificationRequest {
  category?: string;
  only_active_users?: boolean;
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
};
