#!/usr/bin/env node
/**
 * Regenerate the responsive image ladder for the self-hosted public imagery.
 *
 * Why this exists: the site ships AVIF/WebP/JPEG at a few fixed widths and the
 * `<picture>` elements reference them by name. Hand-exporting variants drifts —
 * a new 560w entry gets an AVIF but no WebP fallback, and a phone on an older
 * engine silently downloads the 800w file. This script derives every width the
 * templates ask for, from the 1600w JPEG master, with one quality policy.
 *
 * Output per master `public/images/<name>.jpg` (1600w):
 *   <name>-800.{avif,webp,jpg}   800w
 *   <name>-560.{avif,webp,jpg}   560w
 *
 * Hero exception: 1400w master → 700w JPEG fallback (the template's phone src).
 *
 * Usage: npm run images:optimize
 * Idempotent: files are overwritten with identical settings, so re-running is a
 * no-op in content terms. og-share.jpg is deliberately untouched (social card,
 * fixed 1200x630).
 */
import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMAGES = path.join(ROOT, 'public', 'images');

const AVIF = { quality: 55, effort: 6 };
const WEBP = { quality: 76, effort: 5 };
const JPEG = { quality: 78, mozjpeg: true, progressive: true };

async function encode(source, width, name) {
  const resized = await sharp(source).resize({ width, withoutEnlargement: true }).toBuffer();
  await Promise.all([
    sharp(resized)
      .avif(AVIF)
      .toFile(path.join(IMAGES, `${name}.avif`)),
    sharp(resized)
      .webp(WEBP)
      .toFile(path.join(IMAGES, `${name}.webp`)),
    sharp(resized)
      .jpeg(JPEG)
      .toFile(path.join(IMAGES, `${name}.jpg`)),
  ]);
  return name;
}

async function main() {
  const entries = await readdir(IMAGES);
  // 1600w masters: `<name>.jpg` with no width suffix.
  const masters = entries
    .filter((file) => file.endsWith('.jpg'))
    .filter((file) => !/-\d+\.jpg$/.test(file))
    .filter((file) => file !== 'og-share.jpg');

  const written = [];
  for (const file of masters.sort()) {
    const name = file.replace(/\.jpg$/, '');
    const source = path.join(IMAGES, file);
    for (const width of [800, 560]) {
      written.push(await encode(source, width, `${name}-${width}`));
    }
  }

  // Hero phone fallback (see src/pages/index.astro <img srcset>).
  const hero = path.join(IMAGES, 'hero-laser-1400.jpg');
  try {
    await access(hero);
    const resized = await sharp(hero).resize({ width: 700, withoutEnlargement: true }).toBuffer();
    await sharp(resized).jpeg(JPEG).toFile(path.join(IMAGES, 'hero-laser-700.jpg'));
    written.push('hero-laser-700');
  } catch {
    console.warn('skip hero-laser-1400.jpg (missing)');
  }

  console.log(`optimized ${written.length} variants from ${masters.length} masters`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
