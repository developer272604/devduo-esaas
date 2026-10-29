import type { Template } from '@/lib/types';
import { inr } from '@/lib/format';
import { products } from './products';
import hero from './images/hero.jpg';
import honey from './images/honey.jpg';
import herbalImg from './images/herbal.jpg';
import seeds from './images/seeds.jpg';
import oils from './images/oils.jpg';

/** Free standard delivery from this order value. */
const FREE_SHIP_AT = 499;

export const herbal: Template = {
  id: 'herbal',
  name: 'Ooty Herbals',
  logo: '🌿',
  tag: 'Honey and herbal care',
  foot: 'Raw honey and traditional herbal formulations, harvested in the high-altitude forests of the Nilgiris.',
  freeShipAt: FREE_SHIP_AT,
  announce: `Free shipping on orders above ${inr(FREE_SHIP_AT)}. Use WELCOME10 for 10% off your first order.`,
  theme: { primary: '#114a37', font: 'Lora', bg: '#fbf9f4', mode: 'light', radius: 'soft' },
  cats: [
    { slug: 'honey', name: 'Honey', emoji: '🍯', blurb: 'Raw honey from Nilgiri farms and forests.', image: honey },
    { slug: 'herbal', name: 'Herbal products', emoji: '🌿', blurb: 'Stone-ground powders for daily wellness.', image: herbalImg },
    { slug: 'seeds', name: 'Herbal seeds', emoji: '🌱', blurb: 'High-germination seeds to grow your own wellness.', image: seeds },
    { slug: 'oils', name: 'Oils and extracts', emoji: '🥥', blurb: 'Cold-pressed, unrefined and single origin.', image: oils },
    { slug: 'care', name: 'Personal care', emoji: '🧴', blurb: 'Gels and balms made from garden botanicals.' },
    { slug: 'wellness', name: 'Wellness', emoji: '🍵', blurb: 'Teas and daily rituals in a cup.' },
    { slug: 'spices', name: 'Spices and herbs', emoji: '🌼', blurb: 'Single-origin spices ground in small batches.' },
    { slug: 'gifts', name: 'Gift packs', emoji: '🎁', blurb: 'Hampers for festivals and family.' },
  ],
  products,
  reviews: [
    { q: 'The wild honey tastes like the forest. Nothing like the supermarket jars.', n: 'Revathi S', c: 'Coimbatore' },
    { q: 'Honest ingredient lists and quick delivery. The turmeric is now a monthly reorder.', n: 'Priya N', c: 'Chennai' },
    { q: 'Packaging is simple and recyclable, and the ashwagandha is clean and fresh.', n: 'Ashwin K', c: 'Bengaluru' },
  ],
  home: [
    {
      type: 'heroImage',
      eyebrow: 'Pure honey, pure wellness',
      title: 'Natural honey from the Nilgiris',
      text: 'Pure, raw and naturally sourced honey for a healthier you. Harvested traditionally from pristine hill slopes.',
      cta: 'Shop honey',
      go: 'category/honey',
      image: hero,
      badges: ['100% natural', 'No added sugar', 'Direct from farms'],
    },
    {
      type: 'usp',
      style: 'card',
      items: [
        { icon: 'box', title: 'Free shipping', text: `On orders above ${inr(FREE_SHIP_AT)}` },
        { icon: 'leaf', title: '100% natural', text: 'Pure products' },
        { icon: 'shield', title: 'Secure payments', text: 'Safe and trusted' },
        { icon: 'refresh', title: 'Easy returns', text: 'Hassle free' },
        { icon: 'headset', title: 'Support all week', text: 'We’re here to help' },
      ],
    },
    { type: 'cats', style: 'photoCircles', title: 'Shop by category', link: 'View all categories' },
    {
      type: 'feature',
      eyebrow: 'Authentic harvest',
      title: 'Explore our premium honey range',
      checks: ['Wild honey', 'Multiflora honey', 'Eucalyptus honey', 'Forest honey'],
      cta: 'Shop honey products',
      go: 'category/honey',
      image: hero,
      sticker: ['Pure honey', 'Pure health'],
    },
    { type: 'featured', title: 'Best selling products', count: 6, cols: 6, link: 'View all best sellers', ids: ['h1', 'h2', 'h3', 'h4', 'h5', 'h9'] },
    {
      type: 'promos',
      cols: 2,
      items: [
        { title: 'Natural herbal products for a better you', text: 'Immunity, energy, beauty and wellness', cta: 'Shop herbal products', go: 'category/herbal', image: herbalImg },
        { title: 'Herbal seeds to grow your own wellness', text: 'High germination, premium quality', cta: 'Shop herbal seeds', go: 'category/seeds', image: seeds },
      ],
    },
    { type: 'values', items: ['Sourced from the Nilgiris', 'Traditionally trusted', 'Safe and natural ingredients', 'Supports healthy living'] },
  ],
};
