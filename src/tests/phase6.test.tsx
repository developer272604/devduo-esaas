import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { AddressForm } from '@/components/checkout/parts';
import { EmptyState } from '@/components/common/bits';
import { ProductCard, ProductGrid } from '@/components/common/ProductCard';
import { NotDemo } from '@/components/NotDemo';
import { emptyCheckout } from '@/store/checkout';
import { useDemoStore, useTourOpen } from '@/store/demo';
import { composeTitle } from '@/lib/useDocumentTitle';
import { TEMPLATES } from '@/templates';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('footer year (B2)', () => {
  const year = () => {
    const { unmount } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const text = screen.getByText(/Demo store, no real orders/).textContent ?? '';
    unmount();
    return text;
  };

  it('shows the current year, not a fixed one', () => {
    vi.useFakeTimers();
    for (const y of [2026, 2027, 2031]) {
      vi.setSystemTime(new Date(`${y}-06-15T10:00:00Z`));
      expect(year()).toContain(`© ${y} `);
    }
  });
  it('rolls over on new year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-31T23:30:00'));
    expect(year()).toContain('© 2026 ');
    vi.setSystemTime(new Date('2027-01-01T00:30:00'));
    expect(year()).toContain('© 2027 ');
  });
});

describe('page titles (B3)', () => {
  it('puts the page first, then the brand, then the product name', () => {
    expect(composeTitle('Cart (2)', 'Ooty Herbals')).toBe('Cart (2) – Ooty Herbals · Devduo ESaas demo');
    expect(composeTitle(undefined, 'Aarohi')).toBe('Aarohi · Devduo ESaas demo');
    expect(composeTitle('', 'Aarohi')).toBe('Aarohi · Devduo ESaas demo');
  });
});

describe('checkout field errors are wired to their field (A7)', () => {
  it('links each message to its input and marks the input invalid', () => {
    render(<AddressForm form={emptyCheckout} errors={{ name: 'Enter your full name.', pin: 'Enter a 6-digit pincode.' }} set={() => undefined} />);
    for (const [label, id, message] of [['Full name', 'ck-name-err', 'Enter your full name.'], ['Pincode', 'ck-pin-err', 'Enter a 6-digit pincode.']] as const) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', id);
      expect(document.getElementById(id)).toHaveTextContent(message);
    }
    const ok = screen.getByLabelText('City');
    expect(ok).toHaveAttribute('aria-invalid', 'false');
    expect(ok).not.toHaveAttribute('aria-describedby');
  });
});

describe('heading levels (A3)', () => {
  const product = TEMPLATES.herbal.products[3];
  const card = (level?: 2 | 3) =>
    render(
      <MemoryRouter>
        <ProductCard product={product} level={level} />
      </MemoryRouter>,
    );

  it('a product name is an h3 under a section heading, and an h2 on a page whose title is the h1', () => {
    const a = card();
    expect(within(a.container).getByRole('heading', { level: 3 })).toHaveTextContent(product.name);
    a.unmount();
    const b = card(2);
    expect(within(b.container).getByRole('heading', { level: 2 })).toHaveTextContent(product.name);
    expect(within(b.container).queryByRole('heading', { level: 3 })).toBeNull();
  });
  it('a grid passes the level on to every card', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductGrid products={TEMPLATES.herbal.products.slice(0, 4)} level={2} />
      </MemoryRouter>,
    );
    expect(container.querySelectorAll('h2')).toHaveLength(4);
    expect(container.querySelectorAll('h3')).toHaveLength(0);
  });
  it('an empty state is an h2, or the page h1 when it is the whole page', () => {
    const a = render(<EmptyState emoji="🛍️" title="Nothing here" />);
    expect(within(a.container).getByRole('heading', { level: 2 })).toBeInTheDocument();
    a.unmount();
    const b = render(<EmptyState emoji="🛍️" title="Your cart is empty" page />);
    expect(within(b.container).getByRole('heading', { level: 1 })).toHaveTextContent('Your cart is empty');
  });
});

describe('the first-visit tour (A1)', () => {
  const open = () => renderHook(() => useTourOpen()).result;
  const reset = () => act(() => useDemoStore.setState({ toured: false, reopened: false, snoozed: false }));

  it('is open for a new visitor, hidden for this visit by Escape, and still pending for next time', () => {
    reset();
    const r = open();
    expect(r.current).toBe(true);
    act(() => useDemoStore.getState().snooze());
    expect(r.current).toBe(false);
    expect(useDemoStore.getState().toured).toBe(false); // it will come back on the next visit
  });
  it('Skip or finishing ends it for good', () => {
    reset();
    const r = open();
    act(() => useDemoStore.getState().endTour());
    expect(r.current).toBe(false);
    expect(useDemoStore.getState().toured).toBe(true);
  });
  it('can be replayed after being finished or snoozed', () => {
    reset();
    const r = open();
    act(() => useDemoStore.getState().endTour());
    act(() => useDemoStore.getState().startTour());
    expect(r.current).toBe(true);
    act(() => useDemoStore.getState().snooze());
    expect(r.current).toBe(false);
    act(() => useDemoStore.getState().startTour());
    expect(r.current).toBe(true);
  });
});

describe('demo mode guard (S1)', () => {
  it('by default the mock adapters work', async () => {
    const { adapters } = await import('@/lib/adapters');
    await expect(adapters.auth.sendOtp('9876543210')).resolves.toMatchObject({ ok: true });
  });

  it('with VITE_DEMO_MODE=false the mock auth, payment and order adapters refuse to run, loudly', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'false');
    vi.resetModules();
    const { loadTemplate } = await import('@/templates');
    await loadTemplate('herbal'); // a fresh module graph starts with no template loaded
    const { adapters } = await import('@/lib/adapters');
    expect(() => adapters.auth.sendOtp('9876543210')).toThrow(/Real auth, payment and order adapters are required/);
    expect(() => adapters.auth.verifyOtp({ name: 'A', phone: '9876543210', otp: '123456' })).toThrow(/VITE_DEMO_MODE=false/);
    expect(() => adapters.payment.charge({ method: 'upi', amount: 100 })).toThrow(/docs\/PRODUCTION\.md/);
    expect(() => adapters.orders.create({} as never)).toThrow();
    expect(() => adapters.notify.orderConfirmation({} as never, 'x')).toThrow();
    expect(adapters.catalog.listProducts('herbal').length).toBeGreaterThan(0); // reading the catalogue is harmless
  });

  it('the not-ready screen explains what to do', () => {
    render(<NotDemo />);
    expect(screen.getByRole('alert')).toHaveTextContent('VITE_DEMO_MODE=false');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
