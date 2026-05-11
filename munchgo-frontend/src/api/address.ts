import client, { extractApiResponse } from './client';
import { Address } from '@/types/address';

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await client.get('/addresses');
    return extractApiResponse(response);
  },

  createAddress: async (data: { label: string; detail: string; latitude?: number; longitude?: number }): Promise<Address> => {
    const response = await client.post('/addresses', data);
    return extractApiResponse(response);
  },

  updateAddress: async (id: number, data: { label: string; detail: string; latitude?: number; longitude?: number }): Promise<Address> => {
    const response = await client.put(`/addresses/${id}`, data);
    return extractApiResponse(response);
  },

  deleteAddress: async (id: number): Promise<void> => {
    await client.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await client.put(`/addresses/${id}/default`);
  },
};
