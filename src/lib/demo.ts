/**
 * This storefront is a demo. Sign-in, payment and orders are mock adapters: the OTP is fixed, nothing is
 * charged, and everything lives in the browser. Setting VITE_DEMO_MODE=false builds it for a real
 * deployment, where those adapters must be replaced (see docs/PRODUCTION.md); until then it refuses to run
 * rather than pretend to be a working shop.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export const NOT_DEMO_ERROR = 'Real auth, payment and order adapters are required when VITE_DEMO_MODE=false. The mock adapters only run in demo mode. See docs/PRODUCTION.md.';
