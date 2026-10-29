import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Order } from '@/lib/types';
import { browserStorage, KEY_PREFIX } from '@/lib/storage';
import { persistedState, sanitizeOrders } from '@/lib/sanitize';

type OrdersStore = {
  orders: Order[];
  add: (o: Order) => void;
  replace: (o: Order) => void;
};

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (o) => set({ orders: [o, ...get().orders] }),
      replace: (o) => set({ orders: get().orders.map((x) => (x.id === o.id ? o : x)) }),
    }),
    {
      name: KEY_PREFIX + 'orders',
      storage: createJSONStorage(browserStorage),
      merge: (persisted, current) => ({ ...current, orders: sanitizeOrders(persistedState(persisted).orders) }),
    },
  ),
);
