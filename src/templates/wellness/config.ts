import type { Template } from '@/lib/types';
import { inr } from '@/lib/format';
import { products } from './products';
import hero from './images/hero.jpg';
import lineup from './images/lineup.jpg';
import jar from './images/jar.jpg';
import capsules from './images/capsules.jpg';
import newline from './images/newline.jpg';
import multivitamin from './images/multivitamin.jpg';
import capsuleTech from './images/capsule-tech.jpg';

/** Free standard delivery from this order value. */
const FREE_SHIP_AT = 999;

export const wellness: Template = {
  id: 'wellness',
  name: 'Gutwell',
  logo: '🌱',
  tag: 'Probiotics and nutrition',
  foot: 'Science-led probiotics and daily nutrition for a healthy microbiome and a healthy life.',
  freeShipAt: FREE_SHIP_AT,
  announce: `Free shipping on orders over ${inr(FREE_SHIP_AT)}. Use WELCOME10 for 10% off your first order.`,
  theme: { primary: '#244a33', font: 'Manrope', bg: '#f6f4ef', mode: 'light', radius: 'round' },
  cats: [
    { slug: 'gut', name: 'Gut health', emoji: '🌱', art: 'bottle', blurb: 'Probiotics and prebiotics for a balanced microbiome.' },
    { slug: 'nutrition', name: 'Nutrition', emoji: '💊', art: 'jar', blurb: 'Targeted daily nutrition for energy and long-term health.' },
    { slug: 'sleep', name: 'Sleep', emoji: '🌙', art: 'bottle', blurb: 'Gentle support for winding down and staying asleep.' },
    { slug: 'bundles', name: 'Bundles', emoji: '🎁', art: 'box', blurb: 'Starter bundles and travel packs.' },
  ],
  products,
  reviews: [
    { q: 'Less bloating within two weeks. I finally have a routine I can keep.', n: 'Meera K', c: 'Bengaluru' },
    { q: 'Clear labels and no fluff. The multivitamin is now part of breakfast.', n: 'Rohan S', c: 'Mumbai' },
    { q: 'Subscribed for my parents too. Delivery is always on time.', n: 'Anita R', c: 'Chennai' },
  ],
  home: [
    { type: 'heroPhoto', title: 'Whole body health starts in the gut', image: hero },
    { type: 'bannerImage', image: lineup, cta: 'See products', go: 'shop' },
    { type: 'intro', title: 'Healthy microbiome, healthy life', sub: 'Explore our innovations' },
    {
      type: 'spotlight',
      badge: 'Bestseller',
      code: 'DS-01',
      name: 'Daily Synbiotic',
      text: 'Eases bloating, improves regularity, and supports digestive health with 24 targeted probiotic strains and a novel prebiotic.',
      image: jar,
      cta: 'Shop now',
      go: 'product/w1',
      cta2: 'Subscribe and save',
      sideImage: capsules,
    },
    { type: 'splitBand', title: 'New from Gutwell', text: 'Targeted nutrition, energy, and sleep support designed for your body and your microbiome.', image: newline },
    {
      type: 'duoFeature',
      badge: 'New',
      code: 'DM-02',
      name: 'Daily Multivitamin',
      text: 'Helps fill daily nutrient gaps with 100% daily value of 20 essential vitamins and minerals.',
      cta: 'Shop now',
      go: 'product/w5',
      image: multivitamin,
      image2: capsuleTech,
    },
    { type: 'featured', title: 'Shop all bestsellers', count: 4, cols: 4, link: 'View all', ids: ['w1', 'w5', 'w8', 'w6'] },
  ],
};
