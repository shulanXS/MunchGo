import client, { extractApiResponse } from './client';
import { Restaurant } from '@/types/restaurant';
import { PageResponse } from '@/types/api';

export const favoriteApi = {
  getFavorites: async (): Promise<Restaurant[]> => {
    const response = await client.get('/favorites');
    return extractApiResponse(response);
  },

  toggleFavorite: async (restaurantId: number): Promise<boolean> => {
    try {
      await client.post('/favorites', { restaurantId });
      return true;
    } catch {
      await client.delete(`/favorites/${restaurantId}`);
      return false;
    }
  },

  checkFavorite: async (restaurantId: number): Promise<boolean> => {
    const response = await client.get(`/favorites/check/${restaurantId}`);
    return extractApiResponse(response);
  },
};
