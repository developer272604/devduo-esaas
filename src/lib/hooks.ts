import { useMemo } from 'react';
import { adapters } from './adapters';
import type { Category, Product, Template } from './types';
import { useTemplate } from '@/store/template';

export type Catalog = {
  template: Template;
  /** The active template's free-delivery threshold. */
  freeShipAt: number;
  products: Product[];
  category: (slug: string) => Category | undefined;
  product: (id: string) => Product | undefined;
  search: (q: string) => Product[];
};

/** All catalogue reads go through the CatalogAdapter for the active template. */
export function useCatalog(): Catalog {
  const template = useTemplate();
  return useMemo(() => {
    const id = template.id;
    const products = adapters.catalog.listProducts(id);
    const cats = adapters.catalog.listCategories(id);
    return {
      template,
      freeShipAt: template.freeShipAt,
      products,
      category: (slug) => cats.find((c) => c.slug === slug),
      product: (pid) => adapters.catalog.getProduct(id, pid),
      search: (q) => adapters.catalog.search(id, q),
    };
  }, [template]);
}
