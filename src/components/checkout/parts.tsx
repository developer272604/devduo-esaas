import type { ReactNode } from 'react';
import { inr } from '@/lib/format';
import type { CheckoutForm, ShipSpeed, PayMethod, Totals } from '@/lib/types';
import type { CheckoutErrors } from '@/lib/validation';
import { COD_FEE, EXPRESS_SHIP, STD_SHIP } from '@/lib/pricing';

type Patch = (p: Partial<CheckoutForm>) => void;

function Field({ id, label, value, error, onChange, wide, maxLength, inputMode, autoComplete, placeholder }: {
  id: string; label: string; value: string; error?: string; onChange: (v: string) => void; wide?: boolean;
  maxLength?: number; inputMode?: 'numeric' | 'text'; autoComplete?: string; placeholder?: string;
}) {
  return (
    <div className={wide ? 'w' : ''}>
      <label htmlFor={`ck-${id}`}>{label}</label>
      <input
        id={`ck-${id}`}
        name={id}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete ?? 'off'}
        placeholder={placeholder}
        className={error ? 'bad' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? `ck-${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <div className="er" id={`ck-${id}-err`}>
          {error}
        </div>
      )}
    </div>
  );
}

const digits = (v: string) => v.replace(/\D/g, '');

export function AddressForm({ form, errors, set }: { form: CheckoutForm; errors: CheckoutErrors; set: Patch }) {
  return (
    <div className="box">
      <h3>Delivery address</h3>
      <div className="f">
        <Field id="name" label="Full name" value={form.name} error={errors.name} onChange={(v) => set({ name: v })} autoComplete="name" />
        <Field id="phone" label="Mobile number" value={form.phone} error={errors.phone} maxLength={10} inputMode="numeric" autoComplete="tel-national" onChange={(v) => set({ phone: digits(v) })} />
        <Field id="addr" label="Address" value={form.addr} error={errors.addr} wide autoComplete="street-address" onChange={(v) => set({ addr: v })} />
        <Field id="city" label="City" value={form.city} error={errors.city} autoComplete="address-level2" onChange={(v) => set({ city: v })} />
        <Field id="pin" label="Pincode" value={form.pin} error={errors.pin} maxLength={6} inputMode="numeric" autoComplete="postal-code" onChange={(v) => set({ pin: digits(v) })} />
        <Field id="state" label="State" value={form.state} error={errors.state} wide autoComplete="address-level1" onChange={(v) => set({ state: v })} />
      </div>
    </div>
  );
}

function Opt<T extends string>({ group, value, current, title, hint, onPick }: { group: string; value: T; current: T; title: string; hint: string; onPick: (v: T) => void }) {
  return (
    <label className={`opt${current === value ? ' on' : ''}`}>
      <input type="radio" name={group} value={value} checked={current === value} onChange={() => onPick(value)} />
      <span>
        {title}
        <small>{hint}</small>
      </span>
    </label>
  );
}

export function ShippingOptions({ value, onChange, freeAt }: { value: ShipSpeed; onChange: (v: ShipSpeed) => void; freeAt: number }) {
  return (
    <div className="box">
      <h3>Delivery speed</h3>
      <Opt group="ship" value="std" current={value} title="Standard delivery" hint={`3 to 5 days. Free over ${inr(freeAt)}, otherwise ${inr(STD_SHIP)}`} onPick={onChange} />
      <Opt group="ship" value="exp" current={value} title="Express delivery" hint={`1 to 2 days for ${inr(EXPRESS_SHIP)}`} onPick={onChange} />
    </div>
  );
}

export function PaymentOptions({ form, errors, set }: { form: CheckoutForm; errors: CheckoutErrors; set: Patch }) {
  const pick = (pay: PayMethod) => set({ pay });
  return (
    <div className="box">
      <h3>Payment</h3>
      <Opt group="pay" value="upi" current={form.pay} title="UPI with Devduo Pay" hint="Pay with any UPI app" onPick={pick} />
      {form.pay === 'upi' && (
        <div className="f sub">
          <Field id="upi" label="UPI ID (for example name@upi)" value={form.upi} error={errors.upi} wide onChange={(v) => set({ upi: v.trim() })} />
        </div>
      )}
      <Opt group="pay" value="card" current={form.pay} title="Debit or credit card" hint="Demo only: use 4242 4242 4242 4242, any future expiry and any CVV" onPick={pick} />
      {form.pay === 'card' && (
        <div className="f sub">
          <Field id="card" label="Card number" value={form.card} error={errors.card} wide maxLength={19} inputMode="numeric" autoComplete="cc-number" onChange={(v) => set({ card: digits(v).slice(0, 16).replace(/(.{4})/g, '$1 ').trim() })} />
          <Field
            id="exp"
            label="Expiry (MM/YY)"
            value={form.exp}
            error={errors.exp}
            maxLength={5}
            inputMode="numeric"
            autoComplete="cc-exp"
            onChange={(v) => {
              const d = digits(v).slice(0, 4);
              set({ exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
            }}
          />
          <Field id="cvv" label="CVV" value={form.cvv} error={errors.cvv} maxLength={4} inputMode="numeric" autoComplete="cc-csc" onChange={(v) => set({ cvv: digits(v) })} />
        </div>
      )}
      <Opt group="pay" value="cod" current={form.pay} title="Cash on delivery" hint={`${inr(COD_FEE)} handling fee`} onPick={pick} />
    </div>
  );
}

/** Totals block used by both the cart and the checkout. */
export function OrderSummary({ totals, children, footer, lines, heading = 'Order summary' }: { totals: Totals; children?: ReactNode; footer?: ReactNode; lines?: { label: string; amount: number; qty?: number }[]; heading?: string }) {
  return (
    <aside className="sum">
      <h3>{heading}</h3>
      {children}
      {lines?.map((l) => (
        <div className="r" key={l.label}>
          <span>{l.label}</span>
          <span>{inr(l.amount)}</span>
        </div>
      ))}
      <div className="r">
        <span>Subtotal</span>
        <span>{inr(totals.sub)}</span>
      </div>
      {totals.save > 0 && (
        <div className="r g">
          <span>You save on MRP</span>
          <span>{inr(totals.save)}</span>
        </div>
      )}
      {totals.disc > 0 && (
        <div className="r g">
          <span>Coupon discount</span>
          <span>−{inr(totals.disc)}</span>
        </div>
      )}
      <div className="r">
        <span>Delivery</span>
        <span>{totals.ship ? inr(totals.ship) : 'Free'}</span>
      </div>
      {totals.cod > 0 && (
        <div className="r">
          <span>COD fee</span>
          <span>{inr(totals.cod)}</span>
        </div>
      )}
      <div className="r t">
        <span>Total</span>
        <span>{inr(totals.total)}</span>
      </div>
      {footer}
    </aside>
  );
}
