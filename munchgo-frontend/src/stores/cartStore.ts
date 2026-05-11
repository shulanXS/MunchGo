import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '@/types/cart';

interface CartState {
  cart: Cart | null;
  isDrawerOpen: boolean;
  setCart: (cart: Cart | null) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isDrawerOpen: false,

      setCart: (cart) => set({ cart }),

      addItem: (item) => {
        const { cart } = get();
        if (!cart) {
          set({
            cart: {
              id: 0,
              userId: 0,
              restaurantId: item.restaurantId ?? 0,
              restaurantName: '',
              items: [item],
              totalAmount: item.subtotal,
            },
          });
          return;
        }
        const existingIndex = cart.items.findIndex((i) => i.menuItemId === item.menuItemId);
        let newItems: CartItem[];
        if (existingIndex >= 0) {
          newItems = cart.items.map((i, idx) =>
            idx === existingIndex
              ? { ...i, quantity: i.quantity + item.quantity, subtotal: i.price * (i.quantity + item.quantity) }
              : i
          );
        } else {
          newItems = [...cart.items, item];
        }
        const totalAmount = newItems.reduce((sum, i) => sum + i.subtotal, 0);
        set({ cart: { ...cart, items: newItems, totalAmount } });
      },

      updateItem: (itemId, quantity) => {
        const { cart } = get();
        if (!cart) return;
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        const newItems = cart.items
          .map((i) =>
            i.id === itemId || i.menuItemId === itemId
              ? { ...i, quantity, subtotal: i.price * quantity }
              : i
          )
          .filter((i) => i.quantity > 0);
        const totalAmount = newItems.reduce((sum, i) => sum + i.subtotal, 0);
        set({ cart: { ...cart, items: newItems, totalAmount } });
      },

      removeItem: (itemId) => {
        const { cart } = get();
        if (!cart) return;
        const newItems = cart.items.filter((i) => i.id !== itemId && i.menuItemId !== itemId);
        const totalAmount = newItems.reduce((sum, i) => sum + i.subtotal, 0);
        set({ cart: { ...cart, items: newItems, totalAmount } });
      },

      clearCart: () => set({ cart: null }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getTotalItems: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalAmount: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.totalAmount;
      },
    }),
    { name: 'munchgo-cart' }
  )
);
