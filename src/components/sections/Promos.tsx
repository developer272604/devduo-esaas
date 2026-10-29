import { useEffect, useState } from 'react';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { fromPrice } from '@/lib/pricing';
import { inr } from '@/lib/format';
import { Icon } from '@/components/common/Icon';
import { Illustration } from '@/components/common/Illustration';
import { Stars } from '@/components/common/bits';
import { SlotImg } from '@/components/demo/SlotImg';
import { Txt, useProductName } from '@/components/demo/Txt';
import { useUiStore } from '@/store/ui';
import { slot, type SP } from './types';

const href = (go: string) => (go.startsWith('/') ? go : `/${go}`);

export function Usp({ s, i }: SP<'usp'>) {
  return (
    <section className={`wrap usp-wrap ${s.style === 'card' ? 'usp-card' : 'strip'}`}>
      <ul className="usp">
        {s.items.map((item, j) => (
          <li key={item.title}>
            <span className="usp-ic">
              <Icon name={item.icon} size={s.style === 'card' ? 22 : 20} />
            </span>
            <span>
              <Txt as="b" id={slot(i, `items.${j}.title`)} text={item.title} />
              <Txt as="small" id={slot(i, `items.${j}.text`)} text={item.text} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Text with a checklist on one side, a photo with a round sticker on the other. */
export function Feature({ s, i }: SP<'feature'>) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="feature">
          <div className="feature-copy">
            <Txt as="span" className="eyebrow" id={slot(i, 'eyebrow')} text={s.eyebrow} />
            <Txt as="h2" id={slot(i, 'title')} text={s.title} />
            <ul className="checks">
              {s.checks.map((c, j) => (
                <li key={c}>
                  <span className="tick-sm">
                    <Icon name="check" size={12} />
                  </span>
                  <Txt id={slot(i, `checks.${j}`)} text={c} />
                </li>
              ))}
            </ul>
            <Link className="btn" href={href(s.go)}>
              <Txt id={slot(i, 'cta')} text={s.cta} />
            </Link>
          </div>
          <div className="feature-pic">
            <SlotImg slot={slot(i, 'image')} src={s.image} alt="" sizes="(max-width: 860px) 100vw, 560px" className="feature-photo" />
            <span className="sticker">
              <Txt as="span" id={slot(i, 'sticker.0')} text={s.sticker[0]} />
              <i />
              <Txt as="b" id={slot(i, 'sticker.1')} text={s.sticker[1]} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Two or three coloured promo cards. Tints come from the primary hue, so they follow the theme. */
export function Promos({ s, i }: SP<'promos'>) {
  return (
    <section className="s">
      <div className="wrap">
        <div className={`promos cols-${s.cols}`}>
          {s.items.map((p, j) => (
            <div key={p.title} className={`promo tone${j % 3}`}>
              <div className="promo-copy">
                <Txt as="h3" id={slot(i, `items.${j}.title`)} text={p.title} />
                <Txt as="p" id={slot(i, `items.${j}.text`)} text={p.text} />
                <Link className="btn sm" href={href(p.go)}>
                  <Txt id={slot(i, `items.${j}.cta`)} text={p.cta} />
                </Link>
              </div>
              <div className="promo-pic">
                <SlotImg slot={slot(i, `items.${j}.image`)} src={p.image} alt="" sizes="200px" className="promo-photo" fallback={p.art ? <Illustration kind={p.art} variant={j} /> : undefined} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromoBenefits({ s, i }: SP<'promoBenefits'>) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="pbanner">
          <div className="pbanner-copy">
            <Txt as="span" className="script-sm" id={slot(i, 'eyebrow')} text={s.eyebrow} />
            <Txt as="h2" id={slot(i, 'title')} text={s.title} />
            <Txt as="p" id={slot(i, 'text')} text={s.text} />
            <Link className="btn" href={href(s.go)}>
              <Txt id={slot(i, 'cta')} text={s.cta} />
            </Link>
          </div>
          <div className="pbanner-pic" aria-hidden="true">
            <Illustration kind={s.art} />
          </div>
          <ul className="pbanner-list">
            {s.benefits.map((b, j) => (
              <li key={b.title}>
                <span className={`bdot d${j % 4}`}>
                  <Icon name={(['star', 'sparkle', 'check', 'truck'] as const)[j % 4]} size={16} />
                </span>
                <Txt as="b" id={slot(i, `benefits.${j}.title`)} text={b.title} />
                <Txt as="small" id={slot(i, `benefits.${j}.text`)} text={b.text} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Flash deal with a live countdown. The first render is static so it never jumps. */
export function Flash({ s, i }: SP<'flash'>) {
  const { product } = useCatalog();
  const p = product(s.productId);
  const name = useProductName(p?.id ?? '', p?.name ?? '');
  const total = s.endsInHours * 3600;
  const [left, setLeft] = useState(total);
  useEffect(() => {
    const end = Date.now() + total * 1000;
    const t = setInterval(() => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [total]);
  if (!p) return null;
  const price = fromPrice(p);
  const parts: [string, number][] = [
    ['Days', Math.floor(left / 86400)],
    ['Hrs', Math.floor((left % 86400) / 3600)],
    ['Mins', Math.floor((left % 3600) / 60)],
    ['Secs', left % 60],
  ];
  return (
    <section className="wrap flash-wrap">
      <div className="flash">
        <div className="flash-pic">
          <SlotImg slot={slot(i, 'image')} src={s.image} alt={name} sizes="120px" className="flash-photo" />
        </div>
        <div className="flash-copy">
          <span className="flash-tag">
            <Icon name="bolt" size={16} filled /> <Txt id={slot(i, 'title')} text={s.title} />
          </span>
          <Txt as="small" id={slot(i, 'label')} text={s.label} />
          <div className="flash-price">
            <b>{inr(price.price)}</b>
            <s>{inr(price.mrp)}</s>
          </div>
          <Link className="btn sm flash-btn" href={`/product/${p.id}`}>
            <Txt id={slot(i, 'cta')} text={s.cta} />
          </Link>
        </div>
        <ul className="flash-clock" aria-label="Time left">
          {parts.map(([label, v]) => (
            <li key={label}>
              <b>{pad(v)}</b>
              <small>{label}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Testimonial({ s, i }: SP<'testimonial'>) {
  return (
    <section className="s">
      <div className="wrap">
        <figure className="testi">
          <span className="testi-pic">
            <SlotImg slot={slot(i, 'image')} src={s.image} alt="" sizes="56px" />
          </span>
          <figcaption>
            <Txt as="b" id={slot(i, 'name')} text={s.name} />
            <Txt as="small" id={slot(i, 'role')} text={s.role} />
          </figcaption>
          <blockquote>
            <Stars rating={5} />
            <p>
              “<Txt id={slot(i, 'quote')} text={s.quote} />”
            </p>
          </blockquote>
        </figure>
      </div>
    </section>
  );
}

export function Values({ s, i }: SP<'values'>) {
  return (
    <section className="s">
      <div className="wrap">
        <ul className="values">
          {s.items.map((v, j) => (
            <li key={v}>
              <span className="tick-sm solid">
                <Icon name="check" size={14} />
              </span>
              <Txt id={slot(i, `items.${j}`)} text={v} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function News({ s, i }: SP<'news'>) {
  const toast = useUiStore((st) => st.showToast);
  const [email, setEmail] = useState('');
  const [wa, setWa] = useState(true);
  const [err, setErr] = useState('');
  return (
    <section className="s">
      <div className="wrap">
        <form
          className="news"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Enter a valid email address, for example name@example.com.');
            setErr('');
            setEmail('');
            toast(wa ? 'Subscribed on email and WhatsApp' : 'Subscribed on email');
          }}
        >
          <span className="news-ic" aria-hidden="true">
            <Icon name="mail" size={22} />
          </span>
          <div className="news-copy">
            <h2>
              <Txt id={slot(i, 'title')} text={s.title} />
            </h2>
            <Txt as="p" id={slot(i, 'text')} text={s.text} />
          </div>
          <div className="news-form">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" aria-label="Email address" aria-invalid={!!err} />
            <button type="submit" className="btn">
              Subscribe
            </button>
            {err && (
              <div className="er" role="alert">
                {err}
              </div>
            )}
            <label>
              <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} /> Also send updates on WhatsApp
            </label>
          </div>
        </form>
      </div>
    </section>
  );
}
