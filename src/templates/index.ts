import type { Template, TemplateMeta } from '@/lib/types';
import { meta as herbal } from './herbal/meta';
import { meta as gadgets } from './gadgets/meta';
import { meta as fashion } from './fashion/meta';
import { meta as marketplace } from './marketplace/meta';
import { meta as wellness } from './wellness/meta';

/**
 * Registry. Adding a template means a new folder (meta.ts, config.ts, products.ts, images) and one line in
 * each of the two tables below. Only the small meta files ship with the app; each template's catalogue is
 * its own chunk, fetched the first time that template is used.
 */
export const TEMPLATE_META: Record<string, TemplateMeta> = { herbal, gadgets, fashion, marketplace, wellness };
export const TEMPLATE_IDS = Object.keys(TEMPLATE_META);
export const DEFAULT_TEMPLATE = 'herbal';

const loaders: Record<string, () => Promise<Template>> = {
  herbal: () => import('./herbal/config').then((m) => m.herbal),
  gadgets: () => import('./gadgets/config').then((m) => m.gadgets),
  fashion: () => import('./fashion/config').then((m) => m.fashion),
  marketplace: () => import('./marketplace/config').then((m) => m.marketplace),
  wellness: () => import('./wellness/config').then((m) => m.wellness),
};

/** Templates that have been loaded so far, by id. */
export const TEMPLATES: Record<string, Template> = {};
const pending: Record<string, Promise<Template> | undefined> = {};

export const isTemplateId = (id: unknown): id is string => typeof id === 'string' && Object.prototype.hasOwnProperty.call(TEMPLATE_META, id);

/** Fetches a template's catalogue once and remembers it. An unknown id loads the default. */
export function loadTemplate(id: string): Promise<Template> {
  const key = isTemplateId(id) ? id : DEFAULT_TEMPLATE;
  const done = TEMPLATES[key];
  if (done) return Promise.resolve(done);
  pending[key] ??= loaders[key]()
    .then((t) => (TEMPLATES[key] = t))
    .finally(() => {
      pending[key] = undefined;
    });
  return pending[key]!;
}

export const loadAllTemplates = (): Promise<Template[]> => Promise.all(TEMPLATE_IDS.map(loadTemplate));

/** A loaded template. The app loads the active one before it renders, so this only throws on a coding mistake. */
export function getTemplate(id: string | null | undefined): Template {
  const t = (isTemplateId(id) ? TEMPLATES[id] : undefined) ?? TEMPLATES[DEFAULT_TEMPLATE];
  if (!t) throw new Error(`Template "${String(id)}" is not loaded yet: call loadTemplate() first.`);
  return t;
}
