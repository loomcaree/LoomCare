import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const pages = [
  'index.html',
  'about/index.html',
  'privacy/index.html',
  'terms/index.html',
];
const titles = new Set();
for (const page of pages) {
  assert(
    existsSync(`dist/${page}`),
    `Missing dist/${page}: run npm run build first.`,
  );
  const html = readFileSync(`dist/${page}`, 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(
    (match) => match[1],
  );
  assert(
    assets.some((asset) => asset.endsWith('.js')),
    `${page}: missing built JavaScript entry.`,
  );
  assert(
    assets.some((asset) => asset.endsWith('.css')),
    `${page}: missing built CSS.`,
  );
  for (const asset of assets)
    assert(existsSync(`dist${asset}`), `Missing asset: ${asset}`);
  assert(
    !html.includes('/src/'),
    `${page}: unbuilt source entry found in deployment.`,
  );
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert(
    title && !titles.has(title),
    `${page}: page title must be present and unique.`,
  );
  titles.add(title);
}
assert(
  !existsSync('dist/server'),
  'Server output must not be included in the static upload.',
);
console.log(
  'All four static HTML pages, unique titles, CSS and JavaScript verified.',
);
