import type { Template } from '@/lib/types';
import { inr } from '@/lib/format';
import { meta } from './meta';
import { products } from './products';
import heroHoney from './images/hero-honey.webp';
import heroVarkey from './images/hero-varkey.webp';
import honeyRange from './images/honey-range.webp';
import promoHerbal from './images/promo-herbal.webp';
import promoSeeds from './images/promo-seeds.webp';
import catHoney from './images/cat-honey.webp';
import catHerbal from './images/cat-herbal.webp';
import catSeeds from './images/cat-seeds.webp';
import catOils from './images/cat-oils.webp';
import catCare from './images/cat-care.webp';
import catWellness from './images/cat-wellness.webp';
import catVarkey from './images/cat-varkey.webp';
import catGift from './images/cat-gift.webp';
import ingAloe from './images/ing-aloe-vera.webp';
import ingAmla from './images/ing-amla.webp';
import ingAshwagandha from './images/ing-ashwagandha.webp';
import ingNeem from './images/ing-neem.webp';
import ingTulsi from './images/ing-tulsi.webp';
import ingTurmeric from './images/ing-turmeric.webp';

/** Free standard delivery from this order value. */
const FREE_SHIP_AT = 499;

export const herbal: Template = {
  ...meta,
  chrome: 'ooty',
  foot: 'Raw honey and traditional herbal formulations, harvested in the high-altitude forests of the Nilgiris.',
  freeShipAt: FREE_SHIP_AT,
  announce: `Free shipping on orders above ${inr(FREE_SHIP_AT)}. Use WELCOME10 for 10% off your first order.`,
  cats: [
    { slug: 'honey', name: 'Honey', emoji: '🍯', blurb: 'Raw honey from Nilgiri farms and forests.', image: catHoney },
    { slug: 'herbal', name: 'Herbal products', emoji: '🌿', blurb: 'Stone-ground powders for daily wellness.', image: catHerbal },
    { slug: 'seeds', name: 'Herbal seeds', emoji: '🌱', blurb: 'High-germination seeds to grow your own wellness.', image: catSeeds },
    { slug: 'oils', name: 'Oils and extracts', emoji: '🥥', blurb: 'Cold-pressed, unrefined and single origin.', image: catOils },
    { slug: 'care', name: 'Personal care', emoji: '🧴', blurb: 'Soaps, creams and hair care made from garden botanicals.', image: catCare },
    { slug: 'wellness', name: 'Wellness', emoji: '🍵', blurb: 'Teas, soaks and daily rituals.', image: catWellness },
    { slug: 'spices', name: 'Spices and varkey', emoji: '🌼', blurb: 'Single-origin spices and crisp Ooty varkey.', image: catVarkey },
    { slug: 'gifts', name: 'Gift packs', emoji: '🎁', blurb: 'Hampers for festivals and family.', image: catGift },
  ],
  products,
  ingredientInfo: [
    { name: 'Amla', text: 'Indian gooseberry, a staple of traditional herbal care.', image: ingAmla },
    { name: 'Neem', text: 'A familiar leaf in traditional Indian household routines.', image: ingNeem },
    { name: 'Tulsi', text: 'Holy basil, cherished in Indian homes for generations.', image: ingTulsi },
    { name: 'Aloe vera', text: 'A cooling botanical widely used in everyday skin care.', image: ingAloe },
    { name: 'Turmeric', text: 'The golden spice at the heart of Indian tradition.', image: ingTurmeric },
    { name: 'Ashwagandha', text: 'A root with a long history in Ayurvedic traditions.', image: ingAshwagandha },
  ],
  reviews: [
    { q: 'The wild honey tastes like the forest. Nothing like the supermarket jars.', n: 'Revathi S', c: 'Coimbatore' },
    { q: 'Honest ingredient lists and quick delivery. The turmeric is now a monthly reorder.', n: 'Priya N', c: 'Chennai' },
    { q: 'Packaging is simple and recyclable, and the ashwagandha is clean and fresh.', n: 'Ashwin K', c: 'Bengaluru' },
    { q: 'The Ooty varkey is crisp and flaky, just like the bakeries up the hill. Perfect with evening tea.', n: 'Meera J', c: 'Madurai' },
    { q: 'The hibiscus shampoo is gentle and smells lovely. Delivery came in three days.', n: 'Kavya R', c: 'Hyderabad' },
    { q: 'Energy honey in my morning tea now. Pure and thick, no sugary aftertaste.', n: 'Rohan P', c: 'Pune' },
  ],
  home: [
    {
      type: 'ootyHero',
      slides: [
        {
          image: heroHoney,
          alt: 'Jars of Wild, Multi Flora and Eucalyptus honey on a wooden slab with honeycomb, above the Nilgiri hills',
          eyebrow: 'Pure honey. Pure wellness.',
          title: 'Natural honey from the',
          accent: 'Nilgiris',
          text: 'Pure, raw and naturally sourced honey for a healthier you. Harvested traditionally from pristine hill slopes.',
          cta: 'Shop honey',
          go: 'product/h13',
          chips: ['100% natural', 'No added sugar', 'Direct from farms'],
        },
        {
          image: heroVarkey,
          alt: 'A pack of Special Ooty Varkey with a bowl of crisp varkey and tea on a wooden veranda overlooking tea hills',
          eyebrow: 'The taste of the Nilgiris',
          title: 'Ooty varkey, crispy, flaky and',
          accent: 'irresistible',
          text: 'Traditional Ooty varkey with authentic taste from the Nilgiris. The perfect companion for your morning or evening tea.',
          cta: 'Shop Ooty varkey',
          go: 'product/h14',
          chips: ['Crispy and flaky', 'Authentic taste', 'Tea-time favourite'],
        },
      ],
    },
    {
      type: 'ootyTrust',
      items: [
        { icon: 'truck', title: 'Free shipping', text: `on orders above ${inr(FREE_SHIP_AT)}` },
        { icon: 'leaf', title: '100% natural', text: 'and pure products' },
        { icon: 'shield', title: 'Secure payments', text: 'Safe and trusted' },
        { icon: 'refresh', title: 'Easy returns', text: 'Hassle free' },
        { icon: 'headset', title: 'Customer support', text: 'We’re here to help' },
      ],
    },
    {
      type: 'ootyRings',
      title: 'Shop by category',
      link: 'View all categories',
      items: [
        { label: 'Honey', go: 'category/honey', image: catHoney },
        { label: 'Herbal products', go: 'category/herbal', image: catHerbal },
        { label: 'Herbal seeds', go: 'category/seeds', image: catSeeds },
        { label: 'Oils and extracts', go: 'category/oils', image: catOils },
        { label: 'Personal care', go: 'category/care', image: catCare },
        { label: 'Wellness', go: 'category/wellness', image: catWellness },
        { label: 'Ooty varkey', go: 'product/h14', image: catVarkey },
        { label: 'Gift packs', go: 'category/gifts', image: catGift },
      ],
    },
    {
      type: 'ootyBanner',
      eyebrow: 'Authentic harvest',
      title: 'Explore our premium honey range',
      checks: ['Wild honey', 'Multiflora honey', 'Eucalyptus honey', 'Forest honey'],
      cta: 'Shop honey products',
      go: 'category/honey',
      image: honeyRange,
      alt: 'Wild, Multi Flora and Eucalyptus honey jars with fresh honeycomb',
      sticker: ['Pure honey', 'Pure health'],
    },
    { type: 'ootyRail', key: 'best-sellers', title: 'Best selling products', link: 'View all best sellers', go: 'shop', ids: ['h13', 'h14', 'h1', 'h16', 'h21', 'h4', 'h9', 'h10', 'h19', 'h2'] },
    { type: 'ootyRail', key: 'new-arrivals', title: 'New arrivals', link: 'View all new arrivals', go: 'shop', ids: ['h24', 'h22', 'h18', 'h15', 'h25', 'h3', 'h17', 'h23', 'h20', 'h26'] },
    {
      type: 'ootyPromos',
      items: [
        { title: 'Natural herbal products for a better you', text: 'Immunity, energy, beauty and wellness', cta: 'Shop herbal products', go: 'category/herbal', image: promoHerbal, alt: 'Herbs ground in a traditional mortar and pestle' },
        { title: 'Herbal seeds, grow your own wellness', text: 'High germination | Premium quality', cta: 'Shop herbal seeds', go: 'category/seeds', image: promoSeeds, alt: 'Herbal seeds with a young green seedling sprouting' },
      ],
    },
    {
      type: 'ootyPerks',
      eyebrow: 'Our promise',
      title: 'Why shop with us',
      text: 'Thoughtfully made herbal products, packed with care and delivered to your door.',
      cta: 'Start shopping',
      go: 'shop',
      items: [
        { icon: 'truck', title: 'Free shipping', text: `On every order above ${inr(FREE_SHIP_AT)}, delivered to your door.` },
        { icon: 'leaf', title: '100% natural', text: 'Herbs and botanicals, thoughtfully selected and made with care.' },
        { icon: 'shield', title: 'Secure payments', text: 'Safe, encrypted checkout with UPI, cards and cash on delivery.' },
        { icon: 'refresh', title: 'Easy returns', text: 'Hassle-free returns within 7 days.' },
      ],
    },
    { type: 'ootyReviews', eyebrow: 'Reviews', title: 'What customers say', note: 'Sample testimonials for design preview. A live store would show real customer reviews.' },
  ],
};
