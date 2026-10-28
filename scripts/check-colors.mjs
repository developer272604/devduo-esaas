// Fails when a colour literal appears anywhere except styles/tokens.css.
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src/components', 'src/pages', 'src/styles', 'src/App.tsx', 'src/main.tsx'];
const ALLOW = new Set([path.normalize('src/styles/tokens.css'), path.normalize('src/lib/theme.ts')]);
const PATTERNS = [/#[0-9a-fA-F]{3,8}\b/, /\brgba?\(/, /\bhsla?\(\s*\d/];
const bad = [];

function walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) return fs.readdirSync(p).forEach((f) => walk(path.join(p, f)));
  if (!/\.(tsx?|css)$/.test(p) || ALLOW.has(path.normalize(p))) return;
  fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
    if (PATTERNS.some((r) => r.test(line))) bad.push(`${p}:${i + 1}: ${line.trim()}`);
  });
}
ROOTS.forEach((r) => fs.existsSync(r) && walk(r));
if (bad.length) {
  console.error('Hard-coded colours found (move them to styles/tokens.css):\n' + bad.join('\n'));
  process.exit(1);
}
console.log('No hard-coded colours outside tokens.css.');
