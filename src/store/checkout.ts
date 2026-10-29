import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CheckoutForm } from '@/lib/types';
import { browserStorage, KEY_PREFIX } from '@/lib/storage';
import { persistedState, sanitizeCheckout } from '@/lib/sanitize';

export const emptyCheckout: CheckoutForm = {
  name: '', phone: '', addr: '', city: '', pin: '', state: '',
  ship: 'std', pay: 'upi', upi: '', card: '', exp: '', cvv: '',
};

type CheckoutStore = { form: CheckoutForm; set: (patch: Partial<CheckoutForm>) => void; reset: () => void };

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      form: emptyCheckout,
      set: (patch) => set({ form: { ...get().form, ...patch } }),
      reset: () => set({ form: emptyCheckout }),
    }),
    {
      name: KEY_PREFIX + 'checkout',
      storage: createJSONStorage(browserStorage),
      // Card details are never written to storage.
      partialize: (s) => ({ form: { ...s.form, card: '', exp: '', cvv: '' } }),
      merge: (persisted, current) => ({ ...current, form: sanitizeCheckout(persistedState(persisted).form, emptyCheckout) }),
    },
  ),
);
