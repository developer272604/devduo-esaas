import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Template, ThemeState } from '@/lib/types';
import { defaultTheme, normaliseTheme, themeFor } from '@/lib/theme';
import { persistedState, sanitizeThemes } from '@/lib/sanitize';
import { browserStorage, THEME_KEY } from '@/lib/storage';

export { THEME_KEY, defaultTheme, themeFor };

type ThemeStore = {
  /** Remembered look per template. A template with no entry uses its own default. */
  themes: Record<string, ThemeState>;
  setTheme: (t: Template, patch: Partial<ThemeState>) => void;
  resetTheme: (t: Template) => void;
};

/**
 * Persisted to localStorage. applyTheme() also caches the resolved CSS variables so
 * index.html can restore them before first paint.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themes: {},
      setTheme: (t, patch) => {
        const current = normaliseTheme(get().themes[t.id], defaultTheme(t));
        set({ themes: { ...get().themes, [t.id]: normaliseTheme({ ...current, ...patch }, defaultTheme(t)) } });
      },
      resetTheme: (t) => {
        const next = { ...get().themes };
        delete next[t.id];
        set({ themes: next });
      },
    }),
    { name: THEME_KEY, storage: createJSONStorage(browserStorage), partialize: (s) => ({ themes: s.themes }),
      merge: (persisted, current) => ({ ...current, themes: sanitizeThemes(persistedState(persisted).themes) }),
    },
  ),
);
