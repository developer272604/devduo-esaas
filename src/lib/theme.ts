import type { FontName, Mode, Radius, Template, ThemeState } from './types';
import { THEME_VARS_KEY, safeStorage } from './storage';

/* ---------- colour maths ---------- */
export const hex2rgb = (hex: string): [number, number, number] => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const luminance = ([r, g, b]: [number, number, number]): number => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export const contrast = (a: string, b: string): number => {
  const x = luminance(hex2rgb(a));
  const y = luminance(hex2rgb(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

export const rgb2hsl = ([r0, g0, b0]: [number, number, number]): [number, number, number] => {
  const r = r0 / 255;
  const g = g0 / 255;
  const b = b0 / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
};

export const hsl2hex = (h: number, s0: number, l0: number): string => {
  const s = s0 / 100;
  const l = l0 / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
};

/** White or near-black, whichever has more contrast against `bg`. */
export const onColor = (bg: string): string => (contrast(bg, '#ffffff') >= contrast(bg, '#111111') ? '#ffffff' : '#111111');

/** Nudge lightness of `hex` until it reaches 4.5:1 against every colour in `backgrounds`. */
export const readableOn = (hex: string, backgrounds: string[]): string => {
  const [h, s, l0] = rgb2hsl(hex2rgb(hex));
  const darkBg = backgrounds.every((b) => luminance(hex2rgb(b)) < 0.3);
  const ok = (l: number) => backgrounds.every((b) => contrast(hsl2hex(h, s, l), b) >= 4.5);
  let l = l0;
  for (let i = 0; i < 60 && !ok(l); i++) l = Math.max(0, Math.min(100, l + (darkBg ? 2 : -2)));
  return hsl2hex(h, s, l);
};

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/* ---------- tokens ---------- */
export const RADIUS: Record<Radius, [string, string]> = {
  sharp: ['2px', '2px'],
  soft: ['10px', '8px'],
  round: ['20px', '999px'],
};

export const PALETTE = {
  light: { surface: '#ffffff', text: '#1b1d1c', muted: '#5d6561', border: '#e2ded2', artL1: '93%', artL2: '86%' },
  dark: { surface: '#181c1a', text: '#eceeed', muted: '#9aa39e', border: '#2a302d', artL1: '24%', artL2: '17%' },
} as const;
export const DARK_BG = '#0f1211';

/** CSS family names registered by the @fontsource packages imported in main.tsx. */
export const FONT_FAMILY: Record<FontName, string> = {
  Inter: "'Inter Variable'",
  Poppins: "'Poppins'",
  'Playfair Display': "'Playfair Display Variable'",
  Lora: "'Lora Variable'",
  'Space Grotesk': "'Space Grotesk Variable'",
  Manrope: "'Manrope Variable'",
  Nunito: "'Nunito Variable'",
  Fraunces: "'Fraunces Variable'",
};

export const SWATCHES = [
  '#2f7d4f', '#0f766e', '#2563eb', '#4c6fff', '#7c3aed', '#be185d',
  '#c2410c', '#e8a317', '#b91c1c', '#0e7490', '#334155', '#111827',
];

/** Every CSS variable the theme controls. */
export function themeVars(theme: ThemeState, lightBg: string): Record<string, string> {
  const dark = theme.mode === 'dark';
  const p = PALETTE[theme.mode];
  const bg = dark ? DARK_BG : lightBg;
  const [r, rb] = RADIUS[theme.radius] ?? RADIUS.soft;
  const hue = Math.round(rgb2hsl(hex2rgb(theme.primary))[0]);
  return {
    '--primary': theme.primary,
    '--on-primary': onColor(theme.primary),
    '--primary-text': readableOn(theme.primary, [p.surface, bg]),
    '--ph': String(hue),
    '--bg': bg,
    '--surface': p.surface,
    '--text': p.text,
    '--muted': p.muted,
    '--border': p.border,
    '--radius': r,
    '--radius-btn': rb,
    '--font': `${FONT_FAMILY[theme.font] ?? FONT_FAMILY.Inter}, system-ui, sans-serif`,
    '--artL1': p.artL1,
    '--artL2': p.artL2,
  };
}

/** A theme variable is a --custom-property with a colour, number, length or font list. Anything that could load a URL or break out of the declaration is refused. */
const VAR_NAME = /^--[a-z0-9-]+$/i;
const VAR_VALUE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[\w\s,'"%.-]{1,80})$/i;
export const isSafeThemeVar = (name: string, value: unknown): value is string =>
  typeof value === 'string' && VAR_NAME.test(name) && VAR_VALUE.test(value) && !/url\(|[;{}]/i.test(value);

export function applyTheme(theme: ThemeState, lightBg: string, root: HTMLElement = document.documentElement): void {
  const vars = themeVars(theme, lightBg);
  for (const [k, v] of Object.entries(vars)) if (isSafeThemeVar(k, v)) root.style.setProperty(k, v);
  root.dataset.theme = theme.mode;
  // Read back by the inline script in index.html on the next load, so the first paint is already themed.
  safeStorage.setItem(THEME_VARS_KEY, JSON.stringify({ vars, mode: theme.mode }));
}

export const defaultTheme = (t: Pick<Template, 'theme'>): ThemeState => ({
  primary: t.theme.primary,
  font: t.theme.font,
  mode: t.theme.mode,
  radius: t.theme.radius,
});

export const normaliseTheme = (t: Partial<ThemeState> | undefined, fallback: ThemeState): ThemeState => ({
  primary: t?.primary && isHex(t.primary) ? t.primary : fallback.primary,
  font: t?.font && t.font in FONT_FAMILY ? t.font : fallback.font,
  mode: (t?.mode === 'dark' || t?.mode === 'light' ? t.mode : fallback.mode) as Mode,
  radius: (t?.radius && t.radius in RADIUS ? t.radius : fallback.radius) as Radius,
});

/** The remembered theme for a template, or its own default. */
export const themeFor = (themes: Record<string, ThemeState>, t: Pick<Template, 'id' | 'theme'>): ThemeState => normaliseTheme(themes[t.id], defaultTheme(t));
