import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TEMPLATES } from '@/templates';
import { ART_KINDS, Illustration } from '@/components/common/Illustration';

describe('catalogue pictures (U4, U5)', () => {
  for (const t of Object.values(TEMPLATES)) {
    it(`${t.name}: no two products share a photo`, () => {
      const seen = new Map<string, string>();
      for (const p of t.products) {
        if (!p.image) continue;
        expect(seen.get(p.image), `${p.id} reuses the photo of ${seen.get(p.image)}`).toBeUndefined();
        seen.set(p.image, p.id);
      }
    });

    it(`${t.name}: every product has a photo or a drawn picture, never just an emoji`, () => {
      for (const p of t.products) {
        expect(Boolean(p.image) || Boolean(p.art), `${p.id} ${p.name} has no picture`).toBe(true);
        if (p.art) expect(ART_KINDS, `${p.id} art kind`).toContain(p.art);
      }
    });

    it(`${t.name}: categories without a photo have a drawn picture`, () => {
      for (const c of t.cats) expect(Boolean(c.image) || Boolean(c.art), `${t.id}/${c.slug}`).toBe(true);
    });

    it(`${t.name}: home sections draw from the catalogue, not emoji`, () => {
      for (const s of t.home) {
        if (s.type === 'heroEditorial') s.art.forEach((k) => expect(ART_KINDS).toContain(k));
        if (s.type === 'promoBenefits') expect(ART_KINDS).toContain(s.art);
        if (s.type === 'promos') s.items.forEach((i) => expect(Boolean(i.image) || Boolean(i.art), i.title).toBe(true));
      }
    });
  }

  it('demo data does not use real brand names', () => {
    const names = Object.values(TEMPLATES).flatMap((t) => t.products.flatMap((p) => [p.name, p.desc, p.d ?? '']));
    for (const n of names) expect(n).not.toMatch(/iphone|samsung|galaxy|oneplus|pixel|macbook|apple|nothing phone|tensor|snapdragon/i);
  });
});

describe('illustrations', () => {
  it('every kind draws something visible and uses theme classes only', () => {
    for (const kind of ART_KINDS) {
      const { container, unmount } = render(<Illustration kind={kind} variant={1} />);
      const svg = container.querySelector('svg')!;
      expect(svg.querySelectorAll('path, rect, circle, ellipse').length, kind).toBeGreaterThan(2);
      // no inline colours: everything comes from the theme variables through classes
      expect(svg.outerHTML, kind).not.toMatch(/fill="#|stroke="#|rgb\(|hsl\(/i);
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      unmount();
    }
  });
  it('variants change small details, not the whole picture', () => {
    const a = render(<Illustration kind="phone" variant={0} />).container.innerHTML;
    const b = render(<Illustration kind="phone" variant={1} />).container.innerHTML;
    expect(a).not.toBe(b);
  });
});
