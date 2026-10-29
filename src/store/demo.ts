import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEY_PREFIX, browserStorage } from '@/lib/storage';

export const DEMO_KEY = KEY_PREFIX + 'demo';

type DemoStore = {
  /** True once the visitor has finished or skipped the first-visit tour. */
  toured: boolean;
  /** The tour was reopened on purpose (from Settings) after being finished. */
  reopened: boolean;
  /** Escape pressed: hidden for this visit only. It returns next time because `toured` stays false. Not saved. */
  snoozed: boolean;
  startTour: () => void;
  endTour: () => void;
  snooze: () => void;
};

/** The tour is showing when the visitor has not seen it yet, or asked to see it again. */
export const useTourOpen = (): boolean => useDemoStore((s) => (!s.toured && !s.snoozed) || s.reopened);

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      toured: false,
      reopened: false,
      snoozed: false,
      startTour: () => set({ reopened: true, snoozed: false }),
      endTour: () => set({ toured: true, reopened: false, snoozed: false }),
      snooze: () => set({ snoozed: true, reopened: false }),
    }),
    { name: DEMO_KEY, storage: createJSONStorage(browserStorage), partialize: (s) => ({ toured: s.toured }),
      merge: (persisted, current) => ({ ...current, toured: (persisted as { toured?: unknown } | null)?.toured === true }),
    },
  ),
);
