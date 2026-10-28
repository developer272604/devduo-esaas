import type { Template } from '@/lib/types';
import { herbal } from './herbal/config';
import { gadgets } from './gadgets/config';
import { fashion } from './fashion/config';
import { marketplace } from './marketplace/config';
import { wellness } from './wellness/config';

/** Registry. Adding a template means adding a folder and one line here. */
export const TEMPLATES: Record<string, Template> = { herbal, gadgets, fashion, marketplace, wellness };
export const TEMPLATE_IDS = Object.keys(TEMPLATES);
export const DEFAULT_TEMPLATE = 'herbal';

export const getTemplate = (id: string | null | undefined): Template => (id && TEMPLATES[id]) || TEMPLATES[DEFAULT_TEMPLATE];
