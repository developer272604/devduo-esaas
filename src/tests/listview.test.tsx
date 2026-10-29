import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ListView } from '@/components/ListView';
import { TEMPLATES } from '@/templates';
import { fromPrice } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import {
  PAGE_SIZE, applyFilters, clampRange, emptyFilters, packOptions, pageList, paginate, priceBounds, sortProducts,
} from '@/components/list/model';

const herbal = TEMPLATES.herbal.products;
const FREE = TEMPLATES.herbal.freeShipAt;

const view = (items: Product[] = herbal, props: Partial<Parameters<typeof ListView>[0]> = {}) =>
  render(
    <MemoryRouter>
      <ListView title="Honey" blurb="Raw honey." items={items} trail={[{ label: 'Honey' }]} activeSlug="honey" {...props} />
    </MemoryRouter>,
  );

/** Names of the product cards on screen, in order. */
const names = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading', { level: 2 }).textContent);
const count = () => document.querySelector('.cat-count')!.textContent;

afterEach(() => vi.unstubAllGlobals());

describe('list model', () => {
  it('paginates nine at a time and pulls a bad page back in range', () => {
    expect(PAGE_SIZE).toBe(9);
    const p1 = paginate(herbal, 1);
    expect(p1.slice).toHaveLength(9);
    expect([p1.from, p1.to, p1.total, p1.pages]).toEqual([1, 9, herbal.length, Math.ceil(herbal.length / 9)]);
    const last = paginate(herbal, 99);
    expect(last.page).toBe(last.pages);
    expect(last.slice).toHaveLength(herbal.length - 9 * (last.pages - 1));
    expect(last.to).toBe(herbal.length);
    expect(last.shownPct).toBe(100);
    expect(paginate(herbal, 0).page).toBe(1);
    expect(paginate([], 1)).toMatchObject({ page: 1, pages: 1, from: 0, to: 0, total: 0, shownPct: 0 });
  });

  it('shows every page button when there are few, and a window with gaps when there are many', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
    expect(pageList(1, 10)).toEqual([1, 2, 'gap', 10]);
    expect(pageList(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(pageList(10, 10)).toEqual([1, 'gap', 9, 10]);
  });

  it('keeps typed prices ordered and inside the bounds', () => {
    const b = { lo: 100, hi: 1000, step: 10 };
    expect(clampRange('300', '200', b)).toEqual({ min: 200, max: 300 });
    expect(clampRange('5', '99999', b)).toEqual({ min: 100, max: 1000 });
    expect(clampRange('', 'abc', b)).toEqual({ min: 100, max: 1000 });
  });

  it('filters by price, option value and offer, and sorts', () => {
    const b = priceBounds(herbal);
    const f = emptyFilters(b);
    expect(applyFilters(herbal, f, FREE)).toHaveLength(herbal.length);
    const cheap = applyFilters(herbal, { ...f, max: 200 }, FREE);
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((p) => fromPrice(p).price <= 200)).toBe(true);
    const packs = packOptions(herbal);
    const one = applyFilters(herbal, { ...f, packs: [packs.values[0]] }, FREE);
    expect(one.every((p) => p.opts?.values.includes(packs.values[0]))).toBe(true);
    const rated = applyFilters(herbal, { ...f, offers: ['rated'] }, FREE);
    expect(rated.every((p) => p.rating >= 4.5)).toBe(true);
    const asc = sortProducts(herbal, 'plh').map((p) => fromPrice(p).price);
    expect(asc).toEqual([...asc].sort((a, c) => a - c));
    expect(sortProducts(herbal, 'feat')).toBe(herbal);
  });
});

