import { mockAdapters } from './mock';
import type { Adapters } from './types';

export type * from './types';
export { DEMO_OTP, MAX_STAGE } from './mock';

/** Swap this object for real implementations to move from demo to product. */
export const adapters: Adapters = mockAdapters;
