import client, { extractApiResponse } from './client';
import { ApiResponse } from '@/types/api';
import { Review } from '@/types/review';
import { PageResponse, PageParams } from '@/types/api';
import { AxiosResponse } from 'axios';

export const reviewApi = {
  createReview: async (data: {
    restaurantId: number;
    orderId?: number;
    rating: number;
    content: string;
    images?: string;
  }): Promise<Review> => {
    const response: AxiosResponse<ApiResponse<Review>> = await client.post('/reviews', data);
    return extractApiResponse(response);
  },

  getRestaurantReviews: async (restaurantId: number, params?: PageParams): Promise<PageResponse<Review>> => {
    const response: AxiosResponse<ApiResponse<PageResponse<Review>>> = await client.get(
      `/restaurants/${restaurantId}/reviews`,
      { params }
    );
    return extractApiResponse(response);
  },

  updateReview: async (id: number, data: { rating: number; content: string; images?: string }): Promise<Review> => {
    const response: AxiosResponse<ApiResponse<Review>> = await client.put(`/reviews/${id}`, data);
    return extractApiResponse(response);
  },

  deleteReview: async (id: number): Promise<void> => {
    await client.delete(`/reviews/${id}`);
  },

  replyReview: async (id: number, reply: string): Promise<Review> => {
    const response: AxiosResponse<ApiResponse<Review>> = await client.put(`/reviews/${id}/reply`, { reply });
    return extractApiResponse(response);
  },
};
