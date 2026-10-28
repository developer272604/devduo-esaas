import { useCatalog } from '@/lib/hooks';
import { ListView } from '@/components/ListView';
import { EmptyState } from '@/components/common/bits';

export function ShopView() {
  const { products } = useCatalog();
  return <ListView title="All products" blurb="Everything in the store." items={products} trail={[{ label: 'All products' }]} titleId="page.shop.title" blurbId="page.shop.blurb" />;
}

export function CategoryView({ slug }: { slug: string }) {
  const { category, products } = useCatalog();
  const c = category(slug);
  if (!c) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🧭" title="Category not found" text="That category does not exist in this store." action={{ label: 'Browse all products', href: '/shop' }} />
      </div>
    );
  }
  return <ListView key={slug} title={c.name} blurb={c.blurb} items={products.filter((p) => p.cat === slug)} trail={[{ label: c.name }]} titleId={`cat.${slug}.name`} blurbId={`cat.${slug}.blurb`} />;
}

export function SearchView({ q }: { q: string }) {
  const { search } = useCatalog();
  const results = search(q);
  return (
    <ListView
      key={q}
      title={`Results for “${q}”`}
      blurb={results.length ? '' : 'Nothing matched. Try a shorter word or a different spelling.'}
      items={results}
      trail={[{ label: 'Search' }]}
      emptyText="Try a different search, or browse everything."
    />
  );
}
