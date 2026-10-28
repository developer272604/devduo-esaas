import Link from '@/components/common/Link';
import { adapters, MAX_STAGE } from '@/lib/adapters';
import { useCatalog } from '@/lib/hooks';
import { fmtDate, inr } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useOrdersStore } from '@/store/orders';
import { useUiStore } from '@/store/ui';
import { Art } from '@/components/common/Art';
import { Crumbs, EmptyState } from '@/components/common/bits';
import type { Order } from '@/lib/types';

export const STAGES = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

function OrderCard({ o }: { o: Order }) {
  const { product } = useCatalog();
  const replace = useOrdersStore((s) => s.replace);
  const add = useCartStore((s) => s.add);
  const toast = useUiStore((s) => s.showToast);
  const canCancel = !o.cancelled && o.stage < 2;
  const canAdvance = !o.cancelled && o.stage < MAX_STAGE;

  return (
    <article className="oc" data-order={o.id}>
      <div className="oh">
        <div>
          <b>{o.id}</b>
          <br />
          <small className="muted">
            {fmtDate(o.date)} · {inr(o.t.total)} · {o.pay.toUpperCase()}
          </small>
        </div>
        <span className={`pill${o.cancelled ? ' x' : ''}`} data-status>
          {o.cancelled ? 'Cancelled' : STAGES[o.stage]}
        </span>
      </div>
      <div className="oi">
        {o.items.map((i) => {
          const p = product(i.id);
          return (
            <Link key={i.id + i.opt} href={`/product/${i.id}`} title={i.name}>
              <Art id={i.id} emoji={i.emoji} name={i.name} image={p?.image} sizes="52px" />
            </Link>
          );
        })}
      </div>
      <small className="muted">
        {o.items.map((i) => `${i.name}${i.opt ? ` (${i.opt})` : ''} × ${i.qty}`).join(', ')}
      </small>
      {!o.cancelled && (
        <ol className="tl" aria-label="Order progress">
          {STAGES.map((s, i) => (
            <li key={s} className={i <= o.stage ? 'd' : ''} aria-current={i === o.stage ? 'step' : undefined}>
              {s}
            </li>
          ))}
        </ol>
      )}
      <div className="oacts">
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => {
            o.items.forEach((i) => {
              const p = product(i.id);
              if (p) add(i.id, p.opts ? Math.max(0, p.opts.values.indexOf(i.opt)) : 0, i.qty);
            });
            toast('Items added to cart', { label: 'View cart', href: '/cart' });
          }}
        >
          Buy again
        </button>
        {canAdvance && (
          <button type="button" className="btn ghost sm" onClick={() => replace(adapters.orders.advance(o))}>
            Demo: move to next stage
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              replace(adapters.orders.cancel(o));
              toast('Order cancelled');
            }}
          >
            Cancel order
          </button>
        )}
      </div>
    </article>
  );
}

export function OrdersView() {
  const { template } = useCatalog();
  const user = useAuthStore((s) => s.user);
  const orders = useOrdersStore((s) => s.orders);
  const openModal = useUiStore((s) => s.openModal);

  if (!user) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🔐" title="Sign in to see your orders" text="Use your mobile number. It takes ten seconds." action={{ label: 'Sign in', onClick: () => openModal({ t: 'auth' }) }} />
      </div>
    );
  }
  const mine = orders.filter((o) => o.tpl === template.id);
  return (
    <div className="wrap page">
      <Crumbs trail={[{ label: 'My orders' }]} />
      <div className="ph">
        <h1>My orders</h1>
      </div>
      {mine.length ? (
        mine.map((o) => <OrderCard key={o.id} o={o} />)
      ) : (
        <EmptyState emoji="📦" title="No orders yet" text="Orders you place will appear here." action={{ label: 'Start shopping', href: '/shop' }} />
      )}
    </div>
  );
}
