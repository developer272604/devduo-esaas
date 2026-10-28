import { describe, expect, it } from 'vitest';
import { contrast, defaultTheme, normaliseTheme, onColor, readableOn, themeFor, themeVars } from '@/lib/theme';
import { TEMPLATES } from '@/templates';
import { FONT_NAMES } from '@/lib/types';

describe('contrast helpers', () => {
  it('flips the text on a very light yellow to near-black', () => {
    expect(onColor('#fff7a8')).toBe('#111111');
    expect(onColor('#114a37')).toBe('#ffffff');
  });
  it('nudges a yellow primary until it is readable on white and on the page background', () => {
    const text = readableOn('#ffe14d', ['#ffffff', '#fbf9f4']);
    expect(contrast(text, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(text, '#fbf9f4')).toBeGreaterThanOrEqual(4.5);
  });
  it('lightens instead of darkening on dark surfaces', () => {
    const text = readableOn('#111827', ['#181c1a', '#0f1211']);
    expect(contrast(text, '#181c1a')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('themeVars', () => {
  const base = { primary: '#2f7d4f', font: 'Inter', mode: 'light', radius: 'soft' } as const;

  it('emits every token the spec lists', () => {
    const v = themeVars(base, '#f6f3ea');
    for (const k of ['--primary', '--on-primary', '--primary-text', '--ph', '--bg', '--surface', '--text', '--muted', '--border', '--radius', '--radius-btn', '--font', '--artL1', '--artL2']) {
      expect(v[k], k).toBeTruthy();
    }
    expect(v['--bg']).toBe('#f6f3ea');
  });
  it('uses the radius presets', () => {
    const r = (radius: 'sharp' | 'soft' | 'round') => themeVars({ ...base, radius }, '#ffffff');
    expect([r('sharp')['--radius'], r('sharp')['--radius-btn']]).toEqual(['2px', '2px']);
    expect([r('soft')['--radius'], r('soft')['--radius-btn']]).toEqual(['10px', '8px']);
    expect([r('round')['--radius'], r('round')['--radius-btn']]).toEqual(['20px', '999px']);
  });
  it('redefines the surface colours in dark mode', () => {
    const light = themeVars(base, '#f6f3ea');
    const dark = themeVars({ ...base, mode: 'dark' }, '#f6f3ea');
    for (const k of ['--bg', '--surface', '--text', '--muted', '--border']) expect(dark[k]).not.toBe(light[k]);
  });
  it('maps each of the 8 fonts to its own family', () => {
    const fonts = new Set(FONT_NAMES.map((font) => themeVars({ ...base, font }, '#ffffff')['--font']));
    expect(fonts.size).toBe(8);
  });
  it('keeps primary text readable for every template and mode', () => {
    for (const t of Object.values(TEMPLATES)) {
      for (const mode of ['light', 'dark'] as const) {
        const v = themeVars({ ...defaultTheme(t), mode }, t.theme.bg);
        expect(contrast(v['--primary-text'], v['--surface'])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(v['--primary-text'], v['--bg'])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(v['--on-primary'], v['--primary'])).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('theme persistence helpers', () => {
  it('falls back to the template default when nothing is remembered', () => {
    const t = TEMPLATES.fashion;
    expect(themeFor({}, t)).toEqual(defaultTheme(t));
  });
  it('repairs a corrupt stored value', () => {
    const t = TEMPLATES.fashion;
    const fixed = normaliseTheme(
      { primary: 'not-a-colour', font: 'Comic Sans' as never, mode: 'neon' as never, radius: 'blob' as never },
      defaultTheme(t),
    );
    expect(fixed).toEqual(defaultTheme(t));
  });
});
