import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '@/api/favorite';
import { useAuth } from './useAuth';
import { useUIStore } from '@/stores/uiStore';

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getFavorites(),
    enabled: isAuthenticated,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (restaurantId: number) => favoriteApi.toggleFavorite(restaurantId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      if (typeof data === 'boolean') {
        addToast({
          type: data ? 'success' : 'info',
          message: data ? '已添加到收藏' : '已取消收藏',
        });
      }
    },
    onError: () => {
      addToast({ type: 'error', message: '操作失败，请重试' });
    },
  });
}
