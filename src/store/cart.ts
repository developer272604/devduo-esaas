import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartLine, Coupon } from '@/lib/types';
import { browserStorage, KEY_PREFIX } from '@/lib/storage';
import { MAX_QTY, lineKey, parseLineKey } from '@/lib/pricing';
import { persistedState, sanitizeCartLines, sanitizeCoupon } from '@/lib/sanitize';

type CartStore = {
  lines: CartLine[];
  coupon: Coupon | null;
  add: (id: string, o: number, qty: number) => void;
  /** `key` is `productId|optionIndex`. Quantity below 1 removes the line. */
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setCoupon: (c: Coupon | null) => void;
  clearCoupon: () => void;
  clear: () => void;
};

const matches = (l: CartLine, key: string) => lineKey(l.id, l.o) === key;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      add: (id, o, qty) => {
        const lines = get().lines.slice();
        const i = lines.findIndex((l) => l.id === id && l.o === o);
        if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(MAX_QTY, lines[i].qty + qty) };
        else lines.push({ id, o, qty: Math.min(MAX_QTY, qty) });
        set({ lines });
      },
      setQty: (key, qty) => {
        if (qty < 1) return set({ lines: get().lines.filter((l) => !matches(l, key)) });
        set({ lines: get().lines.map((l) => (matches(l, key) ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)) });
      },
      remove: (key) => set({ lines: get().lines.filter((l) => !matches(l, key)) }),
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      clear: () => set({ lines: [], coupon: null }),
    }),
    {
      name: KEY_PREFIX + 'cart',
      storage: createJSONStorage(browserStorage),
      // Stored carts can be hand-edited or corrupt: keep only whole quantities of 1 to MAX_QTY and known coupons.
      merge: (persisted, current) => {
        const p = persistedState(persisted);
        return { ...current, lines: sanitizeCartLines(p.lines), coupon: sanitizeCoupon(p.coupon) };
      },
    },
  ),
);

export { parseLineKey, lineKey };
export const cartCount = (lines: CartLine[]): number => lines.reduce((a, l) => a + l.qty, 0);
