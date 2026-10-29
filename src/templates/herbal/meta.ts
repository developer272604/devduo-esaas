import type { TemplateMeta } from '@/lib/types';

/** Identity and default look. Small on purpose: it is loaded with the app, the catalogue is not. */
export const meta: TemplateMeta = {
  id: 'herbal',
  name: 'Ooty Herbals',
  logo: '🌿',
  tag: 'Honey and herbal care',
  theme: { primary: '#114a37', font: 'Lora', bg: '#fbf9f4', mode: 'light', radius: 'soft' },
};
