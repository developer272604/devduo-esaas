import type { Template } from '@/lib/types';
import { inr } from '@/lib/format';
import { products } from './products';

/** Free standard delivery from this order value. */
const FREE_SHIP_AT = 2000;

export const fashion: Template = {
  id: 'fashion',
  name: 'Aarohi',
  logo: '🪷',
  tag: 'Ethnic wear',
  foot: 'Grace in every thread. Kurti sets, lehengas and festive wear crafted for comfort, confidence and celebrations.',
  freeShipAt: FREE_SHIP_AT,
  announce: `Free shipping on orders above ${inr(FREE_SHIP_AT)}. Easy returns within 7 days. Use WELCOME10 for 10% off.`,
  theme: { primary: '#a21a5c', font: 'Playfair Display', bg: '#fbf6f1', mode: 'light', radius: 'sharp' },
  cats: [
    { slug: 'kurtis', name: 'Kurtis', emoji: '👗', art: 'kurti', blurb: 'Everyday kurti sets for work and weekends.' },
    { slug: 'lehengas', name: 'Lehengas', emoji: '🥻', art: 'lehenga', blurb: 'Festive and wedding lehengas in rich fabrics.' },
    { slug: 'suits', name: 'Suits', emoji: '👘', art: 'suit', blurb: 'Straight and Anarkali suits in cotton and chanderi.' },
    { slug: 'coord', name: 'Co-ord sets', emoji: '🧥', art: 'coord', blurb: 'Matching sets you can wear together or apart.' },
    { slug: 'bottoms', name: 'Bottoms', emoji: '👖', art: 'trousers', blurb: 'Palazzos, pants and churidars.' },
    { slug: 'accessories', name: 'Accessories', emoji: '👜', art: 'potli', blurb: 'Finishing pieces for every outfit.' },
  ],
  products,
  reviews: [
    { q: 'The embroidery is finer than the photos. I got compliments all evening.', n: 'Gayathri V', c: 'Madurai' },
    { q: 'Sizing was accurate and the kurti set is already my favourite.', n: 'Nikhil P', c: 'Mumbai' },
    { q: 'Exchange was approved within a day. Lovely service.', n: 'Aarthi R', c: 'Chennai' },
  ],
  home: [
    {
      type: 'heroEditorial',
      eyebrow: 'Traditional meets trendy',
      title: 'Ethnic wear for every you',
      text: 'Kurti sets, lehengas and more, crafted for comfort, confidence and celebrations.',
      cta: 'Shop now',
      go: 'shop',
      features: [
        { icon: 'truck', title: 'Free shipping', text: `Above ${inr(FREE_SHIP_AT)}` },
        { icon: 'refresh', title: 'Easy returns', text: 'Within 7 days' },
        { icon: 'shield', title: '100% original', text: 'Products' },
      ],
      art: ['lehenga', 'kurti', 'suit'],
      script: ['Ethnic', 'Style', 'Redefined'],
    },
    { type: 'cats', style: 'circles', title: 'Explore our collections', link: 'View all' },
    { type: 'featured', title: 'Popular picks', count: 6, cols: 6, link: 'View all', ids: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] },
    {
      type: 'promoBenefits',
      eyebrow: 'Limited time',
      title: 'Flat 20% off',
      text: 'On selected ethnic wear',
      cta: 'Shop sale',
      go: 'shop',
      art: 'lehenga',
      benefits: [
        { title: 'Premium fabric', text: 'For lasting comfort' },
        { title: 'Trendy designs', text: 'For every occasion' },
        { title: 'Perfect fit', text: 'For all body types' },
        { title: 'Fast and secure delivery', text: 'Across India' },
      ],
    },
    { type: 'featured', title: 'Loved by our customers', count: 6, cols: 6, link: 'View all', ids: ['f7', 'f8', 'f9', 'f10', 'f11', 'f12'] },
  ],
};
