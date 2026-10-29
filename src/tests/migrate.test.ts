import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { migrateOldKeys } from '@/lib/migrate';
import { adapters } from '@/lib/adapters';
import { newOrderId, newPaymentRef } from '@/lib/adapters/mock';

const OLD = 'vilvad2c.';

describe('moving saved data from the old keys (B4)', () => {
  afterEach(() => window.localStorage.clear());

  it('moves every old key to the new prefix and removes the old one', () => {
    for (const k of ['cart', 'orders', 'custom', 'theme', 'template', 'demo', 'auth', 'wishlist', 'checkout', 'themevars']) localStorage.setItem(OLD + k, `{"v":"${k}"}`);
    expect(migrateOldKeys()).toBe(10);
    for (const k of ['cart', 'orders', 'custom', 'theme', 'template', 'demo', 'auth', 'wishlist', 'checkout', 'themevars']) {
      expect(localStorage.getItem('devduo.' + k)).toBe(`{"v":"${k}"}`);
      expect(localStorage.getItem(OLD + k)).toBeNull();
    }
  });

  it('keeps a value that already exists under the new key, and still removes the old one', () => {
    localStorage.setItem('devduo.cart', 'new');
    localStorage.setItem(OLD + 'cart', 'old');
    expect(migrateOldKeys()).toBe(0);
    expect(localStorage.getItem('devduo.cart')).toBe('new');
    expect(localStorage.getItem(OLD + 'cart')).toBeNull();
  });

  it('leaves other keys alone and is safe to run again', () => {
    localStorage.setItem('other.app', 'keep');
    localStorage.setItem(OLD + 'cart', 'x');
    migrateOldKeys();
    expect(migrateOldKeys()).toBe(0);
    expect(localStorage.getItem('other.app')).toBe('keep');
    expect(localStorage.length).toBe(2);
  });

  it('never throws when storage is blocked or full', () => {
    const blocked = {
      get length(): number {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(migrateOldKeys(blocked)).toBe(0);

    const full = new Map<string, string>([[OLD + 'a', '1'], [OLD + 'b', '2']]);
    const store = {
      get length() {
        return full.size;
      },
      key: (i: number) => [...full.keys()][i] ?? null,
      getItem: (k: string) => full.get(k) ?? null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
      removeItem: (k: string) => void full.delete(k),
    };
    expect(migrateOldKeys(store)).toBe(0);
    expect(full.size).toBe(0); // the old values stop using space even though they could not be copied
  });
});

describe('order and payment ids (R1, R2)', () => {
  it('order ids start with DD and are 10 characters of hex after it, and do not repeat', () => {
    const ids = new Set(Array.from({ length: 2000 }, newOrderId));
    expect(ids.size).toBe(2000);
    for (const id of ids) expect(id).toMatch(/^DD[0-9A-F]{8}$/);
  });
  it('payment references are DP plus 8 digits', () => {
    expect(newPaymentRef()).toMatch(/^DP\d{8}$/);
  });
  it('a created order and its tracking message use the new brand', async () => {
    const order = await adapters.orders.create({
      tpl: 'herbal',
      items: [{ id: 'h7', name: 'Oil', emoji: '', opt: '', qty: 1, price: 449 }],
      totals: { sub: 449, mrp: 549, save: 100, disc: 0, ship: 0, cod: 0, total: 449 },
      address: { name: 'Asha Rao', phone: '9876543210', addr: '12 Lake View', city: 'Chennai', pin: '600001', state: 'TN' },
      pay: 'upi',
      ship: 'std',
    });
    expect(order.id).toMatch(/^DD[0-9A-F]{8}$/);
    const msg = await adapters.notify.orderConfirmation(order, 'Ooty Herbals');
    expect(msg.text).toContain(`devduo.link/${order.id.toLowerCase()}`);
    const charge = await adapters.payment.charge({ method: 'upi', amount: 449 });
    expect(charge.ok && charge.reference).toMatch(/^DP\d{8}$/);
  });
});

describe('the brand guard (R3)', () => {
  const script = resolve(__dirname, '../../scripts/check-brand.mjs');
  const dirs: string[] = [];
  const project = (files: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), 'brand-'));
    dirs.push(dir);
    for (const [name, text] of Object.entries(files)) {
      mkdirSync(join(dir, name, '..'), { recursive: true });
      writeFileSync(join(dir, name), text);
    }
    return dir;
  };
  const run = (cwd: string) => {
    try {
      execFileSync(process.execPath, [script], { cwd, stdio: 'pipe' });
      return 0;
    } catch (e) {
      return (e as { status: number }).status;
    }
  };
  afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

  it('passes a clean project', () => {
    expect(run(project({ 'src/a.ts': 'export const brand = "Devduo ESaas";', 'README.md': '# Devduo ESaas' }))).toBe(0);
  });
  it('fails when the old name appears in any checked file, in any case', () => {
    for (const [file, text] of [['src/a.ts', '// Vilva'], ['README.md', 'Built by vilva'], ['index.html', '<title>VILVA</title>'], ['src/b.css', '/* d2c */'], ['src/c.json', '{"n":"Vilva D2C"}']]) {
      expect(run(project({ [file]: text })), `${file}: ${text}`).toBe(1);
    }
  });
  it('lets the migration file and its tests mention the old prefix', () => {
    expect(run(project({ 'src/lib/migrate.ts': "const OLD = 'vilvad2c.';", 'src/tests/migrate.test.ts': "const OLD = 'vilvad2c.';", 'e2e/migrate.spec.ts': "// vilvad2c.cart" }))).toBe(0);
  });
  it('ignores node_modules and build output', () => {
    expect(run(project({ 'node_modules/x/index.js': 'vilva', 'node_modules/x/a.json': '{"a":"vilva"}', 'dist/a.html': 'vilva', 'src/a.ts': 'ok' }))).toBe(0);
  });
});
