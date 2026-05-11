import client, { extractApiResponse } from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/user';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await client.post('/auth/login', data);
    return extractApiResponse(response);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await client.post('/auth/register', data);
    return extractApiResponse(response);
  },

  logout: async (): Promise<void> => {
    const response = await client.post('/auth/logout');
    return extractApiResponse(response);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/auth/me');
    return extractApiResponse(response);
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await client.post('/auth/refresh', { refreshToken });
    return extractApiResponse(response);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await client.put('/auth/profile', data);
    return extractApiResponse(response);
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    const response = await client.post('/auth/change-password', { oldPassword, newPassword });
    return extractApiResponse(response);
  },
};
