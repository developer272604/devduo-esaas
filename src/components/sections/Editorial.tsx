import Link from '@/components/common/Link';
import { SlotImg } from '@/components/demo/SlotImg';
import { Txt } from '@/components/demo/Txt';
import { slot, type SP } from './types';

const href = (go: string) => (go.startsWith('/') ? go : `/${go}`);

/** A wide product image with a single call to action. */
export function BannerImage({ s, i }: SP<'bannerImage'>) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-banner">
        <div className="ed-banner-pic">
          <SlotImg slot={slot(i, 'image')} src={s.image} alt="" sizes="(max-width: 860px) 90vw, 580px" className="ed-photo" />
        </div>
        <Link className="btn dark" href={href(s.go)}>
          <Txt id={slot(i, 'cta')} text={s.cta} />
        </Link>
      </div>
    </section>
  );
}

export function Intro({ s, i }: SP<'intro'>) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-intro">
        <Txt as="h2" id={slot(i, 'title')} text={s.title} />
        <Txt as="p" id={slot(i, 'sub')} text={s.sub} />
      </div>
    </section>
  );
}

/** A dark product card beside a lifestyle photograph. */
export function Spotlight({ s, i }: SP<'spotlight'>) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-two">
        <article className="ed-dark">
          <Txt as="span" className="pill light" id={slot(i, 'badge')} text={s.badge} />
          <div className="ed-dark-pic">
            <SlotImg slot={slot(i, 'image')} src={s.image} alt={`${s.code} ${s.name}`} sizes="(max-width: 860px) 80vw, 480px" className="ed-photo" />
          </div>
          <p className="ed-code">
            <Txt as="span" className="pill outline" id={slot(i, 'code')} text={s.code} /> <Txt id={slot(i, 'name')} text={s.name} />
          </p>
          <Txt as="p" className="ed-text" id={slot(i, 'text')} text={s.text} />
          <div className="btns">
            <Link className="btn light" href={href(s.go)}>
              <Txt id={slot(i, 'cta')} text={s.cta} />
            </Link>
            <Txt as="span" className="ed-sub" id={slot(i, 'cta2')} text={s.cta2} />
          </div>
        </article>
        <div className="ed-side">
          <SlotImg slot={slot(i, 'sideImage')} src={s.sideImage} alt="" sizes="(max-width: 860px) 100vw, 560px" className="ed-photo" />
        </div>
      </div>
    </section>
  );
}

export function SplitBand({ s, i }: SP<'splitBand'>) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-split">
        <Txt as="h2" id={slot(i, 'title')} text={s.title} />
        <div className="ed-split-pic">
          <SlotImg slot={slot(i, 'image')} src={s.image} alt="" sizes="(max-width: 860px) 90vw, 300px" className="ed-photo" />
        </div>
        <Txt as="p" id={slot(i, 'text')} text={s.text} />
      </div>
    </section>
  );
}

export function DuoFeature({ s, i }: SP<'duoFeature'>) {
  return (
    <section className="wrap ed-wrap">
      <div className="ed-panel ed-duo">
        <div className="ed-duo-copy">
          <p className="ed-code">
            <Txt as="span" className="pill outline" id={slot(i, 'code')} text={s.code} /> <Txt id={slot(i, 'name')} text={s.name} />
          </p>
          <Txt as="p" className="ed-text" id={slot(i, 'text')} text={s.text} />
          <Link className="btn dark" href={href(s.go)}>
            <Txt id={slot(i, 'cta')} text={s.cta} />
          </Link>
        </div>
        <div className="ed-duo-pic">
          <Txt as="span" className="pill tag" id={slot(i, 'badge')} text={s.badge} />
          <SlotImg slot={slot(i, 'image')} src={s.image} alt={s.name} sizes="(max-width: 860px) 90vw, 280px" className="ed-photo" />
        </div>
        <div className="ed-duo-pic">
          <SlotImg slot={slot(i, 'image2')} src={s.image2} alt="" sizes="(max-width: 860px) 90vw, 280px" className="ed-photo" />
        </div>
      </div>
    </section>
  );
}
