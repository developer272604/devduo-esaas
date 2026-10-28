import Image from '@/components/common/Img';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { fromPrice } from '@/lib/pricing';
import { Icon } from '@/components/common/Icon';
import type { UspItem } from '@/lib/types';
import type { S } from './types';

const href = (go: string) => (go.startsWith('/') ? go : `/${go}`);

function Features({ items }: { items: UspItem[] }) {
  return (
    <ul className="hero-feats">
      {items.map((f) => (
        <li key={f.title}>
          <Icon name={f.icon} size={22} />
          <span>
            <b>{f.title}</b>
            <small>{f.text}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Full-bleed photo with copy on the left and trust chips. */
export function HeroImage({ s }: { s: S<'heroImage'> }) {
  return (
    <section className="wrap hero-img-wrap">
      <div className="hero-img">
        <Image src={s.image} alt="" fill priority sizes="(max-width: 1240px) 100vw, 1200px" className="hero-img-photo" />
        <div className="hero-img-scrim" />
        <div className="hero-img-copy">
          <span className="eyebrow">{s.eyebrow}</span>
          <h1>{s.title}</h1>
          <p>{s.text}</p>
          <Link className="btn" href={href(s.go)}>
            {s.cta}
          </Link>
          <ul className="chip-row">
            {s.badges.map((b) => (
              <li key={b}>
                <Icon name="check" size={14} /> {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PhoneMock() {
  return (
    <div className="phones" aria-hidden="true">
      <div className="phone back">
        <i className="cam" />
        <i className="cam c2" />
        <i className="cam c3" />
      </div>
      <div className="phone front">
        <i className="island" />
        <i className="homebar" />
      </div>
      <div className="podium" />
    </div>
  );
}

/** Copy, a product showcase in the middle and a spotlight card for one product. */
export function HeroShowcase({ s }: { s: S<'heroShowcase'> }) {
  const { product } = useCatalog();
  const p = product(s.spotlight.productId);
  const price = p ? fromPrice(p) : null;
  return (
    <section className="hero-show">
      <div className="wrap hero-show-grid">
        <div className="hero-show-copy">
          <span className="eyebrow">{s.eyebrow}</span>
          <h1>{s.title}</h1>
          <p className="lead">{s.text}</p>
          <div className="btns">
            <Link className="btn" href={href(s.go)}>
              {s.cta}
            </Link>
            <Link className="btn ghost" href={href(s.go2)}>
              {s.cta2}
            </Link>
          </div>
          <Features items={s.features} />
        </div>
        <PhoneMock />
        {p && price && (
          <aside className="spot">
            <span className="pill">{s.spotlight.label}</span>
            <h2>{p.name}</h2>
            <p>{s.spotlight.tagline}</p>
            <small>From</small>
            <b className="spot-price">{inr(price.price)}</b>
            <Link className="btn dark block" href={`/product/${p.id}`}>
              {s.spotlight.cta}
            </Link>
          </aside>
        )}
      </div>
    </section>
  );
}

/** Editorial split: copy and trust points on the left, a styled visual with a script callout on the right. */
export function HeroEditorial({ s }: { s: S<'heroEditorial'> }) {
  return (
    <section className="hero-edit">
      <div className="wrap hero-edit-grid">
        <div className="hero-edit-copy">
          <span className="eyebrow">{s.eyebrow}</span>
          <h1>{s.title}</h1>
          <p className="lead">{s.text}</p>
          <Link className="btn" href={href(s.go)}>
            {s.cta}
          </Link>
          <Features items={s.features} />
        </div>
        <div className="hero-edit-visual" aria-hidden="true">
          <div className="figures">
            {s.art.map((e, i) => (
              <span key={i} className={`fig f${i}`}>
                {e}
              </span>
            ))}
          </div>
          <p className="script">
            {s.script.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Discount badge, headline and photo, with trust points underneath. */
export function HeroDeals({ s }: { s: S<'heroDeals'> }) {
  return (
    <section className="wrap hero-deals-wrap">
      <div className="hero-deals">
        <div className="hero-deals-copy">
          <span className="eyebrow pill-eyebrow">{s.eyebrow}</span>
          <h1>{s.title}</h1>
          <p className="lead">{s.text}</p>
          <div className="btns">
            <Link className="btn" href={href(s.go)}>
              {s.cta}
            </Link>
            <Link className="btn ghost" href={href(s.go2)}>
              {s.cta2}
            </Link>
          </div>
        </div>
        <div className="hero-deals-visual">
          <Image src={s.image} alt="" fill priority sizes="(max-width: 860px) 100vw, 560px" className="hero-deals-photo" />
          <span className="disc-badge">
            <small>Up to</small>
            <b>{s.badge.replace(/\D+/g, '') || ''}%</b>
            <small>off</small>
          </span>
        </div>
        <Features items={s.features} />
      </div>
    </section>
  );
}

/** Wide photograph with a centred headline. */
export function HeroPhoto({ s }: { s: S<'heroPhoto'> }) {
  return (
    <section className="wrap hero-photo-wrap">
      <div className="hero-photo">
        <Image src={s.image} alt="" fill priority sizes="(max-width: 1240px) 100vw, 1200px" className="hero-photo-img" />
        <div className="hero-photo-scrim" />
        <h1>{s.title}</h1>
      </div>
    </section>
  );
}
