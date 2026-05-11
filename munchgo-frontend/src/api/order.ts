import client, { extractApiResponse } from './client';
import { Order, CreateOrderRequest } from '@/types/order';
import { PageParams, PageResponse } from '@/types/api';
import { OrderStatus } from '@/types/enums';

export const orderApi = {
  getOrders: async (params?: PageParams & { status?: OrderStatus; role?: string }): Promise<PageResponse<Order>> => {
    const response = await client.get('/orders', { params });
    return extractApiResponse(response);
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await client.get(`/orders/${id}`);
    return extractApiResponse(response);
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await client.post('/orders', data);
    return extractApiResponse(response);
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const response = await client.put(`/orders/${id}/status`, { status });
    return extractApiResponse(response);
  },

  cancelOrder: async (id: number): Promise<Order> => {
    const response = await client.put(`/orders/${id}/cancel`);
    return extractApiResponse(response);
  },

  getOrderStats: async (): Promise<{ total: number; pending: number; completed: number; cancelled: number }> => {
    const response = await client.get('/orders/stats');
    return extractApiResponse(response);
  },

  getRecentOrders: async (limit?: number): Promise<Order[]> => {
    const response = await client.get('/orders/recent', { params: { limit } });
    return extractApiResponse(response);
  },

  getAvailableOrders: async (params?: PageParams): Promise<PageResponse<Order>> => {
    const response = await client.get('/orders/available', { params });
    return extractApiResponse(response);
  },
};
