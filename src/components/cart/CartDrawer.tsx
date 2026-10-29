import { useEffect, useRef, useState } from 'react';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { useLocation } from 'react-router-dom';
import { COUPONS, computeTotals, freeShipRemaining, lineKey, normaliseCoupon, toPriced, unitMrp, unitPrice } from '@/lib/pricing';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { cartCount, useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import type { Coupon } from '@/lib/types';
import { Art } from '@/components/common/Art';
import { Icon } from '@/components/common/Icon';
import { QtyStepper } from '@/components/common/bits';
import { Txt, productNameId } from '@/components/demo/Txt';

/** Progress to free delivery. Shown at the top of the cart, and nowhere else. */
function FreeShipBar({ sub, freeAt, free }: { sub: number; freeAt: number; free: boolean }) {
  const left = freeShipRemaining(sub, freeAt);
  return (
    <div className="cd-ship">
      <p>
        <Icon name="truck" size={16} />
        {free ? <b>You have free delivery</b> : <span>Add <b>{inr(left)}</b> more for free delivery</span>}
      </p>
      <div className="bar2" role="progressbar" aria-valuemin={0} aria-valuemax={freeAt} aria-valuenow={Math.min(freeAt, sub)} aria-label="Progress to free delivery">
        <i style={{ width: `${free ? 100 : Math.min(100, (sub / freeAt) * 100)}%` }} />
      </div>
    </div>
  );
}

/**
 * The cart, as a drawer over whatever page the visitor is on. Opened by the header bag, by adding
 * something to the cart and by the old /cart address. Dialog behaviour: focus is trapped, Escape and the
 * backdrop close it, and the page behind does not scroll.
 */
export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const modal = useUiStore((s) => s.modal);
  const toast = useUiStore((s) => s.showToast);
  const location = useLocation();
  const { pathname } = location;
  const keepOpen = (location.state as { cart?: boolean } | null)?.cart === true;
  const { product, freeShipAt } = useCatalog();
  const lines = useCartStore((s) => s.lines);
  const storedCoupon = useCartStore((s) => s.coupon);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const addWish = useWishlistStore((s) => s.add);
  const [code, setCode] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const coupon = COUPONS.includes(storedCoupon as Coupon) ? storedCoupon : null;

  // A dialog on top of the drawer (sign-in, confirm) takes Escape first.
  useFocusTrap(panelRef, open && !modal, close);

  // Moving to another page closes the drawer, except the hop from /cart, which is how the drawer gets opened by address.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!keepOpen) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, close]);

  // The page behind does not scroll while the cart is open.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const priced = toPriced(lines, product);
  const totals = computeTotals(priced, { coupon, speed: 'std', pay: 'upi', freeAt: freeShipAt });
  const freeShip = freeShipRemaining(totals.sub, freeShipAt) === 0 || coupon === 'FREESHIP';
  const count = cartCount(priced.map((l) => ({ id: l.product.id, o: l.o, qty: l.qty })));
  const inert = open ? {} : ({ inert: '' } as object);

  const apply = () => {
    const c = normaliseCoupon(code);
    if (!c) return toast('That coupon is not valid. Try WELCOME10 or FREESHIP.');
    setCoupon(c);
    setCode('');
    toast('Coupon applied');
  };

  return (
    <>
      <div className={`overlay cd-overlay${open ? ' on' : ''}`} data-no-capture onClick={close} aria-hidden="true" />
      <div id="cart-drawer" data-no-capture className={open ? 'on' : ''} ref={panelRef} role="dialog" aria-modal={open} aria-label="Shopping cart" tabIndex={-1} {...inert}>
        <div className="cd-head">
          <h2>
            <Txt id="page.cart.title" text="Your cart" /> <span>({count})</span>
          </h2>
          <button type="button" className="icon" aria-label="Close cart" onClick={close}>
            <Icon name="x" />
          </button>
        </div>

        {!priced.length ? (
          <div className="cd-empty">
            <span className="ee" aria-hidden="true">🛍️</span>
            <h3>Your cart is empty</h3>
            <p>Add a few things you like and they will show up here.</p>
            <Link className="btn" href="/shop" onClick={close}>
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cd-body">
              <FreeShipBar sub={totals.sub} freeAt={freeShipAt} free={freeShip} />
              <ul className="cd-lines">
                {priced.map((l) => {
                  const p = l.product;
                  const key = lineKey(p.id, l.o);
                  return (
                    <li className="cd-line" key={key}>
                      <Link href={`/product/${p.id}`} tabIndex={-1} aria-hidden="true" className="cd-img">
                        <Art id={p.id} emoji={p.emoji} name={p.name} image={p.image} sizes="90px" />
                      </Link>
                      <div className="cd-info">
                        <div className="cd-top">
                          <h3>
                            <Link href={`/product/${p.id}`}>
                              <Txt id={productNameId(p.id)} text={p.name} />
                            </Link>
                          </h3>
                          <b>{inr(unitPrice(p, l.o) * l.qty)}</b>
                        </div>
                        {p.opts && (
                          <small>
                            {p.opts.label}: {p.opts.values[l.o]}
                          </small>
                        )}
                        <small className="each">
                          {inr(unitPrice(p, l.o))} each
                          {unitMrp(p, l.o) > unitPrice(p, l.o) && <s aria-label={`Original price ${inr(unitMrp(p, l.o))}`}> {inr(unitMrp(p, l.o))}</s>}
                        </small>
                        <div className="cd-act">
                          <QtyStepper value={l.qty} onChange={(n) => setQty(key, n)} label={` for ${p.name}`} />
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
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="cd-foot">
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
              <dl className="cd-sum">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{inr(totals.sub)}</dd>
                </div>
                {totals.save > 0 && (
                  <div className="g">
                    <dt>You save on MRP</dt>
                    <dd>{inr(totals.save)}</dd>
                  </div>
                )}
                {totals.disc > 0 && (
                  <div className="g">
                    <dt>Coupon discount</dt>
                    <dd>−{inr(totals.disc)}</dd>
                  </div>
                )}
                <div>
                  <dt>Delivery (standard)</dt>
                  <dd>{totals.ship === 0 ? 'Free' : inr(totals.ship)}</dd>
                </div>
                <div className="t">
                  <dt>Total</dt>
                  <dd>{inr(totals.total)}</dd>
                </div>
              </dl>
              <Link className="btn block" href="/checkout" onClick={close}>
                Proceed to checkout
              </Link>
              <button type="button" className="linkbtn cd-more" onClick={close}>
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
