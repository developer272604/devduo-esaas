import { useEffect, useState } from 'react';
import Link from '@/components/common/Link';
import { adapters } from '@/lib/adapters';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { useOrdersStore } from '@/store/orders';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/bits';
import { useText } from '@/components/demo/Txt';

export function SuccessView({ orderId }: { orderId: string }) {
  const { template } = useCatalog();
  const brand = useText('brand.name', template.name);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!order) return;
    let live = true;
    void adapters.notify.orderConfirmation(order, brand).then((m) => live && setMessage(m.text));
    return () => {
      live = false;
    };
  }, [order, brand]);

  if (!order) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🧾" title="Order not found" text="It may belong to another template, or it was placed on another device." action={{ label: 'My orders', href: '/orders' }} />
      </div>
    );
  }
  const [from, to] = adapters.orders.etaDays(order.ship);

  return (
    <div className="wrap page">
      <div className="ok2">
        <div className="tick">
          <Icon name="check" size={36} />
        </div>
        <h1>Order placed</h1>
        <p className="muted">
          Order <b data-order-id>{order.id}</b> for {inr(order.t.total)} will reach {order.addr.city} in {from} to {to} days.
        </p>
      </div>
      <div className="wa" aria-label="WhatsApp message preview">
        <small>
          WhatsApp message sent by {brand} through Devduo Business (demo)
        </small>
        <div className="bub">{message}</div>
      </div>
      <div className="ok-actions">
        <Link className="btn" href="/orders">
          Track order
        </Link>
        <Link className="btn ghost" href="/">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
