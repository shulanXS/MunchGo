import client, { extractApiResponse } from './client';
import { Cart, CartItemRequest } from '@/types/cart';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await client.get('/cart');
    return extractApiResponse(response);
  },

  addItem: async (data: CartItemRequest): Promise<Cart> => {
    const response = await client.post('/cart/items', data);
    return extractApiResponse(response);
  },

  updateItem: async (id: number, data: CartItemRequest): Promise<Cart> => {
    const response = await client.put(`/cart/items/${id}`, data);
    return extractApiResponse(response);
  },

  removeItem: async (id: number): Promise<Cart> => {
    const response = await client.delete(`/cart/items/${id}`);
    return extractApiResponse(response);
  },

  clearCart: async (): Promise<void> => {
    await client.delete('/cart/clear');
  },

  getItemCount: async (): Promise<number> => {
    const response = await client.get('/cart/count');
    return extractApiResponse(response);
  },
};
