import client, { extractApiResponse } from './client';
import { ApiResponse } from '@/types/api';
import { Address } from '@/types/address';
import { AxiosResponse } from 'axios';

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const response: AxiosResponse<ApiResponse<Address[]>> = await client.get('/addresses');
    return extractApiResponse(response);
  },

  createAddress: async (data: Partial<Address>): Promise<Address> => {
    const response: AxiosResponse<ApiResponse<Address>> = await client.post('/addresses', data);
    return extractApiResponse(response);
  },

  updateAddress: async (id: number, data: Partial<Address>): Promise<Address> => {
    const response: AxiosResponse<ApiResponse<Address>> = await client.put(`/addresses/${id}`, data);
    return extractApiResponse(response);
  },

  deleteAddress: async (id: number): Promise<void> => {
    await client.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await client.put(`/addresses/${id}/default`);
  },
};
