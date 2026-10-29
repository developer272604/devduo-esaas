import type { Template } from '@/lib/types';
import { inr } from '@/lib/format';
import { meta } from './meta';
import { products } from './products';
import hero from './images/hero.webp';
import watch from './images/watch.webp';
import summer from './images/summer.webp';
import living from './images/living.webp';
import emily from './images/emily.webp';
import catFashion from './images/cat-fashion.webp';
import catElectronics from './images/cat-electronics.webp';
import catBeauty from './images/cat-beauty.webp';
import catHome from './images/cat-home.webp';
import catGrocery from './images/cat-grocery.webp';
import catSports from './images/cat-sports.webp';

/** Free standard delivery from this order value. */
const FREE_SHIP_AT = 999;

export const marketplace: Template = {
  ...meta,
  foot: 'Millions of products from top brands and trusted sellers. Best prices, premium quality and dependable service.',
  freeShipAt: FREE_SHIP_AT,
  announce: '🎉 Mega Summer Sale is live. Get up to 60% off. Use WELCOME10 for an extra 10%.',
  cats: [
    { slug: 'fashion', name: 'Fashion', emoji: '👗', blurb: 'Clothing and accessories for every season.', image: catFashion },
    { slug: 'electronics', name: 'Electronics', emoji: '🎧', blurb: 'Phones, laptops, audio and wearables.', image: catElectronics },
    { slug: 'beauty', name: 'Beauty', emoji: '💄', blurb: 'Skin care and grooming from trusted brands.', image: catBeauty },
    { slug: 'home', name: 'Home and kitchen', emoji: '🛋️', blurb: 'Furniture, appliances and everyday home essentials.', image: catHome },
    { slug: 'grocery', name: 'Grocery', emoji: '🛒', blurb: 'Staples and fresh pantry picks.', image: catGrocery },
    { slug: 'sports', name: 'Sports', emoji: '👟', blurb: 'Footwear and fitness gear.', image: catSports },
  ],
  products,
  reviews: [
    { q: 'Great products, fast delivery and excellent customer service. Marketly is my go-to shopping destination.', n: 'Emily Johnson', c: 'Verified buyer' },
    { q: 'Ordered a sofa and an air fryer in one go. Both arrived within three days and were packed well.', n: 'Karthik M', c: 'Chennai' },
    { q: 'Prices matched the best I found online and returns were painless.', n: 'Divya S', c: 'Bengaluru' },
  ],
  home: [
    { type: 'cats', style: 'quick', title: 'Categories' },
    {
      type: 'heroDeals',
      badge: 'Up to 60% off',
      eyebrow: 'Premium quality. Premium you.',
      title: 'Everything you need, all in one place',
      text: 'Discover millions of products from top brands and trusted sellers. Best prices, premium quality and unbeatable service.',
      cta: 'Shop now',
      go: 'shop',
      cta2: 'Explore deals',
      go2: 'shop',
      image: hero,
      features: [
        { icon: 'truck', title: 'Free shipping', text: `On orders over ${inr(FREE_SHIP_AT)}` },
        { icon: 'refresh', title: 'Easy returns', text: '30-day return policy' },
        { icon: 'shield', title: 'Secure payment', text: '100% protected' },
      ],
    },
    { type: 'flash', productId: 'm7', title: 'Flash deal', label: 'Limited time offer', image: watch, cta: 'Shop the deal', endsInHours: 62 },
    { type: 'cats', style: 'cards', title: 'Popular categories', link: 'View all' },
    { type: 'featured', title: 'Featured products', count: 4, cols: 4, link: 'View all', ids: ['m1', 'm2', 'm5', 'm8'] },
    {
      type: 'promos',
      cols: 2,
      items: [
        { title: 'Summer collection', text: 'Up to 50% off on fashion and accessories', cta: 'Shop now', go: 'category/fashion', image: summer },
        { title: 'Home essentials', text: 'Up to 40% off on home and kitchen', cta: 'Shop now', go: 'category/home', image: living },
      ],
    },
    { type: 'featured', title: 'Best sellers', count: 4, cols: 4, link: 'View all', ids: ['m3', 'm4', 'm5', 'm6'] },
    { type: 'testimonial', quote: 'Great products, fast delivery, and excellent customer service. Marketly is my go-to shopping destination.', name: 'Emily Johnson', role: 'Verified buyer', image: emily },
    { type: 'news', title: 'Get exclusive offers and updates', text: 'Join our newsletter and save more on your favourite products.' },
  ],
};
