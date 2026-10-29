import type { Product } from '@/lib/types';
import { P, PACKS } from '../helpers';
import honey from './images/honey.webp';
import seeds from './images/seeds.webp';
import oils from './images/oils.webp';
import p_aloe_vera_gel_1 from './images/p-aloe-vera-gel-1.webp';
import p_aloe_vera_gel_2 from './images/p-aloe-vera-gel-2.webp';
import p_ashwagandha_herbal_blend_1 from './images/p-ashwagandha-herbal-blend-1.webp';
import p_ashwagandha_herbal_blend_2 from './images/p-ashwagandha-herbal-blend-2.webp';
import p_bhringraj_hair_mask_1 from './images/p-bhringraj-hair-mask-1.webp';
import p_bhringraj_hair_mask_2 from './images/p-bhringraj-hair-mask-2.webp';
import p_coconut_herbal_hair_oil_1 from './images/p-coconut-herbal-hair-oil-1.webp';
import p_coconut_herbal_hair_oil_2 from './images/p-coconut-herbal-hair-oil-2.webp';
import p_energy_honey_1 from './images/p-energy-honey-1.webp';
import p_energy_honey_2 from './images/p-energy-honey-2.webp';
import p_herbal_bath_soak_1 from './images/p-herbal-bath-soak-1.webp';
import p_herbal_bath_soak_2 from './images/p-herbal-bath-soak-2.webp';
import p_herbal_tooth_powder_1 from './images/p-herbal-tooth-powder-1.webp';
import p_herbal_tooth_powder_2 from './images/p-herbal-tooth-powder-2.webp';
import p_hibiscus_herbal_shampoo_1 from './images/p-hibiscus-herbal-shampoo-1.webp';
import p_hibiscus_herbal_shampoo_2 from './images/p-hibiscus-herbal-shampoo-2.webp';
import p_lavender_herbal_sachet_set_1 from './images/p-lavender-herbal-sachet-set-1.webp';
import p_lavender_herbal_sachet_set_2 from './images/p-lavender-herbal-sachet-set-2.webp';
import p_moringa_leaf_blend_1 from './images/p-moringa-leaf-blend-1.webp';
import p_moringa_leaf_blend_2 from './images/p-moringa-leaf-blend-2.webp';
import p_neem_leaf_powder_1 from './images/p-neem-leaf-powder-1.webp';
import p_neem_leaf_powder_2 from './images/p-neem-leaf-powder-2.webp';
import p_neem_tulsi_herbal_soap_1 from './images/p-neem-tulsi-herbal-soap-1.webp';
import p_neem_tulsi_herbal_soap_2 from './images/p-neem-tulsi-herbal-soap-2.webp';
import p_nilgiri_lemongrass_tea_1 from './images/p-nilgiri-lemongrass-tea-1.webp';
import p_nilgiri_lemongrass_tea_2 from './images/p-nilgiri-lemongrass-tea-2.webp';
import p_ooty_varkey_1 from './images/p-ooty-varkey-1.webp';
import p_ooty_varkey_2 from './images/p-ooty-varkey-2.webp';
import p_rose_multani_face_pack_1 from './images/p-rose-multani-face-pack-1.webp';
import p_rose_multani_face_pack_2 from './images/p-rose-multani-face-pack-2.webp';
import p_sesame_herbal_body_oil_1 from './images/p-sesame-herbal-body-oil-1.webp';
import p_sesame_herbal_body_oil_2 from './images/p-sesame-herbal-body-oil-2.webp';
import p_tulsi_green_tea_1 from './images/p-tulsi-green-tea-1.webp';
import p_tulsi_green_tea_2 from './images/p-tulsi-green-tea-2.webp';
import p_turmeric_sandalwood_face_cream_1 from './images/p-turmeric-sandalwood-face-cream-1.webp';
import p_turmeric_sandalwood_face_cream_2 from './images/p-turmeric-sandalwood-face-cream-2.webp';

