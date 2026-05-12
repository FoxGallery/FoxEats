#!/usr/bin/env node
/* eslint-disable */
// Téléchargement des photos curatées Unsplash listées dans photos-manifest.json
// Stockage local : apps/web/public/photos/*.jpg
// Génère aussi : packages/db/src/seed/photo-urls.json (mapping slot → URL publique)
// Usage : node tooling/scripts/curate-photos.mjs [--force]

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const outDir = path.join(root, 'apps', 'web', 'public', 'photos');
const manifestPath = path.join(__dirname, 'photos-manifest.json');
const mappingPath = path.join(root, 'packages', 'db', 'src', 'seed', 'photo-urls.json');

const force = process.argv.includes('--force');

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'foxeats-curate/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return buf.length;
}

function urlFor(id, w, q) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&fm=jpg&auto=compress&fit=crop`;
}

const main = async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const { width, quality } = manifest._meta;
  await fs.mkdir(outDir, { recursive: true });

  const categories = ['hero', 'cities', 'dishes', 'restaurants'];
  const mapping = {};
  const credits = [];

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const cat of categories) {
    for (const item of manifest[cat]) {
      const filename = `${item.slot}.jpg`;
      const dest = path.join(outDir, filename);
      const publicUrl = `/photos/${filename}`;
      mapping[item.slot] = publicUrl;
      credits.push(`- **${item.slot}** — Unsplash photo \`${item.id}\` — ${item.alt}`);

      if (!force && (await exists(dest))) {
        skipped++;
        continue;
      }
      const url = urlFor(item.id, width, quality);
      try {
        const size = await download(url, dest);
        console.log(`✓ ${item.slot} ${(size / 1024).toFixed(0)} KB`);
        downloaded++;
      } catch (err) {
        console.warn(`✗ ${item.slot} — ${err.message}`);
        failed++;
        // garde le mapping pour fallback CSS gradient
      }
    }
  }

  await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2) + '\n', 'utf8');
  await fs.writeFile(
    path.join(outDir, 'CREDITS.md'),
    `# Photos credits\n\nAll photos sourced from [Unsplash](https://unsplash.com/license) (free for commercial use).\n\n${credits.join('\n')}\n`,
    'utf8',
  );

  console.log(`\nDone — downloaded ${downloaded}, skipped ${skipped}, failed ${failed}.`);
  console.log(`Mapping written to ${path.relative(root, mappingPath)}.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
