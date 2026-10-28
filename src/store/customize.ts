import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { KEY_PREFIX, safeStorage } from '@/lib/storage';
import { useUiStore } from './ui';

export const CUSTOM_KEY = KEY_PREFIX + 'custom';

type Bag = Record<string, Record<string, string>>;

type CustomizeStore = {
  /** Edited text, by template id then slot id. Kept apart from the theme, so a theme change never touches it. */
  texts: Bag;
  /** Replacement images (data URLs), by template id then slot id. */
  images: Bag;
  /** Edit mode. Not persisted. */
  editing: boolean;
  /** Set when an image slot wants the file picker. Not persisted. */
  pick: { slot: string; nonce: number } | null;
  setEditing: (on: boolean) => void;
  setText: (tpl: string, id: string, value: string) => void;
  clearText: (tpl: string, id: string) => void;
  setImage: (tpl: string, slot: string, url: string) => void;
  clearImage: (tpl: string, slot: string) => void;
  /** Forget every edit for one template. */
  resetTemplate: (tpl: string) => void;
  requestImage: (slot: string) => void;
};

/** localStorage with a loud failure: a full browser quota would otherwise lose an image on refresh without a word. */
const quotaAwareStorage: StateStorage = {
  getItem: (n) => safeStorage.getItem(n),
  removeItem: (n) => safeStorage.removeItem(n),
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      useUiStore.getState().showToast('Browser storage is full, so this edit will be lost on refresh. Remove an image to free space.');
    }
  },
};

const put = (bag: Bag, tpl: string, key: string, value: string): Bag => ({ ...bag, [tpl]: { ...(bag[tpl] ?? {}), [key]: value } });
const drop = (bag: Bag, tpl: string, key: string): Bag => {
  const inner = { ...(bag[tpl] ?? {}) };
  delete inner[key];
  return { ...bag, [tpl]: inner };
};

export const useCustomize = create<CustomizeStore>()(
  persist(
    (set, get) => ({
      texts: {},
      images: {},
      editing: false,
      pick: null,
      setEditing: (editing) => set({ editing }),
      setText: (tpl, id, value) => set({ texts: put(get().texts, tpl, id, value) }),
      clearText: (tpl, id) => set({ texts: drop(get().texts, tpl, id) }),
      setImage: (tpl, slot, url) => set({ images: put(get().images, tpl, slot, url) }),
      clearImage: (tpl, slot) => set({ images: drop(get().images, tpl, slot) }),
      resetTemplate: (tpl) => {
        const texts = { ...get().texts };
        const images = { ...get().images };
        delete texts[tpl];
        delete images[tpl];
        set({ texts, images });
      },
      requestImage: (slot) => set({ pick: { slot, nonce: (get().pick?.nonce ?? 0) + 1 } }),
    }),
    {
      name: CUSTOM_KEY,
      storage: createJSONStorage(() => quotaAwareStorage),
      partialize: (s) => ({ texts: s.texts, images: s.images }),
    },
  ),
);

/** How many edits a template has, for the reset button. */
export const editCount = (s: Pick<CustomizeStore, 'texts' | 'images'>, tpl: string): number =>
  Object.keys(s.texts[tpl] ?? {}).length + Object.keys(s.images[tpl] ?? {}).length;
