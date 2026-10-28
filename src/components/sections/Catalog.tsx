import Image from '@/components/common/Img';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { EmojiTile } from '@/components/common/Art';
import { ProductGrid, ProductCard } from '@/components/common/ProductCard';
import { SectionHead } from '@/components/common/bits';
import type { Category } from '@/lib/types';
import type { S } from './types';

function CatPicture({ c, sizes }: { c: Category; sizes: string }) {
  return c.image ? <Image src={c.image} alt="" fill sizes={sizes} className="cat-photo" /> : <EmojiTile emoji={c.emoji} id={c.slug} />;
}

/** Category entry points in five visual styles. */
export function Cats({ s }: { s: S<'cats'> }) {
  const { template, products } = useCatalog();
  const count = (slug: string) => products.filter((p) => p.cat === slug).length;
  const cats = template.cats;
  const head = <SectionHead title={s.title} link={s.link ? { label: s.link, href: '/shop' } : undefined} />;

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
                <span>{c.name}</span>
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
        {head}
        {s.style === 'photoCircles' && (
          <ul className="cat-circles">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>
                  <span className="ring">
                    <CatPicture c={c} sizes="96px" />
                  </span>
                  <span className="cat-name">{c.name}</span>
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
                    <b>{c.name}</b>
                    <small>{c.blurb}</small>
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
                  <span className="cat-name">{c.name}</span>
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
                  <b>{c.name}</b>
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

export function Featured({ s }: { s: S<'featured'> }) {
  const { products, product } = useCatalog();
  const list = s.ids ? s.ids.flatMap((id) => product(id) ?? []) : [...products].sort((a, b) => b.rev - a.rev).slice(0, s.count);
  if (!list.length) return null;
  return (
    <section className="s">
      <div className="wrap">
        <SectionHead title={s.title} sub={s.sub} link={s.link ? { label: s.link, href: '/shop' } : undefined} />
        <ProductGrid products={list.slice(0, s.count)} cols={s.cols} />
      </div>
    </section>
  );
}

export function Rail({ s }: { s: S<'rail'> }) {
  const { products, category } = useCatalog();
  const list = products.filter((p) => p.cat === s.cat);
  if (!list.length) return null;
  return (
    <section className="s">
      <div className="wrap">
        <SectionHead title={s.title} link={category(s.cat) ? { label: 'See all', href: `/category/${s.cat}` } : undefined} />
        <div className="rail">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
