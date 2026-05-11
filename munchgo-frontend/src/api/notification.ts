import client, { extractApiResponse } from './client';
import { ApiResponse } from '@/types/api';
import { PageResponse, PageParams } from '@/types/api';
import { AxiosError, AxiosResponse } from 'axios';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (params?: PageParams): Promise<PageResponse<Notification>> => {
    const response: AxiosResponse<ApiResponse<PageResponse<Notification>>> = await client.get('/notifications', {
      params,
    });
    return extractApiResponse(response);
  },

  markAsRead: async (id: number): Promise<void> => {
    await client.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await client.put('/notifications/read-all');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await client.delete(`/notifications/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response: AxiosResponse<ApiResponse<{ count: number }>> = await client.get('/notifications/unread-count');
      const result = extractApiResponse(response);
      return result?.count ?? 0;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return 0;
      }
      throw error;
    }
  },
};
