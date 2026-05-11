import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MerchantState {
  currentRestaurantId: number | null;
  setCurrentRestaurant: (id: number | null) => void;
}

export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      currentRestaurantId: null,
      setCurrentRestaurant: (id) => set({ currentRestaurantId: id }),
    }),
    {
      name: 'munchgo-merchant',
    }
  )
);
