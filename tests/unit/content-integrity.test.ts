/**
 * Content-integrity contracts for the public site.
 *
 * These are source-level assertions on purpose. The three rules they protect
 * are editorial/legal, not type-system properties:
 *
 *  1. No bank card or IBAN number may exist anywhere in the repo. A published
 *     card number is a fraud surface (customers cannot tell a cloned page from
 *     the real one) and a PCI/PII problem that no runtime test would notice.
 *  2. Men's services stay listed, but no male-operator persona is advertised.
 *     Removing the services instead would break the business requirement; the
 *     claim that has to disappear is "اپراتور آقا", not "لاین آقایان".
 *  3. Sadaf Mozaffari is the only person introduced publicly, and no medical
 *     title/qualification is attached to her name.
 *
 * Plus the image-delivery contract: every rendered <img> carries intrinsic
 * dimensions (CLS) and below-the-fold media is lazy with a full srcset ladder.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FEATURE_MODULES } from '../../src/domain/features/registry';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

function walk(dir: string, extensions: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(resolve(root, dir))) {
    const rel = join(dir, entry);
    const abs = resolve(root, rel);
    if (statSync(abs).isDirectory()) {
      out.push(...walk(rel, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      out.push(rel);
    }
  }
  return out;
}

/** Every text file that can ship copy to a browser (excludes node_modules/dist). */
const contentFiles = [
  ...walk('src', ['.astro', '.ts', '.tsx', '.css']),
  ...walk('migrations', ['.sql']),
  ...walk('docs', ['.md']),
  'README.md',
  'ARCHITECTURE.md',
  'DATABASE.md',
  'SECURITY.md',
];
const contentText = contentFiles.map((file) => `\n/* ${file} */\n${read(file)}`).join('');

/** Public-facing render sources: admin pages are internal tooling. */
const publicSources = [
  ...walk('src/pages', ['.astro']).filter((f) => !f.startsWith('src/pages/admin/')),
  ...walk('src/components/public', ['.astro']),
  ...walk('src/components/ui', ['.astro']),
  ...walk('src/layouts', ['.astro']),
  ...walk('src/data', ['.ts']),
  ...walk('src/domain/features', ['.ts']),
];
const publicText = publicSources.map((file) => `\n/* ${file} */\n${read(file)}`).join('');
const clinic = read('src/pages/clinic.astro');
const servicesIndex = read('src/pages/services/index.astro');
const gallery = read('src/components/public/ClinicGallery.astro');

describe('payment credentials are never published', () => {
  it('has no 16-digit card-number run (Latin or Persian digits)', () => {
    const latin = contentText.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g) ?? [];
    const persian = contentText.match(/[۰-۹]{4}[\s-]?[۰-۹]{4}[\s-]?[۰-۹]{4}[\s-]?[۰-۹]{4}/g) ?? [];
    expect([...latin, ...persian]).toEqual([]);
  });

  it('has no Iranian IBAN, spaced or compact', () => {
    const compact = contentText.match(/\bIR\d{24}\b/gi) ?? [];
    const spaced = contentText.match(/\bIR\d{2}(?:[ -]?\d{4}){5}[ -]?\d{2}\b/gi) ?? [];
    expect([...compact, ...spaced]).toEqual([]);
  });

  it('keeps the contact page free of card/sheba value fields', () => {
    const contact = read('src/pages/contact.astro');
    expect(contact).not.toContain('شماره شبا (IBAN)');
    expect(contact).not.toMatch(/data-copy="(?:\d{16}|IR\d{2})/i);
  });
});

describe('male services stay listed, male-operator claims do not', () => {
  it('has no "operator ... male" claim in any public render source', () => {
    // The only allowed mentions of آقا are the service line / tariff itself.
    const claims =
      publicText.match(/اپراتور(?:های|ان)?[^\n<>{}]{0,25}آقا|آقا[^\n<>{}]{0,15}اپراتور/g) ?? [];
    expect(claims).toEqual([]);
  });

  it('still ships the men’s line, prices and booking panel', () => {
    expect(servicesIndex).toContain('id="panel-male"');
    expect(servicesIndex).toContain('لاین اختصاصی آقایان');
    expect(servicesIndex).toContain('آنکارد ریش');
    expect(read('src/data/male-pricing.ts').length).toBeGreaterThan(0);

    const mens = FEATURE_MODULES.find((m) => m.key === 'mens-line');
    expect(mens, 'mens-line module must exist').toBeTruthy();
    expect(mens?.defaultEnabled).toBe(true);
    const defaults = JSON.stringify(mens);
    expect(defaults).not.toMatch(/اپراتور(?:های|ان)?[^\n<>{}]{0,25}آقا/);
  });

  it('keeps the gender-separation FAQ answer without an operator-gender claim', () => {
    const faq = read('src/pages/faq.astro');
    expect(faq).toContain('آیا لاین آقایان و بانوان');
    expect(faq).not.toContain('اپراتورهای ارشد خانم و آقا');
    expect(faq).not.toContain('هم‌جنس');
  });
});