describe('ListView', () => {
  it('has one h1, a breadcrumb, nine cards on page one and the count line', () => {
    view();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(names()).toHaveLength(9);
    expect(count()).toBe(`Showing 1–9 of ${herbal.length} products`);
    expect(document.querySelector('.cat-count')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText(new RegExp(`Showing 9 of ${herbal.length} items`))).toBeInTheDocument();
  });

  it('turns the page with the numbered buttons and prev/next', () => {
    view();
    const first = names();
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    fireEvent.click(within(nav).getByRole('button', { name: 'Next page' }));
    expect(count()).toBe(`Showing 10–18 of ${herbal.length} products`);
    expect(names()).not.toEqual(first);
    expect(within(nav).getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(within(nav).getByRole('button', { name: 'Page 3' }));
    const rest = herbal.length - 18;
    expect(names()).toHaveLength(rest);
    expect(count()).toBe(`Showing 19–${herbal.length} of ${herbal.length} products`);
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeDisabled();
    fireEvent.click(within(nav).getByRole('button', { name: 'Previous page' }));
    expect(count()).toContain('10–18');
  });

  it('adds a chip for each applied filter, removes one, and Reset all clears them', () => {
    view();
    fireEvent.click(screen.getByRole('checkbox', { name: /On sale/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Rated 4.5 and up/ }));
    const chip = screen.getByRole('button', { name: 'Remove filter: On sale' });
    expect(chip).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove filter: Rated 4.5 and up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset all' })).toBeInTheDocument();

    fireEvent.click(chip);
    expect(screen.queryByRole('button', { name: 'Remove filter: On sale' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: /On sale/ })).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Reset all' }));
    expect(screen.queryByRole('button', { name: /Remove filter/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reset all' })).toBeNull();
    expect(count()).toBe(`Showing 1–9 of ${herbal.length} products`);
  });

  it('toggles a pack size chip and filters by it', () => {
    view();
    const group = screen.getByRole('group', { name: /Options|Pack size|Size/ });
    const first = within(group).getAllByRole('button')[0];
    expect(first).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: `Remove filter: ${first.textContent}` })).toBeInTheDocument();
    expect(Number(count()!.match(/of (\d+)/)![1])).toBeLessThan(herbal.length);
  });

  it('applies a typed price range only when Apply is pressed', () => {
    view();
    const max = screen.getByLabelText('Max (₹)');
    fireEvent.change(max, { target: { value: '200' } });
    expect(count()).toContain(`of ${herbal.length} products`); // draft only
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    const shown = Number(count()!.match(/of (\d+)/)![1]);
    expect(shown).toBeLessThan(herbal.length);
    expect(shown).toBe(herbal.filter((p) => fromPrice(p).price <= 200).length);
    expect(screen.getByRole('button', { name: /Remove filter: ₹\d+ – ₹200/ })).toBeInTheDocument();
    // removing the chip brings the whole range back
    fireEvent.click(screen.getByRole('button', { name: /Remove filter: ₹\d+ – ₹200/ }));
    expect(count()).toContain(`of ${herbal.length} products`);
    expect(screen.getByLabelText('Max (₹)')).toHaveValue(priceBounds(herbal).hi);
  });

  it('sorts by price and goes back to page one', () => {
    view();
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Pagination' })).getByRole('button', { name: 'Page 2' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort by' }), { target: { value: 'plh' } });
    expect(count()).toContain('1–9');
    const sorted = sortProducts(herbal, 'plh').slice(0, 9);
    expect(names()).toEqual(sorted.map((p) => p.name));
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort by' }), { target: { value: 'phl' } });
    expect(names()[0]).toBe(sortProducts(herbal, 'phl')[0].name);
  });

  it('switches between grid and list view', () => {
    view();
    const results = document.querySelector('.cat-results')!;
    const grid = screen.getByRole('button', { name: 'Grid view' });
    const list = screen.getByRole('button', { name: 'List view' });
    expect(grid).toHaveAttribute('aria-pressed', 'true');
    expect(results).not.toHaveClass('is-list');
    fireEvent.click(list);
    expect(list).toHaveAttribute('aria-pressed', 'true');
    expect(grid).toHaveAttribute('aria-pressed', 'false');
    expect(results).toHaveClass('is-list');
    fireEvent.click(grid);
    expect(results).not.toHaveClass('is-list');
  });

  it('marks the active category and links to the others and to the shop', () => {
    view(herbal, { activeSlug: TEMPLATES.herbal.cats[0].slug });
    const nav = screen.getByRole('navigation', { name: 'Categories' });
    const active = within(nav).getByRole('link', { current: 'page' });
    expect(active).toHaveAttribute('href', `/category/${TEMPLATES.herbal.cats[0].slug}`);
    expect(within(nav).getByRole('link', { name: /All products/ })).toHaveAttribute('href', '/shop');
    expect(within(nav).getAllByRole('link').length).toBe(TEMPLATES.herbal.cats.length + 1);
  });

  it('lists three top rated products and four reassurances under the grid', () => {
    view();
    const top = screen.getByRole('heading', { name: 'Top rated' }).closest('.cat-w')!;
    expect(within(top as HTMLElement).getAllByRole('link')).toHaveLength(3);
    expect(document.querySelectorAll('.cat-values li')).toHaveLength(4);
  });

  it('says so when the filters leave nothing, and Reset all filters brings the list back', () => {
    const a = { ...herbal[0], id: 'zz1', price: 100, mrp: 100, opts: undefined };
    const b = { ...herbal[1], id: 'zz2', price: 500, mrp: 500, opts: undefined };
    view([a, b]);
    fireEvent.change(screen.getByLabelText('Min (₹)'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Max (₹)'), { target: { value: '300' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('heading', { level: 2, name: 'No products match' })).toBeInTheDocument();
    expect(count()).toBe('No products match');
    fireEvent.click(screen.getByRole('button', { name: 'Reset all filters' }));
    expect(screen.queryByRole('heading', { name: 'No products match' })).toBeNull();
    expect(names()).toHaveLength(2);
  });

  it('shows just the empty state when there are no products at all', () => {
    view([], { emptyText: 'Try a different search.' });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'No products match' })).toBeInTheDocument();
    expect(screen.getByText('Try a different search.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/shop');
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.queryByRole('button', { name: /^Filters/ })).toBeNull();
  });

  describe('filter drawer on tablet and phone', () => {
    const narrow = () =>
      vi.stubGlobal('matchMedia', (q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }));

    it('opens as a modal dialog from the Filters button, locks scroll, closes on Escape and gives scroll back', () => {
      narrow();
      view();
      expect(screen.queryByRole('dialog')).toBeNull();
      const fab = screen.getByRole('button', { name: /^Filters/ });
      fireEvent.click(fab);
      const dialog = screen.getByRole('dialog', { name: 'Filters' });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');
      expect(dialog.contains(document.activeElement)).toBe(true);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });

    it('closes from the close button and from the confirm button', () => {
      narrow();
      view();
      fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Close filters' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
      fireEvent.click(screen.getByRole('checkbox', { name: /On sale/ }));
      fireEvent.click(screen.getByRole('button', { name: /^Show \d+ products?$/ }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
