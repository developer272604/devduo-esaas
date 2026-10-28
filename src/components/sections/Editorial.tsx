import Image from '@/components/common/Img';
import Link from '@/components/common/Link';
import type { S } from './types';

const href = (go: string) => (go.startsWith('/') ? go : `/${go}`);

/** A wide product image with a single call to action. */
export function BannerImage({ s }: { s: S<'bannerImage'> }) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-banner">
        <div className="ed-banner-pic">
          <Image src={s.image} alt="" fill sizes="(max-width: 860px) 90vw, 580px" className="ed-photo" />
        </div>
        <Link className="btn dark" href={href(s.go)}>
          {s.cta}
        </Link>
      </div>
    </section>
  );
}

export function Intro({ s }: { s: S<'intro'> }) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-intro">
        <h2>{s.title}</h2>
        <p>{s.sub}</p>
      </div>
    </section>
  );
}

/** A dark product card beside a lifestyle photograph. */
export function Spotlight({ s }: { s: S<'spotlight'> }) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-two">
        <article className="ed-dark">
          <span className="pill light">{s.badge}</span>
          <div className="ed-dark-pic">
            <Image src={s.image} alt={`${s.code} ${s.name}`} fill sizes="(max-width: 860px) 80vw, 480px" className="ed-photo" />
          </div>
          <p className="ed-code">
            <span className="pill outline">{s.code}</span> {s.name}
          </p>
          <p className="ed-text">{s.text}</p>
          <div className="btns">
            <Link className="btn light" href={href(s.go)}>
              {s.cta}
            </Link>
            <span className="ed-sub">{s.cta2}</span>
          </div>
        </article>
        <div className="ed-side">
          <Image src={s.sideImage} alt="" fill sizes="(max-width: 860px) 100vw, 560px" className="ed-photo" />
        </div>
      </div>
    </section>
  );
}

export function SplitBand({ s }: { s: S<'splitBand'> }) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-split">
        <h2>{s.title}</h2>
        <div className="ed-split-pic">
          <Image src={s.image} alt="" fill sizes="(max-width: 860px) 90vw, 300px" className="ed-photo" />
        </div>
        <p>{s.text}</p>
      </div>
    </section>
  );
}

export function DuoFeature({ s }: { s: S<'duoFeature'> }) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-duo">
        <div className="ed-duo-copy">
          <p className="ed-code">
            <span className="pill outline">{s.code}</span> {s.name}
          </p>
          <p className="ed-text">{s.text}</p>
          <Link className="btn dark" href={href(s.go)}>
            {s.cta}
          </Link>
        </div>
        <div className="ed-duo-pic">
          <span className="pill tag">{s.badge}</span>
          <Image src={s.image} alt={s.name} fill sizes="(max-width: 860px) 90vw, 280px" className="ed-photo" />
        </div>
        <div className="ed-duo-pic">
          <Image src={s.image2} alt="" fill sizes="(max-width: 860px) 90vw, 280px" className="ed-photo" />
        </div>
      </div>
    </section>
  );
}
