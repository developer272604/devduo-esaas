import { Icon } from '@/components/common/Icon';
import { inr } from '@/lib/format';
import type { Template, UspItem } from '@/lib/types';

/** Four reassurances under the grid. Uses the template's own USP row when it has one. */
export function valueItems(t: Template): UspItem[] {
  const own = t.home.find((s) => s.type === 'usp');
  if (own && own.type === 'usp' && own.items.length >= 4) return own.items.slice(0, 4);
  return [
    { icon: 'truck', title: 'Free delivery', text: `On orders over ${inr(t.freeShipAt)}` },
    { icon: 'shield', title: 'Secure payments', text: 'UPI, cards and cash on delivery' },
    { icon: 'refresh', title: 'Easy 7-day returns', text: 'Changed your mind? Send it back' },
    { icon: 'sparkle', title: 'Quality checked', text: 'Every order inspected before it ships' },
  ];
}

export function ValueStrip({ template }: { template: Template }) {
  return (
    <section className="cat-values" aria-label="Why shop with us">
      <ul className="wrap">
        {valueItems(template).map((u) => (
          <li key={u.title}>
            <span className="cat-vi" aria-hidden="true">
              <Icon name={u.icon} size={22} />
            </span>
            <div>
              <strong>{u.title}</strong>
              <p>{u.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
