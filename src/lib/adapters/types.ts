import type { Address, Category, Order, PayMethod, Product, Template, TemplateMeta, Totals, User, CartLine, ShipSpeed, OrderItem } from '../types';

/**
 * The seam between the storefront and a real backend. UI code talks to these
 * interfaces only; the mock implementations in ./mock.ts can be swapped for
 * Devduo ESaas APIs, Devduo Pay and WhatsApp Business without touching components.
 */

export interface CatalogAdapter {
  listTemplates(): TemplateMeta[];
  /** A template that has been loaded. */
  getTemplate(id: string): Template;
  /** Fetches a template's catalogue. A real backend would call its API here. */
  loadTemplate(id: string): Promise<Template>;
  listCategories(tpl: string): Category[];
  listProducts(tpl: string): Product[];
  getProduct(tpl: string, id: string): Product | undefined;
  search(tpl: string, query: string): Product[];
}

export interface AuthAdapter {
  sendOtp(phone: string): Promise<{ ok: boolean; hint?: string; error?: string }>;
  verifyOtp(input: { name: string; phone: string; otp: string }): Promise<{ ok: true; user: User } | { ok: false; error: string }>;
}

export type ChargeRequest = {
  method: PayMethod;
  amount: number;
  upi?: string;
  cardLast4?: string;
};
export type ChargeResult = { ok: true; reference: string } | { ok: false; error: string };

export interface PaymentAdapter {
  /** Devduo Pay charge for UPI, card or cash on delivery (COD resolves without charging). */
  charge(req: ChargeRequest): Promise<ChargeResult>;
}

export type NewOrderInput = {
  tpl: string;
  items: OrderItem[];
  totals: Totals;
  address: Address;
  pay: PayMethod;
  ship: ShipSpeed;
  cart?: CartLine[];
};

export interface OrderAdapter {
  create(input: NewOrderInput): Promise<Order>;
  advance(order: Order): Order;
  cancel(order: Order): Order;
  /** Business days from now. */
  etaDays(ship: ShipSpeed): [number, number];
}

export interface NotifyAdapter {
  /** Returns the WhatsApp message text that would be sent through Devduo Business. */
  orderConfirmation(order: Order, brand: string): Promise<{ channel: 'whatsapp'; text: string }>;
}

export type Adapters = {
  catalog: CatalogAdapter;
  auth: AuthAdapter;
  payment: PaymentAdapter;
  orders: OrderAdapter;
  notify: NotifyAdapter;
};
