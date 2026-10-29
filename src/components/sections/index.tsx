import type { ReactNode } from 'react';
import type { Section, SectionType } from '@/lib/types';
import { useTemplate } from '@/store/template';
import { HeroDeals, HeroEditorial, HeroImage, HeroPhoto, HeroShowcase } from './Heroes';
import { Cats, Featured, Rail } from './Catalog';
import { Feature, Flash, News, PromoBenefits, Promos, Testimonial, Usp, Values } from './Promos';
import { BannerImage, DuoFeature, Intro, SplitBand, Spotlight } from './Editorial';
import { OtBanner, OtHero, OtPerks, OtPromos, OtRail, OtReviews, OtRings, OtTrust } from '@/components/herbal/Home';
import { REQUIRED, type SP } from './types';

type Registry = { [K in SectionType]: (props: SP<K>) => ReactNode };

/** Section type to component. A new section type is the only change a new template can need. */
export const SECTIONS: Registry = {
  heroImage: HeroImage,
  heroShowcase: HeroShowcase,
  heroEditorial: HeroEditorial,
  heroDeals: HeroDeals,
  heroPhoto: HeroPhoto,
  usp: Usp,
  cats: Cats,
  featured: Featured,
  rail: Rail,
  feature: Feature,
  promos: Promos,
  promoBenefits: PromoBenefits,
  flash: Flash,
  testimonial: Testimonial,
  values: Values,
  bannerImage: BannerImage,
  intro: Intro,
  spotlight: Spotlight,
  splitBand: SplitBand,
  duoFeature: DuoFeature,
  news: News,
  ootyHero: OtHero,
  ootyTrust: OtTrust,
  ootyRings: OtRings,
  ootyBanner: OtBanner,
  ootyRail: OtRail,
  ootyPromos: OtPromos,
  ootyPerks: OtPerks,
  ootyReviews: OtReviews,
};

function validate(section: Section, index: number): boolean {
  const known = section.type in SECTIONS;
  if (!known) {
    if (import.meta.env.DEV) console.warn(`[home] Unknown section type "${String((section as { type: string }).type)}" at position ${index}. Skipped.`);
    return false;
  }
  const bag = section as unknown as Record<string, unknown>;
  const missing = REQUIRED[section.type].filter((k) => bag[k] === undefined || bag[k] === null || bag[k] === '');
  if (missing.length) {
    if (import.meta.env.DEV) console.warn(`[home] Section "${section.type}" at position ${index} is missing: ${missing.join(', ')}. Skipped.`);
    return false;
  }
  return true;
}

/** Renders the active template's home page from its ordered section list. */
export function HomeSections() {
  const template = useTemplate();
  return (
    <>
      {template.home.map((section, i) => {
        if (!validate(section, i)) return null;
        const Component = SECTIONS[section.type] as (props: { s: Section; i: number }) => ReactNode;
        return <Component key={`${template.id}-${i}`} s={section} i={i} />;
      })}
    </>
  );
}
