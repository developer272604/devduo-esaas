import type { CheckoutForm } from './types';

export const PHONE_RE = /^[6-9]\d{9}$/;
export const UPI_RE = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;
export const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;

export type CheckoutErrors = Partial<Record<'name' | 'phone' | 'addr' | 'city' | 'pin' | 'state' | 'upi' | 'card' | 'exp' | 'cvv', string>>;

export function validateCheckout(k: CheckoutForm): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (k.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!PHONE_RE.test(k.phone)) e.phone = 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
  if (k.addr.trim().length < 6) e.addr = 'Enter your full address, including house number and street.';
  if (!k.city.trim()) e.city = 'Enter your city.';
  if (!/^\d{6}$/.test(k.pin)) e.pin = 'Enter a 6-digit pincode.';
  if (!k.state.trim()) e.state = 'Enter your state.';
  if (k.pay === 'upi' && !UPI_RE.test(k.upi)) e.upi = 'Enter a valid UPI ID, for example name@upi.';
  if (k.pay === 'card') {
    if (!/^\d{16}$/.test(k.card.replace(/\s/g, ''))) e.card = 'Enter the 16-digit number on your card.';
    if (!EXPIRY_RE.test(k.exp)) e.exp = 'Use the format MM/YY.';
    if (!/^\d{3,4}$/.test(k.cvv)) e.cvv = 'Enter the 3 or 4 digit CVV.';
  }
  return e;
}

export const FIELD_ORDER: (keyof CheckoutErrors)[] = ['name', 'phone', 'addr', 'city', 'pin', 'state', 'upi', 'card', 'exp', 'cvv'];
