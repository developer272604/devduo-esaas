import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_TEMPLATE, TEMPLATES, getTemplate } from '@/templates';
import type { Template } from '@/lib/types';
import { browserStorage, TEMPLATE_KEY } from '@/lib/storage';

export { TEMPLATE_KEY };

type TemplateStore = { tpl: string; setTpl: (id: string) => void };

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      tpl: DEFAULT_TEMPLATE,
      setTpl: (id) => set({ tpl: TEMPLATES[id] ? id : DEFAULT_TEMPLATE }),
    }),
    { name: TEMPLATE_KEY, storage: createJSONStorage(browserStorage), partialize: (s) => ({ tpl: s.tpl }) },
  ),
);

/** The active template object. */
export const useTemplate = (): Template => getTemplate(useTemplateStore((s) => s.tpl));
