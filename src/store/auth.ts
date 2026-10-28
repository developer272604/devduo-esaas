import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { browserStorage, KEY_PREFIX } from '@/lib/storage';

type AuthStore = { user: User | null; signIn: (u: User) => void; signOut: () => void };

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ user: null, signIn: (user) => set({ user }), signOut: () => set({ user: null }) }),
    { name: KEY_PREFIX + 'auth', storage: createJSONStorage(browserStorage) },
  ),
);
