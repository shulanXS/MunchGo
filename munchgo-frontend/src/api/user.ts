import client, { extractApiResponse } from './client';
import { ApiResponse } from '@/types/api';
import { User } from '@/types/user';
import { PageResponse, PageParams } from '@/types/api';
import { AxiosResponse } from 'axios';

export const userApi = {
  getUser: async (id: number): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await client.get(`/users/${id}`);
    return extractApiResponse(response);
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await client.put(`/users/${id}`, data);
    return extractApiResponse(response);
  },

  changePassword: async (id: number, oldPassword: string, newPassword: string): Promise<void> => {
    await client.put(`/users/${id}/password`, { oldPassword, newPassword });
  },

  getAllUsers: async (params?: PageParams): Promise<PageResponse<User>> => {
    const response: AxiosResponse<ApiResponse<PageResponse<User>>> = await client.get('/users', { params });
    return extractApiResponse(response);
  },

  deleteUser: async (id: number): Promise<void> => {
    await client.delete(`/users/${id}`);
  },
};
