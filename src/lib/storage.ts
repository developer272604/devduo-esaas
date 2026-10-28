import type { StateStorage } from 'zustand/middleware';

export const KEY_PREFIX = 'vilvad2c.';
export const TEMPLATE_KEY = KEY_PREFIX + 'template';
export const THEME_KEY = KEY_PREFIX + 'theme';
/** Last applied CSS variables, read by the inline script in index.html so the first paint already has the right look. */
export const THEME_VARS_KEY = KEY_PREFIX + 'themevars';

const noopStorage: StateStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

/** localStorage that never throws (private windows, blocked storage). */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* storage blocked or full: keep running in memory */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const browserStorage = (): StateStorage => (typeof window === 'undefined' ? noopStorage : safeStorage);

export const parseJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
