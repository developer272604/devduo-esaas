import { describe, expect, it } from 'vitest';
import { validateCheckout } from '@/lib/validation';
import { emptyCheckout } from '@/store/checkout';
import type { CheckoutForm } from '@/lib/types';

const good: CheckoutForm = {
  ...emptyCheckout,
  name: 'Asha Rao',
  phone: '9876543210',
  addr: '12 Lake View Road',
  city: 'Chennai',
  pin: '600001',
  state: 'Tamil Nadu',
  upi: 'asha@upi',
};

describe('checkout validation', () => {
  it('accepts a complete UPI order', () => {
    expect(validateCheckout(good)).toEqual({});
  });
  it('rejects mobile numbers that do not match the 6-9 rule', () => {
    for (const phone of ['5876543210', '987654321', '98765432100', 'abcdefghij']) {
      expect(validateCheckout({ ...good, phone }).phone).toBeTruthy();
    }
  });
  it('needs a 6-digit pincode', () => {
    expect(validateCheckout({ ...good, pin: '6000' }).pin).toBeTruthy();
  });
  it('validates the UPI id only for UPI', () => {
    expect(validateCheckout({ ...good, upi: 'nonsense' }).upi).toBeTruthy();
    expect(validateCheckout({ ...good, pay: 'cod', upi: '' })).toEqual({});
  });
  it('validates card number, expiry and CVV', () => {
    const e = validateCheckout({ ...good, pay: 'card', card: '1234', exp: '13/30', cvv: '1' });
    expect(Object.keys(e).sort()).toEqual(['card', 'cvv', 'exp']);
    expect(validateCheckout({ ...good, pay: 'card', card: '4111 1111 1111 1111', exp: '09/29', cvv: '123' })).toEqual({});
  });
  it('writes messages that say how to fix the problem', () => {
    expect(validateCheckout(emptyCheckout).phone).toMatch(/10-digit/);
  });
});
