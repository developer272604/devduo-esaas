import type { Product } from '@/lib/types';
import { P } from '../helpers';
import sneakers from './images/sneakers.jpg';
import earbuds from './images/earbuds.jpg';
import iphone from './images/iphone.jpg';
import macbook from './images/macbook.jpg';
import airfryer from './images/airfryer.jpg';
import sofa from './images/sofa.jpg';
import watch from './images/watch.jpg';
import summer from './images/summer.jpg';
import living from './images/living.jpg';

const SHOE_SIZES = { label: 'Size', values: ['UK 7', 'UK 8', 'UK 9', 'UK 10'] };

export const products: Product[] = [
  P('m1', 'sports', 'Men’s Air Sneakers Running Shoes', 4999, 6599, '👟', 4.5, 1234, 'Cushioned running shoes with a breathable mesh upper and a grippy rubber outsole.', {
    image: sneakers, opts: SHOE_SIZES, d: 'Upper: breathable mesh|Sole: rubber|Weight: 260 g',
  }),
  P('m2', 'electronics', 'Premium Wireless Earbuds Pro', 5799, 7249, '🎧', 4.6, 2631, 'Noise cancelling earbuds with 30 hours of battery and a wireless charging case.', {
    image: earbuds, d: 'Battery: 30 h with case|Bluetooth 5.3|IPX4',
  }),
  P('m3', 'electronics', 'iPhone 15 Pro Max 256GB', 124999, 159900, '📱', 4.7, 1200, 'Titanium design, A17 Pro chip and a 48 MP main camera.', {
    image: iphone, tag: 'Bestseller', d: 'Display: 6.7 inch Super Retina XDR|Storage: 256 GB|Warranty: 1 year',
  }),
  P('m4', 'electronics', 'MacBook Air M2 13-inch', 89999, 109900, '💻', 4.7, 1200, 'Thin and silent, with up to 18 hours of battery and the M2 chip.', {
    image: macbook, d: 'Chip: Apple M2|Memory: 8 GB|Storage: 256 GB SSD',
  }),
  P('m5', 'home', 'Air Fryer 4.5L Digital Display', 6299, 8299, '🍟', 4.4, 862, 'Cook with up to 90% less oil. Eight presets and a digital touch display.', {
    image: airfryer, d: 'Capacity: 4.5 L|Power: 1500 W|8 presets',
  }),
  P('m6', 'home', 'Modern 3-Seater Fabric Sofa', 24999, 31249, '🛋️', 4.4, 542, 'A deep-seat sofa with a solid wood frame and a stain-resistant fabric.', {
    image: sofa, d: 'Seats: 3|Frame: solid wood|Fabric: stain resistant',
  }),
  P('m7', 'electronics', 'Smart Watch Series 5', 12499, 20999, '⌚', 4.5, 640, 'AMOLED display, GPS and seven days of battery. Tracks heart rate, sleep and workouts.', {
    image: watch, tag: 'Flash deal', d: 'Display: 1.9 inch AMOLED|Battery: 7 days|GPS built in',
  }),
  P('m8', 'fashion', 'Summer Floral Dress', 1799, 2999, '👗', 4.6, 410, 'A light cotton dress with a flared skirt. Made for beach days and brunches.', {
    image: summer, opts: { label: 'Size', values: ['S', 'M', 'L', 'XL'] }, d: 'Fabric: cotton|Flared fit|Machine washable',
  }),
  P('m9', 'beauty', 'Vitamin C Glow Serum', 899, 1299, '🧴', 4.5, 980, 'A 10% vitamin C serum that brightens dull skin in four weeks.', {
    d: 'Size: 30 ml|10% vitamin C|Fragrance free',
  }),
  P('m10', 'grocery', 'Aged Basmati Rice, 5 kg', 649, 799, '🍚', 4.7, 2300, 'Long-grain basmati aged for 24 months. Fluffy, fragrant and never sticky.', {
    d: 'Weight: 5 kg|Aged 24 months|Grain length: 8.3 mm',
  }),
  P('m11', 'sports', 'Pro Yoga Mat, 6 mm', 1299, 1799, '🧘', 4.4, 760, 'A dense, non-slip mat that cushions joints without losing balance.', {
    opts: { label: 'Colour', values: ['Teal', 'Grey', 'Plum'] }, d: 'Thickness: 6 mm|Non-slip|Carry strap included',
  }),
  P('m12', 'home', 'Ceramic Dinner Set, 24 pieces', 2499, 3499, '🍽️', 4.3, 390, 'A 24-piece dinner set in matte ceramic. Microwave and dishwasher safe.', {
    image: living, d: 'Pieces: 24|Microwave safe|Dishwasher safe',
  }),
];
