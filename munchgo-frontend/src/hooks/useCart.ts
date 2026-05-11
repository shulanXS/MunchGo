import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cartStore';
import { cartApi } from '@/api/cart';
import { CartItemRequest } from '@/types/cart';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

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

  const addItemMutation = useMutation({
    mutationFn: (data: CartItemRequest) => cartApi.addItem(data),
    onSuccess: (newCart) => {
      setCart(newCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toastSuccess('已添加到购物车');
    },
    onError: () => {
      toastError('添加失败，请重试');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CartItemRequest }) =>
      cartApi.updateItem(id, data),
    onSuccess: (newCart) => {
      setCart(newCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: number) => cartApi.removeItem(id),
    onSuccess: (newCart) => {
      setCart(newCart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      setCart(null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toastSuccess('购物车已清空');
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
    (itemId: number, quantity: number, menuItemId: number) => {
      updateItemMutation.mutate({ id: itemId, data: { menuItemId, quantity } });
    },
    [updateItemMutation]
  );

  const removeItem = useCallback(
    (itemId: number, menuItemId?: number) => {
      const id = itemId || menuItemId;
      if (id) removeItemMutation.mutate(id);
    },
    [removeItemMutation]
  );

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const displayCart = serverCart || cart;

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
