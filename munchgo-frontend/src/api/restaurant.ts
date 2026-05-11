import client, { extractApiResponse } from './client';
import { Restaurant, MenuItem } from '@/types/restaurant';
import { Category } from '@/types/menu';
import { RestaurantStatus } from '@/types/enums';
import { PageParams, PageResponse } from '@/types/api';

export const restaurantApi = {
  getRestaurants: async (params?: PageParams & { keyword?: string; status?: string }): Promise<PageResponse<Restaurant>> => {
    const response = await client.get('/restaurants', { params });
    return extractApiResponse(response);
  },

  getRestaurant: async (id: number): Promise<Restaurant> => {
    const response = await client.get(`/restaurants/${id}`);
    return extractApiResponse(response);
  },

  getStats: async (id: number): Promise<{ totalOrders: number; totalRevenue: number; avgRating: number; todayOrders: number }> => {
    const response = await client.get(`/restaurants/${id}/stats`);
    return extractApiResponse(response);
  },

  getCategories: async (restaurantId: number): Promise<Category[]> => {
    const response = await client.get(`/restaurants/${restaurantId}/categories`);
    return extractApiResponse(response);
  },

  getMenuItems: async (restaurantId: number, params?: PageParams): Promise<PageResponse<MenuItem>> => {
    const response = await client.get(`/restaurants/${restaurantId}/menu-items`, { params });
    return extractApiResponse(response);
  },

  getMenu: async (restaurantId: number): Promise<MenuItem[]> => {
    const response = await client.get(`/restaurants/${restaurantId}/menu-items`);
    const data = extractApiResponse<{ content: MenuItem[] }>(response);
    return data.content || [];
  },

  searchRestaurants: async (keyword: string): Promise<Restaurant[]> => {
    const response = await client.get('/restaurants/search', { params: { keyword } });
    return extractApiResponse(response);
  },

  getNearbyRestaurants: async (lat: number, lng: number, radius?: number): Promise<Restaurant[]> => {
    const response = await client.get('/restaurants/nearby', { params: { lat, lng, radius } });
    return extractApiResponse(response);
  },

  getMyRestaurants: async (): Promise<Restaurant[]> => {
    const response = await client.get('/restaurants/my');
    return extractApiResponse(response);
  },

  createRestaurant: async (data: {
    name: string;
    description?: string;
    address: string;
    phone?: string;
    cuisineType?: string;
    imageUrl?: string;
    minOrderAmount?: number;
    deliveryFee?: number;
  }): Promise<Restaurant> => {
    const response = await client.post('/restaurants', data);
    return extractApiResponse(response);
  },

  updateRestaurant: async (id: number, data: {
    name: string;
    description?: string;
    address: string;
    phone?: string;
    cuisineType?: string;
    imageUrl?: string;
    minOrderAmount?: number;
    deliveryFee?: number;
  }): Promise<Restaurant> => {
    const response = await client.put(`/restaurants/${id}`, data);
    return extractApiResponse(response);
  },

  updateRestaurantStatus: async (id: number, status: RestaurantStatus): Promise<Restaurant> => {
    const response = await client.put(`/restaurants/${id}/status`, { status });
    return extractApiResponse(response);
  },

  deleteRestaurant: async (id: number): Promise<void> => {
    await client.delete(`/restaurants/${id}`);
  },
};
