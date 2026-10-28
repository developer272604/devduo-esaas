import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { EmojiTile } from '@/components/common/Art';
import { ProductGrid, ProductCard } from '@/components/common/ProductCard';
import { SectionHead } from '@/components/common/bits';
import { SlotImg } from '@/components/demo/SlotImg';
import { Txt } from '@/components/demo/Txt';
import type { Category } from '@/lib/types';
import { slot, type SP } from './types';

const catSlot = (slug: string) => `cat.${slug}`;

function CatPicture({ c, sizes }: { c: Category; sizes: string }) {
  return <SlotImg slot={catSlot(c.slug)} src={c.image} alt="" sizes={sizes} className="cat-photo" fallback={<EmojiTile emoji={c.emoji} id={c.slug} />} />;
}

/** A category name, editable once and shown the same in every style. */
const CatName = ({ c, as = 'span', className }: { c: Category; as?: 'span' | 'b'; className?: string }) => (
  <Txt as={as} className={className} id={`cat.${c.slug}.name`} text={c.name} />
);

/** Section heading whose title, subtitle and link text can be edited. */
function Head({ i, title, sub, link, to = '/shop' }: { i: number; title: string; sub?: string; link?: string; to?: string }) {
  return (
    <div className="sh">
      <div>
        <h2>
          <Txt id={slot(i, 'title')} text={title} />
        </h2>
        {sub && (
          <p>
            <Txt id={slot(i, 'sub')} text={sub} />
          </p>
        )}
      </div>
      {link && (
        <Link href={to}>
          <Txt id={slot(i, 'link')} text={link} />
        </Link>
      )}
    </div>
  );
}

/** Category entry points in five visual styles. */
export function Cats({ s, i }: SP<'cats'>) {
  const { template, products } = useCatalog();
  const count = (slug: string) => products.filter((p) => p.cat === slug).length;
  const cats = template.cats;

  if (s.style === 'quick') {
    return (
      <section className="wrap quick-wrap" aria-label={s.title}>
        <ul className="quick">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`}>
                <span className="quick-pic">
                  <CatPicture c={c} sizes="64px" />
                </span>
                <CatName c={c} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="s">
      <div className="wrap">
        <Head i={i} title={s.title} link={s.link} />
        {s.style === 'photoCircles' && (
          <ul className="cat-circles">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>
                  <span className="ring">
                    <CatPicture c={c} sizes="96px" />
                  </span>
                  <CatName c={c} className="cat-name" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {s.style === 'tiles' && (
          <ul className="cat-tiles">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>
                  <span className="tile-pic">
                    <CatPicture c={c} sizes="96px" />
                  </span>
                  <span className="tile-copy">
                    <CatName c={c} as="b" />
                    <Txt as="small" id={`cat.${c.slug}.blurb`} text={c.blurb} />
                    <span className="tile-link">Shop now</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {s.style === 'circles' && (
          <ul className="cat-soft">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>
                  <span className="soft-pic">
                    <CatPicture c={c} sizes="120px" />
                  </span>
                  <CatName c={c} className="cat-name" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {s.style === 'cards' && (
          <ul className="cat-cards">
            {cats.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>
                  <span className="card-pic">
                    <CatPicture c={c} sizes="(max-width: 700px) 45vw, 25vw" />
                  </span>
                  <CatName c={c} as="b" />
                  <small>{count(c.slug)} products</small>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Featured({ s, i }: SP<'featured'>) {
  const { products, product } = useCatalog();
  const list = s.ids ? s.ids.flatMap((id) => product(id) ?? []) : [...products].sort((a, b) => b.rev - a.rev).slice(0, s.count);
  if (!list.length) return null;
  return (
    <section className="s">
      <div className="wrap">
        <Head i={i} title={s.title} sub={s.sub} link={s.link} />
        <ProductGrid products={list.slice(0, s.count)} cols={s.cols} />
      </div>
    </section>
  );
}

export function Rail({ s, i }: SP<'rail'>) {
  const { products, category } = useCatalog();
  const list = products.filter((p) => p.cat === s.cat);
  if (!list.length) return null;
  return (
    <section className="s">
      <div className="wrap">
        <Head i={i} title={s.title} link={category(s.cat) ? 'See all' : undefined} to={`/category/${s.cat}`} />
        <div className="rail">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
