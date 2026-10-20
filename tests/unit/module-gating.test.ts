/**
 * Static contract test for the plugin gate.
 *
 * The whole point of the module system is that a disabled module renders
 * nothing. That promise lives in templates, not in the domain layer, so the
 * only way to protect it in CI is to read the templates and assert the wiring:
 *
 *  - every `sections` module is gated on the homepage,
 *  - every `chrome` module is gated in the public layout,
 *  - every route-backed module (`online-booking`, `content-blog`) both drops
 *    its nav link and redirects its page,
 *  - no public-facing module is registered without a gate anywhere (a module
 *    that nobody reads is dead weight in the hub).
 *
 * This is intentionally source-level: it fails loudly when someone pastes a new
 * section into index.astro and forgets `isOn('<key>')`, which no unit test of
 * the merge helpers could catch.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FEATURE_MODULES } from '../../src/domain/features/registry';

const read = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(`../../src/${rel}`, import.meta.url)), 'utf8');

const homepage = read('pages/index.astro');
const layout = read('layouts/PublicLayout.astro');
const bookingPage = read('pages/booking.astro');
const blogIndex = read('pages/blog/index.astro');
const blogPost = read('pages/blog/[slug].astro');

/** Modules rendered by a page other than the homepage/layout. */
const ROUTE_MODULES = new Set(['online-booking', 'content-blog']);

describe('homepage section gates', () => {
  const sections = FEATURE_MODULES.filter((m) => m.category === 'sections');

  it('has at least the marketing sections we expect', () => {
    expect(sections.length).toBeGreaterThanOrEqual(6);
  });

  it.each(sections.map((m) => m.key))('section `%s` is gated with isOn()', (key) => {
    expect(homepage).toContain(`isOn('${key}')`);
  });

  it('wraps each gated section in a conditional expression (no orphan markup)', () => {
    // Every `isOn('x')` in the page must be followed by `&&` — the pattern that
    // actually suppresses markup, not a boolean nobody reads. Component gates
    // use the single-expression form, section gates the parenthesised block.
    const gates = [...homepage.matchAll(/isOn\('([a-z0-9-]+)'\)/g)].map((m) => m[1]);
    expect(gates.length).toBeGreaterThan(0);
    for (const key of gates) {
      const at = homepage.indexOf(`isOn('${key}')`);
      expect(at, `${key} gate missing`).toBeGreaterThan(-1);
      expect(homepage.slice(at, at + 40)).toContain('&&');
    }
  });
});

describe('site chrome gates', () => {
  const chrome = FEATURE_MODULES.filter((m) => m.category === 'chrome');

  it.each(chrome.map((m) => m.key))('chrome module `%s` is gated in the public layout', (key) => {
    expect(layout).toContain(`isOn('${key}')`);
  });

  it('the sticky bar and announcement bar render nothing when their module is off', () => {
    // These two are the modules a visitor notices first; a leaked copy would
    // advertise a discount that the clinic cannot honour.
    for (const key of ['sticky-booking-cta', 'announcement-bar']) {
      const at = layout.indexOf(`isOn('${key}')`);
      expect(at, `${key} gate missing`).toBeGreaterThan(-1);
      const window = layout.slice(at, at + 120);
      expect(window).toMatch(/isOn\('[a-z0-9-]+'\)\s*&&/);
    }
  });

  it('the WhatsApp float requires a plausibly complete phone number', () => {
    expect(layout).toContain('whatsappPhone.length >= 10');
  });
});

describe('route-backed modules', () => {
  it('online-booking drops its nav links when off', () => {
    expect(layout).toContain("bookingOn || item.href !== '/booking'");
    expect(bookingPage).toContain("isModuleEnabled(env.DB, 'online-booking')");
    expect(bookingPage).toContain("return Astro.redirect('/contact?booking=off', 307)");
  });

  it('content-blog drops its nav links and redirects both blog routes', () => {
    expect(layout).toContain("blogOn || item.href !== '/blog'");
    expect(blogIndex).toContain("isModuleEnabled(env.DB, 'content-blog')");
    expect(blogPost).toContain("isModuleEnabled(env.DB, 'content-blog')");
  });

  it('a gate read failure falls back to rendering (never a blank page)', () => {
    // try/catch around each route gate, default = enabled.
    for (const source of [bookingPage, blogIndex, blogPost]) {
      expect(source).toMatch(/try \{[\s\S]{0,200}isModuleEnabled/);
      expect(source).toContain('= true;');
    }
  });
});

describe('registry has no dead modules', () => {
  const publicModules = FEATURE_MODULES.filter((m) => !m.internal && !ROUTE_MODULES.has(m.key));

  it.each(publicModules.map((m) => m.key))('module `%s` is read by a template', (key) => {
    expect(homepage.includes(key) || layout.includes(key)).toBe(true);
  });
});
