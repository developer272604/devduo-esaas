import type { TemplateMeta } from '@/lib/types';

/** Identity and default look. Small on purpose: it is loaded with the app, the catalogue is not. */
export const meta: TemplateMeta = {
  id: 'marketplace',
  name: 'Marketly',
  logo: '🛍️',
  tag: 'Everyday marketplace',
  theme: { primary: '#2563eb', font: 'Poppins', bg: '#f6f8fc', mode: 'light', radius: 'soft' },
};
