import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, BadgeCheck, Check, ChevronLeft, ChevronRight, Headset, Leaf, Quote, RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import Link from '@/components/common/Link';
import { Children } from 'react';
import { useCatalog } from '@/lib/hooks';
import type { IconName } from '@/lib/types';
import { SlotImg } from '@/components/demo/SlotImg';
import { Txt, useText } from '@/components/demo/Txt';
import { useEditMode } from '@/components/demo/useEditMode';
import { slot, type SP } from '@/components/sections/types';
import { FallingLeaves, OtCard, OtCarousel, OtStars, Reveal, to, useLoopCarousel } from './bits';

const ICONS: Partial<Record<IconName, LucideIcon>> = { truck: Truck, leaf: Leaf, shield: ShieldCheck, refresh: RotateCcw, headset: Headset };
const iconOf = (n: IconName): LucideIcon => ICONS[n] ?? Leaf;

/* ---------- hero ---------- */

/** Where each slide's photo is anchored on phones, tablets and desktops, so the jars stay in frame. */
const POSITIONS: [string, string, string][] = [
  ['76% 50%', '62% 58%', '50% 60%'],
  ['60% 50%', '58% 55%', '50% 55%'],
];
const AUTOPLAY_MS = 7000;

function Words({ text, accent, delay }: { text: string; accent: string; delay: number }) {
  let n = 0;
  const part = (t: string, cls: string) =>
    t
      .split(' ')
      .filter(Boolean)
      .map((w, k) => (
        <span key={`${cls}${k}${w}`}>
          <span className="ot-w">
            <span className={cls} style={{ '--i': n++ + delay * 14 } as CSSProperties}>
              {w}
            </span>
          </span>{' '}
        </span>
      ));
  return (
    <>
      {part(text, '')}
      {part(accent, 'acc')}
    </>
  );
}

function Chips({ items, i, k, className }: { items: string[]; i: number; k: number; className: string }) {
  return (
    <ul className={`ot-chips ${className}`}>
      {items.map((c, j) => (
        <li key={c}>
          <Check aria-hidden="true" strokeWidth={3} /> <Txt id={slot(i, `slides.${k}.chips.${j}`)} text={c} />
        </li>
      ))}
    </ul>
  );
}

