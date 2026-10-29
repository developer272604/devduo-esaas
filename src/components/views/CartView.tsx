import { useState } from 'react';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import type { Coupon } from '@/lib/types';
import { COUPONS, computeTotals, freeShipRemaining, lineKey, normaliseCoupon, toPriced, unitMrp, unitPrice } from '@/lib/pricing';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import { Art } from '@/components/common/Art';
import { Crumbs, EmptyState, QtyStepper } from '@/components/common/bits';
import { Txt, productNameId } from '@/components/demo/Txt';
import { OrderSummary } from '@/components/checkout/parts';

export function CartView() {
  const { product, freeShipAt } = useCatalog();
  const { lines, coupon: storedCoupon } = useCartStore();
  const coupon = COUPONS.includes(storedCoupon as Coupon) ? storedCoupon : null;
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const addWish = useWishlistStore((s) => s.add);
  const toast = useUiStore((s) => s.showToast);
  const [code, setCode] = useState('');

  const priced = toPriced(lines, product);
  if (!priced.length) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🛍️" title="Your cart is empty" text="Add a few things you like and they will show up here." action={{ label: 'Start shopping', href: '/shop' }} />
      </div>
    );
  }
  const totals = computeTotals(priced, { coupon, speed: 'std', pay: 'upi', freeAt: freeShipAt });
  const left = freeShipRemaining(totals.sub, freeShipAt);
  const freeShip = left === 0 || coupon === 'FREESHIP';
  const count = priced.reduce((a, l) => a + l.qty, 0);

  const apply = () => {
    const c = normaliseCoupon(code);
    if (!c) return toast('That coupon is not valid. Try WELCOME10 or FREESHIP.');
    setCoupon(c);
    setCode('');
    toast('Coupon applied');
  };

  return (
    <div className="wrap page">
      <Crumbs trail={[{ label: 'Cart' }]} />
      <div className="ph">
        <h1>
          <Txt id="page.cart.title" text="Your cart" /> ({count})
        </h1>
      </div>
      <div className="two">
        <div>
          {priced.map((l) => {
            const p = l.product;
            const key = lineKey(p.id, l.o);
            return (
              <div className="line" key={key}>
                <Link href={`/product/${p.id}`} tabIndex={-1} aria-hidden="true">
                  <Art id={p.id} emoji={p.emoji} name={p.name} image={p.image} sizes="90px" />
                </Link>
                <div>
                  <h3>
                    <Link href={`/product/${p.id}`}>
                      <Txt id={productNameId(p.id)} text={p.name} />
                    </Link>
                  </h3>
                  {p.opts && (
                    <small>
                      {p.opts.label}: {p.opts.values[l.o]}
                    </small>
                  )}
                  <div className="line-qty">
                    <QtyStepper value={l.qty} onChange={(n) => setQty(key, n)} label={` for ${p.name}`} />
                  </div>
                  <div className="lk">
                    <button type="button" onClick={() => remove(key)}>
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        remove(key);
                        addWish(p.id);
                        toast('Moved to wishlist', { label: 'View wishlist', href: '/wishlist' });
                      }}
                    >
                      Move to wishlist
                    </button>
                  </div>
                </div>
                <div className="rt">
                  <b>{inr(unitPrice(p, l.o) * l.qty)}</b>
                  <br />
                  <small>
                    <s>{inr(unitMrp(p, l.o) * l.qty)}</s>
                  </small>
                </div>
              </div>
            );
          })}
        </div>
        <OrderSummary
          totals={totals}
          footer={
            <>
              {coupon ? (
                <p className="hint">
                  Coupon {coupon} applied.{' '}
                  <button type="button" className="linkbtn" onClick={() => setCoupon(null)}>
                    Remove
                  </button>
                </p>
              ) : (
                <>
                  <div className="cp">
                    <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Coupon code" aria-label="Coupon code" />
                    <button type="button" className="btn ghost sm" onClick={apply}>
                      Apply
                    </button>
                  </div>
                  <p className="hint">Try WELCOME10 or FREESHIP</p>
                </>
              )}
              <Link className="btn block" href="/checkout">
                Proceed to checkout
              </Link>
            </>
          }
        >
          {freeShip ? (
            <small className="g">You have free delivery</small>
          ) : (
            <small>Add {inr(left)} more for free delivery</small>
          )}
          <div className="bar2" role="progressbar" aria-valuemin={0} aria-valuemax={freeShipAt} aria-valuenow={Math.min(freeShipAt, totals.sub)} aria-label="Progress to free delivery">
            <i style={{ width: `${freeShip ? 100 : Math.min(100, (totals.sub / freeShipAt) * 100)}%` }} />
          </div>
        </OrderSummary>
      </div>
    </div>
  );
}
