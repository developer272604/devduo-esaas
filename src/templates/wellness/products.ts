import type { Product } from '@/lib/types';
import { P } from '../helpers';
import jar from './images/jar.jpg';
import lineup from './images/lineup.jpg';
import multivitamin from './images/multivitamin.jpg';
import newline from './images/newline.jpg';
import capsules from './images/capsules.jpg';

export const products: Product[] = [
  P('w1', 'gut', 'DS-01 Daily Synbiotic', 3499, 3999, '💊', 4.8, 2140, 'Eases bloating, improves regularity and supports digestive health with 24 targeted probiotic strains and a novel prebiotic.', {
    art: 'bottle', image: jar, tag: 'Bestseller', d: 'Strains: 24|Capsules: 60 (30 days)|Delayed-release capsule|Vegan',
  }),
  P('w2', 'gut', '14-Day Gut Reset', 2199, 2499, '🌱', 4.6, 640, 'A two-week gentle reset for regularity and comfort. Pair with the Daily Synbiotic.', {
    art: 'box', d: 'Duration: 14 days|Taken with food|No artificial colours',
  }),
  P('w3', 'gut', 'Kids Daily Synbiotic', 2799, 3199, '🧒', 4.7, 510, 'A daily probiotic in a dissolvable stick for children aged 3 and over.', {
    art: 'sachets', d: 'Sticks: 30|Age: 3 and above|Berry flavour',
  }),
  P('w4', 'gut', 'Prebiotic Fibre Powder', 1699, 1999, '🥣', 4.4, 330, 'A tasteless prebiotic fibre that mixes into water, tea or a smoothie.', {
    art: 'jar', d: 'Servings: 30|Unflavoured|Gluten free',
  }),
  P('w5', 'nutrition', 'DM-02 Daily Multivitamin', 2999, 3499, '💊', 4.7, 1180, 'Helps fill daily nutrient gaps with 100% daily value of 20 essential vitamins and minerals.', {
    art: 'bottle', image: multivitamin, tag: 'New', d: 'Nutrients: 20 essential vitamins and minerals|Capsules: 60 (30 days)|Vegan',
  }),
  P('w6', 'nutrition', 'Omega-3 and Vitamin D', 1899, 2299, '🐟', 4.5, 720, 'Algae-based omega-3 with vitamin D3 for heart, brain and bone support.', {
    art: 'bottle', image: newline, d: 'Source: algae|Softgels: 60|No fishy aftertaste',
  }),
  P('w7', 'nutrition', 'Energy Support Capsules', 1399, 1699, '⚡', 4.3, 290, 'B vitamins and adaptogens for steady daytime energy without a caffeine crash.', {
    art: 'bottle', image: capsules, d: 'Capsules: 60|Caffeine free|Vegan',
  }),
  P('w8', 'sleep', 'Magnesium Glycinate', 1299, 1599, '🌙', 4.6, 880, 'A gentle, well-absorbed magnesium to help you wind down and stay asleep.', {
    art: 'bottle', d: 'Capsules: 90|Form: bisglycinate|Non-habit forming',
  }),
  P('w9', 'sleep', 'Sleep Support Capsules', 1499, 1799, '😴', 4.4, 410, 'Melatonin-free blend of L-theanine and herbal extracts for restful sleep.', {
    art: 'bottle', d: 'Capsules: 60|Melatonin free|Non-habit forming',
  }),
  P('w10', 'bundles', 'Starter Bundle', 5999, 7499, '🎁', 4.8, 260, 'Daily Synbiotic, Daily Multivitamin and Magnesium Glycinate for a full month.', {
    art: 'box', image: lineup, tag: 'Save 20%', d: '3 products|30-day supply|Free shipping',
  }),
  P('w11', 'bundles', 'Travel Pack', 1199, 1399, '🧳', 4.5, 190, 'Seven days of Daily Synbiotic and Multivitamin in a slim travel case.', {
    art: 'case', d: '7-day supply|Slim case|Airline friendly',
  }),
];
