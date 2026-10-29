import { create } from 'zustand';
import { setQuotaHandler } from '@/lib/storage';

export type ModalState =
  | { t: 'auth' }
  | { t: 'confirm'; title: string; text: string; yes: string; onYes: () => void }
  | { t: 'busy'; title: string; text: string }
  | { t: 'shot'; url: string; blob: Blob; brand: string }
  | null;

export type ToastState = { id: number; message: string; action?: { label: string; href: string } } | null;

type UiStore = {
  settingsOpen: boolean;
  modal: ModalState;
  toast: ToastState;
  /** Runs once after a successful sign-in (used to resume placing an order). */
  afterAuth: (() => void) | null;
  setSettingsOpen: (open: boolean) => void;
  openModal: (m: Exclude<ModalState, null>) => void;
  closeModal: () => void;
  showToast: (message: string, action?: { label: string; href: string }) => void;
  hideToast: () => void;
  setAfterAuth: (fn: (() => void) | null) => void;
};

let toastId = 0;

export const useUiStore = create<UiStore>()((set) => ({
  settingsOpen: false,
  modal: null,
  toast: null,
  afterAuth: null,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null, afterAuth: null }),
  showToast: (message, action) => set({ toast: { id: ++toastId, message, action } }),
  hideToast: () => set({ toast: null }),
  setAfterAuth: (afterAuth) => set({ afterAuth }),
}));

// Any store that cannot save because the browser storage is full reports it here, once.
setQuotaHandler(() =>
  useUiStore.getState().showToast('Browser storage is full, so recent changes may be lost on refresh. Remove an uploaded image to free space.'),
);
