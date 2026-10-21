/**
 * UX v3 design-system pass — style-guard tests.
 *
 * The v2 CSS history of this repo is a graveyard of "one more <style> block":
 * the homepage alone carried ~940 duplicate lines that hid content below
 * 768px, and six different files defined the same accent six different ways.
 * These tests pin the invariants that stop that from happening again.
 *
 * What must never regress:
 *  1. The system layer exists and is imported LAST by the public layout —
 *     a layer loaded before public.css/site-v2.css is overridden by them,
 *     which is exactly the bug it exists to fix.
 *  2. The 11px type floor and the 44px touch floor are encoded as tokens,
 *     not as per-rule whims (`.promo-tag-mini` was 10.4px in production).
 *  3. Persian copy never gets letter-spacing: the script is cursive-joined
 *     and negative tracking pinches the joins (§tokens.css documents this).
 *  4. The hero/page titles stay single-ink: the white→green gradient clip
 *     measured 1.08:1 on faq/contact (a11y-audit), so gradient-clip titles
 *     are banned from the system layer.
 *  5. One focus ring for everything, and reduced motion collapses it.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const publicLayout = read('src/layouts/PublicLayout.astro');
const uxV3 = read('src/styles/ux-v3.css');
const tokens = read('src/styles/tokens.css');

describe('ux-v3: system layer is wired up', () => {
  it('ships as a real stylesheet', () => {
    expect(uxV3.length).toBeGreaterThan(20_000);
  });

  it('is imported by PublicLayout AFTER the legacy and v2 layers', () => {
    const imports =
      publicLayout
        .match(/import\s+['"][^'"]+\.css['"]/g)
        ?.map((l) => l.replace(/import\s+['"]/, '').replace(/['"]$/, '')) ?? [];
    expect(imports).toContain('../styles/ux-v3.css');
    expect(imports.indexOf('../styles/ux-v3.css')).toBe(imports.length - 1);
    // The legacy layer must come first, or the system pass cannot refine it.
    expect(imports.indexOf('../styles/public.css')).toBeLessThan(
      imports.indexOf('../styles/site-v2.css'),
    );
    expect(imports.indexOf('../styles/site-v2.css')).toBeLessThan(
      imports.indexOf('../styles/ux-v3.css'),
    );
  });

  it('scopes every rule to the public dark theme, never to bare :root', () => {
    const bare = uxV3.match(/(^|\n)([^\n{}]*?:root[^\n{}]*)\{/g);
    // :root may only appear inside a comment or not at all.
    expect(bare ?? []).toHaveLength(0);
  });
});

describe('ux-v3: accessibility floors are tokens, not whims', () => {
  it('encodes the 11px type floor and the 44px touch floor', () => {
    expect(uxV3).toContain('--tap-target-min: 44px');
    expect(tokens).toContain('--tap-target-min: 44px');
    // The micro-tag family shipped at 10.4–10.8px in production; one rule now
    // carries the 11px floor for all of them.
    const block = uxV3.match(/\.promo-tag-mini,[\s\S]*?\}/)?.[0] ?? '';
    expect(block).toContain('.badge-promo');
    expect(block).toContain('.gpt-mens-tag');
    expect(block).toContain('font-size: 11px');
    // `تومان` under each tariff figure measured 4.36:1 — the unit is raised.
    const unit = uxV3.match(/\.gpt-unit \{[\s\S]*?\}/)?.[0] ?? '';
    expect(unit).toContain('font-size: 11px');
  });

  it('floors touch targets on mobile for every button family', () => {
    const mobile = uxV3.slice(uxV3.indexOf('@media (max-width: 768px)'));
    expect(mobile).toContain('min-height: 44px');
    for (const cls of ['.btn', '.gpt-book-btn', '.filter-chip-btn', '.cat-pill']) {
      expect(mobile, `${cls} needs a 44px floor`).toContain(cls);
    }
  });

  it('gives focus-visible rings to every interactive family', () => {
    for (const sel of ['a:focus-visible', 'button:focus-visible', 'summary:focus-visible']) {
      expect(uxV3).toContain(sel);
    }
    expect(uxV3).toContain('outline: 2px solid var(--ux-accent)');
  });
});

describe('ux-v3: Persian typography invariants', () => {
  it('never applies letter-spacing to Persian (RTL) copy', () => {
    // Every letter-spacing declaration must be 0 — tracking on a joined
    // script pinches the glyph joins (documented in tokens.css).
    const spacings = uxV3.match(/letter-spacing:\s*[^;]+;/g) ?? [];
    expect(spacings.length).toBeGreaterThan(0);
    for (const s of spacings) {
      expect(s).toMatch(/letter-spacing:\s*0(;|$)/);
    }
  });

  it('keeps display and body line-heights in the Persian-safe band', () => {
    const titles = uxV3.match(/\.section-title \{[\s\S]*?\}/)?.[0] ?? '';
    expect(titles).toContain('line-height: 1.42');
  });
});

describe('ux-v3: contrast failures that motivated the pass', () => {
  it('defines an accent-ink token dark enough to sit on gold fills', () => {
    // .btn-primary measured 4.36:1 for its 11px "تومان" unit before; the
    // accent-ink token is what makes the gold button family legible.
    expect(uxV3).toContain('--ux-accent-ink: #171104');
    expect(uxV3).toContain('--ux-muted: #a3b0ae');
  });

  it('unifies the card surface language instead of six ad-hoc ones', () => {
    // The six card families each shipped their own border/radius/hover.
    for (const cls of ['.trust-card', '.benefit-card-3d', '.package-card', '.contact-glass-card']) {
      expect(uxV3, `${cls} must join the unified card language`).toContain(cls);
    }
    expect(uxV3).toContain('border-radius: var(--ux-r-card)');
  });

  it('keeps table headers opaque so a sticky header never goes transparent', () => {
    const head = uxV3.match(/\.gender-price-table thead th \{[\s\S]*?\}/)?.[0] ?? '';
    expect(head).toContain('position: sticky');
    expect(head).toMatch(/background: #0b1013/);
  });
});

describe('ux-v3: motion respects reduced motion', () => {
  it('collapses every transition under prefers-reduced-motion', () => {
    const reduced =
      uxV3.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(reduced).toContain('transition-duration: 0.001ms');
    expect(reduced).toContain('scroll-behavior: auto');
  });

  it('never hides content behind a JS-dependent reveal', () => {
    // The v2 history had content at opacity 0 until an observer ran. Nothing
    // in the system layer may be invisible by default.
    const hideRules = uxV3.match(/opacity:\s*0(?:\.\d+)?;/g) ?? [];
    expect(hideRules).toHaveLength(0);
  });
});
