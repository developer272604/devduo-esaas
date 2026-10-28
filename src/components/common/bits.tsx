import type { ReactNode } from 'react';
import Link from '@/components/common/Link';
import { inr, pct } from '@/lib/format';
import { Icon } from './Icon';

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="stars" role="img" aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}
      <i>{'★'.repeat(5 - full)}</i>
    </span>
  );
}

type PriceProps = { price: number; mrp: number; from?: boolean; large?: boolean };

export function Price({ price, mrp, from, large }: PriceProps) {
  const off = pct(price, mrp);
  return (
    <div className={`price${large ? ' lg' : ''}`}>
      <b>
        {from ? 'From ' : ''}
        {inr(price)}
      </b>
      {mrp > price && <s aria-label={`Original price ${inr(mrp)}`}>{inr(mrp)}</s>}
      {off > 0 && <span className="off">{off}% off</span>}
    </div>
  );
}

type QtyProps = { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string };

export function QtyStepper({ value, onChange, min = 1, max = 10, label = '' }: QtyProps) {
  return (
    <div className="qty" role="group" aria-label={`Quantity${label}`}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Decrease quantity${label}`}>
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase quantity${label}`}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

type EmptyProps = { emoji: string; title: string; text?: string; action?: { label: string; href?: string; onClick?: () => void } };

export function EmptyState({ emoji, title, text, action }: EmptyProps) {
  return (
    <div className="empty">
      <div className="ee" aria-hidden="true">
        {emoji}
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action &&
        (action.href ? (
          <Link className="btn" href={action.href}>
            {action.label}
          </Link>
        ) : (
          <button className="btn" onClick={action.onClick}>
            {action.label}
          </button>
        ))}
    </div>
  );
}

export function SectionHead({ title, sub, link }: { title: string; sub?: string; link?: { label: string; href: string } }) {
  return (
    <div className="sh">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {link && <Link href={link.href}>{link.label}</Link>}
    </div>
  );
}

export function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {trail.map((t, i) => (
        <span key={i}>
          {' / '}
          {t.href ? <Link href={t.href}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Wrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`wrap ${className}`}>{children}</div>;
}
