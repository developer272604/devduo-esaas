import { useEffect, useState } from 'react';
import Image from '@/components/common/Img';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { fromPrice } from '@/lib/pricing';
import { inr } from '@/lib/format';
import { Icon } from '@/components/common/Icon';
import { Stars } from '@/components/common/bits';
import { useUiStore } from '@/store/ui';
import type { S } from './types';

const href = (go: string) => (go.startsWith('/') ? go : `/${go}`);

export function Usp({ s }: { s: S<'usp'> }) {
  return (
    <section className={`wrap usp-wrap ${s.style === 'card' ? 'usp-card' : 'strip'}`}>
      <ul className="usp">
        {s.items.map((i) => (
          <li key={i.title}>
            <span className="usp-ic">
              <Icon name={i.icon} size={s.style === 'card' ? 22 : 20} />
            </span>
            <span>
              <b>{i.title}</b>
              <small>{i.text}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Text with a checklist on one side, a photo with a round sticker on the other. */
export function Feature({ s }: { s: S<'feature'> }) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="feature">
          <div className="feature-copy">
            <span className="eyebrow">{s.eyebrow}</span>
            <h2>{s.title}</h2>
            <ul className="checks">
              {s.checks.map((c) => (
                <li key={c}>
                  <span className="tick-sm">
                    <Icon name="check" size={12} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <Link className="btn" href={href(s.go)}>
              {s.cta}
            </Link>
          </div>
          <div className="feature-pic">
            <Image src={s.image} alt="" fill sizes="(max-width: 860px) 100vw, 560px" className="feature-photo" />
            <span className="sticker">
              <span>{s.sticker[0]}</span>
              <i />
              <b>{s.sticker[1]}</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Two or three coloured promo cards. Tints come from the primary hue, so they follow the theme. */
export function Promos({ s }: { s: S<'promos'> }) {
  return (
    <section className="s">
      <div className="wrap">
        <div className={`promos cols-${s.cols}`}>
          {s.items.map((p, i) => (
            <div key={p.title} className={`promo tone${i % 3}`}>
              <div className="promo-copy">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <Link className="btn sm" href={href(p.go)}>
                  {p.cta}
                </Link>
              </div>
              <div className="promo-pic">
                {p.image ? <Image src={p.image} alt="" fill sizes="200px" className="promo-photo" /> : <span aria-hidden="true">{p.emoji}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromoBenefits({ s }: { s: S<'promoBenefits'> }) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="pbanner">
          <div className="pbanner-copy">
            <span className="script-sm">{s.eyebrow}</span>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <Link className="btn" href={href(s.go)}>
              {s.cta}
            </Link>
          </div>
          <div className="pbanner-pic" aria-hidden="true">
            <span>{s.emoji}</span>
          </div>
          <ul className="pbanner-list">
            {s.benefits.map((b, i) => (
              <li key={b.title}>
                <span className={`bdot d${i % 4}`}>
                  <Icon name={(['star', 'sparkle', 'check', 'truck'] as const)[i % 4]} size={16} />
                </span>
                <b>{b.title}</b>
                <small>{b.text}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Flash deal with a live countdown. The first render is static so server and client match. */
export function Flash({ s }: { s: S<'flash'> }) {
  const { product } = useCatalog();
  const p = product(s.productId);
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
          <Image src={s.image} alt="" fill sizes="120px" className="flash-photo" />
        </div>
        <div className="flash-copy">
          <span className="flash-tag">
            <Icon name="bolt" size={16} filled /> {s.title}
          </span>
          <small>{s.label}</small>
          <div className="flash-price">
            <b>{inr(price.price)}</b>
            <s>{inr(price.mrp)}</s>
          </div>
          <Link className="btn sm flash-btn" href={`/product/${p.id}`}>
            {s.cta}
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

export function Testimonial({ s }: { s: S<'testimonial'> }) {
  return (
    <section className="s">
      <div className="wrap">
        <figure className="testi">
          {s.image && (
            <span className="testi-pic">
              <Image src={s.image} alt="" fill sizes="56px" />
            </span>
          )}
          <figcaption>
            <b>{s.name}</b>
            <small>{s.role}</small>
          </figcaption>
          <blockquote>
            <Stars rating={5} />
            <p>“{s.quote}”</p>
          </blockquote>
        </figure>
      </div>
    </section>
  );
}

export function Values({ s }: { s: S<'values'> }) {
  return (
    <section className="s">
      <div className="wrap">
        <ul className="values">
          {s.items.map((v) => (
            <li key={v}>
              <span className="tick-sm solid">
                <Icon name="check" size={14} />
              </span>
              {v}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function News({ s }: { s: S<'news'> }) {
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
            <h2>{s.title}</h2>
            <p>{s.text}</p>
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