describe('only Sadaf Mozaffari is introduced, without a medical title', () => {
  it('introduces her once on the clinic page', () => {
    const names = clinic.match(/class="lead-profile-name">([^<]+)</g) ?? [];
    expect(names).toHaveLength(1);
    expect(clinic).toContain('صدف مظفری');
  });

  it('strips doctor/physician titles and unverified credentials', () => {
    expect(clinic).not.toMatch(/دکتر|پزشک\s*(?:ناظر|متخصص|موسس|مقیم)|نظام پزشکی\s*[۰-۹0-9]/);
    expect(clinic).not.toContain('مریم سلیمانی');
    expect(clinic).not.toContain('۱۲۸۴۷۱');
    expect(clinic).not.toContain('اپراتور تخصصی آقایان');
  });

  it('has no doctor title anywhere in public render sources or seeded content', () => {
    expect(publicText).not.toContain('دکتر');
    expect(read('migrations/0006_seed_blog.sql')).not.toContain('دکتر');
    expect(read('migrations/0006_seed_blog.sql')).not.toContain('توصیه پزشک کلینیک');
    // The forward cleanup must be wired into integration tests or it never runs.
    expect(read('tests/integration/helpers.ts')).toContain('0013_content_cleanup.sql');
    expect(read('tests/integration/helpers.ts')).toContain('runMigration(m13)');
  });
});

describe('image delivery: lazy below the fold, intrinsic size everywhere', () => {
  const astroFiles = walk('src', ['.astro']);

  it('gives every rendered <img> alt, dimensions, loading and async decoding', () => {
    const offenders: string[] = [];
    for (const file of astroFiles) {
      // Inline scripts build HTML strings; only template markup is statically
      // rendered, so strip <script> blocks before looking for tags.
      const source = read(file).replace(/<script[\s\S]*?<\/script>/g, '');
      for (const match of source.matchAll(/<img\b[^>]*>/g)) {
        const tag = match[0];
        const missing = ['alt=', 'width=', 'height=', 'loading=', 'decoding="async"'].filter(
          (attr) => !tag.includes(attr),
        );
        if (missing.length) offenders.push(`${file}: ${missing.join(',')}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('lazy-loads the gallery rail and never marks it high priority', () => {
    const img = gallery.match(/<img\s+class="cg-img[\s\S]*?\/>/)?.[0] ?? '';
    expect(img).toContain('loading="lazy"');
    expect(img).toContain('fetchpriority="low"');
    expect(img).not.toContain('loading="eager"');
    expect(img).toContain('srcset=');
  });

  it('keeps the hero eager/high priority as the LCP element', () => {
    const home = read('src/pages/index.astro');
    const img = home.match(/<img\s+class="hero-visual-img[\s\S]*?\/>/)?.[0] ?? '';
    expect(img).toContain('loading="eager"');
    expect(img).toContain('fetchpriority="high"');
    expect(img).toContain('hero-laser-700.jpg 700w');
  });

  it('ships every gallery rung the srcset advertises', () => {
    const names = [...gallery.matchAll(/src:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThanOrEqual(3);
    const suffixes = [
      '-560.avif',
      '-560.webp',
      '-560.jpg',
      '-800.avif',
      '-800.webp',
      '-800.jpg',
      '.avif',
      '.webp',
      '.jpg',
    ];
    const missing = names.flatMap((name) =>
      suffixes
        .map((suffix) => `public/images/${name}${suffix}`)
        .filter((file) => !existsSync(resolve(root, file))),
    );
    expect(missing).toEqual([]);
  });
});
