import { DEMO_MODE, NOT_DEMO_ERROR } from '../demo';
import { mockAdapters } from './mock';
import type { Adapters } from './types';

export type * from './types';
export { DEMO_OTP, MAX_STAGE } from './mock';

/** Stands in outside demo mode: every call fails loudly instead of quietly using a mock. */
const refuse = (): never => {
  throw new Error(NOT_DEMO_ERROR);
};
const notReady: Adapters = {
  catalog: mockAdapters.catalog, // reading the catalogue is harmless
  auth: { sendOtp: refuse, verifyOtp: refuse },
  payment: { charge: refuse },
  orders: { create: refuse, advance: refuse, cancel: refuse, etaDays: refuse },
  notify: { orderConfirmation: refuse },
};

/** Swap this object for real implementations to move from demo to product. */
export const adapters: Adapters = DEMO_MODE ? mockAdapters : notReady;
