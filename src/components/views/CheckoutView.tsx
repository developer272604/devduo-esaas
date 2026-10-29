import { useState } from 'react';
import { useRouter } from '@/lib/nav';
import { useCatalog } from '@/lib/hooks';
import { computeTotals, toPriced, unitPrice } from '@/lib/pricing';
import type { CheckoutErrors } from '@/lib/validation';
import { useCartStore } from '@/store/cart';
import { useUiStore } from '@/store/ui';
import { useCheckoutStore } from '@/store/checkout';
import { firstErrorField, placeOrder } from '@/store/actions';
import { Crumbs, EmptyState } from '@/components/common/bits';
import { Txt, useNameOf } from '@/components/demo/Txt';
import { AddressForm, OrderSummary, PaymentOptions, ShippingOptions } from '@/components/checkout/parts';
import { inr } from '@/lib/format';

export function CheckoutView() {
  const { product, freeShipAt } = useCatalog();
  const nameOf = useNameOf();
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const coupon = useCartStore((s) => s.coupon);
  const form = useCheckoutStore((s) => s.form);
  const set = useCheckoutStore((s) => s.set);
  const busy = useUiStore((s) => s.modal?.t === 'busy');
  const [errors, setErrors] = useState<CheckoutErrors>({});

  const priced = toPriced(lines, product);
  if (!priced.length) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🛍️" title="Nothing to check out" text="Your cart is empty." action={{ label: 'Start shopping', href: '/shop' }} />
      </div>
    );
  }
  const totals = computeTotals(priced, { coupon, speed: form.ship, pay: form.pay, freeAt: freeShipAt });

  const onSet: typeof set = (patch) => {
    set(patch);
    // Clear an error as soon as that field is touched.
    const touched = Object.keys(patch) as (keyof CheckoutErrors)[];
    if (touched.some((k) => errors[k])) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !touched.includes(k as keyof CheckoutErrors))));
  };

  const submit = () => {
    const errs = placeOrder((href) => router.push(href));
    setErrors(errs);
    const first = firstErrorField(errs);
    if (first) {
      const el = document.getElementById(`ck-${first}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
    }
  };

  return (
    <div className="wrap page">
      <Crumbs trail={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <div className="ph">
        <h1>
          <Txt id="page.checkout.title" text="Checkout" />
        </h1>
      </div>
      <div className="two">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <AddressForm form={form} errors={errors} set={onSet} />
          <ShippingOptions value={form.ship} onChange={(ship) => set({ ship })} freeAt={freeShipAt} />
          <PaymentOptions form={form} errors={errors} set={onSet} />
        </form>
        <OrderSummary
          totals={totals}
          lines={priced.map((l) => ({ label: `${nameOf(l.product.id, l.product.name)} × ${l.qty}`, amount: unitPrice(l.product, l.o) * l.qty }))}
          footer={
            <>
              <button type="button" className="btn block place" onClick={submit} disabled={busy}>
                {form.pay === 'cod' ? 'Place order' : `Pay ${inr(totals.total)}`}
              </button>
              <p className="hint">Demo store. No money is charged.</p>
            </>
          }
        />
      </div>
    </div>
  );
}
