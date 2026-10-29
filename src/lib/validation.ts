import type { CheckoutForm } from './types';

export const PHONE_RE = /^[6-9]\d{9}$/;
export const UPI_RE = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;
export const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;

/** Luhn checksum: catches mistyped card numbers. */
export function luhnValid(card: string): boolean {
  const digits = card.replace(/\s/g, '');
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** MM/YY that is not before the current month. A card is valid through the end of its expiry month. */
export function expiryNotPast(exp: string, now: Date = new Date()): boolean {
  const m = EXPIRY_RE.exec(exp);
  if (!m) return false;
  const month = Number(exp.slice(0, 2));
  const year = 2000 + Number(exp.slice(3, 5));
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

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
    else if (!luhnValid(k.card)) e.card = 'That card number does not look right. Check each digit.';
    if (!EXPIRY_RE.test(k.exp)) e.exp = 'Use the format MM/YY.';
    else if (!expiryNotPast(k.exp)) e.exp = 'That card has expired. Use a card that is still valid.';
    if (!/^\d{3,4}$/.test(k.cvv)) e.cvv = 'Enter the 3 or 4 digit CVV.';
  }
  return e;
}

export const FIELD_ORDER: (keyof CheckoutErrors)[] = ['name', 'phone', 'addr', 'city', 'pin', 'state', 'upi', 'card', 'exp', 'cvv'];
