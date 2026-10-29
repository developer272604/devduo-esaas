import type { TemplateMeta } from '@/lib/types';

/** Identity and default look. Small on purpose: it is loaded with the app, the catalogue is not. */
export const meta: TemplateMeta = {
  id: 'wellness',
  name: 'Gutwell',
  logo: '🌱',
  tag: 'Probiotics and nutrition',
  theme: { primary: '#244a33', font: 'Manrope', bg: '#f6f4ef', mode: 'light', radius: 'round' },
};
