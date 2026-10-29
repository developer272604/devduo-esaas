import type { Template } from '@/lib/types';
import { inr } from '@/lib/format';
import { meta } from './meta';
import { products } from './products';

/** Free standard delivery from this order value. */
const FREE_SHIP_AT = 999;

export const gadgets: Template = {
  ...meta,
  foot: 'The latest mobile technology from top brands at the best prices, with a one-year warranty on every device.',
  freeShipAt: FREE_SHIP_AT,
  announce: `Free shipping on orders over ${inr(FREE_SHIP_AT)}. Use WELCOME10 for 10% off.`,
  cats: [
    { slug: 'phones', name: 'Smartphones', emoji: '📱', art: 'phone', blurb: 'Latest smartphones from top brands.' },
    { slug: 'earbuds', name: 'Earbuds', emoji: '🎧', art: 'earbuds', blurb: 'Premium sound, unmatched style.' },
    { slug: 'watches', name: 'Smartwatches', emoji: '⌚', art: 'watch', blurb: 'Stay connected every moment.' },
    { slug: 'accessories', name: 'Accessories', emoji: '🔌', art: 'charger', blurb: 'Essential accessories for your devices.' },
    { slug: 'tablets', name: 'Tablets', emoji: '📲', art: 'tablet', blurb: 'Powerful, portable and productive.' },
  ],
  products,
  reviews: [
    { q: 'The GaN charger replaced three adapters in my bag. Runs cool and charges fast.', n: 'Vikram R', c: 'Hyderabad' },
    { q: 'Genuine product, sealed box and a proper GST invoice. Delivered in two days.', n: 'Sneha M', c: 'Pune' },
    { q: 'Support replaced my earbuds in two days when one side failed. Rare in this category.', n: 'Rahul D', c: 'Chennai' },
  ],
  home: [
    {
      type: 'heroShowcase',
      eyebrow: 'Latest tech, best prices',
      title: 'Upgrade your world',
      text: 'Discover the latest smartphones and accessories from top brands at unbeatable prices.',
      cta: 'Shop now',
      go: 'category/phones',
      cta2: 'Explore deals',
      go2: 'shop',
      features: [
        { icon: 'truck', title: 'Free shipping', text: `On orders over ${inr(FREE_SHIP_AT)}` },
        { icon: 'refresh', title: 'Easy returns', text: '30-day return policy' },
        { icon: 'shield', title: 'Secure payment', text: '100% secure checkout' },
      ],
      spotlight: { productId: 'g1', label: 'New arrival', tagline: 'Strong. Light. Built for pros.', cta: 'Buy now' },
    },
    { type: 'cats', style: 'tiles', title: 'Shop by category' },
    { type: 'featured', title: 'Featured products', count: 6, cols: 6, link: 'View all products', ids: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] },
    {
      type: 'promos',
      cols: 3,
      items: [
        { title: 'Big savings on top brands', text: 'Special offers on smartphones you love.', cta: 'Explore offers', go: 'category/phones', art: 'phone' },
        { title: 'Up to 40% off on accessories', text: 'Chargers, cases, earbuds and more.', cta: 'Shop accessories', go: 'category/accessories', art: 'earbuds' },
        { title: 'Trade in and save more', text: 'Exchange your old device and get the best value.', cta: 'Learn more', go: 'shop', art: 'tablet' },
      ],
    },
    {
      type: 'usp',
      style: 'strip',
      items: [
        { icon: 'shield', title: '100% original', text: 'Genuine products' },
        { icon: 'card', title: 'Secure payments', text: 'Multiple payment options' },
        { icon: 'truck', title: 'Free shipping', text: `On orders over ${inr(FREE_SHIP_AT)}` },
        { icon: 'refresh', title: '30-day returns', text: 'Hassle-free returns' },
        { icon: 'headset', title: 'Support all week', text: 'We’re here to help' },
      ],
    },
  ],
};
