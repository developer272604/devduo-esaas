import type { Section, SectionType } from '@/lib/types';

/** Props of one section component, by type. `i` is its position on the home page, used to name its editable slots. */
export type S<T extends SectionType> = Extract<Section, { type: T }>;
export type SP<T extends SectionType> = { s: S<T>; i: number };

/** Slot id for a field of the section at position `i`, for example `home.2.title`. */
export const slot = (i: number, field: string) => `home.${i}.${field}`;

/** Keys every section of a type must carry. Unknown or incomplete sections render nothing and warn in development. */
export const REQUIRED: Record<SectionType, string[]> = {
  heroImage: ['title', 'text', 'image', 'cta', 'go'],
  heroShowcase: ['title', 'text', 'cta', 'go', 'spotlight'],
  heroEditorial: ['title', 'text', 'cta', 'go'],
  heroDeals: ['title', 'text', 'cta', 'go', 'image'],
  heroPhoto: ['title', 'image'],
  usp: ['items'],
  cats: ['style', 'title'],
  featured: ['title', 'cols'],
  rail: ['cat', 'title'],
  feature: ['title', 'checks', 'image', 'cta', 'go'],
  promos: ['items', 'cols'],
  promoBenefits: ['title', 'benefits', 'cta', 'go'],
  flash: ['productId', 'title'],
  testimonial: ['quote', 'name'],
  values: ['items'],
  bannerImage: ['image', 'cta', 'go'],
  intro: ['title'],
  spotlight: ['name', 'image', 'cta', 'go'],
  splitBand: ['title', 'image'],
  duoFeature: ['name', 'image', 'cta', 'go'],
  news: ['title'],
  ootyHero: ['slides'],
  ootyTrust: ['items'],
  ootyRings: ['title', 'items'],
  ootyBanner: ['title', 'image', 'cta', 'go'],
  ootyRail: ['key', 'title', 'ids'],
  ootyPromos: ['items'],
  ootyPerks: ['title', 'items'],
  ootyReviews: ['title'],
};
