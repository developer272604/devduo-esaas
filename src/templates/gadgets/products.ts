import type { Product } from '@/lib/types';
import { P } from '../helpers';

const STORAGE = { label: 'Storage', values: ['256 GB', '512 GB', '1 TB'], mult: [1, 1.18, 1.45] };
const PHONE_COLOURS = { label: 'Colour', values: ['Black', 'Blue', 'Silver'] };

export const products: Product[] = [
  P('g1', 'phones', 'iPhone 15 Pro Max', 134900, 159900, '📱', 4.8, 128, 'Titanium build, A17 Pro chip and a 48 MP main camera with 5x optical zoom. USB-C, finally.', {
    tag: 'New', opts: STORAGE, d: 'Display: 6.7 inch Super Retina XDR|Chip: A17 Pro|Camera: 48 MP + 12 MP + 12 MP|Warranty: 1 year',
  }),
  P('g2', 'phones', 'Samsung Galaxy S24 Ultra 5G', 109999, 129999, '📱', 4.7, 96, 'A 200 MP camera, built-in S Pen and a titanium frame. Seven years of software updates.', {
    opts: STORAGE, d: 'Display: 6.8 inch Dynamic AMOLED 2X|Battery: 5000 mAh|Camera: 200 MP main|Warranty: 1 year',
  }),
  P('g3', 'phones', 'OnePlus 12 5G', 64999, 69999, '📱', 4.6, 74, 'Snapdragon 8 Gen 3 with 100W wired charging that fills the battery in under 30 minutes.', {
    opts: PHONE_COLOURS, d: 'Display: 6.82 inch LTPO AMOLED|Charging: 100 W wired|RAM: 12 GB|Warranty: 1 year',
  }),
  P('g4', 'phones', 'Google Pixel 8 Pro 128GB', 84999, 106999, '📱', 4.7, 58, 'The best Pixel camera yet, with seven years of updates and on-device AI tools for photos and calls.', {
    opts: PHONE_COLOURS, d: 'Display: 6.7 inch LTPO OLED|Chip: Tensor G3|Updates: 7 years|Warranty: 1 year',
  }),
  P('g5', 'phones', 'Nothing Phone (2) 256GB', 39999, 44999, '📱', 4.5, 38, 'Glyph interface on the back, a clean software skin and a smooth 120 Hz display.', {
    opts: { label: 'Colour', values: ['Dark Grey', 'White'] }, d: 'Display: 6.7 inch LTPO OLED|Battery: 4700 mAh|Warranty: 1 year',
  }),
  P('g6', 'earbuds', 'Aero Buds Pro', 2999, 4999, '🎧', 4.4, 3200, 'Active noise cancelling earbuds with 36 hours of total playback and dual-device pairing.', {
    tag: 'Bestseller', d: 'Battery: 36 h with case|Bluetooth 5.3|IPX5 sweat resistant|Warranty: 1 year',
  }),
  P('g7', 'earbuds', 'Bass Neckband', 1299, 1999, '🎶', 4.2, 5400, 'Magnetic neckband with 40 hours of battery and a punchy low end for commutes.', {
    d: 'Battery: 40 h|Fast charge: 10 min for 10 h',
  }),
  P('g8', 'watches', 'Pulse Smartwatch', 3499, 5999, '⌚', 4.3, 2100, '1.9 inch AMOLED display, built-in GPS and 10-day battery. Tracks sleep, SpO2 and 100 sports modes.', {
    opts: { label: 'Colour', values: ['Black', 'Silver', 'Blue'] }, d: 'Display: 1.9 inch AMOLED|Battery: 10 days|Water resistance: 5 ATM',
  }),
  P('g9', 'watches', 'Band Fit Tracker', 1999, 2999, '⏱️', 4.1, 1700, 'A slim fitness band with heart-rate tracking, 14-day battery and call alerts.', {
    d: 'Battery: 14 days|Water resistant',
  }),
  P('g10', 'accessories', '65W GaN Charger', 1499, 1999, '🔌', 4.6, 2600, 'Charges a laptop, phone and earbuds together from a charger smaller than a deck of cards.', {
    d: 'Ports: 2 USB-C, 1 USB-A|Output: 65 W',
  }),
  P('g11', 'accessories', '20000mAh Power Bank', 1799, 2499, '🔋', 4.5, 4300, 'Two-way 22.5W fast charging with a digital display. Charges a phone four times.', {
    tag: 'Bestseller', d: 'Capacity: 20000 mAh|Output: 22.5 W|Flight safe',
  }),
  P('g12', 'tablets', 'Tab Air 11 inch', 27999, 32999, '📲', 4.4, 410, 'An 11 inch 2.5K display, quad speakers and a stylus that clips to the side. Made for notes and movies.', {
    opts: { label: 'Storage', values: ['128 GB', '256 GB'], mult: [1, 1.2] }, d: 'Display: 11 inch 2.5K|Battery: 8000 mAh|Stylus supported',
  }),
];
