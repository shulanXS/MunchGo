import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '@/api/restaurant';
import { PageParams } from '@/types/api';

export function useRestaurants(params?: PageParams & { keyword?: string; status?: string }) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantApi.getRestaurants(params),
  });
}

export function useRestaurant(id: number | string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantApi.getRestaurant(Number(id)),
    enabled: !!id,
  });
}

export function useRestaurantStats(id: number | string) {
  return useQuery({
    queryKey: ['restaurantStats', id],
    queryFn: () => restaurantApi.getStats(Number(id)),
    enabled: !!id,
  });
}
