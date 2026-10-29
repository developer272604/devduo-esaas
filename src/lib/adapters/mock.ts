import { TEMPLATES, getTemplate } from '@/templates';
import { inr } from '../format';
import type { Order } from '../types';
import { MAX_STAGE } from '../constants';
import type { Adapters, CatalogAdapter, AuthAdapter, PaymentAdapter, OrderAdapter, NotifyAdapter } from './types';

export const DEMO_OTP = '123456';
export const PAYMENT_DELAY_MS = 1200;
export { MAX_STAGE };

/** Order ids look like DD7F3A9C21: Devduo plus 8 random hex characters (a clock fallback if crypto is missing). */
export const newOrderId = (): string =>
  'DD' + (globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 8).toUpperCase() ?? String(Date.now()).slice(-8));

/** Devduo Pay reference: DP plus 8 digits. */
export const newPaymentRef = (): string => `DP${Date.now().toString().slice(-8)}`;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const catalog: CatalogAdapter = {
  listTemplates: () => Object.values(TEMPLATES),
  getTemplate,
  listCategories: (tpl) => getTemplate(tpl).cats,
  listProducts: (tpl) => getTemplate(tpl).products,
  getProduct: (tpl, id) => getTemplate(tpl).products.find((p) => p.id === id),
  search: (tpl, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const t = getTemplate(tpl);
    const catName = (slug: string) => t.cats.find((c) => c.slug === slug)?.name ?? '';
    return t.products.filter((p) => `${p.name} ${p.desc} ${catName(p.cat)}`.toLowerCase().includes(q));
  },
};

const auth: AuthAdapter = {
  async sendOtp() {
    await wait(150);
    return { ok: true, hint: `Demo OTP is ${DEMO_OTP}.` };
  },
  async verifyOtp({ name, phone, otp }) {
    await wait(150);
    if (otp !== DEMO_OTP) return { ok: false, error: 'That OTP is not correct. Use the demo OTP shown above.' };
    return { ok: true, user: { name: name.trim(), phone } };
  },
};

const payment: PaymentAdapter = {
  async charge(req) {
    await wait(PAYMENT_DELAY_MS);
    if (req.amount <= 0) return { ok: false, error: 'Nothing to charge.' };
    return { ok: true, reference: newPaymentRef() };
  },
};

const orders: OrderAdapter = {
  async create(input) {
    const order: Order = {
      id: newOrderId(),
      tpl: input.tpl,
      date: Date.now(),
      items: input.items,
      t: input.totals,
      addr: input.address,
      pay: input.pay,
      ship: input.ship,
      stage: 0,
      cancelled: false,
    };
    return order;
  },
  advance: (o) => (o.cancelled || o.stage >= MAX_STAGE ? o : { ...o, stage: o.stage + 1 }),
  cancel: (o) => (o.stage < 2 ? { ...o, cancelled: true } : o),
  etaDays: (ship) => (ship === 'exp' ? [1, 2] : [3, 5]),
};

const notify: NotifyAdapter = {
  async orderConfirmation(order, brand) {
    const first = order.addr.name.trim().split(' ')[0] || 'there';
    const n = order.items.reduce((a, i) => a + i.qty, 0);
    const text =
      `Hi ${first}, your ${brand} order ${order.id} is confirmed ✅\n` +
      `${n} item${n === 1 ? '' : 's'}, total ${inr(order.t.total)}.\n` +
      `Track it here: devduo.link/${order.id.toLowerCase()}`;
    return { channel: 'whatsapp', text };
  },
};

export const mockAdapters: Adapters = { catalog, auth, payment, orders, notify };
