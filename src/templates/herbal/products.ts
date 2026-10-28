import type { Product } from '@/lib/types';
import { P, PACKS } from '../helpers';
import honey from './images/honey.jpg';
import herbal from './images/herbal.jpg';
import seeds from './images/seeds.jpg';
import oils from './images/oils.jpg';

export const products: Product[] = [
  P('h1', 'honey', 'Wild Honey', 499, 599, '🍯', 4.9, 1245, 'Raw wild honey collected by tribal harvesters from the high slopes of the Nilgiris. Unheated and unfiltered, so the pollen stays in the jar.', {
    image: honey, tag: 'Bestseller', opts: PACKS, d: 'Source: Nilgiri forests|Raw and unheated|No added sugar|Shelf life: 24 months',
  }),
  P('h2', 'honey', 'Multiflora Honey', 399, 499, '🍯', 4.7, 892, 'A light, floral honey from bees that forage across coffee, wildflower and eucalyptus blossoms. Smooth enough for tea and toast.', {
    image: honey, opts: PACKS, d: 'Source: Nilgiri farms|Raw and unheated|No added sugar',
  }),
  P('h3', 'honey', 'Eucalyptus Honey', 449, 599, '🍯', 4.7, 765, 'Dark amber honey with a clean, slightly minty finish. A favourite for winter mornings and sore throats.', {
    image: honey, tag: 'New', opts: PACKS, d: 'Source: Nilgiri eucalyptus groves|Raw and unheated|No added sugar',
  }),
  P('h4', 'herbal', 'Ashwagandha Powder', 299, 399, '🌿', 4.6, 654, 'Stone-ground ashwagandha root powder. Stir a teaspoon into warm milk at night.', {
    image: herbal, d: 'Weight: 100 g|Single ingredient|Lab tested for every batch',
  }),
  P('h5', 'herbal', 'Neem Leaf Powder', 249, 349, '🍃', 4.6, 512, 'Shade-dried neem leaves, finely milled. Use in face packs or as a weekly herbal rinse.', {
    image: seeds, d: 'Weight: 100 g|Shade dried|No fillers',
  }),
  P('h6', 'seeds', 'Tulsi Seeds', 99, 149, '🌱', 4.4, 380, 'High-germination holy basil seeds with a sowing guide in the pack. Grows well on a sunny balcony.', {
    image: seeds, d: 'Pack: 500 seeds|Germination: 85%+|Sow year round',
  }),
  P('h7', 'oils', 'Cold-pressed Coconut Oil', 449, 549, '🥥', 4.7, 1320, 'Wooden-press coconut oil from single-origin farms. Use for cooking, skin and hair.', {
    image: oils, d: 'Size: 1 litre|Unrefined, no additives',
  }),
  P('h8', 'oils', 'Almond Hair Oil', 349, 429, '🫙', 4.5, 410, 'Sweet almond and bhringraj oil for a calmer scalp and softer hair. Warm gently before use.', {
    image: oils, d: 'Size: 200 ml|Cold-pressed|Leave on for 1 hour',
  }),
  P('h9', 'care', 'Aloe Vera Gel', 329, 449, '🪴', 4.6, 698, 'Cold-extracted from the leaf and stabilised without alcohol. Works on skin, sunburn and as a light scalp tonic.', {
    image: oils, tag: 'Bestseller', d: 'Size: 200 ml|Alcohol free|Suitable for all skin types',
  }),
  P('h10', 'wellness', 'Tulsi Green Tea', 249, 299, '🍵', 4.6, 1500, 'Whole-leaf green tea with holy basil and lemongrass. Twenty biodegradable pyramid bags.', {
    image: herbal, d: '20 tea bags|Caffeine: low',
  }),
  P('h11', 'spices', 'Wild Turmeric Powder', 179, 229, '🌼', 4.8, 940, 'Stone-ground wild turmeric with a deep colour and a high curcumin content. Cook with it or stir into warm milk.', {
    image: herbal, d: 'Weight: 200 g|Curcumin: 4%+|Single origin',
  }),
  P('h12', 'gifts', 'Honey Gift Box', 999, 1299, '🎁', 4.8, 340, 'Three honeys, a wooden dipper and a handwritten note in a reusable box. Ready to gift.', {
    image: honey, tag: 'Gift', d: '3 honeys of 250 g|Wooden dipper|Reusable box',
  }),
];
