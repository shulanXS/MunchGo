import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cartStore';
import { cartApi } from '@/api/cart';
import { CartItemRequest } from '@/types/cart';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { Cart } from '@/types/cart';

export function useCart() {
  const { isAuthenticated } = useAuth();
  const { cart, setCart, isDrawerOpen, openDrawer, closeDrawer } = useCartStore();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const queryClient = useQueryClient();

  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated,
  });

  const syncCart = useCallback((newCart: Cart | null) => {
    setCart(newCart);
    queryClient.setQueryData(['cart'], newCart);
  }, [setCart, queryClient]);

  const addItemMutation = useMutation({
    mutationFn: (data: CartItemRequest) => cartApi.addItem(data),
    onSuccess: (newCart) => {
      syncCart(newCart);
      toastSuccess('已添加到购物车');
    },
    onError: () => {
      toastError('添加失败，请重试');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      cartApi.updateItem(id, { quantity }),
    onSuccess: (newCart) => {
      syncCart(newCart);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: number) => cartApi.removeItem(id),
    onSuccess: (newCart) => {
      syncCart(newCart);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      syncCart(null);
      toastSuccess('购物车已清空');
    },
    onError: () => {
      toastError('清空失败，请重试');
    },
  });

  const addItem = useCallback(
    (menuItemId: number, quantity: number = 1) => {
      if (!isAuthenticated) {
        toastWarning('请先登录');
        return;
      }
      addItemMutation.mutate({ menuItemId, quantity });
    },
    [addItemMutation, isAuthenticated, toastWarning]
  );

  const updateItem = useCallback(
    (cartItemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItemMutation.mutate(cartItemId);
        return;
      }
      updateItemMutation.mutate({ id: cartItemId, quantity });
    },
    [updateItemMutation, removeItemMutation]
  );

  const removeItem = useCallback(
    (cartItemId: number) => {
      if (cartItemId) removeItemMutation.mutate(cartItemId);
    },
    [removeItemMutation]
  );

  const clearCart = useCallback(
    async () => {
      try {
        await clearCartMutation.mutateAsync();
      } catch {
        // error handled by onError
      }
    },
    [clearCartMutation]
  );

  const displayCart = serverCart ?? cart;

  return {
    cart: displayCart,
    isLoading,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    totalItems: displayCart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    totalAmount: displayCart?.totalAmount ?? 0,
  };
}
