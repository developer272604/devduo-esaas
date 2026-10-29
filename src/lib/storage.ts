import type { StateStorage } from 'zustand/middleware';

export const KEY_PREFIX = 'devduo.';
export const TEMPLATE_KEY = KEY_PREFIX + 'template';
export const THEME_KEY = KEY_PREFIX + 'theme';
/** Last applied CSS variables, read by the inline script in index.html so the first paint already has the right look. */
export const THEME_VARS_KEY = KEY_PREFIX + 'themevars';

let quotaHandler: (() => void) | null = null;
let quotaReported = false;
/** Registers what to do when the browser refuses a write (storage full). Called once per episode. */
export const setQuotaHandler = (fn: (() => void) | null): void => {
  quotaHandler = fn;
};

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
      quotaReported = false;
    } catch {
      // Storage is blocked or full: the app keeps working in memory, but say so once.
      if (!quotaReported) {
        quotaReported = true;
        quotaHandler?.();
      }
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
