import type { Product } from '@/lib/types';

type Extra = Partial<Pick<Product, 'image' | 'art' | 'tag' | 'd' | 'opts' | 'images' | 'short' | 'ingredients' | 'usage' | 'storage' | 'weight'>>;

/** Compact product factory so template catalogues stay readable. */
export const P = (
  id: string,
  cat: string,
  name: string,
  price: number,
  mrp: number,
  emoji: string,
  rating: number,
  rev: number,
  desc: string,
  extra: Extra = {},
): Product => ({ id, cat, name, price, mrp, emoji, rating, rev, desc, ...extra });

export const SIZES = { label: 'Size', values: ['S', 'M', 'L', 'XL'] };
/** Pack sizes ordered smallest first so the "From" price is the first option. */
export const PACKS = { label: 'Pack size', values: ['250 g', '500 g', '1 kg'], mult: [1, 1.8, 3.3] };
