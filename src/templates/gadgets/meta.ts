import type { TemplateMeta } from '@/lib/types';

/** Identity and default look. Small on purpose: it is loaded with the app, the catalogue is not. */
export const meta: TemplateMeta = {
  id: 'gadgets',
  name: 'MobiStore',
  logo: '📱',
  tag: 'Phones and gadgets',
  theme: { primary: '#7c3aed', font: 'Manrope', bg: '#f7f5fd', mode: 'light', radius: 'soft' },
};
