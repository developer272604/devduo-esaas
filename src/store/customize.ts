import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEY_PREFIX, browserStorage } from '@/lib/storage';
import { IMAGE_BUDGET } from '@/lib/constants';
import { isImageData, persistedState, sanitizeImages, sanitizeTexts } from '@/lib/sanitize';

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
  /** Saves a replacement image. Returns false when it is not inline raster data or would exceed the storage budget. */
  setImage: (tpl: string, slot: string, url: string) => boolean;
  clearImage: (tpl: string, slot: string) => void;
  /** Forget every edit for one template. */
  resetTemplate: (tpl: string) => void;
  requestImage: (slot: string) => void;
};

/** Characters of replacement images already stored, across all templates. */
export const imageChars = (images: Bag): number => Object.values(images).reduce((a, bag) => a + Object.values(bag).reduce((b, v) => b + v.length, 0), 0);

/** Would saving `url` into `slot` keep the images within IMAGE_BUDGET? A replaced image frees its old space. */
export const fitsBudget = (images: Bag, tpl: string, slot: string, url: string): boolean =>
  imageChars(images) - (images[tpl]?.[slot]?.length ?? 0) + url.length <= IMAGE_BUDGET;

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
      setImage: (tpl, slot, url) => {
        if (!isImageData(url) || !fitsBudget(get().images, tpl, slot, url)) return false;
        set({ images: put(get().images, tpl, slot, url) });
        return true;
      },
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
      storage: createJSONStorage(browserStorage),
      partialize: (s) => ({ texts: s.texts, images: s.images }),
      merge: (persisted, current) => {
        const p = persistedState(persisted);
        return { ...current, texts: sanitizeTexts(p.texts), images: sanitizeImages(p.images) };
      },
    },
  ),
);

/** How many edits a template has, for the reset button. */
export const editCount = (s: Pick<CustomizeStore, 'texts' | 'images'>, tpl: string): number =>
  Object.keys(s.texts[tpl] ?? {}).length + Object.keys(s.images[tpl] ?? {}).length;
