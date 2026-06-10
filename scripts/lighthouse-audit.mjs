import { spawnSync } from 'node:child_process';

const TARGET_URL =
  process.env.LIGHTHOUSE_URL ?? 'http://localhost:3456/dashboard';
const MIN_SCORE = 90;

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'lighthouse',
    TARGET_URL,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless',
    '--output=json',
    '--quiet',
  ],
  { encoding: 'utf8' }
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const report = JSON.parse(result.stdout);
const categories = report.categories ?? {};

console.log(`Lighthouse audit for ${TARGET_URL}`);

let failed = false;
for (const [name, category] of Object.entries(categories)) {
  const score = Math.round((category.score ?? 0) * 100);
  const status = score >= MIN_SCORE ? 'PASS' : 'FAIL';
  console.log(`- ${name}: ${score} (${status})`);
  if (score < MIN_SCORE) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
