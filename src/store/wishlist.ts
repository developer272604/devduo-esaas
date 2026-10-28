import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { browserStorage, KEY_PREFIX } from '@/lib/storage';

type WishlistStore = {
  ids: string[];
  /** Returns true when the product was added, false when it was removed. */
  toggle: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !has;
      },
      add: (id) => {
        if (!get().ids.includes(id)) set({ ids: [...get().ids, id] });
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
    }),
    { name: KEY_PREFIX + 'wishlist', storage: createJSONStorage(browserStorage) },
  ),
);