export const products: Product[] = [
  P('h1', 'honey', 'Wild Honey', 499, 599, '🍯', 4.9, 1245, 'Raw wild honey collected by tribal harvesters from the high slopes of the Nilgiris. Unheated and unfiltered, so the pollen stays in the jar.', {
    art: 'honey', image: honey, tag: 'Bestseller', opts: PACKS, d: 'Source: Nilgiri forests|Raw and unheated|No added sugar|Shelf life: 24 months',
  }),
  P('h2', 'honey', 'Multiflora Honey', 399, 499, '🍯', 4.7, 892, 'A light, floral honey from bees that forage across coffee, wildflower and eucalyptus blossoms. Smooth enough for tea and toast.', {
    art: 'honey', opts: PACKS, d: 'Source: Nilgiri farms|Raw and unheated|No added sugar',
  }),
  P('h3', 'honey', 'Eucalyptus Honey', 449, 599, '🍯', 4.7, 765, 'Dark amber honey with a clean, slightly minty finish. A favourite for winter mornings and sore throats.', {
    art: 'honey', tag: 'New', opts: PACKS, d: 'Source: Nilgiri eucalyptus groves|Raw and unheated|No added sugar',
  }),
  P('h4', 'herbal', 'Ashwagandha Powder', 299, 399, '🌿', 4.6, 654, 'Stone-ground ashwagandha root powder. Stir a teaspoon into warm milk at night.', {
    art: 'pouch', image: p_ashwagandha_herbal_blend_1, images: [p_ashwagandha_herbal_blend_1, p_ashwagandha_herbal_blend_2], short: 'A traditional herbal blend for your daily wellness ritual.', ingredients: ['Ashwagandha root', 'Tulsi leaf', 'Licorice root'], weight: '100 g', storage: 'Store in a cool, dry place away from direct sunlight.',
    d: 'Weight: 100 g|Stone ground|Lab tested for every batch',
  }),
  P('h5', 'herbal', 'Neem Leaf Powder', 249, 349, '🍃', 4.6, 512, 'Shade-dried neem leaves, finely milled. Use in face packs or as a weekly herbal rinse.', {
    art: 'pouch', image: p_neem_leaf_powder_1, images: [p_neem_leaf_powder_1, p_neem_leaf_powder_2], short: 'Finely milled neem leaf for traditional rituals.', ingredients: ['Neem leaf'], weight: '100 g', storage: 'Store in a cool, dry place away from direct sunlight.',
    d: 'Weight: 100 g|Shade dried|No fillers',
  }),
  P('h6', 'seeds', 'Tulsi Seeds', 99, 149, '🌱', 4.4, 380, 'High-germination holy basil seeds with a sowing guide in the pack. Grows well on a sunny balcony.', {
    art: 'pouch', image: seeds, d: 'Pack: 500 seeds|Germination: 85%+|Sow year round',
  }),
  P('h7', 'oils', 'Cold-pressed Coconut Oil', 449, 549, '🥥', 4.7, 1320, 'Wooden-press coconut oil from single-origin farms. Use for cooking, skin and hair.', {
    art: 'bottle', d: 'Size: 1 litre|Unrefined, no additives',
  }),
  P('h8', 'oils', 'Almond Hair Oil', 349, 429, '🫙', 4.5, 410, 'Sweet almond and bhringraj oil for a calmer scalp and softer hair. Warm gently before use.', {
    art: 'bottle', image: oils, d: 'Size: 200 ml|Cold-pressed|Leave on for 1 hour',
  }),
  P('h9', 'care', 'Aloe Vera Gel', 329, 449, '🪴', 4.6, 698, 'Cold-extracted from the leaf and stabilised without alcohol. Works on skin, sunburn and as a light scalp tonic.', {
    art: 'tube', tag: 'Bestseller', image: p_aloe_vera_gel_1, images: [p_aloe_vera_gel_1, p_aloe_vera_gel_2], short: 'A light, cooling gel for everyday skin care.', ingredients: ['Aloe vera', 'Cucumber extract', 'Glycerin'], weight: '150 ml', storage: 'Store in a cool, dry place away from direct sunlight.',
    d: 'Size: 200 ml|Alcohol free|Suitable for all skin types',
  }),
  P('h10', 'wellness', 'Tulsi Green Tea', 249, 299, '🍵', 4.6, 1500, 'Whole-leaf green tea with holy basil and lemongrass. Twenty biodegradable pyramid bags.', {
    art: 'teabox', image: p_tulsi_green_tea_1, images: [p_tulsi_green_tea_1, p_tulsi_green_tea_2], short: 'Green tea with tulsi leaves for a calming cup.', ingredients: ['Green tea', 'Tulsi leaf'], weight: '50 g', storage: 'Store in a cool, dry place away from direct sunlight.',
    d: '20 tea bags|Caffeine: low',
  }),
  P('h11', 'spices', 'Wild Turmeric Powder', 179, 229, '🌼', 4.8, 940, 'Stone-ground wild turmeric with a deep colour and a high curcumin content. Cook with it or stir into warm milk.', {
    art: 'pouch', d: 'Weight: 200 g|Curcumin: 4%+|Single origin',
  }),
  P('h12', 'gifts', 'Honey Gift Box', 999, 1299, '🎁', 4.8, 340, 'Three honeys, a wooden dipper and a handwritten note in a reusable box. Ready to gift.', {
    art: 'giftbox', tag: 'Gift', d: '3 honeys of 250 g|Wooden dipper|Reusable box',
  }),
  P('h13', 'honey', 'Energy Honey', 399, 459, '🍯', 4.8, 2, 'Golden honey to stir into tea, drizzle over breakfast or enjoy by the spoon.', {
    image: p_energy_honey_1,
    images: [p_energy_honey_1, p_energy_honey_2],
    short: 'Golden, naturally sweet honey for your everyday routine.',
    ingredients: ['Honey'],
    weight: '250 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'honey',
    tag: 'Bestseller',
    opts: { label: 'Pack size', values: ['250 g', '500 g'], mult: [1.0, 1.877193], mrpMult: [1.0, 1.893246] },
    d: 'Naturally sweet|Versatile in the kitchen|Everyday ritual',
  }),
  P('h14', 'spices', 'Ooty Varkey', 149, 169, '🍪', 4.7, 2, 'The crisp, flaky, layered biscuit Ooty is known for, ideal with a hot cup of tea.', {
    image: p_ooty_varkey_1,
    images: [p_ooty_varkey_1, p_ooty_varkey_2],
    short: 'Crisp, flaky layered Ooty varkey — made for tea time.',
    weight: '200 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'box',
    tag: 'Bestseller',
    opts: { label: 'Pack size', values: ['200 g', '400 g'], mult: [1.0, 1.872483], mrpMult: [1.0, 1.946746] },
    d: 'Crisp and flaky|Perfect with tea|A taste of Ooty',
  }),
  P('h15', 'herbal', 'Moringa Leaf Blend', 349, 399, '🌿', 4.4, 1, 'A pure, finely milled moringa leaf blend for traditional kitchen and wellness routines.', {
    image: p_moringa_leaf_blend_1,
    images: [p_moringa_leaf_blend_1, p_moringa_leaf_blend_2],
    short: 'Finely milled moringa leaf for simple everyday use.',
    ingredients: ['Moringa leaf'],
    weight: '100 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'pouch',
    tag: 'New',
    d: 'Single-ingredient simplicity|Everyday wellness|Natural care',
  }),
  P('h16', 'care', 'Hibiscus Herbal Shampoo', 429, 499, '🌺', 4.7, 2, 'A gentle herbal shampoo made for a nourishing wash-day ritual, inspired by the traditional use of hibiscus and amla.', {
    image: p_hibiscus_herbal_shampoo_1,
    images: [p_hibiscus_herbal_shampoo_1, p_hibiscus_herbal_shampoo_2],
    short: 'A gentle herbal wash inspired by hibiscus and amla.',
    ingredients: ['Hibiscus extract', 'Amla extract', 'Aloe vera', 'Shikakai'],
    weight: '200 ml',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'bottle',
    tag: 'Bestseller',
    opts: { label: 'Pack size', values: ['100 ml', '200 ml', '500 ml'], mult: [1.0, 1.722892, 3.610442], mrpMult: [1.0, 1.668896, 3.675585] },
    d: 'Gentle everyday cleansing|Herbal inspiration|Pleasant natural care',
  }),
  P('h17', 'care', 'Bhringraj Hair Mask', 499, 599, '🧴', 4.5, 1, 'A rich, creamy hair mask with bhringraj and herbal extracts for a weekly conditioning ritual.', {
    image: p_bhringraj_hair_mask_1,
    images: [p_bhringraj_hair_mask_1, p_bhringraj_hair_mask_2],
    short: 'A creamy herbal mask for a weekly hair ritual.',
    ingredients: ['Bhringraj extract', 'Amla extract', 'Coconut oil', 'Fenugreek'],
    weight: '200 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'jar',
    d: 'Weekly conditioning ritual|Traditional herbal inspiration|Soft, nourished feel',
  }),
  P('h18', 'care', 'Turmeric Sandalwood Cream', 549, 649, '🌼', 4.3, 1, 'A rich daily face cream inspired by the traditional pairing of turmeric and sandalwood.', {
    image: p_turmeric_sandalwood_face_cream_1,
    images: [p_turmeric_sandalwood_face_cream_1, p_turmeric_sandalwood_face_cream_2],
    short: 'A rich daily cream with turmeric and sandalwood.',
    ingredients: ['Turmeric extract', 'Sandalwood', 'Shea butter', 'Rose water'],
    weight: '50 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'jar',
    tag: 'New',
    d: 'Daily moisturising ritual|Traditional botanical pairing|Thoughtfully selected ingredients',
  }),
  P('h19', 'care', 'Neem Tulsi Herbal Soap', 99, 119, '🧼', 4.5, 2, 'A herbal bath bar with neem and tulsi for a fresh, everyday cleansing ritual.', {
    image: p_neem_tulsi_herbal_soap_1,
    images: [p_neem_tulsi_herbal_soap_1, p_neem_tulsi_herbal_soap_2],
    short: 'A herbal bar for a fresh, everyday wash.',
    ingredients: ['Neem', 'Tulsi', 'Coconut oil', 'Glycerin'],
    weight: '100 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'box',
    tag: 'Bestseller',
    opts: { label: 'Pack', values: ['Single bar', 'Pack of 3'], mult: [1.0, 2.717172], mrpMult: [1.0, 3.0] },
    d: 'Fresh everyday wash|Herbal-inspired|Gentle cleansing',
  }),
  P('h20', 'care', 'Herbal Tooth Powder', 199, 229, '🦷', 4.2, 1, 'A traditional-style tooth powder with a blend of herbs for a simple daily routine.', {
    image: p_herbal_tooth_powder_1,
    images: [p_herbal_tooth_powder_1, p_herbal_tooth_powder_2],
    short: 'A traditional-style herbal tooth powder.',
    ingredients: ['Clove', 'Neem', 'Mint', 'Rock salt'],
    weight: '100 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'jar',
    d: 'Simple daily routine|Herbal-inspired|Natural care',
  }),
  P('h21', 'oils', 'Coconut Herbal Hair Oil', 429, 499, '🥥', 4.8, 3, 'Coconut oil infused with bhringraj, amla and hibiscus for a traditional oiling ritual.', {
    image: p_coconut_herbal_hair_oil_1,
    images: [p_coconut_herbal_hair_oil_1, p_coconut_herbal_hair_oil_2],
    short: 'Coconut oil infused with traditional hair-care herbs.',
    ingredients: ['Coconut oil', 'Bhringraj', 'Amla', 'Hibiscus', 'Curry leaf'],
    weight: '200 ml',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'bottle',
    tag: 'Bestseller',
    opts: { label: 'Pack size', values: ['100 ml', '200 ml', '500 ml'], mult: [1.0, 1.722892, 3.811245], mrpMult: [1.0, 1.668896, 3.842809] },
    d: 'Traditional oiling ritual|Herbal infusion|Everyday hair care',
  }),
  P('h22', 'oils', 'Sesame Herbal Body Oil', 549, 649, '🫙', 4.4, 1, 'A warm, nourishing body oil based on sesame, inspired by traditional self-care rituals.', {
    image: p_sesame_herbal_body_oil_1,
    images: [p_sesame_herbal_body_oil_1, p_sesame_herbal_body_oil_2],
    short: 'Warm, nourishing sesame oil with herbal infusion.',
    ingredients: ['Sesame oil', 'Ashwagandha', 'Lavender', 'Vitamin E'],
    weight: '250 ml',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'bottle',
    tag: 'New',
    opts: { label: 'Pack size', values: ['100 ml', '250 ml'], mult: [1.0, 1.83612], mrpMult: [1.0, 1.859599] },
    d: 'Warm self-care ritual|Body nourishment|Thoughtfully selected ingredients',
  }),
  P('h23', 'care', 'Rose Multani Face Pack', 249, 299, '🌹', 4.5, 1, 'A classic face pack powder pairing multani mitti with rose petals.', {
    image: p_rose_multani_face_pack_1,
    images: [p_rose_multani_face_pack_1, p_rose_multani_face_pack_2],
    short: 'Multani mitti and rose petal powder face pack.',
    ingredients: ['Multani mitti', 'Rose petal powder', 'Sandalwood'],
    weight: '100 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'pouch',
    d: 'Classic ritual|Fragrant and simple|Natural care',
  }),
  P('h24', 'wellness', 'Nilgiri Lemongrass Tea', 249, 299, '🍵', 4.6, 1, 'A bright, citrusy herbal infusion of lemongrass, inspired by the Nilgiri hills.', {
    image: p_nilgiri_lemongrass_tea_1,
    images: [p_nilgiri_lemongrass_tea_1, p_nilgiri_lemongrass_tea_2],
    short: 'A bright, citrusy infusion inspired by the Nilgiris.',
    ingredients: ['Lemongrass', 'Mint', 'Ginger'],
    weight: '50 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'teabox',
    tag: 'New',
    opts: { label: 'Pack size', values: ['50 g', '100 g'], mult: [1.0, 1.803213], mrpMult: [1.0, 1.83612] },
    d: 'Bright and refreshing|Caffeine-free herbal infusion|Everyday ritual',
  }),
  P('h25', 'wellness', 'Herbal Bath Soak', 599, 699, '🛁', 4.5, 1, 'A relaxing bath soak combining mineral salts with dried herbs and flowers.', {
    image: p_herbal_bath_soak_1,
    images: [p_herbal_bath_soak_1, p_herbal_bath_soak_2],
    short: 'A relaxing soak with herbs and mineral salts.',
    ingredients: ['Epsom salt', 'Lavender', 'Rose petals', 'Chamomile'],
    weight: '250 g',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'jar',
    d: 'Relaxing ritual|Naturally fragrant|Thoughtfully selected ingredients',
  }),
  P('h26', 'gifts', 'Lavender Herbal Sachet Set', 349, 399, '💜', 4.4, 1, 'A set of three sachets filled with dried lavender and herbs, for drawers, wardrobes or pillows.', {
    image: p_lavender_herbal_sachet_set_1,
    images: [p_lavender_herbal_sachet_set_1, p_lavender_herbal_sachet_set_2],
    short: 'Set of three dried-lavender sachets for drawers and pillows.',
    ingredients: ['Lavender', 'Rose petals', 'Cedar shavings'],
    weight: 'Pack of 3',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    art: 'sachets',
    d: 'Naturally fragrant|Calm everyday spaces|Handy gifting idea',
  }),
];
