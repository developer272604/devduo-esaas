import type { Product } from '@/lib/types';
import { P, SIZES } from '../helpers';

export const products: Product[] = [
  P('f1', 'kurtis', 'Floral Printed Kurti Set', 1999, 2999, '👗', 4.8, 124, 'Cotton kurta with palazzo and dupatta in a block floral print. Relaxed fit for long days.', {
    art: 'kurti', tag: 'New', opts: SIZES, d: 'Set of 3|Fabric: cotton|Care: wash separately',
  }),
  P('f2', 'lehengas', 'Embroidered Lehenga Set', 4999, 6999, '🥻', 4.9, 89, 'A flared lehenga with thread embroidery, a matching blouse and a net dupatta.', {
    art: 'lehenga', tag: 'Bestseller', opts: SIZES, d: 'Set of 3|Fabric: georgette|Dry clean only',
  }),
  P('f3', 'kurtis', 'Chikankari Kurti Set', 1799, 2499, '👗', 4.6, 78, 'Hand-finished chikankari on soft cotton, paired with straight pants.', {
    art: 'kurti', tag: 'Sale', opts: SIZES, d: 'Set of 2|Fabric: cotton|Hand embroidered',
  }),
  P('f4', 'lehengas', 'Rayon Lehenga Set', 3999, 5499, '🥻', 4.8, 92, 'Light rayon lehenga with a printed border. Easy to carry and comfortable for festive evenings.', {
    art: 'lehenga', opts: SIZES, d: 'Set of 3|Fabric: rayon|Machine wash on gentle',
  }),
  P('f5', 'kurtis', 'Mirror Work Kurti Set', 2799, 3899, '👚', 4.7, 65, 'A navy kurta with mirror work on the yoke, with matching bottoms and dupatta.', {
    art: 'kurti', opts: SIZES, d: 'Set of 3|Fabric: viscose blend|Mirror work yoke',
  }),
  P('f6', 'lehengas', 'Velvet Lehenga Set', 5999, 7999, '🥻', 4.9, 112, 'Deep wine velvet with zari detailing. Made for winter weddings.', {
    art: 'lehenga', tag: 'New', opts: SIZES, d: 'Set of 3|Fabric: velvet|Dry clean only',
  }),
  P('f7', 'suits', 'Cotton Suit Set', 2499, 3499, '👘', 4.9, 67, 'An unstitched-look straight suit in pure cotton with a mul dupatta.', {
    art: 'suit', opts: SIZES, d: 'Set of 3|Fabric: pure cotton|Care: hand wash first time',
  }),
  P('f8', 'suits', 'Anarkali Suit Set', 3299, 4499, '👗', 4.7, 54, 'A floor-length Anarkali with an embroidered yoke and a soft chiffon dupatta.', {
    art: 'suit', opts: SIZES, d: 'Set of 3|Fabric: chanderi blend|Fully lined',
  }),
  P('f9', 'coord', 'Linen Co-ord Set', 2199, 3499, '🧥', 4.6, 76, 'A relaxed linen shirt and trousers in a single colour. Wear together or split.', {
    art: 'coord', opts: SIZES, d: 'Set of 2|Fabric: linen blend|Regular fit',
  }),
  P('f10', 'coord', 'Printed Co-ord Set', 2599, 3699, '🧥', 4.5, 61, 'A cropped printed top with matching flared pants. Easy to dress up.', {
    art: 'coord', opts: SIZES, d: 'Set of 2|Fabric: rayon|Flared fit',
  }),
  P('f11', 'bottoms', 'Cotton Palazzo Pants', 899, 1299, '👖', 4.4, 210, 'Wide-leg cotton palazzos with an elastic waist and side pockets.', {
    art: 'trousers', opts: SIZES, d: 'Fabric: cotton|Elastic waist|Pockets: 2',
  }),
  P('f12', 'accessories', 'Embroidered Potli Bag', 1299, 1799, '👜', 4.5, 143, 'A silk potli with zardozi embroidery and a drawstring closure.', {
    art: 'potli', opts: { label: 'Colour', values: ['Maroon', 'Teal', 'Gold'] }, d: 'Size: 22 × 18 cm|Fabric: silk|Drawstring closure',
  }),
];
