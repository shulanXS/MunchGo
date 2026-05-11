import client, { extractApiResponse } from './client';
import { MenuItem } from '@/types/restaurant';
import { Category } from '@/types/menu';

export const menuItemApi = {
  createMenuItem: async (restaurantId: number, data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: number;
    imageUrl?: string;
    tags?: string;
    available?: boolean;
  }): Promise<MenuItem> => {
    const response = await client.post(`/restaurants/${restaurantId}/menu-items`, data);
    return extractApiResponse(response);
  },

  updateMenuItem: async (id: number, data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: number;
    imageUrl?: string;
    tags?: string;
    available?: boolean;
  }): Promise<MenuItem> => {
    const response = await client.put(`/menu-items/${id}`, data);
    return extractApiResponse(response);
  },

  updateMenuItemStatus: async (id: number, available: boolean): Promise<MenuItem> => {
    const response = await client.put(`/menu-items/${id}/available`, { available });
    return extractApiResponse(response);
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    await client.delete(`/menu-items/${id}`);
  },

  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await client.get(`/menu-items/${id}`);
    return extractApiResponse(response);
  },

  createCategory: async (restaurantId: number, data: {
    name: string;
    sortOrder?: number;
  }): Promise<Category> => {
    const response = await client.post(`/restaurants/${restaurantId}/categories`, data);
    return extractApiResponse(response);
  },

  updateCategory: async (id: number, data: {
    name: string;
    sortOrder?: number;
  }): Promise<Category> => {
    const response = await client.put(`/categories/${id}`, data);
    return extractApiResponse(response);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await client.delete(`/categories/${id}`);
  },
};