/** Full-width home hero: slow zoom, drifting leaves, headline that rises word by word, autoplay. */
export function OtHero({ s, i }: SP<'ootyHero'>) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const editing = useEditMode();
  const n = s.slides.length;

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (paused || reduced || editing || n < 2) return;
    const t = setTimeout(() => setIndex((x) => (x + 1) % n), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, reduced, editing, n]);

  const go = (next: number) => setIndex((next + n) % n);
  const k = index;
  const slide = s.slides[k];
  const title = useText(slot(i, `slides.${k}.title`), slide.title);
  const accent = useText(slot(i, `slides.${k}.accent`), slide.accent);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="ot-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {s.slides.map((sl, j) => (
        <div key={sl.alt} aria-hidden={j !== index} className={`ot-hero-img${j === index ? ' on' : ''}`} style={{ '--pm': POSITIONS[j]?.[0], '--ps': POSITIONS[j]?.[1], '--pl': POSITIONS[j]?.[2] } as CSSProperties}>
          <SlotImg slot={slot(i, `slides.${j}.image`)} src={sl.image} alt={sl.alt} priority={j === 0} sizes="100vw" className="ot-cover" />
        </div>
      ))}
      <div className="ot-hero-scrim" aria-hidden="true" />
      <FallingLeaves />
      <div className="wrap ot-hero-wrap" aria-live={paused ? 'polite' : 'off'}>
        <div key={k} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} className="ot-hero-copy">
          <p className="ot-eyebrow ot-in" style={{ '--d': '.05s' } as CSSProperties}>
            <Txt id={slot(i, `slides.${k}.eyebrow`)} text={slide.eyebrow} />
          </p>
          <h1>
            {editing ? (
              <>
                <Txt id={slot(i, `slides.${k}.title`)} text={slide.title} /> <Txt className="acc" id={slot(i, `slides.${k}.accent`)} text={slide.accent} />
              </>
            ) : (
              <>
                <span className="sr-only">
                  {title} {accent}
                </span>
                <span aria-hidden="true">
                  <Words text={title} accent={accent} delay={0.1} />
                </span>
              </>
            )}
          </h1>
          <p className="ot-hero-text ot-in" style={{ '--d': '.45s' } as CSSProperties}>
            <Txt id={slot(i, `slides.${k}.text`)} text={slide.text} />
          </p>
          <div className="ot-in" style={{ '--d': '.6s' } as CSSProperties}>
            <Link href={to(slide.go)} className="ot-btn light sheen ot-cta">
              <Txt id={slot(i, `slides.${k}.cta`)} text={slide.cta} /> <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="ot-in only-d" style={{ '--d': '.75s' } as CSSProperties}>
            <Chips items={slide.chips} i={i} k={k} className="d" />
          </div>
        </div>
      </div>
      <div className="wrap ot-hero-chips-m">
        <Chips items={slide.chips} i={i} k={k} className="m" />
      </div>
      {n > 1 && (
        <>
          <button type="button" aria-label="Previous slide" className="ot-hero-nav prev" onClick={() => go(index - 1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next slide" className="ot-hero-nav next" onClick={() => go(index + 1)}>
            <ChevronRight aria-hidden="true" />
          </button>
          <div className="ot-dots">
            {s.slides.map((sl, j) => (
              <button key={sl.alt} type="button" aria-label={`Go to slide ${j + 1}`} aria-current={j === index} onClick={() => go(j)}>
                <span className={j === index ? 'on' : ''} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- trust bar ---------- */

export function OtTrust({ s, i }: SP<'ootyTrust'>) {
  return (
    <section aria-label="Why shop with us" className="wrap ot-trust-wrap">
      <Reveal>
        <ul className="ot-trust">
          {s.items.map((it, j) => {
            const Icon = iconOf(it.icon);
            return (
              <li key={it.title}>
                <div>
                  <span className="ot-ic">
                    <Icon aria-hidden="true" strokeWidth={1.6} />
                  </span>
                  <span>
                    <Txt as="b" id={slot(i, `items.${j}.title`)} text={it.title} />
                    <Txt as="small" id={slot(i, `items.${j}.text`)} text={it.text} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

/* ---------- category rings ---------- */

export function OtRings({ s, i }: SP<'ootyRings'>) {
  return (
    <section id="categories" aria-labelledby="ot-cats-h" className="ot-sec wrap">
      <Reveal>
        <div className="ot-sh">
          <h2 id="ot-cats-h">
            <Txt id={slot(i, 'title')} text={s.title} />
          </h2>
          <Link href="/shop" className="ot-link">
            <Txt id={slot(i, 'link')} text={s.link} /> <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
      <ul className="ot-rings">
        {s.items.map((r, j) => (
          <li key={r.label}>
            <Reveal delay={j * 0.05} y={14}>
              <Link href={to(r.go)} className="ot-ring">
                <span className="ot-ring-o">
                  <span className="ot-ring-i">
                    <SlotImg slot={slot(i, `items.${j}.image`)} src={r.image} alt="" sizes="104px" className="ot-cover" />
                  </span>
                </span>
                <Txt as="span" className="ot-ring-l" id={slot(i, `items.${j}.label`)} text={r.label} />
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- premium honey banner ---------- */

export function OtBanner({ s, i }: SP<'ootyBanner'>) {
  return (
    <section id="honey-range" aria-labelledby="ot-honey-h" className="ot-sec wrap">
      <Reveal>
        <div className="ot-banner">
          <FallingLeaves />
          <div className="ot-banner-copy">
            <p className="ot-label">
              <Txt id={slot(i, 'eyebrow')} text={s.eyebrow} />
            </p>
            <h2 id="ot-honey-h">
              <Txt id={slot(i, 'title')} text={s.title} />
            </h2>
            <ul className="ot-checks">
              {s.checks.map((c, j) => (
                <li key={c} style={{ '--d': `${0.15 + j * 0.08}s` } as CSSProperties}>
                  <span className="ck">
                    <Check aria-hidden="true" strokeWidth={3} />
                  </span>
                  <Txt id={slot(i, `checks.${j}`)} text={c} />
                </li>
              ))}
            </ul>
            <Link href={to(s.go)} className="ot-btn sheen">
              <Txt id={slot(i, 'cta')} text={s.cta} /> <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="ot-banner-img">
            <SlotImg slot={slot(i, 'image')} src={s.image} alt={s.alt} sizes="(max-width: 1000px) 100vw, 640px" className="ot-cover" />
            <div className="ot-sticker" aria-hidden="true">
              <span>
                {s.sticker[0]}
                <i />
                {s.sticker[1]}
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- product rail ---------- */

export function OtRail({ s, i }: SP<'ootyRail'>) {
  const { product } = useCatalog();
  const items = s.ids.map((id) => product(id)).filter((p) => !!p);
  if (!items.length) return null;
  return (
    <Reveal className="ot-rail">
      <OtCarousel id={s.key} title={s.title} titleSlot={slot(i, 'title')} link={s.link} linkSlot={slot(i, 'link')} go={s.go}>
        {items.map((p) => (
          <OtCard key={p!.id} product={p!} />
        ))}
      </OtCarousel>
    </Reveal>
  );
}

/* ---------- promo tiles ---------- */

export function OtPromos({ s, i }: SP<'ootyPromos'>) {
  return (
    <section aria-label="Featured collections" className="ot-sec wrap">
      <div className="ot-promos">
        {s.items.map((t, j) => (
          <Reveal key={t.title} delay={j * 0.1} className="ot-promo-wrap">
            <Link href={to(t.go)} className={`ot-promo t${j % 2}`}>
              <FallingLeaves />
              <div className="ot-promo-copy">
                <h3>
                  <Txt id={slot(i, `items.${j}.title`)} text={t.title} />
                </h3>
                <Txt as="p" id={slot(i, `items.${j}.text`)} text={t.text} />
                <span className="ot-pill">
                  <Txt id={slot(i, `items.${j}.cta`)} text={t.cta} /> <ArrowRight aria-hidden="true" />
                </span>
              </div>
              <span className="ot-promo-img">
                <SlotImg slot={slot(i, `items.${j}.image`)} src={t.image} alt={t.alt} sizes="160px" className="ot-cover" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- why shop with us ---------- */

export function OtPerks({ s, i }: SP<'ootyPerks'>) {
  return (
    <section aria-labelledby="ot-perks-h" className="ot-sec ot-sec-lg wrap">
      <Reveal>
        <div className="ot-perks">
          <FallingLeaves count={6} />
          <div className="ot-perks-grid">
            <div>
              <p className="ot-label light">
                <span className="ln" aria-hidden="true" /> <Txt id={slot(i, 'eyebrow')} text={s.eyebrow} />
              </p>
              <h2 id="ot-perks-h">
                <Txt id={slot(i, 'title')} text={s.title} />
              </h2>
              <Txt as="p" className="ot-perks-text" id={slot(i, 'text')} text={s.text} />
              <Link href={to(s.go)} className="ot-btn light sheen">
                <Txt id={slot(i, 'cta')} text={s.cta} /> <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <ul>
              {s.items.map((p, j) => {
                const Icon = iconOf(p.icon);
                return (
                  <li key={p.title}>
                    <Reveal delay={j * 0.08} y={14} className="ot-perk-wrap">
                      <div className="ot-perk">
                        <span className="ot-perk-n" aria-hidden="true">
                          0{j + 1}
                        </span>
                        <span className="ot-perk-ic">
                          <Icon aria-hidden="true" strokeWidth={1.6} />
                        </span>
                        <div>
                          <h3>
                            <Txt id={slot(i, `items.${j}.title`)} text={p.title} />
                          </h3>
                          <Txt as="p" id={slot(i, `items.${j}.text`)} text={p.text} />
                        </div>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- customer reviews ---------- */

function ReviewCarousel({ children }: { children: ReactNode }) {
  const { track, step, goTo, index, pauseProps } = useLoopCarousel(5500);
  const count = Children.count(children);
  return (
    <div aria-roledescription="carousel" aria-label="Customer testimonials">
      <ul ref={track} {...pauseProps} className="ot-track ot-track-rv">
        {Children.map(children, (c) => (
          <li>{c}</li>
        ))}
      </ul>
      <div className="ot-rv-ctl">
        <button type="button" className="ot-round" aria-label="Previous testimonial" onClick={() => step(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <div role="group" aria-label="Choose testimonial" className="ot-rv-dots">
          {Array.from({ length: count }, (_, j) => (
            <button key={j} type="button" aria-label={`Show testimonial ${j + 1}`} aria-current={j === index} onClick={() => goTo(j)}>
              <span className={j === index ? 'on' : ''} />
            </button>
          ))}
        </div>
        <button type="button" className="ot-round" aria-label="Next testimonial" onClick={() => step(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function OtReviews({ s, i }: SP<'ootyReviews'>) {
  const { template } = useCatalog();
  return (
    <section aria-labelledby="ot-reviews-h" className="ot-reviews">
      <div className="wrap">
        <Reveal>
          <div className="ot-sh-c">
            <p className="ot-label earth">
              <span className="ln" aria-hidden="true" /> <Txt id={slot(i, 'eyebrow')} text={s.eyebrow} />
            </p>
            <h2 id="ot-reviews-h">
              <Txt id={slot(i, 'title')} text={s.title} />
            </h2>
          </div>
        </Reveal>
        <div className="ot-rv-body">
          <ReviewCarousel>
            {template.reviews.map((r, j) => (
              <figure key={r.n} className="ot-quote">
                <Quote aria-hidden="true" strokeWidth={1.4} />
                <div>
                  <OtStars value={5} size={16} />
                  <span className="sr-only">Rated 5 out of 5</span>
                </div>
                <blockquote>
                  <Txt as="p" id={`home.reviews.${j}.q`} text={r.q} />
                </blockquote>
                <figcaption>
                  <b>
                    <Txt id={`home.reviews.${j}.n`} text={r.n} />
                  </b>
                  <span>
                    <span className="ot-ver">
                      <BadgeCheck aria-hidden="true" /> Verified purchase
                    </span>
                    <Txt id={`home.reviews.${j}.c`} text={r.c} />
                  </span>
                </figcaption>
              </figure>
            ))}
          </ReviewCarousel>
        </div>
        <Txt as="p" className="ot-note" id={slot(i, 'note')} text={s.note} />
      </div>
    </section>
  );
}
