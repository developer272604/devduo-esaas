import type { Template } from '@/lib/types';
import { KEY_PREFIX, parseJson, safeStorage } from '@/lib/storage';
import { FONT_FAMILY, applyTheme, themeFor } from '@/lib/theme';
import { sanitizeThemes } from '@/lib/sanitize';
import { useThemeStore } from '@/store/theme';
import { DEFAULT_TEMPLATE, TEMPLATE_META, getTemplate, isTemplateId, loadTemplate } from './index';

/** The template id saved by the template store, checked. Read before the stores exist, so the right chunk can start downloading early. */
export function savedTemplateId(): string {
  const saved = parseJson<{ state?: { tpl?: unknown } }>(safeStorage.getItem(KEY_PREFIX + 'template') as string | null);
  return isTemplateId(saved?.state?.tpl) ? (saved!.state!.tpl as string) : DEFAULT_TEMPLATE;
}

/** Tells the browser to start fetching the first big picture on the home page, which is what the visitor sees first. */
export function preloadHero(t: Template): void {
  const hero = t.home.find((s) => s.type === 'heroImage' || s.type === 'heroDeals' || s.type === 'heroPhoto');
  const href = hero && 'image' in hero ? hero.image : undefined;
  if (!href || typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.setAttribute('rel', 'preload');
  link.setAttribute('as', 'image');
  link.setAttribute('href', href);
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
}

/** Loads the saved template (or the default if that fails) and returns when it is ready to render. */
export async function loadSavedTemplate(): Promise<Template> {
  let t: Template;
  try {
    t = await loadTemplate(savedTemplateId());
  } catch {
    t = await loadTemplate(DEFAULT_TEMPLATE);
  }
  preloadHero(getTemplate(t.id));
  return t;
}

/** The longest the first paint will wait for the font. After that the page shows with the fallback font and swaps. */
export const FONT_WAIT_MS = 1500;

/** The CSS family of the font the saved theme (or the template's own default) will use. */
export function savedFontFamily(): string {
  const id = savedTemplateId();
  const themes = sanitizeThemes(parseJson<{ state?: { themes?: unknown } }>(safeStorage.getItem(KEY_PREFIX + 'theme') as string | null)?.state?.themes);
  const font = themes[id]?.font ?? TEMPLATE_META[id].theme.font;
  return FONT_FAMILY[font];
}

/**
 * Starts downloading the theme font now and waits for it, so the first paint already uses it. Without this the page
 * paints in a fallback font, the real font arrives, and the text re-wraps and pushes the content below it down.
 * Resolves after FONT_WAIT_MS at the latest, and never rejects.
 */
export async function loadThemeFont(family = savedFontFamily()): Promise<void> {
  const fonts = typeof document === 'undefined' ? undefined : document.fonts;
  if (!fonts?.load) return;
  const loading = Promise.all(['400', '600', '700'].map((w) => fonts.load(`${w} 1em ${family}`))).then(() => undefined, () => undefined);
  await Promise.race([loading, new Promise<void>((r) => setTimeout(r, FONT_WAIT_MS))]);
}

/**
 * Puts the saved look (or the template's own) on the page before the first render. The inline script in index.html
 * does this from a cache when it can; this covers a first visit to a template and a cleared cache, so the first paint
 * never uses the wrong colours or font and re-wraps when the right ones arrive.
 */
export function applySavedTheme(t: Template): void {
  applyTheme(themeFor(useThemeStore.getState().themes, t), t.theme.bg);
}
