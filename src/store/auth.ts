import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { browserStorage, KEY_PREFIX } from '@/lib/storage';
import { persistedState, sanitizeUser } from '@/lib/sanitize';

type AuthStore = { user: User | null; signIn: (u: User) => void; signOut: () => void };

// TODO(backend): "signed in" must be a server session (HttpOnly cookie) after a real OTP check, never a value kept in
// localStorage. See docs/PRODUCTION.md.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ user: null, signIn: (user) => set({ user }), signOut: () => set({ user: null }) }),
    {
      name: KEY_PREFIX + 'auth',
      storage: createJSONStorage(browserStorage),
      merge: (persisted, current) => ({ ...current, user: sanitizeUser(persistedState(persisted).user) }),
    },
  ),
);
