// Fails the build when the old product name comes back. The only places allowed to mention it are
// the one-time storage migration and the tests that prove it works.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

const BAD = /vilva|d2c/i; // also matches vilvad2c
const CHECKED = /\.(tsx?|css|html|md|json|mjs)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'test-results', 'playwright-report']);
const ALLOWED = [
  join('src', 'lib', 'migrate.ts'),
  join('src', 'tests', 'migrate.test.ts'),
  join('e2e', 'migrate.spec.ts'),
  join('scripts', 'check-brand.mjs'),
  'package-lock.json',
].map((p) => p.split(sep).join('/'));

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIP_DIRS.has(name) ? [] : walk(path);
    return [path];
  });

const hits = walk('.')
  .map((p) => p.split(sep).join('/').replace(/^\.\//, ''))
  .filter((p) => CHECKED.test(p) && !ALLOWED.includes(p) && BAD.test(readFileSync(p, 'utf8')));

if (hits.length) {
  console.error('Old brand name found in:\n' + hits.map((h) => '  ' + h).join('\n'));
  process.exit(1);
}
console.log('Brand check passed: the old name appears only where the storage migration needs it.');
