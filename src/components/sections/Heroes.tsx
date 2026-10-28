import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { fromPrice } from '@/lib/pricing';
import { Icon } from '@/components/common/Icon';
import { SlotImg } from '@/components/demo/SlotImg';
import { Txt, useProductName } from '@/components/demo/Txt';
import type { UspItem } from '@/lib/types';
import { slot, type SP } from './types';

const href = (go: string) => (go.startsWith('/') ? go : `/${go}`);

function Features({ items, i }: { items: UspItem[]; i: number }) {
  return (
    <ul className="hero-feats">
      {items.map((f, j) => (
        <li key={f.title}>
          <Icon name={f.icon} size={22} />
          <span>
            <Txt as="b" id={slot(i, `features.${j}.title`)} text={f.title} />
            <Txt as="small" id={slot(i, `features.${j}.text`)} text={f.text} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Full-bleed photo with copy on the left and trust chips. */
export function HeroImage({ s, i }: SP<'heroImage'>) {
  return (
    <section className="wrap hero-img-wrap">
      <div className="hero-img">
        <SlotImg slot={slot(i, 'image')} src={s.image} alt="" priority sizes="(max-width: 1240px) 100vw, 1200px" className="hero-img-photo" />
        <div className="hero-img-scrim" />
        <div className="hero-img-copy">
          <Txt as="span" className="eyebrow" id={slot(i, 'eyebrow')} text={s.eyebrow} />
          <Txt as="h1" id={slot(i, 'title')} text={s.title} />
          <Txt as="p" id={slot(i, 'text')} text={s.text} />
          <Link className="btn" href={href(s.go)}>
            <Txt id={slot(i, 'cta')} text={s.cta} />
          </Link>
          <ul className="chip-row">
            {s.badges.map((b, j) => (
              <li key={b}>
                <Icon name="check" size={14} /> <Txt id={slot(i, `badges.${j}`)} text={b} />
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
export function HeroShowcase({ s, i }: SP<'heroShowcase'>) {
  const { product } = useCatalog();
  const p = product(s.spotlight.productId);
  const name = useProductName(p?.id ?? '', p?.name ?? '');
  const price = p ? fromPrice(p) : null;
  return (
    <section className="hero-show">
      <div className="wrap hero-show-grid">
        <div className="hero-show-copy">
          <Txt as="span" className="eyebrow" id={slot(i, 'eyebrow')} text={s.eyebrow} />
          <Txt as="h1" id={slot(i, 'title')} text={s.title} />
          <Txt as="p" className="lead" id={slot(i, 'text')} text={s.text} />
          <div className="btns">
            <Link className="btn" href={href(s.go)}>
              <Txt id={slot(i, 'cta')} text={s.cta} />
            </Link>
            <Link className="btn ghost" href={href(s.go2)}>
              <Txt id={slot(i, 'cta2')} text={s.cta2} />
            </Link>
          </div>
          <Features items={s.features} i={i} />
        </div>
        <PhoneMock />
        {p && price && (
          <aside className="spot">
            <Txt as="span" className="pill" id={slot(i, 'spotlight.label')} text={s.spotlight.label} />
            <h2>{name}</h2>
            <Txt as="p" id={slot(i, 'spotlight.tagline')} text={s.spotlight.tagline} />
            <small>From</small>
            <b className="spot-price">{inr(price.price)}</b>
            <Link className="btn dark block" href={`/product/${p.id}`}>
              <Txt id={slot(i, 'spotlight.cta')} text={s.spotlight.cta} />
            </Link>
          </aside>
        )}
      </div>
    </section>
  );
}

/** Editorial split: copy and trust points on the left, a styled visual with a script callout on the right. */
export function HeroEditorial({ s, i }: SP<'heroEditorial'>) {
  return (
    <section className="hero-edit">
      <div className="wrap hero-edit-grid">
        <div className="hero-edit-copy">
          <Txt as="span" className="eyebrow" id={slot(i, 'eyebrow')} text={s.eyebrow} />
          <Txt as="h1" id={slot(i, 'title')} text={s.title} />
          <Txt as="p" className="lead" id={slot(i, 'text')} text={s.text} />
          <Link className="btn" href={href(s.go)}>
            <Txt id={slot(i, 'cta')} text={s.cta} />
          </Link>
          <Features items={s.features} i={i} />
        </div>
        <div className="hero-edit-visual">
          <div className="figures" aria-hidden="true">
            {s.art.map((e, j) => (
              <span key={j} className={`fig f${j}`}>
                {e}
              </span>
            ))}
          </div>
          <p className="script">
            {s.script.map((w, j) => (
              <Txt key={w} as="span" id={slot(i, `script.${j}`)} text={w} />
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Discount badge, headline and photo, with trust points underneath. */
export function HeroDeals({ s, i }: SP<'heroDeals'>) {
  return (
    <section className="wrap hero-deals-wrap">
      <div className="hero-deals">
        <div className="hero-deals-copy">
          <Txt as="span" className="eyebrow pill-eyebrow" id={slot(i, 'eyebrow')} text={s.eyebrow} />
          <Txt as="h1" id={slot(i, 'title')} text={s.title} />
          <Txt as="p" className="lead" id={slot(i, 'text')} text={s.text} />
          <div className="btns">
            <Link className="btn" href={href(s.go)}>
              <Txt id={slot(i, 'cta')} text={s.cta} />
            </Link>
            <Link className="btn ghost" href={href(s.go2)}>
              <Txt id={slot(i, 'cta2')} text={s.cta2} />
            </Link>
          </div>
        </div>
        <div className="hero-deals-visual">
          <SlotImg slot={slot(i, 'image')} src={s.image} alt="" priority sizes="(max-width: 860px) 100vw, 560px" className="hero-deals-photo" />
          <span className="disc-badge">
            <small>Up to</small>
            <Txt as="b" id={slot(i, 'badge')} text={`${s.badge.replace(/\D+/g, '') || ''}%`} />
            <small>off</small>
          </span>
        </div>
        <Features items={s.features} i={i} />
      </div>
    </section>
  );
}

/** Wide photograph with a centred headline. */
export function HeroPhoto({ s, i }: SP<'heroPhoto'>) {
  return (
    <section className="wrap hero-photo-wrap">
      <div className="hero-photo">
        <SlotImg slot={slot(i, 'image')} src={s.image} alt="" priority sizes="(max-width: 1240px) 100vw, 1200px" className="hero-photo-img" />
        <div className="hero-photo-scrim" />
        <Txt as="h1" id={slot(i, 'title')} text={s.title} />
      </div>
    </section>
  );
}
